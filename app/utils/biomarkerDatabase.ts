/**
 * VagalSync V15.0 Ultimate - Biomarker Database
 * 
 * This file contains the complete database of 24 biomarkers across 6 categories.
 * Each biomarker includes optimal ranges, clinical significance, and impact values.
 * 
 * Patent #1: myVagal Tone™ - Each biomarker contributes +8 (optimal) or -10 (suboptimal)
 * Patent #3: Accuracy Weighting - Impacts are multiplied by source accuracy factor
 * 
 * WELLNESS COMPLIANCE: These ranges are for wellness optimization, not medical diagnosis.
 */

import { BiomarkerDefinition, BiomarkerCategory, AccuracyWeight, AccuracySource } from '../types/biomarker.types';

// ============================================================================
// ACCURACY WEIGHTING SYSTEM (PATENT #3)
// ============================================================================

/**
 * Accuracy factors for different measurement sources
 * These multiply the base impact to account for measurement reliability
 */
export const ACCURACY_WEIGHTS: Record<AccuracySource, AccuracyWeight> = {
  laboratory: {
    factor: 1.0,
    label: "Laboratory Grade",
    description: "Professional lab test - highest accuracy"
  },
  medical_device: {
    factor: 1.0,
    label: "Medical Device",
    description: "FDA-cleared medical device"
  },
  validated_consumer: {
    factor: 0.98,
    label: "Validated Consumer",
    description: "Consumer device with clinical validation"
  },
  standard_consumer: {
    factor: 0.92,
    label: "Consumer Device",
    description: "Standard consumer wearable or tracker"
  }
};

// ============================================================================
// BIOMARKER DATABASE - 24 BIOMARKERS ACROSS 6 CATEGORIES
// ============================================================================

/**
 * Complete biomarker database
 * Each biomarker includes optimal ranges based on latest wellness research
 */
