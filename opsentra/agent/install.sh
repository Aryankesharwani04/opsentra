#!/usr/bin/env bash
# =============================================================================
# Opsentra CloudWatch Agent Installer
# =============================================================================
# Usage:
#   curl -sSL https://agent.opsentra.io/install.sh | bash -s <workspace_id>
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'
info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; exit 1; }

echo -e "${BOLD}"
echo "  ___  _ __  ___  ___ _ __ | |_ _ __ __ _ "
echo " / _ \| '_ \/ __|/ _ \ '_ \| __| '__/ _\` |"
echo "| (_) | |_) \__ \  __/ | | | |_| | | (_| |"
echo " \___/| .__/|___/\___|_| |_|\__|_|  \__,_|"
echo "      |_|   CloudWatch Agent Installer v1.0"
echo -e "${RESET}"

WORKSPACE_ID="${1:-}"
[[ -z "$WORKSPACE_ID" ]] && error "workspace_id required"

[[ $EUID -ne 0 ]] && error "Run as root"

source /etc/os-release

if [[ "$ID" == "ubuntu" || "$ID" == "debian" ]]; then
  PKG_MANAGER="apt"
  CW_AGENT_URL="https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb"
  CW_AGENT_PKG="/tmp/amazon-cloudwatch-agent.deb"
else
  PKG_MANAGER="yum"
  CW_AGENT_URL="https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm"
  CW_AGENT_PKG="/tmp/amazon-cloudwatch-agent.rpm"
fi

IMDS_TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
 -H "X-aws-ec2-metadata-token-ttl-seconds: 60" || true)

INSTANCE_ID=$(curl -s -H "X-aws-ec2-metadata-token: $IMDS_TOKEN" \
 http://169.254.169.254/latest/meta-data/instance-id)

AWS_REGION=$(curl -s -H "X-aws-ec2-metadata-token: $IMDS_TOKEN" \
 http://169.254.169.254/latest/meta-data/placement/region)

LOG_GROUP_SYSTEM="opsentra-${WORKSPACE_ID}-system"
LOG_GROUP_NGINX="opsentra-${WORKSPACE_ID}-nginx"
LOG_GROUP_DOCKER="opsentra-${WORKSPACE_ID}-docker"

info "Installing prerequisites..."

if [[ "$PKG_MANAGER" == "apt" ]]; then
  apt-get update -qq
  apt-get install -y curl wget unzip jq
else
  yum install -y curl wget unzip jq
fi

success "Prerequisites installed."

if ! command -v amazon-cloudwatch-agent-ctl &>/dev/null; then
  info "Downloading CloudWatch agent..."
  curl -sSL "$CW_AGENT_URL" -o "$CW_AGENT_PKG"

  if [[ "$PKG_MANAGER" == "apt" ]]; then
    dpkg -i "$CW_AGENT_PKG"
    apt-get install -f -y
  else
    rpm -U "$CW_AGENT_PKG"
  fi

  rm -f "$CW_AGENT_PKG"
fi

success "CloudWatch agent installed."

CW_CONFIG="/opt/aws/amazon-cloudwatch-agent/etc/opsentra-cloudwatch-config.json"

mkdir -p /opt/aws/amazon-cloudwatch-agent/etc

cat > "$CW_CONFIG" <<EOF
{
 "agent": {
  "metrics_collection_interval": 60,
  "run_as_user": "root",
  "region": "${AWS_REGION}"
 },
 "logs": {
  "logs_collected": {
   "files": {
    "collect_list": [
     {
      "file_path": "/var/log/syslog",
      "log_group_name": "${LOG_GROUP_SYSTEM}",
      "log_stream_name": "${INSTANCE_ID}-syslog",
      "timestamp_format": "%b %d %H:%M:%S",
      "timezone": "LOCAL",
      "retention_in_days": 90
     },
     {
      "file_path": "/var/log/messages",
      "log_group_name": "${LOG_GROUP_SYSTEM}",
      "log_stream_name": "${INSTANCE_ID}-messages",
      "timestamp_format": "%b %d %H:%M:%S",
      "timezone": "LOCAL",
      "retention_in_days": 90
     },
     {
      "file_path": "/var/log/auth.log",
      "log_group_name": "${LOG_GROUP_SYSTEM}",
      "log_stream_name": "${INSTANCE_ID}-auth",
      "timestamp_format": "%b %d %H:%M:%S",
      "timezone": "LOCAL",
      "retention_in_days": 90
     },
     {
      "file_path": "/var/log/nginx/access.log",
      "log_group_name": "${LOG_GROUP_NGINX}",
      "log_stream_name": "${INSTANCE_ID}-nginx-access",
      "timestamp_format": "%d/%b/%Y:%H:%M:%S %z",
      "timezone": "UTC",
      "retention_in_days": 90
     },
     {
      "file_path": "/var/log/nginx/error.log",
      "log_group_name": "${LOG_GROUP_NGINX}",
      "log_stream_name": "${INSTANCE_ID}-nginx-error",
      "timestamp_format": "%Y/%m/%d %H:%M:%S",
      "timezone": "UTC",
      "retention_in_days": 90
     }
    ]
   }
  }
 }
}
EOF

success "Config created."

amazon-cloudwatch-agent-ctl \
 -a fetch-config \
 -m ec2 \
 -c file:$CW_CONFIG \
 -s

systemctl enable amazon-cloudwatch-agent
systemctl restart amazon-cloudwatch-agent

success "CloudWatch agent running."

echo ""
echo "Opsentra setup complete"
echo "Instance ID: $INSTANCE_ID"
echo "Workspace: $WORKSPACE_ID"
echo "Log group: $LOG_GROUP_SYSTEM"
echo ""