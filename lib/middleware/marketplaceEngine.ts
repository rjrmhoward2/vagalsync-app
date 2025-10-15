/**
 * VagalSync V15.0 Ultimate - Marketplace Engine
 * Revenue Stream #10: Product Recommendations & Affiliate Revenue
 * 
 * Analyzes biomarker gaps and recommends products with affiliate links.
 * 
 * REVENUE MODEL:
 * - Amazon Associates: 4-10% commission
 * - Thorne Research: 15% commission
 * - Fullscript: 20-25% commission
 * - Other supplements: 10-20% commission
 * 
 * INTELLIGENT MATCHING:
 * - Biomarker deficiencies → specific products
 * - User preferences (vegan, organic, etc.)
 * - Budget considerations
 * - Effectiveness research backing
 * 
 * NO NFTs, NO TOKENS, NO BLOCKCHAIN - Pure Affiliate Revenue
 */

import type { BiomarkerEntry } from '../../app/types/biomarker.types';
import { getBiomarkerById } from '../../app/utils/biomarkerDatabase';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Product in marketplace
 */
export interface MarketplaceProduct {
  id: string;
  name: string;
  brand: string;
  description: string;
  category: ProductCategory;
  
  // Targeting
  targetsBiomarkers: string[];        // Which biomarkers it improves
  effectiveness: 'high' | 'medium' | 'low';
  researchBacked: boolean;
  
  // Pricing
  price: number;
  currency: string;
  
  // Affiliate links
  affiliateLinks: {
    amazon?: string;                   // Amazon Associates
    thorne?: string;                   // Thorne direct
    fullscript?: string;               // Fullscript
    direct?: string;                   // Manufacturer direct
  };
  
  // Commission rates
  commissionRates: {
    amazon?: number;                   // Percentage
    thorne?: number;
    fullscript?: number;
    direct?: number;
  };
  
  // Metadata
  image: string;
  rating: number;                      // 1-5 stars
  reviewCount: number;
  tags: string[];                      // vegan, organic, gmp, etc.
  dosage: string;
  servingsPerContainer: number;
  
  created: Date;
  updated: Date;
}

/**
 * Product categories
 */
export type ProductCategory = 
  | 'supplement'
  | 'device'
  | 'lab_test'
  | 'book'
  | 'course'
  | 'equipment'
  | 'food';

/**
 * Product recommendation with reasoning
 */
export interface ProductRecommendation {
  product: MarketplaceProduct;
  score: number;                       // 0-100 relevance score
  reasoning: string;
  estimatedImpact: number;             // Expected myVagal Tone improvement
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  // Why it's recommended
  biomarkerGaps: {
    biomarkerId: string;
    biomarkerName: string;
    currentValue?: number;
    optimalRange: string;
    gapSeverity: 'critical' | 'moderate' | 'mild';
  }[];
  
  // Personalization factors
  matchesPreferences: boolean;
  inBudget: boolean;
  researchSupport: string[];           // Links to studies
}

/**
 * User preferences for recommendations
 */
export interface UserPreferences {
  userId: string;
  
  // Dietary preferences
  dietary: {
    vegan?: boolean;
    vegetarian?: boolean;
    glutenFree?: boolean;
    dairyFree?: boolean;
    organic?: boolean;
  };
  
  // Budget
  monthlyBudget?: number;
  priceRange: 'budget' | 'moderate' | 'premium';
  
  // Brands
  preferredBrands: string[];
  avoidBrands: string[];
  
  // Quality standards
  requireGMP: boolean;                 // Good Manufacturing Practices
  requireThirdPartyTesting: boolean;
  requireUSPVerified: boolean;         // US Pharmacopeia
  
  updated: Date;
}

/**
 * Purchase tracking for attribution
 */
export interface PurchaseEvent {
  id: string;
  userId: string;
  productId: string;
  
  // Attribution
  clickedAt: Date;
  purchasedAt?: Date;
  
  // Revenue
  orderValue: number;
  commission: number;
  commissionRate: number;
  
  // Source
  affiliateNetwork: 'amazon' | 'thorne' | 'fullscript' | 'direct';
  referralLink: string;
  
  // Status
  status: 'clicked' | 'pending' | 'confirmed' | 'cancelled';
  
  created: Date;
}

// ============================================================================
// PRODUCT DATABASE
// ============================================================================

/**
 * Curated product catalog
 * In Phase 2, this moves to database with admin CMS
 */
