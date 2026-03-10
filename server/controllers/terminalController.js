const CommandLog = require("../models/CommandLog");

exports.executeCommand = async (req, res) => {
  const { command, userId = "default" } = req.body;

  if (!command) {
    return res.status(400).json({ error: "Missing command." });
  }

  // Basic command sanitization
  const blockedPatterns = [
    /rm\s+-rf/,
    /\/dev\/null/,
    /;\s*rm/,
    /mv\s+\/\s+/
  ];
  
  if (blockedPatterns.some(pattern => pattern.test(command))) {
    return res.json({ 
      output: "❌ Blocked potentially dangerous command" 
    });
  }

  try {
    const { exec } = await import('child_process');
    exec(command, async (err, stdout, stderr) => {
      const output = err ? stderr : stdout;
      
      await CommandLog.create({
        userId,
        command,
        output,
        timestamp: new Date()
      });
      
      res.json({ output });
    });
  } catch (e) {
    res.status(500).json({ error: "Command execution failed" });
  }
};