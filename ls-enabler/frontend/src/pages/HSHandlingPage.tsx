import React, { useState, useEffect } from 'react';

// Sample data for demonstrations
const generateSampleData = () => ({
  cpuUsage: Math.floor(Math.random() * 40) + 30, // 30-70%
  ramUsage: Math.floor(Math.random() * 50) + 25, // 25-75%
  diskUsage: Math.floor(Math.random() * 60) + 20, // 20-80%
  networkTraffic: Math.floor(Math.random() * 100) + 50, // 50-150 Mbps
  temperature: Math.floor(Math.random() * 20) + 45, // 45-65°C
  uptime: Math.floor(Math.random() * 30) + 1, // 1-31 days
});

const generateTimeSeriesData = (points: number) => {
  return Array.from({ length: points }, (_, i) => ({
    time: `${(23 - Math.floor(i / 4))}:${String((60 - (i % 4) * 15)).padStart(2, '0')}`,
    value: Math.floor(Math.random() * 40) + 30,
  }));
};

const generateAlerts = () => [
  { id: 1, type: 'warning', message: 'High CPU usage on Server-03', time: '2 mins ago', severity: 'medium' },
  { id: 2, type: 'error', message: 'Disk space critical on Server-07', time: '5 mins ago', severity: 'high' },
  { id: 3, type: 'info', message: 'Server-12 maintenance scheduled', time: '1 hour ago', severity: 'low' },
  { id: 4, type: 'warning', message: 'Network latency spike detected', time: '3 hours ago', severity: 'medium' },
];

interface HSHandlingPageProps {
  onBack?: () => void;
}

