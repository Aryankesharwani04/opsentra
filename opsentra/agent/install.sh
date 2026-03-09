#!/usr/bin/env bash
# =============================================================================
# Opsentra CloudWatch Agent Installer
# =============================================================================
# Usage:
#   curl -sSL https://agent.opsentra.io/install.sh | bash -s <workspace_id>
#
# Or with explicit flags:
#   bash install.sh --workspace-id <id> [--api-url <url>] [--instance-name <name>] [--auto-register]
#
# Supports: Ubuntu 20.04 / 22.04 / 24.04  |  Amazon Linux 2 / Amazon Linux 2023
# Requires: Root privileges
# =============================================================================

set -euo pipefail

# ── Colour helpers ────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'
info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; exit 1; }

# ── Banner ────────────────────────────────────────────────────────
echo -e "${BOLD}"
echo "  ___  _ __  ___  ___ _ __ | |_ _ __ __ _ "
echo " / _ \| '_ \/ __|/ _ \ '_ \| __| '__/ _\` |"
echo "| (_) | |_) \__ \  __/ | | | |_| | | (_| |"
echo " \___/| .__/|___/\___|_| |_|\__|_|  \__,_|"
echo "      |_|   CloudWatch Agent Installer v1.0"
echo -e "${RESET}"

# ── Parse arguments ───────────────────────────────────────────────
WORKSPACE_ID=""
API_URL="https://api.opsentra.io/api/v1"
INSTANCE_NAME=""
AUTO_REGISTER=false

# Support positional: curl ... | bash -s <workspace_id>
if [[ $# -ge 1 && "$1" != --* ]]; then
  WORKSPACE_ID="$1"
  shift
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --workspace-id)  WORKSPACE_ID="$2";   shift 2 ;;
    --api-url)       API_URL="$2";        shift 2 ;;
    --instance-name) INSTANCE_NAME="$2";  shift 2 ;;
    --auto-register) AUTO_REGISTER=true;  shift 1 ;;
    *) warn "Unknown argument: $1"; shift ;;
  esac
done

[[ -z "$WORKSPACE_ID" ]] && error "workspace_id is required. Usage: bash install.sh <workspace_id>"

# ── Root check ────────────────────────────────────────────────────
[[ $EUID -ne 0 ]] && error "This script must be run as root (sudo bash install.sh ...)"

# ── OS Detection ──────────────────────────────────────────────────
detect_os() {
  if [[ -f /etc/os-release ]]; then
    # shellcheck source=/dev/null
    source /etc/os-release
    OS_ID="${ID:-unknown}"
    OS_VERSION_ID="${VERSION_ID:-unknown}"
  else
    error "Cannot detect OS. /etc/os-release not found."
  fi

  case "$OS_ID" in
    ubuntu|debian)
      PKG_MANAGER="apt"
      CW_AGENT_URL="https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb"
      CW_AGENT_PKG="/tmp/amazon-cloudwatch-agent.deb"
      ;;
    amzn)
      PKG_MANAGER="yum"
      if [[ "$OS_VERSION_ID" == "2023" ]]; then
        CW_AGENT_URL="https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm"
      else
        CW_AGENT_URL="https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm"
      fi
      CW_AGENT_PKG="/tmp/amazon-cloudwatch-agent.rpm"
      ;;
    rhel|centos|fedora)
      PKG_MANAGER="yum"
      CW_AGENT_URL="https://s3.amazonaws.com/amazoncloudwatch-agent/redhat/amd64/latest/amazon-cloudwatch-agent.rpm"
      CW_AGENT_PKG="/tmp/amazon-cloudwatch-agent.rpm"
      ;;
    *)
      error "Unsupported OS: $OS_ID. Supported: Ubuntu, Debian, Amazon Linux 2/2023, RHEL, CentOS."
      ;;
  esac

  info "Detected OS: ${OS_ID} ${OS_VERSION_ID} (package manager: ${PKG_MANAGER})"
}

