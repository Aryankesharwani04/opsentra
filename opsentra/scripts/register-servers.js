'use strict';
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 }).then(async () => {
  const db = mongoose.connection.db;

  // Find the active workspace
  const workspace = await db.collection('workspaces').findOne({ isActive: true });
  if (!workspace) { console.error('No active workspace found'); process.exit(1); }
  console.log('Workspace:', workspace._id.toString());

  // Read a sample of logs to discover distinct instanceIds fast (no .distinct() which buffers)
  const logs = await db.collection('log_entries')
    .find({}, { projection: { instanceId: 1, logGroup: 1 } })
    .limit(500)
    .toArray();

  const seen = new Map(); // instanceId -> first logGroup
  for (const l of logs) {
    if (l.instanceId && l.instanceId !== 'unknown' && !seen.has(l.instanceId)) {
      seen.set(l.instanceId, l.logGroup || '');
    }
  }

  console.log('Discovered instance IDs:', [...seen.keys()]);

  for (const [instanceId, logGroup] of seen.entries()) {
    const rootGroup = logGroup.split('-').slice(0, 4).join('-'); // opsentra-<wsId>-system
    await db.collection('serverinstances').updateOne(
      { workspaceId: workspace._id, instanceId },
      {
        $setOnInsert: {
          workspaceId: workspace._id,
          instanceId,
          instanceName: instanceId,
          logGroup: rootGroup || `opsentra-${workspace._id}-system`,
          region: 'us-east-1',
          status: 'running',
          lastSeenAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    console.log('Registered:', instanceId, '->', rootGroup);
  }

  console.log('Done.');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
