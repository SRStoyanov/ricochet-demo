# 🐧 Linux Setup Guide for Ricochet Game

This guide explains how to run the modular Ricochet game on Linux systems and addresses common issues.

## 🚨 Important: Why You Need a Web Server

The modular version uses **ES6 modules** (`import`/`export` statements), which are blocked by browsers when loading files directly via `file://` protocol for security reasons. This means:

- ❌ **Won't work**: Double-clicking `index-modular.html` 
- ✅ **Will work**: Serving files through a web server

## 🚀 Quick Start (Recommended)

### Option 1: Automated Server Script
```bash
# Make script executable (if not already)
chmod +x start-server.sh

# Start server (auto-detects best option)
./start-server.sh

# Or specify custom port
./start-server.sh 8080
```

The script will:
- 🔍 Check for available web servers (Node.js, Python, PHP)
- 🌐 Start the best available server
- 🚀 Auto-open your browser
- 📝 Show you all the URLs

### Option 2: Python Server (Most Common)
```bash
# Python 3 (recommended)
python3 serve.py

# Or use built-in server
python3 -m http.server 8000

# Python 2 (if you only have Python 2)
python -m SimpleHTTPServer 8000
```

### Option 3: Node.js Server
```bash
# Using our custom server
node serve.js

# Or specify port
node serve.js 8080
```

### Option 4: PHP Server
```bash
php -S localhost:8000
```

## 🔧 Installation Commands by Distribution

### Ubuntu/Debian
```bash
# Install Python 3
sudo apt update
sudo apt install python3

# Install Node.js
sudo apt install nodejs npm

# Install PHP
sudo apt install php
```

### CentOS/RHEL/Fedora
```bash
# Install Python 3
sudo yum install python3          # CentOS 7
sudo dnf install python3          # CentOS 8+/Fedora

# Install Node.js
sudo yum install nodejs npm       # CentOS 7
sudo dnf install nodejs npm       # CentOS 8+/Fedora

# Install PHP
sudo yum install php              # CentOS 7
sudo dnf install php              # CentOS 8+/Fedora
```

### Arch Linux
```bash
# Install Python 3
sudo pacman -S python

# Install Node.js
sudo pacman -S nodejs npm

# Install PHP
sudo pacman -S php
```

### openSUSE
```bash
# Install Python 3
sudo zypper install python3

# Install Node.js
sudo zypper install nodejs npm

# Install PHP
sudo zypper install php
```

## 🌐 Game URLs

Once your server is running, access these URLs:

- **🎮 Modular Game**: `http://localhost:8000/index-modular.html`
- **📄 Original Game**: `http://localhost:8000/index.html`
- **🎨 Level Editor**: `http://localhost:8000/level-parser-demo.html`

## 🔍 Troubleshooting

### Problem: Port Already in Use
```bash
# Check what's using the port
lsof -i :8000

# Or use netstat
netstat -tulpn | grep :8000

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use a different port
python3 serve.py 8080
```

### Problem: Permission Denied
```bash
# Make scripts executable
chmod +x serve.py serve.js start-server.sh

# Or run with explicit interpreter
python3 serve.py
node serve.js
```

### Problem: Command Not Found
```bash
# Check if Python is installed
python3 --version

# Check if Node.js is installed
node --version

# Check if PHP is installed
php --version

# If none are installed, install one using your package manager
```

### Problem: Browser Doesn't Open Automatically
```bash
# Manually open browser with URL
firefox http://localhost:8000/index-modular.html
google-chrome http://localhost:8000/index-modular.html
chromium-browser http://localhost:8000/index-modular.html

# Or use generic command
xdg-open http://localhost:8000/index-modular.html
```

### Problem: CORS Errors in Browser Console
This usually means you're trying to load `index-modular.html` directly instead of through a web server. Make sure you're accessing the URL through `http://localhost:8000/` not `file://`.

### Problem: Module Import Errors
1. **Check file paths**: Linux is case-sensitive
2. **Verify server is running**: Look for server startup messages
3. **Check browser console**: Look for specific error messages
4. **Clear browser cache**: Ctrl+Shift+R or Ctrl+F5

## 🎯 Testing Your Setup

1. **Start the server** using one of the methods above
2. **Check server output** for any error messages
3. **Open browser** to `http://localhost:8000/index-modular.html`
4. **Check browser console** (F12) for JavaScript errors
5. **Try the level editor** at `http://localhost:8000/level-parser-demo.html`

## 🔒 Security Notes

- The servers are configured to run on `localhost` only
- CORS headers are added for local development
- Directory traversal is blocked
- No external network access is allowed

## 📱 Alternative: Using Docker

If you have Docker installed:

```bash
# Create a simple Dockerfile
cat > Dockerfile << 'EOF'
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
EOF

# Build and run
docker build -t ricochet-game .
docker run -p 8000:80 ricochet-game
```

## 🌟 Advanced: Using nginx

For production or advanced setups:

```bash
# Install nginx
sudo apt install nginx  # Ubuntu/Debian
sudo yum install nginx  # CentOS/RHEL

# Create config file
sudo tee /etc/nginx/sites-available/ricochet << 'EOF'
server {
    listen 8000;
    server_name localhost;
    root /path/to/ricochet-demo;
    index index-modular.html;
    
    location / {
        try_files $uri $uri/ =404;
        add_header Access-Control-Allow-Origin *;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/ricochet /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

## 🆘 Still Having Issues?

1. **Check the file permissions**: `ls -la` in the game directory
2. **Verify your Linux distribution**: Some commands vary by distro
3. **Try a different port**: Ports below 1024 require root privileges
4. **Check firewall settings**: Some firewalls block local servers
5. **Use the original version**: `index.html` works without a server

## 📚 Additional Resources

- **Python HTTP Server**: https://docs.python.org/3/library/http.server.html
- **Node.js HTTP Module**: https://nodejs.org/api/http.html
- **PHP Built-in Server**: https://www.php.net/manual/en/features.commandline.webserver.php
- **ES6 Modules**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules

## 🎮 Game Controls

Once running:
- **Mouse**: Move paddle
- **Click**: Launch ball
- **ESC**: Return to menu
- **Space**: Restart (on game over screen)

## 🏆 Success!

If you can see the game running with the starfield background and can launch the ball, you're all set! The modular version includes all the original functionality plus the new level parser system.

Enjoy creating custom levels! 🎉