#!/bin/bash

# Ricochet Game Server Startup Script
# This script provides multiple ways to start a local web server for the game

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default port
DEFAULT_PORT=8000
PORT=${1:-$DEFAULT_PORT}

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}🎮 Ricochet Game Server Startup${NC}"
echo -e "${BLUE}=================================${NC}"
echo

# Function to check if port is available
check_port() {
    if command -v lsof >/dev/null 2>&1; then
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
            return 1
        fi
    elif command -v netstat >/dev/null 2>&1; then
        if netstat -ln | grep -q ":$PORT "; then
            return 1
        fi
    fi
    return 0
}

# Function to open browser
open_browser() {
    local url=$1
    echo -e "${GREEN}🚀 Opening browser...${NC}"

    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$url" >/dev/null 2>&1
    elif command -v gnome-open >/dev/null 2>&1; then
        gnome-open "$url" >/dev/null 2>&1
    elif command -v kde-open >/dev/null 2>&1; then
        kde-open "$url" >/dev/null 2>&1
    else
        echo -e "${YELLOW}⚠️  Could not auto-open browser${NC}"
        echo -e "${YELLOW}📝 Manually open: $url${NC}"
    fi
}

# Function to start Python server
start_python_server() {
    echo -e "${GREEN}🐍 Starting Python HTTP server...${NC}"

    if command -v python3 >/dev/null 2>&1; then
        cd "$SCRIPT_DIR"
        if [ -f "serve.py" ]; then
            python3 serve.py $PORT
        else
            python3 -m http.server $PORT --bind localhost
        fi
    elif command -v python >/dev/null 2>&1; then
        cd "$SCRIPT_DIR"
        python -m http.server $PORT --bind localhost
    else
        return 1
    fi
}

# Function to start Node.js server
start_node_server() {
    echo -e "${GREEN}🟢 Starting Node.js HTTP server...${NC}"

    if command -v node >/dev/null 2>&1; then
        cd "$SCRIPT_DIR"
        if [ -f "serve.js" ]; then
            node serve.js $PORT
        else
            return 1
        fi
    else
        return 1
    fi
}

# Function to start PHP server
start_php_server() {
    echo -e "${GREEN}🐘 Starting PHP built-in server...${NC}"

    if command -v php >/dev/null 2>&1; then
        cd "$SCRIPT_DIR"
        echo -e "${BLUE}📄 Game URLs:${NC}"
        echo -e "${BLUE}   • Original:     http://localhost:$PORT/index.html${NC}"
        echo -e "${BLUE}   • Modular:      http://localhost:$PORT/index-modular.html${NC}"
        echo -e "${BLUE}   • Level Editor: http://localhost:$PORT/level-parser-demo.html${NC}"
        echo -e "${YELLOW}⚡ Press Ctrl+C to stop the server${NC}"
        echo

        # Auto-open browser after a short delay
        (sleep 2 && open_browser "http://localhost:$PORT/index-modular.html") &

        php -S localhost:$PORT
    else
        return 1
    fi
}

# Function to show manual instructions
show_manual_instructions() {
    echo -e "${RED}❌ No suitable web server found${NC}"
    echo
    echo -e "${YELLOW}🔧 Manual Setup Options:${NC}"
    echo
    echo -e "${BLUE}Option 1: Install Python 3${NC}"
    echo "  sudo apt install python3  # Ubuntu/Debian"
    echo "  sudo yum install python3   # CentOS/RHEL"
    echo "  sudo pacman -S python      # Arch Linux"
    echo
    echo -e "${BLUE}Option 2: Install Node.js${NC}"
    echo "  sudo apt install nodejs    # Ubuntu/Debian"
    echo "  sudo yum install nodejs    # CentOS/RHEL"
    echo "  sudo pacman -S nodejs      # Arch Linux"
    echo
    echo -e "${BLUE}Option 3: Install PHP${NC}"
    echo "  sudo apt install php       # Ubuntu/Debian"
    echo "  sudo yum install php       # CentOS/RHEL"
    echo "  sudo pacman -S php         # Arch Linux"
    echo
    echo -e "${BLUE}Option 4: Use a different web server${NC}"
    echo "  nginx, apache, or any other HTTP server"
    echo "  Just serve the files from this directory"
    echo
    echo -e "${YELLOW}⚠️  Important: The modular version requires a web server${NC}"
    echo -e "${YELLOW}   (ES6 modules don't work with file:// protocol)${NC}"
}

# Main execution
echo -e "${BLUE}📁 Game directory: $SCRIPT_DIR${NC}"
echo -e "${BLUE}🌐 Using port: $PORT${NC}"
echo

# Check if port is available
if ! check_port; then
    echo -e "${RED}❌ Port $PORT is already in use${NC}"
    echo -e "${YELLOW}💡 Try a different port: $0 $((PORT + 1))${NC}"
    exit 1
fi

# Try different server options in order of preference
echo -e "${YELLOW}🔍 Checking available web servers...${NC}"

if start_node_server; then
    exit 0
elif start_python_server; then
    exit 0
elif start_php_server; then
    exit 0
else
    show_manual_instructions
    exit 1
fi
