import React, { useState, useEffect } from 'react';
import { AlertTriangle, Server, HardDrive, Plus, Settings, RefreshCw, Monitor } from 'lucide-react';

interface FileSystem {
  device: string;
  size: string;
  used: string;
  available: string;
  usage_percent: number;
  mount_point: string;
  status: 'normal' | 'warning' | 'critical';
}

interface Host {
  host_id: string;
  hostname: string;
  username: string;
  port: number;
  status: string;
  last_check: number | null;
  filesystems?: FileSystem[];
  threshold_exceeded?: number;
}

interface AddHostData {
  host_id: string;
  hostname: string;
  username: string;
  password: string;
  port: number;
}

const FSMonitoringPage: React.FC = () => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [fsData, setFsData] = useState<Host[]>([]);
  const [threshold, setThreshold] = useState(80);
  const [loading, setLoading] = useState(false);
  const [showAddHost, setShowAddHost] = useState(false);
  const [showOnlyAboveThreshold, setShowOnlyAboveThreshold] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const [newHost, setNewHost] = useState<AddHostData>({
    host_id: '',
    hostname: '',
    username: '',
    password: '',
    port: 22
  });

  // Fetch hosts list
  const fetchHosts = async () => {
    try {
      const response = await fetch('/api/fs/hosts');
      if (response.ok) {
        const data = await response.json();
        setHosts(Array.isArray(data) ? data : [data].filter(Boolean));
      }
    } catch (error) {
      console.error('Error fetching hosts:', error);
    }
  };

  // Fetch FS data for all hosts
  const fetchFSData = async (onlyThreshold = false) => {
    setLoading(true);
    try {
      const endpoint = onlyThreshold ? '/api/fs/threshold' : '/api/fs/status';
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setFsData(Array.isArray(data) ? data : [data].filter(Boolean));
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching FS data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add new host
  const addHost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/fs/add-host', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHost)
      });
      
      if (response.ok) {
        setShowAddHost(false);
        setNewHost({ host_id: '', hostname: '', username: '', password: '', port: 22 });
        fetchHosts();
        alert('Host added successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert(`Error adding host: ${error}`);
    }
  };

  // Set threshold
  const updateThreshold = async () => {
    try {
      const response = await fetch('/api/fs/set-threshold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold })
      });
      
      if (response.ok) {
        alert('Threshold updated successfully!');
        fetchFSData(showOnlyAboveThreshold);
      }
    } catch (error) {
      alert(`Error updating threshold: ${error}`);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-500 bg-red-50';
      case 'warning': return 'text-orange-500 bg-orange-50';
      case 'normal': return 'text-green-500 bg-green-50';
      case 'connected': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  // Get usage color for progress bar
  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= threshold) return 'bg-orange-500';
    return 'bg-green-500';
  };

  // Test connection to a specific host
  const testConnection = async (hostId: string) => {
    try {
      const response = await fetch('/api/fs/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host_id: hostId })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`Connection test for ${hostId}:`, result.status);
        return result;
      }
    } catch (error) {
      console.error(`Error testing connection for ${hostId}:`, error);
    }
    return null;
  };

  // Auto-connect to production server when page loads
  const autoConnectToProduction = async () => {
    console.log('Auto-connecting to production server...');
    await testConnection('production_server');
    fetchFSData();
  };

  useEffect(() => {
    fetchHosts();
    autoConnectToProduction(); // Auto-connect to your production server
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchFSData(showOnlyAboveThreshold);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchFSData(showOnlyAboveThreshold);
  }, [showOnlyAboveThreshold]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Monitor className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">File System Monitor</h1>
                <p className="text-gray-600">Monitor disk space usage across your hosts</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Last Update: {lastUpdate.toLocaleTimeString()}
              </span>
              <button
                onClick={() => fetchFSData(showOnlyAboveThreshold)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-50">
                <Server className="h-4 w-4 mr-2" />
                Connected to: tlpv12455.dadc.sbc.com
              </div>

              <div className="flex items-center space-x-2">
                <label htmlFor="threshold" className="text-sm font-medium text-gray-700">
                  Threshold:
                </label>
                <input
                  id="threshold"
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                  min="1"
                  max="100"
                />
                <span className="text-sm text-gray-500">%</span>
                <button
                  onClick={updateThreshold}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Update
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showOnlyAboveThreshold}
                  onChange={(e) => setShowOnlyAboveThreshold(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Show only above threshold</span>
              </label>
            </div>
          </div>
        </div>

        {/* FS Data Grid */}
        <div className="grid gap-6">
          {fsData.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600">
                {hosts.length === 0 
                  ? "Add hosts to start monitoring their file systems."
                  : "Click refresh to fetch file system data from your hosts."}
              </p>
            </div>
          ) : (
            fsData.map((host) => (
              <div key={host.host_id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Host Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Server className="h-6 w-6 text-gray-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {host.hostname} ({host.host_id})
                        </h3>
                        <p className="text-sm text-gray-600">
                          Status: <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(host.status)}`}>
                            {host.status}
                          </span>
                          {host.threshold_exceeded && host.threshold_exceeded > 0 && (
                            <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle className="inline h-3 w-3 mr-1" />
                              {host.threshold_exceeded} above threshold
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {host.last_check && (
                      <div className="text-right text-sm text-gray-500">
                        Last checked: {new Date(host.last_check * 1000).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* File Systems */}
                {host.filesystems && host.filesystems.length > 0 ? (
                  <div className="p-6">
                    <div className="grid gap-4">
                      {host.filesystems.map((fs, index) => (
                        <div 
                          key={index} 
                          className={`p-4 rounded-lg border ${
                            fs.status === 'critical' ? 'border-red-200 bg-red-50' :
                            fs.status === 'warning' ? 'border-orange-200 bg-orange-50' :
                            'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <HardDrive className="h-5 w-5 text-gray-500" />
                              <span className="font-medium text-gray-900">{fs.mount_point}</span>
                              <span className="text-sm text-gray-500">({fs.device})</span>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(fs.status)}`}>
                              {fs.usage_percent}% used
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div 
                              className={`h-2 rounded-full ${getUsageColor(fs.usage_percent)}`}
                              style={{ width: `${fs.usage_percent}%` }}
                            />
                          </div>

                          {/* Storage Details */}
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Size:</span>
                              <span className="ml-1 font-medium">{fs.size}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Used:</span>
                              <span className="ml-1 font-medium">{fs.used}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Available:</span>
                              <span className="ml-1 font-medium">{fs.available}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    {host.status === 'connected' ? 'No file systems found' : 'Unable to fetch file system data'}
                    {host.error && (
                      <div className="mt-2 text-sm text-red-600">
                        Error: {host.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Host Modal */}
        {showAddHost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Add New Host</h3>
              <form onSubmit={addHost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Host ID
                  </label>
                  <input
                    type="text"
                    value={newHost.host_id}
                    onChange={(e) => setNewHost({ ...newHost, host_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hostname/IP
                  </label>
                  <input
                    type="text"
                    value={newHost.hostname}
                    onChange={(e) => setNewHost({ ...newHost, hostname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newHost.username}
                    onChange={(e) => setNewHost({ ...newHost, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newHost.password}
                    onChange={(e) => setNewHost({ ...newHost, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={newHost.port}
                    onChange={(e) => setNewHost({ ...newHost, port: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddHost(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Add Host
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FSMonitoringPage;