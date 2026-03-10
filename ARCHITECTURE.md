# Opsentra Architecture

This document describes the internal architecture and system design of **Opsentra — Centralized Logging Platform**.

Opsentra is built to collect logs from distributed infrastructure, process them through a scalable ingestion pipeline, and present them in a real-time observability dashboard.

---

# High Level Architecture

```

EC2 Instance
│
│ CloudWatch Agent (installed by Opsentra agent)
▼
AWS CloudWatch Logs
│
│ STS AssumeRole
▼
Opsentra Backend
│
├── LogCollectorWorker
│      │
│      ▼
│    Redis Queue
│      │
│      ▼
└── DbInsertWorker
│
▼
MongoDB
│
▼
WebSocket / REST API
│
▼
React Dashboard

```

---

# Core Components

## 1. Opsentra Agent

The **Opsentra Agent** is a lightweight installation script that runs on EC2 instances.

Responsibilities:

- Install Amazon CloudWatch Agent
- Configure log collection paths
- Detect instance metadata (IMDSv2)
- Configure log groups automatically
- Register the server with Opsentra backend
- Start CloudWatch log streaming

Example logs collected:

```

/var/log/syslog
/var/log/auth.log
/var/log/nginx/*.log
/var/lib/docker/containers/*/*-json.log

```

The agent ensures infrastructure logs are automatically forwarded to CloudWatch.

---

# AWS CloudWatch Integration

Opsentra does **not store AWS credentials**.

Instead it uses:

```

AWS STS AssumeRole

```

Users connect AWS accounts by providing an **IAM Role ARN** with read-only permissions.

Backend then temporarily assumes that role to read logs from CloudWatch.

Benefits:

- secure
- no long-term credentials stored
- enterprise-grade integration

---

# Log Ingestion Pipeline

Opsentra uses a **queue-based ingestion architecture** to ensure scalability.

Pipeline flow:

```

CloudWatch Logs
│
▼
LogCollectorWorker
│
▼
Redis Queue
│
▼
DbInsertWorker
│
▼
MongoDB
│
▼
WebSocket broadcast

```

---

# Workers

Opsentra uses background workers to decouple ingestion and storage.

---

## LogCollectorWorker

Runs every **10 seconds**.

Responsibilities:

- Assume AWS IAM role
- Fetch CloudWatch log events
- Maintain log group cursors
- Push new log events into Redis queue

Advantages:

- prevents duplicate ingestion
- supports multiple log groups
- scales horizontally

---

## DbInsertWorker

Runs every **3 seconds**.

Responsibilities:

- consume Redis queue
- batch insert logs into MongoDB
- publish logs to WebSocket clients
- update recent logs cache

Batch insertion improves database performance and reduces write overhead.

---

# Backend Architecture

Backend follows a modular architecture:

```

src/
│
├── controllers
│
├── routes
│
├── services
│
├── workers
│
├── middleware
│
├── models
│
└── utils

```

Each layer has a clear responsibility.

---

## Controllers

Handle HTTP request logic.

Examples:

```

authController
awsController
serverController
logController
agentController

```

---

## Services

Business logic layer.

Examples:

```

authService
awsAssumeRoleService
logStreamService
serverService

```

Services isolate domain logic from controllers.

---

## Middleware

Cross-cutting concerns:

```

auth middleware
rate limiter
validation middleware
error handler

```

---

# Data Storage

Opsentra uses a **hybrid storage architecture**.

---

## MongoDB

Primary persistent storage.

Stores:

- log entries
- user accounts
- workspaces
- server instances
- AWS integrations
- ingestion cursors

MongoDB works well for log workloads due to flexible schema.

---

## Redis

Used for **high-speed data processing**.

Responsibilities:

- ingestion queue
- pub/sub for live logs
- rate limiting store
- caching recent logs

Redis acts as a **buffer between ingestion and storage**.

---

# Live Log Streaming

Logs are delivered to the dashboard using two mechanisms:

### Polling

Frontend polls recent logs periodically.

```

GET /logs/recent

```

### WebSocket Broadcast

Workers publish new logs to connected clients.

Benefits:

- near real-time updates
- efficient client updates

---

# Log Level Classification

Opsentra automatically categorizes logs based on message content.

| Level | Detection |
|------|------|
| ERROR | error, exception, fatal |
| WARN | warn, deprecated |
| DEBUG | debug, trace |
| INFO | default |

This allows quick filtering inside the dashboard.

---

# Multi-Tenant Architecture

Opsentra supports **workspace isolation**.

Each workspace contains:

```

users
servers
AWS integrations
logs

```

Logs are always scoped by:

```

workspaceId

```

This enables secure multi-tenant deployments.

---

# Security Model

Opsentra implements several security layers.

### Authentication

```

JWT Access Tokens
JWT Refresh Tokens

```

Access tokens are short-lived.

---

### Password Security

Passwords are hashed using:

```

bcrypt

```

---

### API Protection

Backend includes:

- rate limiting
- CORS restrictions
- input validation
- HTTP security headers

---

### AWS Security

AWS access uses:

```

STS AssumeRole

```

No AWS secrets are stored in the database.

---

# Scalability Design

Opsentra is designed for high log throughput.

Key scaling strategies:

### Queue-based ingestion

Redis decouples ingestion and storage.

### Batch database writes

Workers insert logs in batches.

### Horizontal workers

Multiple collectors can run simultaneously.

### Stateless API servers

Backend servers can scale horizontally.

---

# Future Architecture

Opsentra roadmap includes:

### AI Log Analysis Agent

An AI system will analyze logs and suggest fixes.

Example:

```

Detected: Nginx 502 error
Suggested fix: restart nginx
Command: sudo systemctl restart nginx

```

---

### Alerting System

- Slack notifications
- Email alerts
- PagerDuty integration

---

### Kubernetes Support

Future support for:

```

Kubernetes pod logs
container logs
cluster observability

```

---

### Anomaly Detection

Machine learning models will detect:

- unusual error spikes
- infrastructure anomalies
- performance degradation

---

# Summary

Opsentra provides a scalable logging architecture by combining:

```

CloudWatch ingestion
Redis streaming
MongoDB storage
Real-time dashboards

```

This architecture allows developers to monitor distributed infrastructure from a single unified platform.
```