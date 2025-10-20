'use client';

import React, { useState, useCallback } from 'react';
import { 
  Upload, FileText, Image as ImageIcon, CheckCircle, AlertCircle, 
  Loader2, X, Edit, Save, Download, Trash2, Calendar, Building2,
  Beaker, TrendingUp, Eye, RefreshCw
} from 'lucide-react';

interface ExtractedBiomarker {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  confidence: number;
  category: string;
}

interface LabResult {
  id: string;
  uploadDate: Date;
  labName: string;
  testDate: Date;
  fileName: string;
  fileType: string;
  extractedText: string;
  biomarkers: ExtractedBiomarker[];
  status: 'processing' | 'review' | 'imported' | 'error';
}

export default function LabUploadTab() {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentLab, setCurrentLab] = useState<LabResult | null>(null);
  const [labHistory, setLabHistory] = useState<LabResult[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Load lab history from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('vagalsync_lab_results');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert date strings back to Date objects
      const history = parsed.map((lab: any) => ({
        ...lab,
        uploadDate: new Date(lab.uploadDate),
        testDate: new Date(lab.testDate)
      }));
      setLabHistory(history);
    }
  }, []);

  // Save to localStorage whenever lab history changes
  const saveToStorage = (history: LabResult[]) => {
    localStorage.setItem('vagalsync_lab_results', JSON.stringify(history));
  };

  // Biomarker patterns for parsing
  const biomarkerPatterns = [
    // Cardiovascular
    { 
      name: 'Heart Rate Variability', 
      aliases: ['HRV', 'heart rate variability', 'SDNN'],
      category: 'Cardiovascular',
      unit: 'ms',
      pattern: /(?:HRV|SDNN|heart rate variability)[:\s]*(\d+\.?\d*)\s*(ms|milliseconds?)?/i
    },
    { 
      name: 'Resting Heart Rate', 
      aliases: ['RHR', 'resting heart rate', 'heart rate'],
      category: 'Cardiovascular',
      unit: 'bpm',
      pattern: /(?:resting heart rate|RHR|heart rate)[:\s]*(\d+)\s*(bpm)?/i
    },
    { 
      name: 'Blood Pressure', 
      aliases: ['BP', 'blood pressure'],
      category: 'Cardiovascular',
      unit: 'mmHg',
      pattern: /(?:blood pressure|BP)[:\s]*(\d+\/\d+)\s*(mmHg)?/i
    },

    // Metabolic
    { 
      name: 'Glucose', 
      aliases: ['glucose', 'blood sugar', 'fasting glucose'],
      category: 'Metabolic',
      unit: 'mg/dL',
      pattern: /(?:glucose|blood sugar|fasting glucose)[:\s]*(\d+\.?\d*)\s*(mg\/dL)?/i
    },
    { 
      name: 'HbA1c', 
      aliases: ['HbA1c', 'A1C', 'hemoglobin A1c'],
      category: 'Metabolic',
      unit: '%',
      pattern: /(?:HbA1c|A1C|hemoglobin A1c)[:\s]*(\d+\.?\d*)\s*%?/i
    },
    { 
      name: 'Cholesterol', 
      aliases: ['cholesterol', 'total cholesterol'],
      category: 'Metabolic',
      unit: 'mg/dL',
      pattern: /(?:total cholesterol|cholesterol)[:\s]*(\d+)\s*(mg\/dL)?/i
    },
    { 
      name: 'HDL', 
      aliases: ['HDL', 'HDL cholesterol'],
      category: 'Metabolic',
      unit: 'mg/dL',
      pattern: /(?:HDL|HDL cholesterol)[:\s]*(\d+)\s*(mg\/dL)?/i
    },
    { 
      name: 'LDL', 
      aliases: ['LDL', 'LDL cholesterol'],
      category: 'Metabolic',
      unit: 'mg/dL',
      pattern: /(?:LDL|LDL cholesterol)[:\s]*(\d+)\s*(mg\/dL)?/i
    },
    { 
      name: 'Triglycerides', 
      aliases: ['triglycerides', 'TG'],
      category: 'Metabolic',
      unit: 'mg/dL',
      pattern: /(?:triglycerides|TG)[:\s]*(\d+)\s*(mg\/dL)?/i
    },

    // Hormonal
    { 
      name: 'Cortisol', 
      aliases: ['cortisol', 'serum cortisol'],
      category: 'Hormonal',
      unit: 'μg/dL',
      pattern: /(?:cortisol|serum cortisol)[:\s]*(\d+\.?\d*)\s*(μg\/dL|ug\/dL)?/i
    },
    { 
      name: 'Testosterone', 
      aliases: ['testosterone', 'total testosterone'],
      category: 'Hormonal',
      unit: 'ng/dL',
      pattern: /(?:testosterone|total testosterone)[:\s]*(\d+)\s*(ng\/dL)?/i
    },
    { 
      name: 'Thyroid (TSH)', 
      aliases: ['TSH', 'thyroid stimulating hormone'],
      category: 'Hormonal',
      unit: 'mIU/L',
      pattern: /(?:TSH|thyroid stimulating hormone)[:\s]*(\d+\.?\d*)\s*(mIU\/L)?/i
    },
    { 
      name: 'Vitamin D', 
      aliases: ['vitamin D', '25-OH vitamin D', 'vitamin D3'],
      category: 'Hormonal',
      unit: 'ng/mL',
      pattern: /(?:vitamin D|25-OH vitamin D)[:\s]*(\d+\.?\d*)\s*(ng\/mL)?/i
    },

    // Inflammatory
    { 
      name: 'CRP', 
      aliases: ['CRP', 'C-reactive protein', 'hs-CRP'],
      category: 'Inflammatory',
      unit: 'mg/L',
      pattern: /(?:CRP|C-reactive protein|hs-CRP)[:\s]*(\d+\.?\d*)\s*(mg\/L)?/i
    },
    { 
      name: 'IL-6', 
      aliases: ['IL-6', 'interleukin-6'],
      category: 'Inflammatory',
      unit: 'pg/mL',
      pattern: /(?:IL-6|interleukin-6)[:\s]*(\d+\.?\d*)\s*(pg\/mL)?/i
    },

    // Sleep
    { 
      name: 'Melatonin', 
      aliases: ['melatonin'],
      category: 'Sleep',
      unit: 'pg/mL',
      pattern: /(?:melatonin)[:\s]*(\d+\.?\d*)\s*(pg\/mL)?/i
    }
  ];

  // Parse extracted text to find biomarkers
  const parseBiomarkers = (text: string): ExtractedBiomarker[] => {
    const found: ExtractedBiomarker[] = [];

    biomarkerPatterns.forEach(pattern => {
      const match = text.match(pattern.pattern);
      if (match) {
        const value = match[1];
        const unit = match[2] || pattern.unit;
        
        // Try to find reference range nearby
        const rangePattern = /(?:reference|normal|range)[:\s]*(\d+\.?\d*\s*-\s*\d+\.?\d*)/i;
        const rangeMatch = text.match(rangePattern);
        
        found.push({
          name: pattern.name,
          value: value,
          unit: unit,
          referenceRange: rangeMatch ? rangeMatch[1] : 'Not found',
          confidence: 0.85,
          category: pattern.category
        });
      }
    });

    return found;
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setProcessing(true);

    try {
      // Create a unique ID
      const labId = `lab_${Date.now()}`;

      // Read file as base64 for storage (or process immediately)
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const result = e.target?.result;

        // Simulate OCR processing
        // In production, you'd use Tesseract.js or Google Cloud Vision API
        const extractedText = await performOCR(file);

        // Parse biomarkers from text
        const biomarkers = parseBiomarkers(extractedText);

        // Create lab result object
        const newLab: LabResult = {
          id: labId,
          uploadDate: new Date(),
          labName: 'Detected Lab',
          testDate: new Date(),
          fileName: file.name,
          fileType: file.type,
          extractedText: extractedText,
          biomarkers: biomarkers,
          status: biomarkers.length > 0 ? 'review' : 'error'
        };

        setCurrentLab(newLab);
        setProcessing(false);
      };

      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Upload error:', error);
      setProcessing(false);
      setUploading(false);
    }
  };

  // Simulated OCR function
  const performOCR = async (file: File): Promise<string> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In production, use Tesseract.js:
    // const { data: { text } } = await Tesseract.recognize(file, 'eng');
    // return text;

    // For now, return sample extracted text
    return `
      LABORATORY REPORT
      Patient Name: John Doe
      Test Date: ${new Date().toLocaleDateString()}
      
      LIPID PANEL
      Total Cholesterol: 185 mg/dL (Reference: 125-200)
      HDL Cholesterol: 55 mg/dL (Reference: >40)
      LDL Cholesterol: 110 mg/dL (Reference: <100)
      Triglycerides: 100 mg/dL (Reference: <150)
      
      METABOLIC PANEL
      Glucose: 92 mg/dL (Reference: 70-100)
      HbA1c: 5.2% (Reference: <5.7)
      
      HORMONE PANEL
      Cortisol: 12.5 μg/dL (Reference: 6-23)
      Testosterone: 650 ng/dL (Reference: 300-1000)
      TSH: 2.1 mIU/L (Reference: 0.4-4.0)
      Vitamin D: 45 ng/mL (Reference: 30-100)
      
      INFLAMMATORY MARKERS
      CRP: 0.8 mg/L (Reference: <3.0)
    `;
  };

  // Import biomarkers to main dashboard
  const importBiomarkers = () => {
    if (!currentLab) return;

    // Get existing biomarkers from localStorage
    const existing = localStorage.getItem('vagalsync_biomarkers');
    const biomarkerData = existing ? JSON.parse(existing) : {};

    // Update with new lab values
    currentLab.biomarkers.forEach(marker => {
      const key = marker.name.toLowerCase().replace(/\s+/g, '');
      biomarkerData[key] = {
        value: parseFloat(marker.value) || marker.value,
        enabled: true,
        source: 'lab',
        confidence: marker.confidence,
        lastUpdated: new Date().toISOString(),
        referenceRange: marker.referenceRange
      };
    });

    // Save to localStorage
    localStorage.setItem('vagalsync_biomarkers', JSON.stringify(biomarkerData));

    // Add to lab history
    const updatedLab = { ...currentLab, status: 'imported' as const };
    const newHistory = [updatedLab, ...labHistory];
    setLabHistory(newHistory);
    saveToStorage(newHistory);

    // Clear current lab
    setCurrentLab(null);
    setUploading(false);

    // Show success message
    alert(`✅ Imported ${currentLab.biomarkers.length} biomarkers!`);
  };

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  // Edit biomarker value
  const updateBiomarker = (index: number, field: string, value: string) => {
    if (!currentLab) return;
    
    const updated = [...currentLab.biomarkers];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentLab({ ...currentLab, biomarkers: updated });
  };

  // Delete biomarker
  const deleteBiomarker = (index: number) => {
    if (!currentLab) return;
    
    const updated = currentLab.biomarkers.filter((_, i) => i !== index);
    setCurrentLab({ ...currentLab, biomarkers: updated });
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-white mb-4 flex items-center justify-center">
          <Beaker className="w-12 h-12 mr-4 text-green-400" />
          Lab Results Upload
        </h2>
        <p className="text-2xl text-cyan-300/80">
          Upload lab reports and automatically extract biomarkers
        </p>
      </div>

      {/* Upload Area */}
      {!uploading && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-4 border-dashed rounded-3xl p-12 text-center transition-all ${
            dragActive
              ? 'border-cyan-400 bg-cyan-400/10'
              : 'border-white/20 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10'
          }`}
        >
          <Upload className="w-20 h-20 mx-auto mb-6 text-cyan-400" />
          <h3 className="text-2xl font-bold text-white mb-4">
            Upload Lab Report
          </h3>
          <p className="text-white/70 text-lg mb-6">
            Drag and drop your lab report here, or click to browse
          </p>
          
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            className="hidden"
            id="file-upload"
          />
          
          <label
            htmlFor="file-upload"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-full font-bold hover:from-cyan-600 hover:to-blue-600 transition-all cursor-pointer"
          >
            <FileText className="w-5 h-5" />
            <span>Choose File</span>
          </label>

          <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-white/60">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </div>
            <div className="flex items-center">
              <ImageIcon className="w-4 h-4 mr-2" />
              PNG, JPG
            </div>
          </div>
        </div>
      )}

      {/* Processing State */}
      {processing && (
        <div className="bg-blue-500/20 rounded-3xl p-12 text-center border border-blue-400/30">
          <Loader2 className="w-16 h-16 mx-auto mb-6 text-cyan-400 animate-spin" />
          <h3 className="text-2xl font-bold text-white mb-4">
            Processing Lab Report...
          </h3>
          <p className="text-white/70 text-lg">
            Extracting text and identifying biomarkers
          </p>
          <div className="mt-6 max-w-md mx-auto bg-white/10 rounded-full h-2">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full animate-pulse w-2/3"></div>
          </div>
        </div>
      )}

      {/* Review Extracted Data */}
      {currentLab && !processing && (
        <div className="space-y-6">
          {/* Lab Info */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-3xl p-8 border border-purple-400/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                Review Extracted Biomarkers
              </h3>
              <button
                onClick={() => {
                  setCurrentLab(null);
                  setUploading(false);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-white/60 text-sm mb-1">File Name</div>
                <div className="text-white font-medium">{currentLab.fileName}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-white/60 text-sm mb-1">Upload Date</div>
                <div className="text-white font-medium">
                  {currentLab.uploadDate.toLocaleDateString()}
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-white/60 text-sm mb-1">Biomarkers Found</div>
                <div className="text-cyan-400 font-bold text-xl">
                  {currentLab.biomarkers.length}
                </div>
              </div>
            </div>

            {/* Status */}
            {currentLab.biomarkers.length === 0 ? (
              <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-6 mb-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-orange-400" />
                  <div>
                    <div className="font-bold text-white mb-1">No Biomarkers Detected</div>
                    <div className="text-white/70 text-sm">
                      The OCR couldn't find standard biomarkers. You can manually add them or try a different image.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-6 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="font-bold text-white mb-1">
                      Successfully Extracted {currentLab.biomarkers.length} Biomarkers
                    </div>
                    <div className="text-white/70 text-sm">
                      Review the values below and edit if needed before importing
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Biomarker List */}
          {currentLab.biomarkers.length > 0 && (
            <div className="space-y-3">
              {currentLab.biomarkers.map((marker, index) => (
                <div
                  key={index}
                  className="bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-cyan-400/30 transition-all"
                >
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    {/* Name */}
                    <div className="md:col-span-2">
                      <div className="text-white/60 text-xs mb-1">Biomarker</div>
                      {editingIndex === index ? (
                        <input
                          type="text"
                          value={marker.name}
                          onChange={(e) => updateBiomarker(index, 'name', e.target.value)}
                          className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                        />
                      ) : (
                        <div className="text-white font-medium">{marker.name}</div>
                      )}
                      <div className="text-cyan-400 text-xs mt-1">{marker.category}</div>
                    </div>

                    {/* Value */}
                    <div>
                      <div className="text-white/60 text-xs mb-1">Value</div>
                      {editingIndex === index ? (
                        <input
                          type="text"
                          value={marker.value}
                          onChange={(e) => updateBiomarker(index, 'value', e.target.value)}
                          className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                        />
                      ) : (
                        <div className="text-white font-bold">{marker.value}</div>
                      )}
                    </div>

                    {/* Unit */}
                    <div>
                      <div className="text-white/60 text-xs mb-1">Unit</div>
                      {editingIndex === index ? (
                        <input
                          type="text"
                          value={marker.unit}
                          onChange={(e) => updateBiomarker(index, 'unit', e.target.value)}
                          className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                        />
                      ) : (
                        <div className="text-white">{marker.unit}</div>
                      )}
                    </div>

                    {/* Reference Range */}
                    <div>
                      <div className="text-white/60 text-xs mb-1">Reference</div>
                      {editingIndex === index ? (
                        <input
                          type="text"
                          value={marker.referenceRange}
                          onChange={(e) => updateBiomarker(index, 'referenceRange', e.target.value)}
                          className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                        />
                      ) : (
                        <div className="text-white/70 text-sm">{marker.referenceRange}</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {editingIndex === index ? (
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="p-2 rounded-lg bg-green-500 hover:bg-green-600 transition-all"
                        >
                          <Save className="w-4 h-4 text-white" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingIndex(index)}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                        >
                          <Edit className="w-4 h-4 text-white" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteBiomarker(index)}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div className="mt-4 flex items-center">
                    <div className="text-white/60 text-xs mr-3">Confidence:</div>
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                        style={{ width: `${marker.confidence * 100}%` }}
                      />
                    </div>
                    <div className="ml-3 text-white/80 text-sm font-medium">
                      {Math.round(marker.confidence * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Import Button */}
          {currentLab.biomarkers.length > 0 && (
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => {
                  setCurrentLab(null);
                  setUploading(false);
                }}
                className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={importBiomarkers}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full font-bold hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                <Download className="w-5 h-5" />
                <span>Import {currentLab.biomarkers.length} Biomarkers</span>
              </button>
            </div>
          )}

          {/* Raw Text Preview */}
          <details className="bg-white/5 rounded-2xl border border-white/10">
            <summary className="p-4 cursor-pointer text-white font-medium hover:bg-white/10 rounded-2xl transition-all">
              View Extracted Text
            </summary>
            <div className="p-4 border-t border-white/10">
              <pre className="text-white/70 text-sm whitespace-pre-wrap font-mono">
                {currentLab.extractedText}
              </pre>
            </div>
          </details>
        </div>
      )}

      {/* Lab History */}
      {labHistory.length > 0 && !uploading && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <Calendar className="w-7 h-7 mr-3 text-cyan-400" />
            Lab History
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {labHistory.map((lab) => (
              <div
                key={lab.id}
                className="bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-cyan-400/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-white font-bold text-lg mb-1">
                      {lab.fileName}
                    </div>
                    <div className="text-white/60 text-sm">
                      {lab.uploadDate.toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    lab.status === 'imported' 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {lab.status === 'imported' ? '✓ Imported' : 'Pending'}
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-cyan-400">
                    <Beaker className="w-4 h-4 mr-2" />
                    {lab.biomarkers.length} biomarkers
                  </div>
                  <button
                    onClick={() => setCurrentLab(lab)}
                    className="flex items-center text-white/70 hover:text-white transition-all"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-500/20 rounded-2xl p-6 border border-blue-400/30">
          <FileText className="w-10 h-10 text-blue-400 mb-4" />
          <h4 className="font-bold text-white mb-2">Supported Formats</h4>
          <p className="text-white/70 text-sm">
            PDF, PNG, JPG from Quest, LabCorp, and most major labs
          </p>
        </div>

        <div className="bg-green-500/20 rounded-2xl p-6 border border-green-400/30">
          <CheckCircle className="w-10 h-10 text-green-400 mb-4" />
          <h4 className="font-bold text-white mb-2">Automatic Detection</h4>
          <p className="text-white/70 text-sm">
            Our AI identifies 24+ common biomarkers automatically
          </p>
        </div>

        <div className="bg-purple-500/20 rounded-2xl p-6 border border-purple-400/30">
          <TrendingUp className="w-10 h-10 text-purple-400 mb-4" />
          <h4 className="font-bold text-white mb-2">Track Progress</h4>
          <p className="text-white/70 text-sm">
            View trends and improvements over time with multiple uploads
          </p>
        </div>
      </div>
    </div>
  );
}
