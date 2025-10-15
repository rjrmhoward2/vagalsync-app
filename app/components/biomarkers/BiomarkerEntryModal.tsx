/**
 * VagalSync V15.0 Ultimate - Biomarker Entry Modal
 * 
 * Modal form for adding or editing biomarker measurements.
 * 
 * Features:
 * - Add new measurement or edit existing
 * - Accuracy source selection (lab, medical device, consumer)
 * - Real-time validation with error messages
 * - Date/time picker
 * - Optional notes field
 * - Preview of impact on myVagal Tone
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';

import { BiomarkerDefinition, BiomarkerEntry, AccuracySource } from '../../types/biomarker.types';
import { ACCURACY_WEIGHTS } from '../../utils/biomarkerDatabase';
import { 
  addBiomarkerEntry, 
  updateBiomarkerEntry 
} from '../../services/storageService';
import { 
  validateFieldRealtime,
  validateBiomarkerEntry 
} from '../../utils/validators';
import { 
  isInOptimalRange,
  calculateBiomarkerImpact 
} from '../../utils/calculations';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface BiomarkerEntryModalProps {
  biomarker: BiomarkerDefinition;
  existingEntry?: BiomarkerEntry; // If editing
  onClose: () => void;
  onSave: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function BiomarkerEntryModal({
  biomarker,
  existingEntry,
  onClose,
  onSave
}: BiomarkerEntryModalProps) {
  const isEditing = !!existingEntry;

  // Form state
  const [value, setValue] = useState(existingEntry?.value.toString() || '');
  const [accuracySource, setAccuracySource] = useState<AccuracySource>(
    existingEntry?.accuracySource || 'standard_consumer'
  );
  const [timestamp, setTimestamp] = useState(
    existingEntry?.timestamp 
      ? new Date(existingEntry.timestamp).toISOString().slice(0, 16) 
      : new Date().toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState(existingEntry?.notes || '');

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Preview state
  const [previewImpact, setPreviewImpact] = useState<number | null>(null);
  const [previewOptimal, setPreviewOptimal] = useState<boolean | null>(null);

  // ============================================================================
  // REAL-TIME VALIDATION
  // ============================================================================

  useEffect(() => {
    // Validate value field
    const valueError = validateFieldRealtime('value', value);
    setErrors(prev => ({ ...prev, value: valueError.error || '' }));

    // Calculate preview if value is valid
    if (value && !valueError.error) {
      const numValue = parseFloat(value);
      const isOptimal = isInOptimalRange(numValue, biomarker.optimalRange);
      setPreviewOptimal(isOptimal);

      // Calculate impact
      const baseImpact = isOptimal ? 8 : -10;
      const accuracyFactor = ACCURACY_WEIGHTS[accuracySource].factor;
      const weightedImpact = baseImpact * accuracyFactor;
      setPreviewImpact(weightedImpact);
    } else {
      setPreviewOptimal(null);
      setPreviewImpact(null);
    }
  }, [value, accuracySource, biomarker]);

  useEffect(() => {
    const timestampError = validateFieldRealtime('timestamp', timestamp);
    setErrors(prev => ({ ...prev, timestamp: timestampError.error || '' }));
  }, [timestamp]);

  useEffect(() => {
    const notesError = validateFieldRealtime('notes', notes);
    setErrors(prev => ({ ...prev, notes: notesError.error || '' }));
  }, [notes]);

  // ============================================================================
  // FORM SUBMISSION
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setWarnings([]);

    try {
      // Final validation
      const validation = validateBiomarkerEntry({
        biomarkerId: biomarker.id,
        value: parseFloat(value),
        unit: biomarker.unit,
        timestamp: new Date(timestamp),
        accuracySource,
        notes: notes || undefined
      });

      if (!validation.isValid) {
        setErrors({ form: validation.error || 'Validation failed' });
        setIsSaving(false);
        return;
      }

      if (validation.warnings) {
        setWarnings(validation.warnings);
      }

      // Save or update entry
      if (isEditing) {
        updateBiomarkerEntry(existingEntry.id, {
          value: parseFloat(value),
          timestamp: new Date(timestamp),
          accuracySource,
          notes: notes || undefined
        });
      } else {
        addBiomarkerEntry({
          biomarkerId: biomarker.id,
          value: parseFloat(value),
          unit: biomarker.unit,
          timestamp: new Date(timestamp),
          accuracySource,
          notes: notes || undefined
        });
      }

      // Success!
      onSave();
      onClose();
    } catch (error: any) {
      setErrors({ form: error.message || 'Failed to save entry' });
    } finally {
      setIsSaving(false);
    }
  };

  // Check if form is valid
  const hasErrors = Object.values(errors).some(e => e);
  const isValid = value && timestamp && !hasErrors;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-black/30 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{biomarker.icon || '📊'}</div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isEditing ? 'Update' : 'Add'} {biomarker.name}
              </h2>
              <p className="text-white/60 text-sm">
                Optimal range: {biomarker.optimalRange} {biomarker.unit}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Value Input */}
          <div>
            <label className="block text-white font-medium mb-2">
              Measurement Value *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Enter value in ${biomarker.unit}`}
                className={`w-full bg-white/10 border ${
                  errors.value ? 'border-red-400' : 'border-white/20'
                } rounded-xl px-4 py-3 text-white text-lg placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400`}
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 font-medium">
                {biomarker.unit}
              </div>
            </div>
            {errors.value && (
              <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.value}
              </p>
            )}

            {/* Preview Impact */}
            {previewOptimal !== null && previewImpact !== null && (
              <div className={`mt-3 p-3 rounded-lg ${
                previewOptimal 
                  ? 'bg-emerald-500/20 border border-emerald-400/30' 
                  : 'bg-red-500/20 border border-red-400/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {previewOptimal ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-300 font-medium">In Optimal Range</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-300 font-medium">Outside Optimal Range</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm">Impact:</span>
                    <span className={`font-bold text-lg ${
                      previewImpact > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {previewImpact > 0 ? '+' : ''}{previewImpact.toFixed(1)}
                    </span>
                    {previewImpact > 0 ? (
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accuracy Source Selection */}
          <div>
            <label className="block text-white font-medium mb-2">
              Measurement Source *
            </label>
            <p className="text-white/60 text-sm mb-3">
              Different sources have different accuracy weights (affects myVagal Tone calculation)
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(ACCURACY_WEIGHTS) as AccuracySource[]).map(source => {
                const weight = ACCURACY_WEIGHTS[source];
                const isSelected = accuracySource === source;

                return (
                  <button
                    key={source}
                    type="button"
                    onClick={() => setAccuracySource(source)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{weight.label}</span>
                      <span className={`text-sm font-bold ${
                        isSelected ? 'text-cyan-400' : 'text-white/60'
                      }`}>
                        {(weight.factor * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-white/60 text-xs">{weight.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date/Time Input */}
          <div>
            <label className="block text-white font-medium mb-2">
              Measurement Date & Time *
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                max={new Date().toISOString().slice(0, 16)}
                className={`w-full bg-white/10 border ${
                  errors.timestamp ? 'border-red-400' : 'border-white/20'
                } rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400`}
                required
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none" />
            </div>
            {errors.timestamp && (
              <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.timestamp}
              </p>
            )}
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-white font-medium mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any relevant notes about this measurement..."
              rows={3}
              maxLength={500}
              className={`w-full bg-white/10 border ${
                errors.notes ? 'border-red-400' : 'border-white/20'
              } rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none`}
            />
            <div className="flex justify-between items-center mt-2">
              {errors.notes ? (
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.notes}
                </p>
              ) : (
                <p className="text-white/40 text-sm">
                  Example: "Fasting blood test", "After morning workout", etc.
                </p>
              )}
              <span className="text-white/40 text-sm">{notes.length}/500</span>
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4">
              {warnings.map((warning, index) => (
                <p key={index} className="text-yellow-300 text-sm flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {warning}
                </p>
              ))}
            </div>
          )}

          {/* Form Error */}
          {errors.form && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4">
              <p className="text-red-300 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {errors.form}
              </p>
            </div>
          )}

          {/* Biomarker Info */}
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-white font-medium mb-2">About {biomarker.name}</h4>
            <p className="text-white/70 text-sm mb-3">{biomarker.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Optimal Range:</span>
                <span className="text-emerald-400 font-medium">
                  {biomarker.optimalRange} {biomarker.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Normal Range:</span>
                <span className="text-white/80">
                  {biomarker.normalRange} {biomarker.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isSaving}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                isValid && !isSaving
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {isSaving ? 'Saving...' : isEditing ? 'Update Entry' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
