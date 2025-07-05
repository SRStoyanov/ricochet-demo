#!/usr/bin/env python3
"""
Simple HTTP server for serving the Ricochet game locally.
This solves the ES6 module CORS issues when running on Linux.

Usage:
    python3 serve.py [port]
    ./serve.py [port]

Default port is 8000
"""

import http.server
import socketserver
import webbrowser
import sys
import os
import threading
import time

def main():
    # Get port from command line or use default
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Error: Invalid port number '{sys.argv[1]}'. Using default port 8000.")

    # Change to the directory containing this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    # Create server
    handler = http.server.SimpleHTTPRequestHandler

    # Add CORS headers for local development
    class CORSHTTPRequestHandler(handler):
        def end_headers(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            super().end_headers()

    try:
        with socketserver.TCPServer(("", port), CORSHTTPRequestHandler) as httpd:
            print(f"🎮 Ricochet Game Server")
            print(f"📁 Serving directory: {script_dir}")
            print(f"🌐 Server running at: http://localhost:{port}")
            print(f"📄 Game URLs:")
            print(f"   • Original:     http://localhost:{port}/index.html")
            print(f"   • Modular:      http://localhost:{port}/index-modular.html")
            print(f"   • Level Editor: http://localhost:{port}/level-parser-demo.html")
            print(f"⚡ Press Ctrl+C to stop the server")
            print()

            # Auto-open browser after a short delay
            def open_browser():
                time.sleep(1)
                try:
                    webbrowser.open(f'http://localhost:{port}/index-modular.html')
                    print("🚀 Opened game in default browser")
                except Exception as e:
                    print(f"⚠️  Could not auto-open browser: {e}")
                    print("📝 Manually open the URL above in your browser")

            browser_thread = threading.Thread(target=open_browser)
            browser_thread.daemon = True
            browser_thread.start()

            # Start server
            httpd.serve_forever()

    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"❌ Error: Port {port} is already in use")
            print(f"💡 Try a different port: python3 serve.py {port + 1}")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