const PRODUCT_CATALOG: MarketplaceProduct[] = [
  // Vitamin D
  {
    id: 'thorne-vitamin-d-5000',
    name: 'Vitamin D-5000',
    brand: 'Thorne',
    description: 'High-potency vitamin D3 for immune support and bone health. 5,000 IU per capsule.',
    category: 'supplement',
    targetsBiomarkers: ['vitamin_d'],
    effectiveness: 'high',
    researchBacked: true,
    price: 24.00,
    currency: 'USD',
    affiliateLinks: {
      thorne: 'https://www.thorne.com/products/dp/vitamin-d-5000?aff=vagalsync',
      amazon: 'https://www.amazon.com/dp/B0002JKM6K?tag=vagalsync-20',
      fullscript: 'https://us.fullscript.com/product/thorne-vitamin-d-5000?referrer=vagalsync'
    },
    commissionRates: {
      thorne: 15,
      amazon: 4,
      fullscript: 25
    },
    image: '/products/thorne-vitamin-d.jpg',
    rating: 4.8,
    reviewCount: 2847,
    tags: ['gmp', 'third-party-tested', 'gluten-free'],
    dosage: '5,000 IU',
    servingsPerContainer: 60,
    created: new Date('2024-01-01'),
    updated: new Date('2025-01-01')
  },
  
  // Omega-3
  {
    id: 'nordic-naturals-ultimate-omega',
    name: 'Ultimate Omega',
    brand: 'Nordic Naturals',
    description: 'High-concentration fish oil for cardiovascular health. 1,280mg EPA+DHA per serving.',
    category: 'supplement',
    targetsBiomarkers: ['omega3', 'crp', 'triglycerides'],
    effectiveness: 'high',
    researchBacked: true,
    price: 39.95,
    currency: 'USD',
    affiliateLinks: {
      amazon: 'https://www.amazon.com/dp/B001LF39RO?tag=vagalsync-20',
      direct: 'https://www.nordicnaturals.com/products/ultimate-omega?ref=vagalsync'
    },
    commissionRates: {
      amazon: 4,
      direct: 15
    },
    image: '/products/nordic-omega.jpg',
    rating: 4.7,
    reviewCount: 3542,
    tags: ['gmp', 'third-party-tested', 'sustainable', 'ifos-certified'],
    dosage: '1,280mg EPA+DHA',
    servingsPerContainer: 60,
    created: new Date('2024-01-01'),
    updated: new Date('2025-01-01')
  },
  
  // Magnesium
  {
    id: 'thorne-magnesium-bisglycinate',
    name: 'Magnesium Bisglycinate',
    brand: 'Thorne',
    description: 'Highly absorbable chelated magnesium for muscle relaxation and sleep support.',
    category: 'supplement',
    targetsBiomarkers: ['magnesium'],
    effectiveness: 'high',
    researchBacked: true,
    price: 22.00,
    currency: 'USD',
    affiliateLinks: {
      thorne: 'https://www.thorne.com/products/dp/magnesium-bisglycinate?aff=vagalsync',
      amazon: 'https://www.amazon.com/dp/B0002JHZOG?tag=vagalsync-20',
      fullscript: 'https://us.fullscript.com/product/thorne-magnesium-bisglycinate?referrer=vagalsync'
    },
    commissionRates: {
      thorne: 15,
      amazon: 4,
      fullscript: 25
    },
    image: '/products/thorne-magnesium.jpg',
    rating: 4.9,
    reviewCount: 1923,
    tags: ['gmp', 'third-party-tested', 'vegan', 'gluten-free'],
    dosage: '200mg elemental magnesium',
    servingsPerContainer: 90,
    created: new Date('2024-01-01'),
    updated: new Date('2025-01-01')
  },
  
  // CGM Device
  {
    id: 'dexcom-g7',
    name: 'Dexcom G7 CGM System',
    brand: 'Dexcom',
    description: 'Continuous glucose monitoring system for real-time blood sugar tracking.',
    category: 'device',
    targetsBiomarkers: ['fasting_glucose', 'hba1c'],
    effectiveness: 'high',
    researchBacked: true,
    price: 199.00,
    currency: 'USD',
    affiliateLinks: {
      amazon: 'https://www.amazon.com/dp/B0XXXXXXX?tag=vagalsync-20',
      direct: 'https://www.dexcom.com/g7?ref=vagalsync'
    },
    commissionRates: {
      amazon: 3,
      direct: 5
    },
    image: '/products/dexcom-g7.jpg',
    rating: 4.6,
    reviewCount: 8234,
    tags: ['fda-approved', 'medical-device', 'prescription-required'],
    dosage: 'N/A',
    servingsPerContainer: 1,
    created: new Date('2024-01-01'),
    updated: new Date('2025-01-01')
  },
  
  // Lab Test
  {
    id: 'quest-comprehensive-metabolic-panel',
    name: 'Comprehensive Metabolic Panel',
    brand: 'Quest Diagnostics',
    description: 'Complete blood work panel covering all major biomarkers.',
    category: 'lab_test',
    targetsBiomarkers: ['fasting_glucose', 'crp', 'vitamin_d', 'magnesium', 'cortisol_am'],
    effectiveness: 'high',
    researchBacked: true,
    price: 149.00,
    currency: 'USD',
    affiliateLinks: {
      direct: 'https://www.questhealth.com/products/metabolic-panel?ref=vagalsync'
    },
    commissionRates: {
      direct: 10
    },
    image: '/products/quest-panel.jpg',
    rating: 4.8,
    reviewCount: 4521,
    tags: ['clia-certified', 'physician-reviewed', 'at-home-kit'],
    dosage: 'N/A',
    servingsPerContainer: 1,
    created: new Date('2024-01-01'),
    updated: new Date('2025-01-01')
  }
];

