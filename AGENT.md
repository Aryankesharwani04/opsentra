# Opsentra Agent

The **Opsentra Agent** is a lightweight installation script that enables servers to forward system and application logs to the Opsentra platform.

It installs and configures the **Amazon CloudWatch Agent**, automatically connects the instance with Opsentra, and starts streaming logs from the server.

The goal of the agent is to make infrastructure log collection **fully automated and one-command installable**.

---

# Overview

The agent performs the following operations:

1. Detects the operating system
2. Installs required dependencies
3. Downloads and installs the Amazon CloudWatch Agent
4. Generates a CloudWatch log configuration
5. Starts the CloudWatch agent service
6. Registers the server with the Opsentra backend

After installation, logs begin appearing in the dashboard within **30 seconds to 1 minute**.

---

# Installation

The agent is installed using a single command:

```

sudo curl -sSL [https://raw.githubusercontent.com/Aryankesharwani04/opsentra/upgradation/opsentra/agent/install.sh](https://raw.githubusercontent.com/Aryankesharwani04/opsentra/upgradation/opsentra/agent/install.sh) 
| sudo bash -s <workspace_id>

```

Example:

```

sudo curl -sSL [https://raw.githubusercontent.com/Aryankesharwani04/opsentra/upgradation/opsentra/agent/install.sh](https://raw.githubusercontent.com/Aryankesharwani04/opsentra/upgradation/opsentra/agent/install.sh) 
| sudo bash -s 69af2663ae6ce934f64e0f19

```

---

# Supported Operating Systems

Currently supported environments:

| OS | Version |
|----|--------|
| Ubuntu | 20.04 / 22.04 / 24.04 |
| Debian | 11 / 12 |
| Amazon Linux | 2 / 2023 |
| RHEL / CentOS | 7+ |

---

# Installation Steps

## 1. OS Detection

The script detects the OS using:

```

/etc/os-release

```

It automatically selects the appropriate package manager:

| OS | Package Manager |
|----|----|
| Ubuntu / Debian | apt |
| Amazon Linux | yum |
| RHEL / CentOS | yum |

---

## 2. Install Dependencies

The script installs required tools:

```

curl
wget
unzip
jq

```

These are required for downloading the CloudWatch agent and interacting with AWS metadata.

---

## 3. Install CloudWatch Agent

The agent downloads the latest version from AWS:

```

[https://s3.amazonaws.com/amazoncloudwatch-agent](https://s3.amazonaws.com/amazoncloudwatch-agent)

```

The installation method depends on the OS:

| OS | Package |
|----|----|
| Ubuntu / Debian | `.deb` |
| Amazon Linux | `.rpm` |

---

## 4. Instance Metadata Detection

The agent retrieves instance metadata using **IMDSv2**.

Example metadata queries:

```

instance-id
region
hostname

```

This information is used to:

- identify the server
- generate log stream names
- register the instance with Opsentra

---

# Log Collection Configuration

The agent automatically generates a CloudWatch configuration file:

```

/opt/aws/amazon-cloudwatch-agent/etc/opsentra-cloudwatch-config.json

```

---

# Default Logs Collected

The agent collects logs from common system and application paths.

### System Logs

```

/var/log/syslog
/var/log/messages
/var/log/auth.log

```

---

### Nginx Logs

```

/var/log/nginx/access.log
/var/log/nginx/error.log

```

---

### Docker Logs

```

/var/lib/docker/containers/*/*-json.log

```

These logs allow monitoring of containerized services.

---

# Log Groups

The agent automatically creates CloudWatch log groups with the format:

```

opsentra-<workspace_id>-system
opsentra-<workspace_id>-nginx
opsentra-<workspace_id>-docker

```

Each EC2 instance gets its own log stream.

Example:

```

opsentra-69af2663ae6ce934f64e0f19-system
└── i-0b7e2cdf32e2c76e1-syslog

```

---

# Agent Service

After configuration, the CloudWatch agent runs as a system service:

```

amazon-cloudwatch-agent.service

```

Check status:

```

systemctl status amazon-cloudwatch-agent

```

Restart:

```

sudo systemctl restart amazon-cloudwatch-agent

```

View logs:

```

tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log

```

---

# Server Registration

After installation, the agent registers the server with Opsentra.

Request sent:

```

POST /api/v1/servers/register

```

Payload:

```

{
"instance_id": "...",
"instance_name": "...",
"workspace_id": "...",
"region": "..."
}

```

This allows the dashboard to display the server and associate logs with it.

---

# Log Flow

The complete log flow is:

```

Server Logs
│
▼
CloudWatch Agent
│
▼
AWS CloudWatch Logs
│
▼
Opsentra LogCollectorWorker
│
▼
Redis Queue
│
▼
MongoDB
│
▼
Opsentra Dashboard

```

---

# Security Model

The agent does **not require AWS credentials**.

Instead it uses the IAM role attached to the EC2 instance.

Required policy:

```

CloudWatchAgentServerPolicy

```

This ensures:

- secure log delivery
- no credentials stored on the instance

---

# Troubleshooting

### Check Agent Status

```

systemctl status amazon-cloudwatch-agent

```

---

### Restart Agent

```

sudo systemctl restart amazon-cloudwatch-agent

```

---

### View Agent Logs

```

tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log

```

---

### Verify Docker Logs

```

ls /var/lib/docker/containers/*/*-json.log

```

---

# Future Improvements

Planned improvements for the Opsentra Agent include:

### Auto Service Discovery

Automatically detect:

- running containers
- installed services
- Kubernetes pods

---

### AI Log Analysis

Future versions will include an AI-powered assistant that:

- analyzes log patterns
- detects infrastructure errors
- suggests commands to fix issues

Example:

```

Detected: nginx upstream timeout
Suggested fix: restart nginx
Command: sudo systemctl restart nginx

```

---

# Summary

The Opsentra agent provides a **simple one-command installation process** that enables automatic log collection from infrastructure servers.

By combining the CloudWatch agent with automated registration and configuration, Opsentra makes log monitoring **plug-and-play for cloud environments**.