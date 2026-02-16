#!/usr/bin/env python3
"""
File System Monitor with SSH connectivity for remote host monitoring
"""
import paramiko
import json
import time
from typing import Dict, List, Optional
import re
import os
import tempfile

class FSMonitor:
    def __init__(self):
        self.hosts = {}
        self.threshold = 80  # Default threshold of 80%
    
    def convert_ppk_to_openssh(self, ppk_path: str) -> str:
        """Convert PPK file to OpenSSH format and return temporary file path"""
        try:
            # For now, return None to indicate PPK files need manual conversion
            # Later we can add automatic conversion
            print(f"PPK file detected: {ppk_path}")
            print("PPK files need to be converted to OpenSSH format.")
            return None
        except Exception as e:
            print(f"Failed to process PPK file: {e}")
            return None
    
    def add_host(self, host_id: str, hostname: str, username: str, password: str = None, key_file: str = None, port: int = 22):
        """Add a host to monitor"""
        self.hosts[host_id] = {
            'hostname': hostname,
            'username': username,
            'password': password,
            'key_file': key_file,
            'port': port,
            'status': 'disconnected',
            'last_check': None,
            'filesystems': []
        }
    
    def connect_to_host(self, host_id: str) -> Optional[paramiko.SSHClient]:
        """Establish SSH connection to a host"""
        if host_id not in self.hosts:
            return None
        
        host_info = self.hosts[host_id]
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        try:
            if host_info['key_file']:
                key_file = host_info['key_file']
                
                # Check if it's a PPK file and convert if necessary
                if key_file.lower().endswith('.ppk'):
                    raise Exception("PPK files not supported. Please convert to OpenSSH format using PuTTYgen: Conversions → Export OpenSSH key")
                
                client.connect(
                    hostname=host_info['hostname'],
                    username=host_info['username'],
                    key_filename=key_file,
                    port=host_info['port'],
                    timeout=10
                )
                
                # Clean up temporary file if we created one
                if key_file != host_info['key_file'] and os.path.exists(key_file):
                    try:
                        os.unlink(key_file)
                    except:
                        pass
                        
            else:
                client.connect(
                    hostname=host_info['hostname'],
                    username=host_info['username'],
                    password=host_info['password'],
                    port=host_info['port'],
                    timeout=10
                )
            
            self.hosts[host_id]['status'] = 'connected'
            return client
            
        except Exception as e:
            self.hosts[host_id]['status'] = f'error: {str(e)}'
            return None
    
    def get_filesystem_info(self, client: paramiko.SSHClient) -> List[Dict]:
        """Get filesystem information from remote host"""
        try:
            # Run df command to get filesystem information
            stdin, stdout, stderr = client.exec_command('df -h | grep -v tmpfs | grep -v udev')
            output = stdout.read().decode('utf-8')
            error = stderr.read().decode('utf-8')
            
            if error:
                print(f"Error getting filesystem info: {error}")
                return []
            
            filesystems = []
            lines = output.strip().split('\n')[1:]  # Skip header line
            
            for line in lines:
                if line.strip():
                    # Parse df output: Filesystem Size Used Avail Use% Mounted
                    parts = line.split()
                    if len(parts) >= 6:
                        filesystem = {
                            'device': parts[0],
                            'size': parts[1],
                            'used': parts[2],
                            'available': parts[3],
                            'usage_percent': int(parts[4].rstrip('%')),
                            'mount_point': parts[5],
                            'status': 'normal'
                        }
                        
                        # Mark as warning or critical based on usage
                        if filesystem['usage_percent'] >= 90:
                            filesystem['status'] = 'critical'
                        elif filesystem['usage_percent'] >= self.threshold:
                            filesystem['status'] = 'warning'
                        
                        filesystems.append(filesystem)
            
            return filesystems
            
        except Exception as e:
            print(f"Error executing df command: {str(e)}")
            return []
    
    def check_host(self, host_id: str) -> Dict:
        """Check filesystem status for a specific host"""
        if host_id not in self.hosts:
            return {'error': 'Host not found'}
        
        client = self.connect_to_host(host_id)
        if not client:
            return {
                'host_id': host_id,
                'status': self.hosts[host_id]['status'],
                'filesystems': [],
                'last_check': time.time(),
                'error': 'Cannot connect to host'
            }
        
        try:
            filesystems = self.get_filesystem_info(client)
            self.hosts[host_id]['filesystems'] = filesystems
            self.hosts[host_id]['last_check'] = time.time()
            
            return {
                'host_id': host_id,
                'hostname': self.hosts[host_id]['hostname'],
                'status': 'connected',
                'filesystems': filesystems,
                'last_check': self.hosts[host_id]['last_check'],
                'threshold_exceeded': len([fs for fs in filesystems if fs['usage_percent'] >= self.threshold])
            }
            
        except Exception as e:
            return {
                'host_id': host_id,
                'status': 'error',
                'error': str(e),
                'last_check': time.time()
            }
        finally:
            client.close()
    
    def check_all_hosts(self) -> List[Dict]:
        """Check all configured hosts"""
        results = []
        for host_id in self.hosts.keys():
            result = self.check_host(host_id)
            results.append(result)
        return results
    
    def get_hosts_above_threshold(self) -> List[Dict]:
        """Get only hosts with filesystems above threshold"""
        all_results = self.check_all_hosts()
        return [result for result in all_results 
                if result.get('threshold_exceeded', 0) > 0]
    
    def set_threshold(self, threshold: int):
        """Set the filesystem usage threshold"""
        self.threshold = max(1, min(100, threshold))
    
    def get_host_list(self) -> List[Dict]:
        """Get list of configured hosts"""
        return [
            {
                'host_id': host_id,
                'hostname': info['hostname'],
                'username': info['username'],
                'port': info['port'],
                'status': info['status'],
                'last_check': info['last_check']
            }
            for host_id, info in self.hosts.items()
        ]

# Global instance
fs_monitor = FSMonitor()

# Pre-configure production host automatically
fs_monitor.add_host(
    host_id="production_server",
    hostname="135.170.191.244",
    username="prachpan",
    key_file=r"C:\Users\prachpan\OneDrive - AMDOCS\Documents\SuperPuTTY\pp225y_openssh.pem",
    port=22
)

if __name__ == "__main__":
    # Test the FS monitor with pre-configured production host
    results = fs_monitor.check_all_hosts()
    print(json.dumps(results, indent=2))