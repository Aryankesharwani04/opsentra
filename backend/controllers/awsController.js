// const { exec } = require("child_process");

// exports.configureAWS = (req, res) => {
//     const { accessKey, secretKey, region } = req.body;

//     if (!accessKey || !secretKey || !region) {
//         return res.status(400).send("Missing AWS configuration parameters.");
//     }

//     const commands = `
//     aws configure set aws_access_key_id ${accessKey} &&
//     aws configure set aws_secret_access_key ${secretKey} &&
//     aws configure set default.region ${region}
//   `;

//     exec(commands, (error, stdout, stderr) => {
//         if (error) {
//             return res.status(500).send(`Execution Error: ${stderr}`);
//         }
//         res.send(`AWS configuration successful: ${stdout}`);
//     });
// };

const { exec } = require("child_process");
const AWSConfig = require("../models/AWSConfig");

exports.configureAWS = async (req, res) => {
    const { accessKey, secretKey, region } = req.body;

    if (!accessKey || !secretKey || !region) {
        return res.status(400).send("Missing AWS configuration parameters.");
    }

    try {
        // Step 1: Save to MongoDB
        const newConfig = new AWSConfig({
            accessKey,
            secretKey,
            region,
        });

        await newConfig.save();
        console.log("✅ AWS credentials saved to MongoDB");

        // Step 2: Run aws configure
        const command = `
    aws configure set aws_access_key_id ${accessKey} &&
    aws configure set aws_secret_access_key ${secretKey} &&
    aws configure set default.region ${region}
    `;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("❌ AWS CLI Error:", stderr);
                return res.status(500).send(`Error configuring AWS: ${stderr}`);
            }
            res.send("✅ AWS configuration saved and CLI executed successfully.");
        });
    } catch (err) {
        console.error("❌ MongoDB Save Error:", err);
        res.status(500).send("Internal server error.");
    }
};
