'use strict';

const Workspace = require('../models/Workspace');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');
const config = require('../config/env');

/** Base URL where the install script is hosted. Override via AGENT_BASE_URL env var. */
const AGENT_BASE_URL = process.env.AGENT_BASE_URL || 'https://agent.opsentra.io';

/**
 * @route  GET /api/v1/agent/install-command
 * @access Protected
 * @query  workspace_id?  - MongoDB ObjectId (falls back to user's default workspace)
 * @query  instance_name? - Optional instance name hint to embed in the command
 *
 * Returns a personalised curl install command the user runs on their EC2 instance.
 * The agent script will:
 *   1. Install the CloudWatch unified agent
 *   2. Use workspace_id to derive the log group name (opsentra-{workspace_id}-{instance_id})
 *   3. Configure and start the CloudWatch agent service
 */
const getInstallCommand = catchAsync(async (req, res) => {
  // Resolve workspace
  let workspaceId = req.query.workspace_id;

  let workspace;
  if (workspaceId) {
    workspace = await Workspace.findOne({ _id: workspaceId, userId: req.user._id, isActive: true });
    if (!workspace) throw AppError.notFound('Workspace not found or does not belong to this account');
  } else {
    workspace = await Workspace.findOne({ userId: req.user._id, isActive: true })
      .sort({ createdAt: 1 }); // Oldest = default
    if (!workspace) throw AppError.notFound('No active workspace found. Please create a workspace first.');
    workspaceId = workspace._id.toString();
  }

  const instanceNameHint = req.query.instance_name
    ? `--instance-name "${req.query.instance_name}"`
    : '';

  // Primary install command (one-liner for the EC2 terminal)
  const installCommand = [
    `sudo curl -sSL ${AGENT_BASE_URL}/install.sh`,
    `| sudo bash -s ${workspaceId}`,
    instanceNameHint,
  ].filter(Boolean).join(' ');

  // Advanced: one-liner with explicit API endpoint so agent can call back
  const apiBaseUrl = process.env.API_BASE_URL || `http://localhost:${config.server.port}`;
  const advancedCommand = [
    `curl -sSL ${AGENT_BASE_URL}/install.sh`,
    `| bash -s -- \\`,
    `    --workspace-id ${workspaceId} \\`,
    `    --api-url ${apiBaseUrl}/api/v1 \\`,
    instanceNameHint ? `    ${instanceNameHint} \\` : null,
    `    --auto-register`,
  ].filter(Boolean).join('\n');

  sendSuccess(res, {
    message: 'Install command generated successfully',
    data: {
      workspace: {
        id: workspaceId,
        name: workspace.workspaceName,
      },

      // Quick one-liner — display this prominently in the UI
      install_command: installCommand,

      // Step-by-step breakdown for users who prefer explicit flags
      advanced_command: advancedCommand,

      // What the agent will do when run
      agent_steps: [
        'Download and install the AWS CloudWatch unified agent',
        `Configure log forwarding with log group prefix: opsentra-${workspaceId}-<instance-id>`,
        'Auto-detect the EC2 instance ID via instance metadata service (IMDSv2)',
        'Register this instance with Opsentra via POST /api/v1/servers/register',
        'Start and enable the CloudWatch agent service (systemd)',
      ],

      // Generated log group pattern so users know what to expect
      log_group_pattern: `opsentra-${workspaceId}-<ec2-instance-id>`,

      // Script source (for users who want to inspect before running)
      script_url: `${AGENT_BASE_URL}/install.sh`,
    },
  });
});

module.exports = { getInstallCommand };
