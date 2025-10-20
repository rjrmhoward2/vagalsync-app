'use client';

// VagalSync V15.0 - Genetic Upload Tab (FIXED VERSION)
// Compatible with geneticDataMiddleware-WORKING.ts

import React, { useState, useEffect } from 'react';
import { Shield, Upload, Lock, Trash2, Eye, Download, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { geneticDataMiddleware } from '../../services/geneticDataMiddleware';

export default function GeneticUploadTab() {
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [showPrivacyAudit, setShowPrivacyAudit] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const existingProfile = geneticDataMiddleware.getProfile();
    setProfile(existingProfile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);

      // Validate file type
      if (!file.name.endsWith('.txt')) {
        alert('Please upload a .txt file from 23andMe');
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('File too large. Maximum size is 50MB');
        return;
      }

      // Parse file
      const parsedProfile = await geneticDataMiddleware.parse23andMeFile(file, {
        enabled: encryptionEnabled,
        password: encryptionEnabled ? encryptionPassword : undefined
      });

      setProfile(parsedProfile);
      
      alert(`✅ Success! Parsed ${parsedProfile.variantCount.toLocaleString()} genetic variants`);
      
      // Clear password field
      setEncryptionPassword('');

    } catch (error: any) {
      console.error('[GeneticUpload] Upload failed:', error);
      alert(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Delete all genetic data? This cannot be undone.')) {
      geneticDataMiddleware.deleteAllData();
      setProfile(null);
      alert('✅ All genetic data deleted');
    }
  };

  const handleExport = () => {
    const data = geneticDataMiddleware.exportData();
    
    // Create download
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vagalsync-genetic-export-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✅ Genetic data exported');
  };

  const getVariantColor = (genotype: string): string => {
    if (genotype.includes('T') && genotype.includes('T')) return 'text-red-400';
    if (genotype.includes('C') && genotype.includes('C')) return 'text-green-400';
    return 'text-yellow-400';
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Shield className="w-8 h-8 mr-3 text-purple-400" />
            Genetic Insights
          </h1>
          <p className="text-white/60 mt-2">
            Privacy-first 23andMe integration
          </p>
        </div>
        {profile && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowPrivacyAudit(!showPrivacyAudit)}
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg flex items-center space-x-2 transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>Privacy Audit</span>
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg flex items-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg flex items-center space-x-2 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete All</span>
            </button>
          </div>
        )}
      </div>

      {/* Privacy Promise Banner */}
      <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-2xl p-8 border border-purple-500/30">
        <div className="flex items-start space-x-4">
          <Shield className="w-12 h-12 text-purple-400 flex-shrink-0" />
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">🔒 Privacy Promise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/90">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold">Your DNA NEVER leaves your device</p>
                  <p className="text-sm text-white/70">100% client-side processing</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold">AES-256 encryption available</p>
                  <p className="text-sm text-white/70">Military-grade security (optional)</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold">No server uploads</p>
                  <p className="text-sm text-white/70">Stored locally in your browser only</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold">Delete anytime</p>
                  <p className="text-sm text-white/70">One-click permanent deletion</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Audit Panel */}
      {showPrivacyAudit && profile && (
        <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-2xl p-6 border border-cyan-500/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-cyan-400" />
            Privacy Audit
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {Object.entries(geneticDataMiddleware.getPrivacyAudit()).map(([key, value]) => (
              <div key={key} className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60 mb-1 capitalize">{key.replace(/_/g, ' ')}</div>
                <div className="text-white font-medium">{String(value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Section */}
      {!profile ? (
        <div className="space-y-6">
          {/* File Upload */}
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              dragActive
                ? 'border-purple-400 bg-purple-500/10'
                : 'border-white/20 bg-white/5 hover:border-purple-400/50 hover:bg-purple-500/5'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Upload 23andMe Raw Data</h3>
            <p className="text-white/60 mb-6">
              Drag & drop your .txt file here, or click to browse
            </p>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className={`inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? 'Processing...' : 'Choose File'}
            </label>
          </div>

          {/* Encryption Option */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-6 border border-gray-600/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Lock className="w-6 h-6 text-yellow-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Optional Encryption</h3>
                  <p className="text-white/60 text-sm">Add password protection to your genetic data</p>
                </div>
              </div>
              <button
                onClick={() => setEncryptionEnabled(!encryptionEnabled)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  encryptionEnabled
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-white/10 text-white/60 border border-white/20'
                }`}
              >
                {encryptionEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {encryptionEnabled && (
              <div className="mt-4">
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Encryption Password
                </label>
                <input
                  type="password"
                  value={encryptionPassword}
                  onChange={(e) => setEncryptionPassword(e.target.value)}
                  placeholder="Enter a strong password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400/50"
                />
                <p className="text-white/40 text-xs mt-2">
                  ⚠️ Remember this password - we cannot recover it if lost
                </p>
              </div>
            )}
          </div>

          {/* How to Get Data */}
          <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl p-6 border border-blue-500/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              How to Get Your 23andMe Raw Data
            </h3>
            <ol className="space-y-3 text-white/90 text-sm">
              <li className="flex items-start">
                <span className="font-bold text-blue-400 mr-2">1.</span>
                <span>Log in to <a href="https://www.23andme.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">23andme.com</a></span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-400 mr-2">2.</span>
                <span>Go to Account → Settings → Browse Raw Data</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-400 mr-2">3.</span>
                <span>Click "Download" (this may take a few minutes)</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-400 mr-2">4.</span>
                <span>Save the .txt file and upload it here</span>
              </li>
            </ol>
          </div>
        </div>
      ) : (
        /* Profile Display */
        <div className="space-y-6">
          {/* Profile Summary */}
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-400" />
                Genetic Profile Loaded
              </h2>
              <div className="text-right">
                <div className="text-green-400 text-sm">Uploaded</div>
                <div className="text-white font-medium">
                  {new Date(profile.uploadDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Total Variants</div>
                <div className="text-2xl font-bold text-white">
                  {profile.variantCount.toLocaleString()}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Key Variants</div>
                <div className="text-2xl font-bold text-white">
                  {profile.keyVariants.length}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Encryption</div>
                <div className="text-2xl font-bold text-white">
                  {profile.encrypted ? (
                    <span className="flex items-center text-yellow-400">
                      <Lock className="w-5 h-5 mr-2" />
                      Enabled
                    </span>
                  ) : (
                    <span className="text-white/60">Disabled</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Key Variants */}
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-6">Key Genetic Variants</h2>
            
            {profile.keyVariants.length > 0 ? (
              <div className="space-y-4">
                {profile.keyVariants.map((variant: any, index: number) => (
                  <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-white">{variant.gene}</span>
                          <span className="text-white/60">({variant.rsid})</span>
                        </div>
                        <p className="text-white/70 text-sm mt-1">{variant.clinicalSignificance}</p>
                      </div>
                      <div className={`text-xl font-bold ${getVariantColor(variant.genotype)}`}>
                        {variant.genotype}
                      </div>
                    </div>
                    <div className="text-xs text-white/50">
                      Chromosome {variant.chromosome} • Position {variant.position.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-center py-8">
                No key variants found in uploaded data
              </p>
            )}
          </div>

          {/* Risk Factors */}
          {profile.riskFactors.length > 0 && (
            <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-2xl p-6 border border-orange-500/30">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-orange-400" />
                Risk Factors
              </h2>
              <div className="space-y-3">
                {profile.riskFactors.map((risk: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3 bg-white/5 rounded-lg p-4">
                    <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/90">{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {profile.recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-2xl p-6 border border-cyan-500/30">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-cyan-400" />
                Personalized Recommendations
              </h2>
              <div className="space-y-3">
                {profile.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3 bg-white/5 rounded-lg p-4">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/90">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
