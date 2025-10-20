'use client';

// VagalSync V15.0 - Device Connection Tab (FIXED VERSION)
// Compatible with syncMiddleware-WORKING.ts

import React, { useState, useEffect } from 'react';
import { 
  Watch, Activity, Heart, Wifi, Mail, Chrome, 
  CheckCircle, AlertCircle, Loader2, Settings, Zap,
  RefreshCw, Trash2, Calendar, TrendingUp, Link as LinkIcon
} from 'lucide-react';
import { syncMiddleware } from '../../services/syncMiddleware';

type DeviceType = 'oura' | 'whoop' | 'apple-health' | 'garmin' | 'fitbit' | 'polar';
type SyncMethod = 'api' | 'email' | 'extension' | 'manual';

interface Device {
  id: string;
  name: string;
  type: DeviceType;
  icon: any;
  color: string;
  methods: SyncMethod[];
  apiAvailable: boolean;
  emailAvailable: boolean;
  extensionAvailable: boolean;
}

export default function DeviceConnectionTab() {
  const [connectedDevices, setConnectedDevices] = useState<any[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<SyncMethod | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState<boolean>(false);

  const availableDevices: Device[] = [
    {
      id: 'oura',
      name: 'Oura Ring',
      type: 'oura',
      icon: Activity,
      color: 'from-purple-600 to-blue-600',
      methods: ['api', 'email', 'extension'],
      apiAvailable: true,
      emailAvailable: true,
      extensionAvailable: true
    },
    {
      id: 'whoop',
      name: 'WHOOP',
      type: 'whoop',
      icon: Zap,
      color: 'from-red-600 to-pink-600',
      methods: ['api', 'email', 'extension'],
      apiAvailable: true,
      emailAvailable: true,
      extensionAvailable: true
    },
    {
      id: 'apple-health',
      name: 'Apple Health',
      type: 'apple-health',
      icon: Heart,
      color: 'from-gray-600 to-gray-800',
      methods: ['api', 'email'],
      apiAvailable: true,
      emailAvailable: true,
      extensionAvailable: false
    },
    {
      id: 'garmin',
      name: 'Garmin',
      type: 'garmin',
      icon: Watch,
      color: 'from-blue-700 to-cyan-700',
      methods: ['api', 'email', 'extension'],
      apiAvailable: true,
      emailAvailable: true,
      extensionAvailable: true
    },
    {
      id: 'fitbit',
      name: 'Fitbit',
      type: 'fitbit',
      icon: Activity,
      color: 'from-indigo-600 to-purple-600',
      methods: ['api', 'email', 'extension'],
      apiAvailable: true,
      emailAvailable: true,
      extensionAvailable: true
    }
  ];

  useEffect(() => {
    loadConnectedDevices();
  }, []);

  const loadConnectedDevices = () => {
    const devices = syncMiddleware.getConnectedDevices();
    setConnectedDevices(devices);
  };

  const handleConnectDevice = async (device: Device, method: SyncMethod) => {
    setConnecting(device.id);
    setSelectedMethod(method);

    try {
      let credentials: any;

      switch (method) {
        case 'api':
          credentials = await initiateOAuth(device.type);
          break;
        case 'email':
          credentials = await connectEmail();
          break;
        case 'extension':
          credentials = await installExtension();
          break;
      }

      if (credentials) {
        await syncMiddleware.connectDevice(device.type, method, credentials);
        loadConnectedDevices();
        setSelectedDevice(null);
        setShowConnectionModal(false);
      }

    } catch (error: any) {
      console.error('Connection failed:', error);
      alert(`Failed to connect ${device.name}: ${error.message}`);
    } finally {
      setConnecting(null);
    }
  };

  const initiateOAuth = async (deviceType: DeviceType): Promise<any> => {
    // TODO: Real OAuth in Phase 2
    // For now, simulate OAuth success
    
    console.log(`[DeviceTab] Initiating OAuth for ${deviceType}...`);
    
    // Simulate OAuth popup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock credentials
    return {
      accessToken: `mock_token_${deviceType}_${Date.now()}`,
      refreshToken: `mock_refresh_${deviceType}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    };
  };

  const connectEmail = async (): Promise<any> => {
    // TODO: Gmail OAuth in Phase 2
    // For now, show instructions
    
    console.log('[DeviceTab] Email connection...');
    
    alert(`
Email Auto-Import Instructions:

1. Forward device emails to:
   import@myvagalsync.com

2. We'll automatically parse:
   - Oura daily summaries
   - WHOOP recovery emails
   - Garmin notifications

3. Data syncs within 5 minutes

Note: Full OAuth coming in Phase 2!
    `);
    
    return {
      method: 'email_forward',
      configured: true
    };
  };

  const installExtension = async (): Promise<any> => {
    // TODO: Chrome extension in Phase 2
    // For now, show instructions
    
    console.log('[DeviceTab] Extension install...');
    
    alert(`
Browser Extension (Coming Soon):

1. Install VagalSync Chrome Extension
2. Visit your device's web dashboard
3. Extension auto-captures data
4. Syncs to VagalSync instantly

Note: Extension launching in Phase 2!
    `);
    
    return {
      method: 'extension',
      installed: false
    };
  };

  const handleDisconnect = async (deviceId: string) => {
    if (confirm('Disconnect this device?')) {
      await syncMiddleware.disconnectDevice(deviceId);
      loadConnectedDevices();
    }
  };

  const handleManualSync = async (deviceId: string) => {
    console.log(`[DeviceTab] Manual sync for ${deviceId}...`);
    const result = await syncMiddleware.manualSync(deviceId);
    
    if (result.success) {
      alert(`✅ Synced ${result.biomarkersAdded} biomarkers!`);
      loadConnectedDevices();
    } else {
      alert(`❌ Sync failed: ${result.errors?.join(', ')}`);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Device Connections</h1>
          <p className="text-white/60 mt-2">
            Auto-sync from your favorite wearables & health apps
          </p>
        </div>
        <button
          onClick={() => loadConnectedDevices()}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Connected Devices */}
      {connectedDevices.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <CheckCircle className="w-6 h-6 mr-3 text-green-400" />
            Connected Devices
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectedDevices.map((device) => {
              const deviceInfo = availableDevices.find(d => d.type === device.deviceType);
              const Icon = deviceInfo?.icon || Activity;

              return (
                <div
                  key={device.deviceId}
                  className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-500/30"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${deviceInfo?.color || 'from-gray-600 to-gray-800'}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white capitalize">
                          {device.deviceType.replace('-', ' ')}
                        </h3>
                        <p className="text-green-400 text-sm flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Connected via {device.method}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Last Sync:</span>
                      <span className="text-white">
                        {device.lastSync 
                          ? new Date(device.lastSync).toLocaleString()
                          : 'Never'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Sync Interval:</span>
                      <span className="text-white">{device.syncIntervalMinutes} minutes</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleManualSync(device.deviceId)}
                      className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg flex items-center justify-center space-x-2 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Sync Now</span>
                    </button>
                    <button
                      onClick={() => handleDisconnect(device.deviceId)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Devices */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Wifi className="w-6 h-6 mr-3 text-cyan-400" />
          Available Devices
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableDevices.map((device) => {
            const Icon = device.icon;
            const isConnected = connectedDevices.some(d => d.deviceType === device.type);

            return (
              <div
                key={device.id}
                className={`bg-gradient-to-br ${device.color} rounded-2xl p-6 border border-white/10 ${
                  isConnected ? 'opacity-50' : 'hover:scale-105 transition-transform cursor-pointer'
                }`}
                onClick={() => !isConnected && setSelectedDevice(device)}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-10 h-10 text-white" />
                  {isConnected && (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{device.name}</h3>

                {!isConnected && (
                  <div className="space-y-2">
                    {device.apiAvailable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnectDevice(device, 'api');
                        }}
                        disabled={connecting === device.id}
                        className="w-full px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                      >
                        {connecting === device.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <Wifi className="w-4 h-4" />
                            <span>Connect via API</span>
                          </>
                        )}
                      </button>
                    )}
                    {device.emailAvailable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnectDevice(device, 'email');
                        }}
                        className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm flex items-center justify-center space-x-2 transition-all"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Connect via Email</span>
                      </button>
                    )}
                    {device.extensionAvailable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnectDevice(device, 'extension');
                        }}
                        className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm flex items-center justify-center space-x-2 transition-all"
                      >
                        <Chrome className="w-4 h-4" />
                        <span>Install Extension</span>
                      </button>
                    )}
                  </div>
                )}

                {isConnected && (
                  <p className="text-green-400 text-sm">Already connected ✓</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-2xl p-6 border border-cyan-500/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-cyan-400" />
          How Auto-Sync Works
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-3xl">🔌</div>
            <h4 className="font-bold text-white">1. Connect Once</h4>
            <p className="text-white/60 text-sm">
              Choose your preferred connection method (API, email, or extension)
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-3xl">🔄</div>
            <h4 className="font-bold text-white">2. Auto-Sync Forever</h4>
            <p className="text-white/60 text-sm">
              Data syncs automatically every 30 minutes (configurable)
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-3xl">📊</div>
            <h4 className="font-bold text-white">3. Stay Updated</h4>
            <p className="text-white/60 text-sm">
              myVagal Tone™ updates in real-time as new data arrives
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