// ============================================================================
// MARKETPLACE ENGINE CLASS
// ============================================================================

export class MarketplaceEngine {
  private products: Map<string, MarketplaceProduct>;
  private userPreferences: Map<string, UserPreferences>;
  private purchaseEvents: PurchaseEvent[];

  constructor() {
    this.products = new Map(
      PRODUCT_CATALOG.map(p => [p.id, p])
    );
    this.userPreferences = new Map();
    this.purchaseEvents = [];
  }

  // ==========================================================================
  // RECOMMENDATION ENGINE
  // ==========================================================================

  /**
   * Get personalized product recommendations based on biomarker gaps
   * 
   * @param userId - User ID
   * @param entries - User's biomarker entries
   * @param limit - Maximum recommendations to return
   * @returns Ranked product recommendations
   */
  async getRecommendations(
    userId: string,
    entries: BiomarkerEntry[],
    limit: number = 10
  ): Promise<ProductRecommendation[]> {
    
    // Step 1: Identify biomarker gaps
    const gaps = this.identifyBiomarkerGaps(entries);
    
    if (gaps.length === 0) {
      console.log('[Marketplace] No biomarker gaps found - all optimal!');
      return [];
    }
    
    // Step 2: Get user preferences
    const preferences = this.getUserPreferences(userId);
    
    // Step 3: Match products to gaps
    const recommendations: ProductRecommendation[] = [];
    
    for (const product of this.products.values()) {
      const recommendation = this.scoreProduct(product, gaps, preferences);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }
    
    // Step 4: Sort by relevance score (highest first)
    recommendations.sort((a, b) => b.score - a.score);
    
    // Step 5: Return top N
    return recommendations.slice(0, limit);
  }

  /**
   * Identify which biomarkers are out of optimal range
   */
  private identifyBiomarkerGaps(entries: BiomarkerEntry[]): Array<{
    biomarkerId: string;
    biomarkerName: string;
    currentValue?: number;
    optimalRange: string;
    gapSeverity: 'critical' | 'moderate' | 'mild';
  }> {
    
    const gaps = [];
    
    // Group entries by biomarker (latest value)
    const latestValues = new Map<string, BiomarkerEntry>();
    entries.forEach(entry => {
      const existing = latestValues.get(entry.biomarkerId);
      if (!existing || new Date(entry.timestamp) > new Date(existing.timestamp)) {
        latestValues.set(entry.biomarkerId, entry);
      }
    });
    
    // Check each biomarker
    for (const entry of latestValues.values()) {
      if (!entry.inOptimalRange) {
        const biomarker = getBiomarkerById(entry.biomarkerId);
        if (!biomarker) continue;
        
        // Calculate gap severity
        const severity = this.calculateGapSeverity(entry, biomarker);
        
        gaps.push({
          biomarkerId: entry.biomarkerId,
          biomarkerName: biomarker.name,
          currentValue: entry.value,
          optimalRange: biomarker.optimalRange,
          gapSeverity: severity
        });
      }
    }
    
    return gaps;
  }

  /**
   * Calculate how severe a biomarker gap is
   */
  private calculateGapSeverity(
    entry: BiomarkerEntry,
    biomarker: any
  ): 'critical' | 'moderate' | 'mild' {
    
    // Parse optimal range
    const range = biomarker.optimalRange;
    const match = range.match(/(\d+\.?\d*)-(\d+\.?\d*)/);
    
    if (!match) return 'moderate';
    
    const min = parseFloat(match[1]);
    const max = parseFloat(match[2]);
    const value = entry.value;
    
    // Calculate % deviation from range
    let deviation = 0;
    if (value < min) {
      deviation = ((min - value) / min) * 100;
    } else if (value > max) {
      deviation = ((value - max) / max) * 100;
    }
    
    if (deviation > 50) return 'critical';
    if (deviation > 25) return 'moderate';
    return 'mild';
  }