export const BIOMARKER_DATABASE: BiomarkerDefinition[] = [
  
  // ==========================================================================
  // CATEGORY 1: STRESS HORMONES (4 biomarkers)
  // ==========================================================================
  {
    id: 'cortisol_am',
    name: 'Cortisol AM',
    unit: 'μg/dL',
    category: 'stress_hormones',
    optimalRange: '10-16',
    normalRange: '6.2-19.4',
    description: 'Morning cortisol levels indicate stress response activation',
    clinicalSignificance: 'Elevated cortisol indicates chronic stress activation and HPA axis dysregulation. Optimal morning cortisol supports healthy circadian rhythm and stress resilience.',
    impactOnVagalTone: 8,
    icon: '☀️'
  },
  {
    id: 'cortisol_pm',
    name: 'Cortisol PM',
    unit: 'μg/dL',
    category: 'stress_hormones',
    optimalRange: '3-10',
    normalRange: '2.3-11.9',
    description: 'Evening cortisol should be lower for healthy sleep',
    clinicalSignificance: 'Evening cortisol should decline for proper sleep onset. Elevated evening cortisol disrupts sleep quality and recovery.',
    impactOnVagalTone: 8,
    icon: '🌙'
  },
  {
    id: 'dhea_s',
    name: 'DHEA-S',
    unit: 'μg/dL',
    category: 'stress_hormones',
    optimalRange: '280-640',
    normalRange: '164-530',
    description: 'DHEA buffers cortisol and supports stress resilience',
    clinicalSignificance: 'DHEA is the stress resilience hormone. Optimal levels indicate strong adrenal function and ability to manage stress.',
    impactOnVagalTone: 8,
    icon: '⚡'
  },
  {
    id: 'cortisol_dhea_ratio',
    name: 'Cortisol:DHEA Ratio',
    unit: 'ratio',
    category: 'stress_hormones',
    optimalRange: '5-10',
    normalRange: '5-15',
    description: 'Balance between stress and resilience hormones',
    clinicalSignificance: 'High ratio indicates chronic stress overwhelm. Optimal ratio shows healthy stress response with adequate recovery capacity.',
    impactOnVagalTone: 8,
    icon: '⚖️'
  },

  // ==========================================================================
  // CATEGORY 2: INFLAMMATORY MARKERS (4 biomarkers)
  // ==========================================================================
  {
    id: 'crp',
    name: 'C-Reactive Protein (CRP)',
    unit: 'mg/L',
    category: 'inflammatory',
    optimalRange: '0-1',
    normalRange: '0-3',
    description: 'Primary marker of systemic inflammation',
    clinicalSignificance: 'Elevated CRP indicates inflammation which triggers stress response. Optimal CRP shows low inflammatory burden and good vagal tone.',
    impactOnVagalTone: 8,
    icon: '🔥'
  },
  {
    id: 'homocysteine',
    name: 'Homocysteine',
    unit: 'μmol/L',
    category: 'inflammatory',
    optimalRange: '5-7',
    normalRange: '5-15',
    description: 'Marker of methylation and vascular health',
    clinicalSignificance: 'Elevated homocysteine indicates poor methylation, B-vitamin deficiency, and vascular inflammation affecting brain health.',
    impactOnVagalTone: 8,
    icon: '🧬'
  },
  {
    id: 'esr',
    name: 'ESR (Sed Rate)',
    unit: 'mm/hr',
    category: 'inflammatory',
    optimalRange: '0-10',
    normalRange: '0-20',
    description: 'General inflammation indicator',
    clinicalSignificance: 'Elevated ESR indicates chronic inflammation. Optimal levels support healthy immune function and stress resilience.',
    impactOnVagalTone: 8,
    icon: '📊'
  },
  {
    id: 'ferritin',
    name: 'Ferritin',
    unit: 'ng/mL',
    category: 'inflammatory',
    optimalRange: '50-150',
    normalRange: '24-336',
    description: 'Iron storage and inflammation marker',
    clinicalSignificance: 'Both low and high ferritin impact health. Low indicates iron deficiency affecting energy. High indicates inflammation.',
    impactOnVagalTone: 8,
    icon: '🩸'
  },

  // ==========================================================================
  // CATEGORY 3: METABOLIC MARKERS (4 biomarkers)
  // ==========================================================================
  {
    id: 'fasting_glucose',
    name: 'Fasting Glucose',
    unit: 'mg/dL',
    category: 'metabolic',
    optimalRange: '75-85',
    normalRange: '70-100',
    description: 'Blood sugar control and insulin sensitivity',
    clinicalSignificance: 'Optimal glucose indicates good insulin sensitivity. Elevated glucose triggers stress response and inflammation.',
    impactOnVagalTone: 8,
    icon: '🍬'
  },
  {
    id: 'hba1c',
    name: 'HbA1c',
    unit: '%',
    category: 'metabolic',
    optimalRange: '4.8-5.4',
    normalRange: '4.0-5.6',
    description: '3-month average blood sugar',
    clinicalSignificance: 'HbA1c shows long-term glucose control. Optimal levels indicate stable energy and low glycation stress.',
    impactOnVagalTone: 8,
    icon: '📈'
  },
  {
    id: 'fasting_insulin',
    name: 'Fasting Insulin',
    unit: 'μIU/mL',
    category: 'metabolic',
    optimalRange: '2-5',
    normalRange: '2-19',
    description: 'Insulin resistance indicator',
    clinicalSignificance: 'Elevated insulin indicates insulin resistance, a major stress on the body. Optimal insulin shows good metabolic health.',
    impactOnVagalTone: 8,
    icon: '💉'
  },
  {
    id: 'homa_ir',
    name: 'HOMA-IR',
    unit: 'score',
    category: 'metabolic',
    optimalRange: '0.5-1.4',
    normalRange: '0.5-2.0',
    description: 'Calculated insulin resistance score',
    clinicalSignificance: 'HOMA-IR quantifies insulin resistance. Optimal scores indicate excellent metabolic flexibility and stress resilience.',
    impactOnVagalTone: 8,
    icon: '🎯'
  },

  // ==========================================================================
  // CATEGORY 4: CARDIOVASCULAR MARKERS (4 biomarkers)
  // ==========================================================================
  {
    id: 'total_cholesterol',
    name: 'Total Cholesterol',
    unit: 'mg/dL',
    category: 'cardiovascular',
    optimalRange: '160-200',
    normalRange: '125-200',
    description: 'Overall cholesterol level',
    clinicalSignificance: 'Optimal cholesterol supports hormone production and cell health. Very low or high levels indicate metabolic stress.',
    impactOnVagalTone: 8,
    icon: '❤️'
  },
  {
    id: 'ldl',
    name: 'LDL Cholesterol',
    unit: 'mg/dL',
    category: 'cardiovascular',
    optimalRange: '80-120',
    normalRange: '0-100',
    description: 'LDL cholesterol levels',
    clinicalSignificance: 'Oxidized LDL drives inflammation. Optimal LDL in the context of low inflammation supports cardiovascular health.',
    impactOnVagalTone: 8,
    icon: '📉'
  },
  {
    id: 'hdl',
    name: 'HDL Cholesterol',
    unit: 'mg/dL',
    category: 'cardiovascular',
    optimalRange: '50-90',
    normalRange: '40-100',
    description: 'Protective HDL cholesterol',
    clinicalSignificance: 'HDL is protective and anti-inflammatory. Higher HDL (in optimal range) supports stress resilience and recovery.',
    impactOnVagalTone: 8,
    icon: '📈'
  },
  {
    id: 'triglycerides',
    name: 'Triglycerides',
    unit: 'mg/dL',
    category: 'cardiovascular',
    optimalRange: '50-90',
    normalRange: '0-150',
    description: 'Blood fat levels',
    clinicalSignificance: 'Elevated triglycerides indicate metabolic stress and insulin resistance. Optimal levels support cardiovascular and brain health.',
    impactOnVagalTone: 8,
    icon: '🫀'
  },

  // ==========================================================================
  // CATEGORY 5: NEUROCHEMICAL MARKERS (4 biomarkers)
  // ==========================================================================
  {
    id: 'serotonin',
    name: 'Serotonin',
    unit: 'ng/mL',
    category: 'neurochemical',
    optimalRange: '101-283',
    normalRange: '101-283',
    description: 'Mood and stress regulation neurotransmitter',
    clinicalSignificance: 'Serotonin regulates mood, sleep, and stress response. Optimal levels support emotional resilience and vagal tone.',
    impactOnVagalTone: 8,
    icon: '😊'
  },
  {
    id: 'dopamine',
    name: 'Dopamine',
    unit: 'pg/mL',
    category: 'neurochemical',
    optimalRange: '0-30',
    normalRange: '0-30',
    description: 'Motivation and reward neurotransmitter',
    clinicalSignificance: 'Dopamine drives motivation and pleasure. Optimal levels support stress resilience through positive engagement with life.',
    impactOnVagalTone: 8,
    icon: '🎯'
  },
  {
    id: 'gaba',
    name: 'GABA',
    unit: 'nmol/L',
    category: 'neurochemical',
    optimalRange: '2-6',
    normalRange: '2-6',
    description: 'Primary calming neurotransmitter',
    clinicalSignificance: 'GABA is the main inhibitory neurotransmitter. Optimal GABA supports relaxation response and parasympathetic activation.',
    impactOnVagalTone: 8,
    icon: '🧘'
  },
  {
    id: 'glutamate',
    name: 'Glutamate',
    unit: 'μmol/L',
    category: 'neurochemical',
    optimalRange: '20-80',
    normalRange: '20-80',
    description: 'Primary excitatory neurotransmitter',
    clinicalSignificance: 'Balanced glutamate supports learning and memory. Excess glutamate increases stress response and reduces vagal tone.',
    impactOnVagalTone: 8,
    icon: '⚡'
  },

  // ==========================================================================
  // CATEGORY 6: NUTRITIONAL MARKERS (4 biomarkers)
  // ==========================================================================
  {
    id: 'vitamin_d',
    name: 'Vitamin D',
    unit: 'ng/mL',
    category: 'nutritional',
    optimalRange: '50-80',
    normalRange: '30-100',
    description: 'Immune and mood supporting vitamin',
    clinicalSignificance: 'Vitamin D deficiency increases inflammation and reduces stress resilience. Optimal levels support immune function and mood.',
    impactOnVagalTone: 8,
    icon: '☀️'
  },
  {
    id: 'magnesium',
    name: 'Magnesium RBC',
    unit: 'mg/dL',
    category: 'nutritional',
    optimalRange: '5.5-6.5',
    normalRange: '4.0-6.4',
    description: 'Stress-buffer mineral in red blood cells',
    clinicalSignificance: 'Magnesium is essential for stress response regulation. Optimal magnesium supports parasympathetic activation and recovery.',
    impactOnVagalTone: 8,
    icon: '🧲'
  },
  {
    id: 'omega_3_index',
    name: 'Omega-3 Index',
    unit: '%',
    category: 'nutritional',
    optimalRange: '8-12',
    normalRange: '4-8',
    description: 'Anti-inflammatory fatty acid status',
    clinicalSignificance: 'Omega-3s are anti-inflammatory and support vagal nerve function. Optimal levels reduce stress response and support recovery.',
    impactOnVagalTone: 8,
    icon: '🐟'
  },
  {
    id: 'b12',
    name: 'Vitamin B12',
    unit: 'pg/mL',
    category: 'nutritional',
    optimalRange: '500-1000',
    normalRange: '200-900',
    description: 'Nervous system supporting vitamin',
    clinicalSignificance: 'B12 supports nervous system health and energy production. Optimal levels support stress resilience and cognitive function.',
    impactOnVagalTone: 8,
    icon: '🅱️'
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a biomarker by its ID
 * @param id - Biomarker ID (e.g., "cortisol_am")
 * @returns BiomarkerDefinition or undefined if not found
 */
export function getBiomarkerById(id: string): BiomarkerDefinition | undefined {
  return BIOMARKER_DATABASE.find(b => b.id === id);
}

/**
 * Get all biomarkers in a specific category
 * @param category - Category to filter by
 * @returns Array of biomarkers in that category
 */
export function getBiomarkersByCategory(category: BiomarkerCategory): BiomarkerDefinition[] {
  return BIOMARKER_DATABASE.filter(b => b.category === category);
}

/**
 * Get all available categories
 * @returns Array of all 6 categories
 */
export function getAllCategories(): BiomarkerCategory[] {
  return [
    'stress_hormones',
    'inflammatory',
    'metabolic',
    'cardiovascular',
    'neurochemical',
    'nutritional'
  ];
}

/**
 * Search biomarkers by name
 * @param query - Search string
 * @returns Matching biomarkers
 */
export function searchBiomarkers(query: string): BiomarkerDefinition[] {
  const lowerQuery = query.toLowerCase();
  return BIOMARKER_DATABASE.filter(b => 
    b.name.toLowerCase().includes(lowerQuery) ||
    b.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get category display information
 * @param category - Category ID
 * @returns Display name and icon for the category
 */
export function getCategoryInfo(category: BiomarkerCategory): { name: string; icon: string } {
  const info = {
    stress_hormones: { name: 'Stress Hormones', icon: '⚡' },
    inflammatory: { name: 'Inflammatory', icon: '🔥' },
    metabolic: { name: 'Metabolic', icon: '🍬' },
    cardiovascular: { name: 'Cardiovascular', icon: '❤️' },
    neurochemical: { name: 'Neurochemical', icon: '🧠' },
    nutritional: { name: 'Nutritional', icon: '🥗' }
  };
  
  return info[category];
}