detect_os

# ── Detect EC2 Instance ID (IMDSv2) ──────────────────────────────
info "Retrieving EC2 instance metadata..."

IMDS_TOKEN=$(curl -sSf \
  --connect-timeout 3 \
  -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 60" 2>/dev/null || echo "")

if [[ -n "$IMDS_TOKEN" ]]; then
  INSTANCE_ID=$(curl -sSf \
    --connect-timeout 3 \
    -H "X-aws-ec2-metadata-token: $IMDS_TOKEN" \
    "http://169.254.169.254/latest/meta-data/instance-id" 2>/dev/null || echo "")
  AWS_REGION=$(curl -sSf \
    --connect-timeout 3 \
    -H "X-aws-ec2-metadata-token: $IMDS_TOKEN" \
    "http://169.254.169.254/latest/meta-data/placement/region" 2>/dev/null || echo "us-east-1")
else
  warn "Could not reach EC2 metadata service. Using fallback values."
  INSTANCE_ID="local-$(hostname)"
  AWS_REGION="us-east-1"
fi

[[ -z "$INSTANCE_NAME" ]] && INSTANCE_NAME="${INSTANCE_ID}"

info "Instance ID : ${INSTANCE_ID}"
info "Region      : ${AWS_REGION}"
info "Workspace ID: ${WORKSPACE_ID}"

# ── Log group names ───────────────────────────────────────────────
LOG_GROUP_SYSTEM="opsentra-${WORKSPACE_ID}-system"
LOG_GROUP_NGINX="opsentra-${WORKSPACE_ID}-nginx"
LOG_GROUP_DOCKER="opsentra-${WORKSPACE_ID}-docker"

info "Log group   : ${LOG_GROUP_SYSTEM}"

# ── Install prerequisites ─────────────────────────────────────────
info "Installing prerequisites..."

if [[ "$PKG_MANAGER" == "apt" ]]; then
  apt-get update -qq
  apt-get install -y -qq curl wget unzip jq 2>/dev/null || true
else
  yum install -y -q curl wget unzip jq 2>/dev/null || true
fi

success "Prerequisites installed."

# ── Download & Install CloudWatch Agent ──────────────────────────
if command -v amazon-cloudwatch-agent-ctl &>/dev/null; then
  success "Amazon CloudWatch Agent already installed. Skipping download."
else
  info "Downloading Amazon CloudWatch Agent..."
  curl -sSfL "$CW_AGENT_URL" -o "$CW_AGENT_PKG"

  info "Installing Amazon CloudWatch Agent..."
  if [[ "$PKG_MANAGER" == "apt" ]]; then
    dpkg -i -E "$CW_AGENT_PKG"
    apt-get install -f -y -qq
  else
    rpm -U --force "$CW_AGENT_PKG"
  fi

  rm -f "$CW_AGENT_PKG"
  success "Amazon CloudWatch Agent installed."
fi

# ── Generate CloudWatch Agent Configuration ───────────────────────
CW_CONFIG_DIR="/opt/aws/amazon-cloudwatch-agent/etc"
CW_CONFIG_FILE="${CW_CONFIG_DIR}/opsentra-cloudwatch-config.json"

mkdir -p "$CW_CONFIG_DIR"

info "Generating CloudWatch agent configuration..."

# Build Docker log collection (requires Docker to be installed)
DOCKER_LOGS_CONFIG=""
if command -v docker &>/dev/null; then
  DOCKER_LOGS_CONFIG=',
          {
            "file_path": "/var/lib/docker/containers/*/*.log",
            "log_group_name": "'"${LOG_GROUP_DOCKER}"'",
            "log_stream_name": "'"${INSTANCE_ID}"'-docker-{hostname}",
            "timestamp_format": "%Y-%m-%dT%H:%M:%S",
            "timezone": "UTC",
            "multi_line_start_pattern": "{timestamp_format}",
            "retention_in_days": 90
          }'
fi

cat > "$CW_CONFIG_FILE" << EOF
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "root",
    "region": "${AWS_REGION}",
    "logfile": "/opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log"
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
          },
          {
            "file_path": "/var/log/auth.log",
            "log_group_name": "${LOG_GROUP_SYSTEM}",
            "log_stream_name": "${INSTANCE_ID}-auth",
            "timestamp_format": "%b %d %H:%M:%S",
            "timezone": "LOCAL",
            "retention_in_days": 30
          }${DOCKER_LOGS_CONFIG}
        ]
      }
    },
    "log_stream_name": "${INSTANCE_ID}-default",
    "force_flush_interval": 15
  }
}
EOF