  /**
   * Score a product's relevance for user's gaps
   */
  private scoreProduct(
    product: MarketplaceProduct,
    gaps: any[],
    preferences: UserPreferences
  ): ProductRecommendation | null {
    
    // Does this product target any of the user's gaps?
    const relevantGaps = gaps.filter(gap => 
      product.targetsBiomarkers.includes(gap.biomarkerId)
    );
    
    if (relevantGaps.length === 0) {
      return null;  // Not relevant
    }
    
    // Calculate base score (0-100)
    let score = 0;
    
    // Gap coverage (40 points max)
    score += (relevantGaps.length / gaps.length) * 40;
    
    // Effectiveness (20 points max)
    if (product.effectiveness === 'high') score += 20;
    else if (product.effectiveness === 'medium') score += 12;
    else score += 5;
    
    // Research backing (15 points max)
    if (product.researchBacked) score += 15;
    
    // User ratings (15 points max)
    score += (product.rating / 5) * 15;
    
    // Preference matching (10 points max)
    const matchesPreferences = this.checkPreferenceMatch(product, preferences);
    if (matchesPreferences) score += 10;
    
    // Budget fit
    const inBudget = this.checkBudget(product, preferences);
    if (!inBudget) score *= 0.8;  // 20% penalty if over budget
    
    // Determine priority
    const highestSeverity = relevantGaps.reduce((highest, gap) => {
      const severities = ['mild', 'moderate', 'critical'];
      return severities.indexOf(gap.gapSeverity) > severities.indexOf(highest) 
        ? gap.gapSeverity 
        : highest;
    }, 'mild');
    
    // Generate reasoning
    const reasoning = this.generateReasoning(product, relevantGaps);
    
    // Estimate impact on myVagal Tone
    const estimatedImpact = relevantGaps.reduce((total, gap) => {
      const biomarker = getBiomarkerById(gap.biomarkerId);
      return total + (biomarker?.impactOnVagalTone || 0);
    }, 0);
    
    return {
      product,
      score: Math.round(score),
      reasoning,
      estimatedImpact,
      priority: highestSeverity as any,
      biomarkerGaps: relevantGaps,
      matchesPreferences,
      inBudget,
      researchSupport: []  // TODO: Add research links
    };
  }

  /**
   * Check if product matches user preferences
   */
  private checkPreferenceMatch(
    product: MarketplaceProduct,
    preferences: UserPreferences
  ): boolean {
    
    // Check dietary restrictions
    if (preferences.dietary.vegan && !product.tags.includes('vegan')) {
      return false;
    }
    
    if (preferences.dietary.glutenFree && !product.tags.includes('gluten-free')) {
      return false;
    }
    
    // Check quality standards
    if (preferences.requireGMP && !product.tags.includes('gmp')) {
      return false;
    }
    
    if (preferences.requireThirdPartyTesting && !product.tags.includes('third-party-tested')) {
      return false;
    }
    
    // Check brand preferences
    if (preferences.avoidBrands.includes(product.brand)) {
      return false;
    }
    
    return true;
  }

  /**
   * Check if product fits user's budget
   */
  private checkBudget(
    product: MarketplaceProduct,
    preferences: UserPreferences
  ): boolean {
    
    if (!preferences.monthlyBudget) return true;
    
    // Assume monthly cost for supplements
    const monthlyCost = product.category === 'supplement'
      ? product.price  // Already monthly
      : product.price; // One-time purchase
    
    return monthlyCost <= preferences.monthlyBudget;
  }

  /**
   * Generate human-readable reasoning for recommendation
   */
  private generateReasoning(
    product: MarketplaceProduct,
    gaps: any[]
  ): string {
    
    const biomarkerNames = gaps.map(g => g.biomarkerName).join(', ');
    
    const reasons = [
      `Targets your ${biomarkerNames} deficiency`,
      product.effectiveness === 'high' ? 'High effectiveness rating' : '',
      product.researchBacked ? 'Backed by clinical research' : '',
      product.rating >= 4.5 ? `Highly rated (${product.rating}/5 from ${product.reviewCount} reviews)` : ''
    ].filter(Boolean);
    
    return reasons.join('. ') + '.';
  }

  // ==========================================================================
  // USER PREFERENCES
  // ==========================================================================