const HSHandlingPage: React.FC<HSHandlingPageProps> = ({ onBack }) => {
  const [serverData, setServerData] = useState(generateSampleData());
  const [cpuHistory, setCpuHistory] = useState(generateTimeSeriesData(24));
  const [memoryHistory, setMemoryHistory] = useState(generateTimeSeriesData(24));
  const [alerts, setAlerts] = useState(generateAlerts());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setServerData(generateSampleData());
      setLastUpdate(new Date());
      
      // Update time series data
      setCpuHistory(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          value: Math.floor(Math.random() * 40) + 30
        });
        return newData;
      });
      
      setMemoryHistory(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          value: Math.floor(Math.random() * 50) + 25
        });
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number) => {
    if (value >= 85) return '#ef4444'; // red
    if (value >= 70) return '#f97316'; // orange
    return '#22c55e'; // green
  };

  const getStatusBgColor = (value: number) => {
    if (value >= 85) return '#fef2f2'; // red bg
    if (value >= 70) return '#fff7ed'; // orange bg
    return '#f0fdf4'; // green bg
  };

  const renderMetricCard = (title: string, value: number, unit: string, icon: string) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: '16px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>{icon}</span>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>{title}</h3>
        </div>
        <span style={{
          padding: '8px 12px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600',
          color: getStatusColor(value),
          backgroundColor: getStatusBgColor(value)
        }}>
          {value}{unit}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div style={{
        width: '100%',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        height: '8px',
        marginBottom: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '8px',
          borderRadius: '4px',
          backgroundColor: getStatusColor(value),
          width: `${Math.min(value, 100)}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>
      
      <p style={{
        fontSize: '14px',
        color: '#6b7280',
        margin: 0
      }}>
        {value < 50 ? 'Optimal' : value < 80 ? 'Normal' : 'High Usage'}
      </p>
    </div>
  );

  const renderLineChart = (data: typeof cpuHistory, title: string, color: string) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '16px',
        marginTop: 0
      }}>{title}</h3>
      <div style={{ position: 'relative', height: '200px' }}>
        <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 400 120">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={120 - (y * 1.2)}
              x2="400"
              y2={120 - (y * 1.2)}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          
          {/* Data line */}
          <polyline
            points={data.map((point, index) => 
              `${(index * 400) / (data.length - 1)},${120 - (point.value * 1.2)}`
            ).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          
          {/* Data points */}
          {data.map((point, index) => (
            <circle
              key={index}
              cx={(index * 400) / (data.length - 1)}
              cy={120 - (point.value * 1.2)}
              r="3"
              fill={color}
            />
          ))}
        </svg>
        
        {/* Y-axis labels */}
        <div style={{
          position: 'absolute',
          left: '-32px',
          top: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>
      </div>
      
      {/* X-axis labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#6b7280',
        marginTop: '8px'
      }}>
        <span>{data[0]?.time}</span>
        <span>{data[Math.floor(data.length / 2)]?.time}</span>
        <span>{data[data.length - 1]?.time}</span>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '24px',
      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          marginBottom: '32px',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {onBack && (
                <button
                  onClick={onBack}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    gap: '8px'
                  }}
                >
                  ← Back
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '8px',
                  backgroundColor: '#e0f2fe',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '32px' }}>🖥️</span>
                </div>
                <div>
                  <h1 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: 0
                  }}>FS Handling Dashboard</h1>
                  <p style={{
                    color: '#6b7280',
                    margin: '4px 0 0 0',
                    fontSize: '14px'
                  }}>File System Management & Monitoring</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                Last Update: {lastUpdate.toLocaleTimeString()}
              </span>
              <button
                onClick={() => setLastUpdate(new Date())}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  gap: '8px'
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', gap: '32px' }}>
              {[
                { key: 'overview', label: 'System Overview', icon: '📊' },
                { key: 'performance', label: 'Performance Metrics', icon: '📈' },
                { key: 'alerts', label: 'Alerts & Monitoring', icon: '⚠️' },
                { key: 'settings', label: 'Settings', icon: '⚙️' }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 24px',
                    border: 'none',
                    backgroundColor: activeTab === key ? '#e0f2fe' : 'transparent',
                    borderBottom: activeTab === key ? '2px solid #0891b2' : '2px solid transparent',
                    color: activeTab === key ? '#0891b2' : '#6b7280',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    gap: '8px',
                    borderRadius: '8px 8px 0 0'
                  }}
                >
                  <span>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {renderMetricCard(
                'CPU Usage',
                serverData.cpuUsage,
                '%',
                <Cpu className="h-6 w-6 text-blue-600" />,
                'cpu'
              )}
              {renderMetricCard(
                'Memory Usage',
                serverData.ramUsage,
                '%',
                <Activity className="h-6 w-6 text-green-600" />,
                'memory'
              )}
              {renderMetricCard(
                'Disk Usage',
                serverData.diskUsage,
                '%',
                <HardDrive className="h-6 w-6 text-purple-600" />,
                'disk'
              )}
              {renderMetricCard(
                'Temperature',
                serverData.temperature,
                '°C',
                <TrendingUp className="h-6 w-6 text-red-600" />,
                'temp'
              )}
            </div>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Activity className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Network Traffic</h3>
                </div>
                <div className="text-3xl font-bold text-green-600">{serverData.networkTraffic}</div>
                <div className="text-sm text-gray-500">Mbps Average</div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">System Uptime</h3>
                </div>
                <div className="text-3xl font-bold text-blue-600">{serverData.uptime}</div>
                <div className="text-sm text-gray-500">Days</div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Server className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Active Servers</h3>
                </div>
                <div className="text-3xl font-bold text-purple-600">24</div>
                <div className="text-sm text-gray-500">Out of 26 Total</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderLineChart(cpuHistory, 'CPU Usage Over Time', '#3b82f6')}
            {renderLineChart(memoryHistory, 'Memory Usage Over Time', '#10b981')}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {alerts.map((alert) => (
                <div key={alert.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {alert.type === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                    {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                    {alert.type === 'info' && <CheckCircle className="h-5 w-5 text-blue-500" />}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500">{alert.time}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Auto-refresh interval</span>
                <select className="mt-1 block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md">
                  <option>5 seconds</option>
                  <option>10 seconds</option>
                  <option>30 seconds</option>
                  <option>1 minute</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Alert notifications</span>
                <input type="checkbox" defaultChecked className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-gray-300 rounded" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HSHandlingPage;