#!/usr/bin/env python3
"""
Comprehensive Startup Manager for LS Enabler
Handles process cleanup, port management, and reliable startup
"""
import os
import sys
import json
import time
import socket
import subprocess
import psutil
import signal
from pathlib import Path
from typing import List, Optional, Tuple

class StartupManager:
    def __init__(self):
        self.base_dir = Path(__file__).parent
        self.backend_dir = self.base_dir / "backend"
        self.frontend_dir = self.base_dir / "frontend"
        self.backend_process = None
        self.frontend_process = None
        self.backend_port = None
        self.frontend_port = None
        
    def log(self, message: str, level: str = "INFO"):
        """Enhanced logging with timestamps"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
    
    def find_free_port(self, start_port: int = 8000, max_attempts: int = 100) -> int:
        """Find a free port starting from start_port"""
        for port in range(start_port, start_port + max_attempts):
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.bind(('127.0.0.1', port))
                    return port
            except OSError:
                continue
        raise RuntimeError(f"Could not find a free port in range {start_port}-{start_port + max_attempts}")
    
    def kill_processes_on_ports(self, ports: List[int]) -> None:
        """Kill any processes using the specified ports"""
        for port in ports:
            try:
                for conn in psutil.net_connections():
                    if conn.laddr.port == port and conn.pid:
                        try:
                            proc = psutil.Process(conn.pid)
                            self.log(f"Killing process {proc.pid} ({proc.name()}) on port {port}", "WARN")
                            proc.kill()
                            proc.wait(timeout=3)
                        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.TimeoutExpired):
                            pass
                        except Exception as e:
                            self.log(f"Error killing process on port {port}: {e}", "ERROR")
            except Exception as e:
                self.log(f"Error checking port {port}: {e}", "ERROR")
    
    def kill_existing_servers(self) -> None:
        """Kill any existing Node.js and Python server processes"""
        try:
            # Kill by process name
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    proc_info = proc.info
                    cmdline = ' '.join(proc_info.get('cmdline', []))
                    
                    # Kill FastAPI/uvicorn processes
                    if any(keyword in cmdline for keyword in ['uvicorn', 'fastapi', 'simple_main', 'reliable_server', 'main:app']):
                        self.log(f"Killing server process {proc_info['pid']} ({proc_info['name']})", "WARN")
                        proc.kill()
                        proc.wait(timeout=3)
                    
                    # Kill Node.js dev servers
                    elif proc_info['name'] in ['node.exe', 'node'] and 'dev' in cmdline:
                        self.log(f"Killing Node.js process {proc_info['pid']}", "WARN")
                        proc.kill()
                        proc.wait(timeout=3)
                        
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.TimeoutExpired):
                    pass
                except Exception as e:
                    self.log(f"Error killing process: {e}", "ERROR")
                    
        except Exception as e:
            self.log(f"Error during process cleanup: {e}", "ERROR")
    
    def wait_for_port(self, port: int, timeout: int = 30) -> bool:
        """Wait for a port to become available"""
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.settimeout(1)
                    result = s.connect_ex(('127.0.0.1', port))
                    if result == 0:
                        return True
            except Exception:
                pass
            time.sleep(0.5)
        return False
    
    def update_frontend_config(self, backend_port: int) -> None:
        """Update frontend configuration to use the correct backend port"""
        vite_config_path = self.frontend_dir / "vite.config.ts"
        
        if vite_config_path.exists():
            try:
                # Read current config
                with open(vite_config_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Update backend port in proxy configuration
                import re
                pattern = r"target: ['\"]http://localhost:\d+['\"]"
                replacement = f"target: 'http://localhost:{backend_port}'"
                
                updated_content = re.sub(pattern, replacement, content)
                
                # Write updated config
                with open(vite_config_path, 'w', encoding='utf-8') as f:
                    f.write(updated_content)
                
                self.log(f"Updated frontend config to use backend port {backend_port}")
                
            except Exception as e:
                self.log(f"Error updating frontend config: {e}", "ERROR")
    
    def start_backend(self) -> bool:
        """Start the backend server"""
        try:
            self.log("Starting backend server...")
            
            # Change to backend directory
            os.chdir(self.backend_dir)
            
            # Find free port for backend
            self.backend_port = self.find_free_port(8000)
            self.log(f"Using backend port: {self.backend_port}")
            
            # Start the reliable server
            python_executable = sys.executable
            cmd = [python_executable, "reliable_server.py"]
            
            self.backend_process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                cwd=self.backend_dir
            )
            
            # Wait for backend to start
            if self.wait_for_port(self.backend_port, timeout=15):
                self.log(f"✅ Backend started successfully on port {self.backend_port}")
                return True
            else:
                self.log("❌ Backend failed to start within timeout", "ERROR")
                if self.backend_process and self.backend_process.poll() is None:
                    self.backend_process.kill()
                return False
                
        except Exception as e:
            self.log(f"❌ Backend startup failed: {e}", "ERROR")
            return False
    
    def start_frontend(self) -> bool:
        """Start the frontend server"""
        try:
            self.log("Starting frontend server...")
            
            # Update frontend config first
            if self.backend_port:
                self.update_frontend_config(self.backend_port)
            
            # Change to frontend directory
            os.chdir(self.frontend_dir)
            
            # Find free port for frontend
            self.frontend_port = self.find_free_port(5173)
            self.log(f"Using frontend port: {self.frontend_port}")
            
            # Start npm dev server
            cmd = ["npm", "run", "dev", "--", "--port", str(self.frontend_port), "--host", "0.0.0.0"]
            
            self.frontend_process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                cwd=self.frontend_dir
            )
            
            # Wait for frontend to start
            if self.wait_for_port(self.frontend_port, timeout=15):
                self.log(f"✅ Frontend started successfully on port {self.frontend_port}")
                return True
            else:
                self.log("❌ Frontend failed to start within timeout", "ERROR")
                if self.frontend_process and self.frontend_process.poll() is None:
                    self.frontend_process.kill()
                return False
                
        except Exception as e:
            self.log(f"❌ Frontend startup failed: {e}", "ERROR")
            return False
    
    def monitor_processes(self) -> None:
        """Monitor both processes and restart if needed"""
        self.log("Monitoring processes... Press Ctrl+C to stop all servers")
        
        try:
            while True:
                time.sleep(2)
                
                # Check backend
                if self.backend_process and self.backend_process.poll() is not None:
                    self.log("❌ Backend process died, restarting...", "WARN")
                    if not self.start_backend():
                        break
                
                # Check frontend
                if self.frontend_process and self.frontend_process.poll() is not None:
                    self.log("❌ Frontend process died, restarting...", "WARN")
                    if not self.start_frontend():
                        break
                
        except KeyboardInterrupt:
            self.log("Received shutdown signal", "INFO")
        except Exception as e:
            self.log(f"Monitor error: {e}", "ERROR")
    
    def cleanup(self) -> None:
        """Clean shutdown of all processes"""
        self.log("Shutting down all processes...")
        
        if self.backend_process:
            try:
                self.backend_process.terminate()
                self.backend_process.wait(timeout=5)
            except:
                self.backend_process.kill()
        
        if self.frontend_process:
            try:
                self.frontend_process.terminate()
                self.frontend_process.wait(timeout=5)
            except:
                self.frontend_process.kill()
        
        self.log("✅ All processes shut down")
    
    def run(self) -> int:
        """Main execution method"""
        try:
            self.log("=" * 60)
            self.log("🚀 LS ENABLER COMPREHENSIVE STARTUP MANAGER")
            self.log("=" * 60)
            
            # Step 1: Clean up existing processes
            self.log("Step 1: Cleaning up existing processes...")
            self.kill_existing_servers()
            self.kill_processes_on_ports([8000, 8001, 8002, 8003, 8004, 8005, 8006, 8007, 8008, 8009, 8010, 5173, 5174, 5175])
            time.sleep(2)
            
            # Step 2: Start backend
            self.log("Step 2: Starting backend server...")
            if not self.start_backend():
                self.log("❌ Failed to start backend", "ERROR")
                return 1
            
            # Step 3: Start frontend
            self.log("Step 3: Starting frontend server...")
            if not self.start_frontend():
                self.log("❌ Failed to start frontend", "ERROR")
                return 1
            
            # Step 4: Display URLs
            self.log("=" * 60)
            self.log("✅ ALL SERVICES STARTED SUCCESSFULLY!")
            self.log(f"🌐 Frontend: http://localhost:{self.frontend_port}")
            self.log(f"🔧 Backend:  http://localhost:{self.backend_port}")
            self.log(f"🩺 Health:   http://localhost:{self.backend_port}/health")
            self.log(f"📚 API Docs: http://localhost:{self.backend_port}/docs")
            self.log("=" * 60)
            
            # Step 5: Monitor processes
            self.monitor_processes()
            
            return 0
            
        except Exception as e:
            self.log(f"❌ Startup manager failed: {e}", "ERROR")
            return 1
        finally:
            self.cleanup()

def main():
    """Entry point"""
    manager = StartupManager()
    return manager.run()

if __name__ == "__main__":
    exit(main())