  /**
   * Get user preferences (or defaults)
   */
  private getUserPreferences(userId: string): UserPreferences {
    let preferences = this.userPreferences.get(userId);
    
    if (!preferences) {
      preferences = {
        userId,
        dietary: {},
        priceRange: 'moderate',
        preferredBrands: [],
        avoidBrands: [],
        requireGMP: true,
        requireThirdPartyTesting: true,
        requireUSPVerified: false,
        updated: new Date()
      };
      
      this.userPreferences.set(userId, preferences);
    }
    
    return preferences;
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: string,
    updates: Partial<Omit<UserPreferences, 'userId' | 'updated'>>
  ): Promise<UserPreferences> {
    
    const current = this.getUserPreferences(userId);
    
    const updated = {
      ...current,
      ...updates,
      updated: new Date()
    };
    
    this.userPreferences.set(userId, updated);
    return updated;
  }

  // ==========================================================================
  // PURCHASE TRACKING
  // ==========================================================================

  /**
   * Track when user clicks affiliate link
   */
  async trackClick(
    userId: string,
    productId: string,
    affiliateNetwork: 'amazon' | 'thorne' | 'fullscript' | 'direct',
    referralLink: string
  ): Promise<string> {
    
    const product = this.products.get(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }
    
    const event: PurchaseEvent = {
      id: `click-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      productId,
      clickedAt: new Date(),
      orderValue: 0,
      commission: 0,
      commissionRate: product.commissionRates[affiliateNetwork] || 0,
      affiliateNetwork,
      referralLink,
      status: 'clicked',
      created: new Date()
    };
    
    this.purchaseEvents.push(event);
    
    console.log('[Marketplace] Click tracked:', {
      product: product.name,
      network: affiliateNetwork,
      commission: event.commissionRate + '%'
    });
    
    return event.id;
  }

  /**
   * Record confirmed purchase (from affiliate network webhook)
   */
  async recordPurchase(
    clickId: string,
    orderValue: number
  ): Promise<void> {
    
    const event = this.purchaseEvents.find(e => e.id === clickId);
    if (!event) {
      throw new Error(`Click event not found: ${clickId}`);
    }
    
    event.status = 'confirmed';
    event.purchasedAt = new Date();
    event.orderValue = orderValue;
    event.commission = orderValue * (event.commissionRate / 100);
    
    console.log('[Marketplace] Purchase confirmed:', {
      clickId,
      orderValue: `$${orderValue}`,
      commission: `$${event.commission.toFixed(2)}`
    });
  }

  /**
   * Get revenue analytics
   */
  async getRevenueStats(userId?: string): Promise<{
    totalClicks: number;
    totalPurchases: number;
    totalRevenue: number;
    totalCommission: number;
    conversionRate: number;
    byNetwork: Record<string, any>;
  }> {
    
    const events = userId 
      ? this.purchaseEvents.filter(e => e.userId === userId)
      : this.purchaseEvents;
    
    const clicks = events.filter(e => e.status === 'clicked').length;
    const purchases = events.filter(e => e.status === 'confirmed');
    const totalRevenue = purchases.reduce((sum, e) => sum + e.orderValue, 0);
    const totalCommission = purchases.reduce((sum, e) => sum + e.commission, 0);
    
    // Group by network
    const byNetwork: Record<string, any> = {};
    for (const event of purchases) {
      if (!byNetwork[event.affiliateNetwork]) {
        byNetwork[event.affiliateNetwork] = {
          purchases: 0,
          revenue: 0,
          commission: 0
        };
      }
      
      byNetwork[event.affiliateNetwork].purchases++;
      byNetwork[event.affiliateNetwork].revenue += event.orderValue;
      byNetwork[event.affiliateNetwork].commission += event.commission;
    }
    
    return {
      totalClicks: clicks,
      totalPurchases: purchases.length,
      totalRevenue,
      totalCommission,
      conversionRate: clicks > 0 ? (purchases.length / clicks) * 100 : 0,
      byNetwork
    };
  }

  // ==========================================================================
  // PRODUCT MANAGEMENT
  // ==========================================================================

  /**
   * Get product by ID
   */
  getProduct(productId: string): MarketplaceProduct | undefined {
    return this.products.get(productId);
  }

  /**
   * Get all products
   */
  getAllProducts(): MarketplaceProduct[] {
    return Array.from(this.products.values());
  }

  /**
   * Search products
   */
  searchProducts(query: string): MarketplaceProduct[] {
    const lowercaseQuery = query.toLowerCase();
    
    return Array.from(this.products.values()).filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.brand.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const marketplaceEngine = new MarketplaceEngine();
