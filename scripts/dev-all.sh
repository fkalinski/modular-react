#!/bin/bash

# Development helper script to run all modules concurrently
# Each module represents a separate "repository" in production
#
# Usage:
#   ./scripts/dev-all.sh start    - Start all services
#   ./scripts/dev-all.sh stop     - Stop all services
#   ./scripts/dev-all.sh restart  - Restart all services
#   ./scripts/dev-all.sh status   - Show status of all services

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# PID file to track running services
PID_FILE="/tmp/modular-react.pids"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Service definitions (name:port:directory:logfile)
declare -a SERVICES=(
  "shared-components:3001:shared-components:shared-components.log"
  "shared-data:3002:shared-data:shared-data.log"
  "content-shell:3003:content-platform/shell:content-shell.log"
  "files-tab:3004:content-platform/files-folders:files-tab.log"
  "hubs-tab:3005:hubs-tab:hubs-tab.log"
  "reports-tab:3006:reports-tab:reports-tab.log"
  "user-tab:3007:user-tab:user-tab.log"
  "top-level-shell:3000:top-level-shell:top-level-shell.log"
)

# Check if a process is running
is_running() {
  local pid=$1
  [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

# Start a single service
start_service() {
  local name=$1
  local port=$2
  local dir=$3
  local logfile=$4

  cd "$PROJECT_ROOT/$dir" || return 1
  npm run dev > "/tmp/$logfile" 2>&1 &
  local pid=$!

  echo "$name:$pid:$port" >> "$PID_FILE"
  echo -e "${GREEN}✓${NC} $name: http://localhost:$port (PID: $pid)"

  sleep 2
}

# Stop a single service by PID
stop_service() {
  local name=$1
  local pid=$2
  local port=$3

  if is_running "$pid"; then
    echo -e "${YELLOW}⏹ ${NC} Stopping $name (PID: $pid)..."
    kill "$pid" 2>/dev/null
    sleep 1

    # Force kill if still running
    if is_running "$pid"; then
      kill -9 "$pid" 2>/dev/null
      echo -e "${RED}✗${NC} Force killed $name"
    else
      echo -e "${GREEN}✓${NC} Stopped $name"
    fi
  else
    echo -e "${YELLOW}⊗${NC} $name (PID: $pid) not running"
  fi

  # Also kill any process using the port
  local port_pid=$(lsof -ti:$port 2>/dev/null)
  if [ -n "$port_pid" ] && [ "$port_pid" != "$pid" ]; then
    echo -e "${YELLOW}⚠${NC}  Killing process $port_pid using port $port"
    kill -9 "$port_pid" 2>/dev/null
  fi
}

# Start all services
start_all() {
  echo "🚀 Starting Modular React Platform (all modules)..."
  echo ""

  # Check if already running
  if [ -f "$PID_FILE" ]; then
    echo -e "${YELLOW}⚠${NC}  Services may already be running. Use 'stop' first or 'restart'"
    echo -e "${YELLOW}⚠${NC}  PID file exists: $PID_FILE"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi

  # Create/clear PID file
  > "$PID_FILE"

  echo -e "${BLUE}🏗️  Starting development servers...${NC}"
  echo ""

  # Start each service
  for service in "${SERVICES[@]}"; do
    IFS=':' read -r name port dir logfile <<< "$service"
    start_service "$name" "$port" "$dir" "$logfile"
  done

  echo ""
  echo -e "${GREEN}🎉 All services started!${NC}"
  echo ""
  echo -e "${BLUE}📱 Access the platform:${NC}"
  echo "   Main Application: http://localhost:3000"
  echo ""
  echo -e "${BLUE}📋 Logs available in /tmp/*.log${NC}"
  echo -e "${BLUE}🛠️  Manage services:${NC}"
  echo "   ./scripts/dev-all.sh stop     - Stop all services"
  echo "   ./scripts/dev-all.sh restart  - Restart all services"
  echo "   ./scripts/dev-all.sh status   - Check service status"
  echo ""
}

# Stop all services
stop_all() {
  echo "🛑 Stopping Modular React Platform..."
  echo ""

  if [ ! -f "$PID_FILE" ]; then
    echo -e "${YELLOW}⚠${NC}  No PID file found at $PID_FILE"
    echo -e "${YELLOW}⚠${NC}  Services may not be running or were started manually"
    echo ""

    # Try to kill by port
    echo "Checking for processes on known ports..."
    for service in "${SERVICES[@]}"; do
      IFS=':' read -r name port dir logfile <<< "$service"
      local port_pid=$(lsof -ti:$port 2>/dev/null)
      if [ -n "$port_pid" ]; then
        echo -e "${YELLOW}⚠${NC}  Found process $port_pid on port $port ($name)"
        kill -9 "$port_pid" 2>/dev/null && echo -e "${GREEN}✓${NC} Killed $name"
      fi
    done
    return
  fi

  # Stop each service from PID file
  while IFS=':' read -r name pid port; do
    stop_service "$name" "$pid" "$port"
  done < "$PID_FILE"

  # Remove PID file
  rm -f "$PID_FILE"

  echo ""
  echo -e "${GREEN}✓ All services stopped${NC}"
}

# Show status of all services
status_all() {
  echo "📊 Service Status"
  echo ""

  if [ ! -f "$PID_FILE" ]; then
    echo -e "${YELLOW}⚠${NC}  No PID file found. Services not started with this script."
    echo ""
    echo "Checking ports manually:"
    for service in "${SERVICES[@]}"; do
      IFS=':' read -r name port dir logfile <<< "$service"
      local port_pid=$(lsof -ti:$port 2>/dev/null)
      if [ -n "$port_pid" ]; then
        echo -e "${GREEN}✓${NC} $name: Running (PID: $port_pid, Port: $port)"
      else
        echo -e "${RED}✗${NC} $name: Not running (Port: $port)"
      fi
    done
    return
  fi

  # Check each service from PID file
  while IFS=':' read -r name pid port; do
    if is_running "$pid"; then
      echo -e "${GREEN}✓${NC} $name: Running (PID: $pid, Port: $port) http://localhost:$port"
    else
      echo -e "${RED}✗${NC} $name: Dead (PID: $pid was running on Port: $port)"

      # Check if port is still in use
      local port_pid=$(lsof -ti:$port 2>/dev/null)
      if [ -n "$port_pid" ]; then
        echo -e "   ${YELLOW}⚠${NC}  Port $port in use by PID: $port_pid (orphan process)"
      fi
    fi
  done < "$PID_FILE"
}

# Main command handler
case "${1:-start}" in
  start)
    start_all
    ;;
  stop)
    stop_all
    ;;
  restart)
    echo "🔄 Restarting services..."
    echo ""
    stop_all
    echo ""
    sleep 2
    start_all
    ;;
  status)
    status_all
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status}"
    echo ""
    echo "  start    - Start all development servers"
    echo "  stop     - Stop all development servers"
    echo "  restart  - Restart all development servers"
    echo "  status   - Show status of all services"
    exit 1
    ;;
esac
