// VagalSync V15.0 Ultimate - Genetic & Epigenetic Database
// Patent-pending genetic variant database for personalized biomarker recommendations
// CORRECTED VERSION - Proper exports

// ============================================================================
// TYPES (EXPORTED)
// ============================================================================

export interface GeneticVariant {
  rsid: string;
  gene: string;
  chromosome: string;
  position: number;
  pathway: 'metabolic' | 'inflammation' | 'cardiovascular' | 'hormonal' | 'neurological';
  description: string;
  riskVariants: Array<{
    genotype: string;
    impact: 'high' | 'moderate' | 'low';
    description: string;
    recommendations: string[];
  }>;
  biomarkerImpacts: Array<{
    biomarkerId: string;
    effect: string;
    magnitude: number;
  }>;
  epigeneticModifiers: EpigeneticModifier[];
}

export interface EpigeneticModifier {
  intervention: string;
  effect: string;
  evidence: 'strong' | 'moderate' | 'emerging';
  mechanism: string;
}

// ============================================================================
// DATABASE (EXPORTED)
// ============================================================================

export const geneticDatabase: GeneticVariant[] = [
  // METABOLIC VARIANTS
  {
    rsid: 'rs1801133',
    gene: 'MTHFR',
    chromosome: '1',
    position: 11856378,
    pathway: 'metabolic',
    description: 'Affects folate metabolism and homocysteine levels',
    riskVariants: [
      {
        genotype: 'TT',
        impact: 'high',
        description: '70% reduction in enzyme activity, elevated homocysteine risk',
        recommendations: [
          'Monitor homocysteine levels regularly',
          'Supplement with methylfolate (not folic acid)',
          'Increase B12 intake',
          'Track cardiovascular biomarkers closely'
        ]
      },
      {
        genotype: 'CT',
        impact: 'moderate',
        description: '35% reduction in enzyme activity',
        recommendations: [
          'Consider methylfolate supplementation',
          'Monitor homocysteine annually'
        ]
      }
    ],
    biomarkerImpacts: [
      {
        biomarkerId: 'homocysteine',
        effect: 'Increases homocysteine levels',
        magnitude: 1.5
      },
      {
        biomarkerId: 'folate',
        effect: 'Reduces folate utilization',
        magnitude: -0.7
      }
    ],
    epigeneticModifiers: [
      {
        intervention: 'Methylfolate supplementation (400-800mcg)',
        effect: 'Normalizes homocysteine levels',
        evidence: 'strong',
        mechanism: 'Bypasses impaired MTHFR enzyme activity'
      },
      {
        intervention: 'Leafy green vegetables (5+ servings/week)',
        effect: 'Improves folate status',
        evidence: 'strong',
        mechanism: 'Provides natural folates'
      }
    ]
  },

  {
    rsid: 'rs429358',
    gene: 'APOE',
    chromosome: '19',
    position: 45411941,
    pathway: 'metabolic',
    description: 'Major genetic risk factor for Alzheimer\'s disease and cardiovascular disease',
    riskVariants: [
      {
        genotype: 'CC',
        impact: 'high',
        description: 'APOE4/APOE4 - Highest risk for Alzheimer\'s and cardiovascular disease',
        recommendations: [
          'Prioritize cardiovascular health markers',
          'Monitor lipid panels quarterly',
          'Track inflammatory markers (CRP, IL-6)',
          'Emphasize cognitive health biomarkers',
          'Consider genetic counseling'
        ]
      },
      {
        genotype: 'CT',
        impact: 'moderate',
        description: 'APOE3/APOE4 - Moderately increased risk',
        recommendations: [
          'Monitor lipid panels semi-annually',
          'Track inflammatory biomarkers',
          'Focus on lifestyle interventions'
        ]
      }
    ],
    biomarkerImpacts: [
      {
        biomarkerId: 'ldl-cholesterol',
        effect: 'Increases LDL cholesterol levels',
        magnitude: 1.3
      },
      {
        biomarkerId: 'crp',
        effect: 'Increases inflammatory markers',
        magnitude: 1.2
      },
      {
        biomarkerId: 'triglycerides',
        effect: 'Increases triglyceride levels',
        magnitude: 1.1
      }
    ],
    epigeneticModifiers: [
      {
        intervention: 'Mediterranean diet',
        effect: 'Reduces cardiovascular risk by 30%',
        evidence: 'strong',
        mechanism: 'Anti-inflammatory effects, improved lipid profile'
      },
      {
        intervention: 'Omega-3 supplementation (2g EPA+DHA daily)',
        effect: 'Reduces inflammation and improves lipid metabolism',
        evidence: 'strong',
        mechanism: 'Competes with arachidonic acid metabolism'
      },
      {
        intervention: 'Regular aerobic exercise (150+ min/week)',
        effect: 'Improves cognitive function and cardiovascular health',
        evidence: 'strong',
        mechanism: 'Increases BDNF, improves insulin sensitivity'
      }
    ]
  },

  // INFLAMMATION VARIANTS
  {
    rsid: 'rs1800795',
    gene: 'IL6',
    chromosome: '7',
    position: 22727026,
    pathway: 'inflammation',
    description: 'Affects IL-6 production and inflammatory response',
    riskVariants: [
      {
        genotype: 'CC',
        impact: 'moderate',
        description: 'Increased IL-6 production, higher baseline inflammation',
        recommendations: [
          'Monitor CRP and IL-6 levels regularly',
          'Focus on anti-inflammatory diet',
          'Track inflammatory biomarkers',
          'Optimize omega-3 intake'
        ]
      }
    ],
    biomarkerImpacts: [
      {
        biomarkerId: 'crp',
        effect: 'Increases C-reactive protein',
        magnitude: 1.4
      },
      {
        biomarkerId: 'il-6',
        effect: 'Increases IL-6 baseline levels',
        magnitude: 1.6
      }
    ],
    epigeneticModifiers: [
      {
        intervention: 'Anti-inflammatory diet (Mediterranean, low-glycemic)',
        effect: 'Reduces IL-6 levels by 20-30%',
        evidence: 'strong',
        mechanism: 'Reduces pro-inflammatory cytokine production'
      },
      {
        intervention: 'Curcumin supplementation (1000mg with black pepper)',
        effect: 'Reduces inflammation markers',
        evidence: 'moderate',
        mechanism: 'Inhibits NF-κB pathway'
      }
    ]
  },

  // CARDIOVASCULAR VARIANTS
  {
    rsid: 'rs1799983',
    gene: 'NOS3',
    chromosome: '7',
    position: 150690107,
    pathway: 'cardiovascular',
    description: 'Affects nitric oxide production and vascular function',
    riskVariants: [
      {
        genotype: 'TT',
        impact: 'moderate',
        description: 'Reduced nitric oxide production, impaired vascular function',
        recommendations: [
          'Monitor blood pressure regularly',
          'Track endothelial function markers',
          'Focus on nitrate-rich foods',
          'Consider L-arginine supplementation'
        ]
      }
    ],
    biomarkerImpacts: [
      {
        biomarkerId: 'blood-pressure',
        effect: 'Increases blood pressure',
        magnitude: 1.2
      },
      {
        biomarkerId: 'hrv-rmssd',
        effect: 'May reduce HRV',
        magnitude: -0.8
      }
    ],
    epigeneticModifiers: [
      {
        intervention: 'Beetroot juice (500ml daily)',
        effect: 'Increases nitric oxide by 20-30%',
        evidence: 'strong',
        mechanism: 'Provides dietary nitrates for NO production'
      },
      {
        intervention: 'L-citrulline supplementation (6g daily)',
        effect: 'Improves vascular function',
        evidence: 'moderate',
        mechanism: 'Converts to L-arginine, substrate for NO synthesis'
      }
    ]
  },

  // HORMONAL VARIANTS
  {
    rsid: 'rs6259',
    gene: 'SHBG',
    chromosome: 'X',
    position: 135775909,
    pathway: 'hormonal',
    description: 'Affects sex hormone binding globulin levels',
    riskVariants: [
      {
        genotype: 'AA',
        impact: 'moderate',
        description: 'Lower SHBG levels, affects free testosterone/estrogen',
        recommendations: [
          'Monitor free testosterone and estrogen',
          'Track SHBG levels',
          'Consider metabolic health markers',
          'Monitor insulin sensitivity'
        ]
      }
    ],
    biomarkerImpacts: [
      {
        biomarkerId: 'testosterone',
        effect: 'Affects free testosterone levels',
        magnitude: 1.3
      },
      {
        biomarkerId: 'fasting-insulin',
        effect: 'Associated with insulin resistance',
        magnitude: 1.2
      }
    ],
    epigeneticModifiers: [
      {
        intervention: 'Weight management (reduce body fat)',
        effect: 'Increases SHBG levels',
        evidence: 'strong',
        mechanism: 'Reduces insulin resistance'
      },
      {
        intervention: 'Resistance training (3x/week)',
        effect: 'Improves hormone balance',
        evidence: 'strong',
        mechanism: 'Increases muscle mass, improves insulin sensitivity'
      }
    ]
  },

  // NEUROLOGICAL VARIANTS
  {
    rsid: 'rs4680',
    gene: 'COMT',
    chromosome: '22',
    position: 19963748,
    pathway: 'neurological',
    description: 'Affects dopamine metabolism and stress response',
    riskVariants: [
      {
        genotype: 'AA',
        impact: 'moderate',
        description: 'Slow COMT activity, higher baseline dopamine, increased stress sensitivity',
        recommendations: [
          'Monitor cortisol levels',
          'Track HRV for stress assessment',
          'Focus on stress management',
          'Consider magnesium supplementation'
        ]
      },
      {
        genotype: 'GG',
        impact: 'low',
        description: 'Fast COMT activity, lower baseline dopamine',
        recommendations: [
          'May benefit from tyrosine supplementation',
          'Monitor cognitive performance'
        ]
      }
    ],
    biomarkerImpacts: [
      {
        biomarkerId: 'cortisol',
        effect: 'Affects stress response and cortisol patterns',
        magnitude: 1.2
      },
      {
        biomarkerId: 'hrv-rmssd',
        effect: 'Influences autonomic balance',
        magnitude: -1.1
      }
    ],
    epigeneticModifiers: [
      {
        intervention: 'Mindfulness meditation (20 min daily)',
        effect: 'Normalizes stress response',
        evidence: 'strong',
        mechanism: 'Reduces cortisol, improves HRV'
      },
      {
        intervention: 'Magnesium glycinate (400mg daily)',
        effect: 'Supports COMT enzyme function',
        evidence: 'moderate',
        mechanism: 'Cofactor for COMT enzyme'
      }
    ]
  }
];

// ============================================================================
// HELPER FUNCTIONS (EXPORTED)
// ============================================================================

/**
 * Get variant by rsID
 */
export function getVariantByRsid(rsid: string): GeneticVariant | undefined {
  return geneticDatabase.find(v => v.rsid === rsid);
}

/**
 * Get all variants for a specific gene
 */
export function getVariantsByGene(gene: string): GeneticVariant[] {
  return geneticDatabase.filter(v => v.gene === gene);
}

/**
 * Get all variants in a specific pathway
 */
export function getVariantsByPathway(pathway: GeneticVariant['pathway']): GeneticVariant[] {
  return geneticDatabase.filter(v => v.pathway === pathway);
}

/**
 * Get all biomarkers affected by genetics
 */
export function getAllAffectedBiomarkers(): string[] {
  const biomarkers = new Set<string>();
  geneticDatabase.forEach(variant => {
    variant.biomarkerImpacts.forEach(impact => {
      biomarkers.add(impact.biomarkerId);
    });
  });
  return Array.from(biomarkers);
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  geneticDatabase,
  getVariantByRsid,
  getVariantsByGene,
  getVariantsByPathway,
  getAllAffectedBiomarkers
};