success "CloudWatch agent configuration written to: ${CW_CONFIG_FILE}"

# ── Apply config & Start Agent ────────────────────────────────────
info "Applying configuration and starting CloudWatch agent..."

amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c "file:${CW_CONFIG_FILE}"

# Enable and ensure service is running
if command -v systemctl &>/dev/null; then
  systemctl enable amazon-cloudwatch-agent
  systemctl restart amazon-cloudwatch-agent

  sleep 2  # Give the service a moment to start

  if systemctl is-active --quiet amazon-cloudwatch-agent; then
    success "Amazon CloudWatch agent is running."
  else
    warn "CloudWatch agent may not have started. Check: journalctl -u amazon-cloudwatch-agent -n 50"
  fi
else
  # SysV init (older systems)
  service amazon-cloudwatch-agent restart || true
  success "CloudWatch agent started (SysV init)."
fi

# ── Auto-register with Opsentra API ──────────────────────────────
if [[ "$AUTO_REGISTER" == true && -n "$API_URL" ]]; then
  info "Registering instance with Opsentra API..."

  REGISTER_RESPONSE=$(curl -sSf \
    -X POST "${API_URL}/servers/register" \
    -H "Content-Type: application/json" \
    -d '{
      "instance_id": "'"${INSTANCE_ID}"'",
      "instance_name": "'"${INSTANCE_NAME}"'",
      "workspace_id": "'"${WORKSPACE_ID}"'",
      "region": "'"${AWS_REGION}"'"
    }' 2>/dev/null || echo '{"error":"registration_failed"}')

  if echo "$REGISTER_RESPONSE" | grep -q '"status":"success"'; then
    success "Instance registered with Opsentra successfully."
  else
    warn "Auto-registration failed. Register manually in the Opsentra dashboard."
    warn "Response: ${REGISTER_RESPONSE}"
  fi
fi

# ── Summary ───────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}✅ Opsentra agent setup complete!${RESET}"
echo ""
echo -e "  ${BOLD}Instance ID:${RESET}      ${INSTANCE_ID}"
echo -e "  ${BOLD}Workspace ID:${RESET}     ${WORKSPACE_ID}"
echo -e "  ${BOLD}Log Groups:${RESET}"
echo -e "    System logs →   ${LOG_GROUP_SYSTEM}"
echo -e "    Nginx logs  →   ${LOG_GROUP_NGINX}"
[[ -n "$DOCKER_LOGS_CONFIG" ]] && \
echo -e "    Docker logs →   ${LOG_GROUP_DOCKER}"
echo ""
echo -e "  ${BOLD}Next steps:${RESET}"
echo -e "    1. Go to Opsentra dashboard → Servers"
echo -e "    2. Add instance: ${INSTANCE_ID}"
echo -e "    3. Logs will appear in CloudWatch within 1–2 minutes"
echo ""
echo -e "  ${BOLD}Useful commands:${RESET}"
echo -e "    Status:  systemctl status amazon-cloudwatch-agent"
echo -e "    Logs:    tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log"
echo -e "    Restart: sudo systemctl restart amazon-cloudwatch-agent"
echo ""
