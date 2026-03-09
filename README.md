# Opsentra: Centralized Logging Platform for DevOps Workflows

> **Docker, Fluentd, AWS, MERN Stack, Tailwind CSS**  
> *(April 2025 - Current)*

---

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Problems Solved](#problems-solved)
- [Solution & Features](#solution--features)
- [Integrations](#integrations)
  - [Docker Logs](#docker-logs)
  - [AWS Logs](#aws-logs)
  - [Linux Ubuntu Logs](#linux-ubuntu-logs)
  - [AI Suggestions (Future)](#ai-suggestions-future)
- [Setup & Usage](#setup--usage)
- [Future Plans](#future-plans)
- [License](#license)

---

## Overview
Opsentra is a unified platform designed to aggregate, analyze, and visualize logs from diverse DevOps environments. It streamlines log collection from Docker containers, AWS services, and Linux systems, providing actionable insights and centralized management for engineering teams.

## Architecture
```
+-------------------+      +-------------------+      +-------------------+
|   Docker Host     | ---> |   Fluentd Agent   | ---> |   Opsentra Backend|
+-------------------+      +-------------------+      +-------------------+
        |                        |                          |
        |                        |                          |
        v                        v                          v
+-------------------+      +-------------------+      +-------------------+
| AWS CloudWatch    | ---> | AWS Lambda        | ---> | AWS S3            |
+-------------------+      +-------------------+      +-------------------+
        |                        |                          |
        v                        v                          v
+-------------------+      +-------------------+      +-------------------+
| Linux Syslogs     | ---> | Fluentd Agent     | ---> | Opsentra Backend  |
+-------------------+      +-------------------+      +-------------------+
```
- **Frontend:** MERN stack web interface for log visualization and management
- **Backend:** Node.js/Express server for log ingestion, analysis, and API
- **Log Collection:** Fluentd Docker image, AWS Lambda, Linux syslog integration
- **Storage:** AWS S3 for log files, MongoDB for metadata
- **AI (Planned):** Gemini API for log analysis and command suggestions

## Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js, MongoDB
- **Log Collection:** Docker, Fluentd, AWS Lambda, AWS CloudWatch, Linux Syslog
- **Cloud & Storage:** AWS S3
- **AI (Planned):** Gemini API
- **Other:** Docker Hub (for agent distribution)

## Problems Solved
- Fragmented log sources across containers, cloud, and OS
- Manual log aggregation and slow troubleshooting
- Lack of real-time log visualization and error detection
- No unified platform for DevOps log management

## Solution & Features
- **Centralized Log Aggregation:** Collects logs from Docker containers, AWS services, and Linux systems
- **Automated Log Forwarding:** Fluentd agent forwards logs to Opsentra backend with user token
- **Unified Web Interface:** MERN stack dashboard for viewing, filtering, and managing logs
- **Error Analysis:** Backend differentiates error and normal logs for better visualization
- **AWS Integration:** Lambda functions collect logs, store in S3, and generate public URLs for backend ingestion
- **Linux Integration:** Collects syslogs from Ubuntu systems
- **Scalable & Secure:** Token-based authentication for log forwarding
- **Future AI Integration:** Gemini API for log analysis and command suggestions

## Integrations
### Docker Logs
- User runs Opsentra's Docker image (packaged Fluentd agent) on their host
- User provides their unique token/key
- Fluentd collects logs from all running containers
- Logs are forwarded to Opsentra backend via secure API
- One-step setup via Docker Hub image

### AWS Logs
- AWS CloudWatch monitors logs from AWS services
- Custom AWS Lambda function collects logs from specified services
- Lambda converts logs to CSV and stores in AWS S3
- Lambda generates public URLs for S3 log files
- Opsentra backend fetches logs from S3, analyzes, and visualizes them

### Linux Ubuntu Logs
- Fluentd agent installed on Ubuntu system
- Collects syslogs and forwards to Opsentra backend
- Enables monitoring of local system events and errors

### AI Suggestions (Future)
- Planned integration with Gemini API
- Analyze error logs and provide AI-powered command suggestions
- Help users resolve issues faster with automated troubleshooting steps

## Setup & Usage
1. **Docker Log Collection**
   - Pull Opsentra Fluentd image from Docker Hub
   - Run container with your token/key:
     ```sh
     docker run -d -e TOKEN_ID=your_token -v /var/lib/docker/containers:/fluentd/log opsentra/fluentd-agent
     ```
2. **AWS Log Collection**
   - Deploy provided AWS Lambda function
   - Configure CloudWatch log sources
   - Set up S3 bucket for log storage
   - Provide S3 public URL to Opsentra backend
3. **Linux Log Collection**
   - Install Fluentd agent on Ubuntu
   - Configure syslog forwarding
   - Provide token/key for authentication
4. **Web Dashboard**
   - Access MERN stack dashboard for log visualization and management

## Future Plans
- Integrate Gemini API for AI-powered log analysis and troubleshooting
- Expand support for more cloud providers and log sources
- Advanced alerting and notification system
- Role-based access and multi-tenancy

## License
*To be determined*

---

*For more details, see individual documentation for each integration and module. If any section needs more specifics, please update as required.*
