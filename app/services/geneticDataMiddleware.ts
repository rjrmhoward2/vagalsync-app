// VagalSync V15.0 - Genetic Data Middleware (WORKING VERSION)
// Privacy-First 23andMe Integration
// FIXED: All imports match existing project structure

// ============================================================================
// TYPES
// ============================================================================

export interface GeneticVariant {
  rsid: string;
  chromosome: string;
  position: number;
  genotype: string;
  gene?: string;
  clinicalSignificance?: string;
}

export interface GeneticProfile {
  uploadDate: Date;
  variantCount: number;
  keyVariants: GeneticVariant[];
  riskFactors: string[];
  recommendations: string[];
  encrypted: boolean;
}

export interface EncryptionConfig {
  password?: string;
  enabled: boolean;
}

// ============================================================================
// KEY SNPS OF INTEREST
// ============================================================================

const KEY_SNPS = {
  // Methylation (MTHFR)
  'rs1801133': { gene: 'MTHFR', name: 'C677T', significance: 'Folate metabolism' },
  'rs1801131': { gene: 'MTHFR', name: 'A1298C', significance: 'Folate metabolism' },
  
  // Neurotransmitters (COMT)
  'rs4680': { gene: 'COMT', name: 'Val158Met', significance: 'Dopamine metabolism' },
  
  // Alzheimer's risk (APOE)
  'rs429358': { gene: 'APOE', name: 'ε4 allele', significance: 'Alzheimer\'s risk' },
  'rs7412': { gene: 'APOE', name: 'ε2/ε3/ε4', significance: 'Alzheimer\'s risk' },
  
  // Vitamin D (VDR)
  'rs2228570': { gene: 'VDR', name: 'FokI', significance: 'Vitamin D receptor' },
  
  // Serotonin transporter (5-HTTLPR)
  'rs25531': { gene: 'SLC6A4', name: '5-HTTLPR', significance: 'Serotonin transport' }
};

// ============================================================================
// GENETIC DATA MIDDLEWARE CLASS
// ============================================================================

class GeneticDataMiddleware {
  
  private profile: GeneticProfile | null = null;
  private rawData: string = '';
  
  constructor() {
    this.loadProfile();
  }
  
  // =========================================================================
  // FILE PARSING (CLIENT-SIDE ONLY - PRIVACY FIRST)
  // =========================================================================
  
  async parse23andMeFile(file: File, encryptionConfig: EncryptionConfig): Promise<GeneticProfile> {
    try {
      console.log('[GeneticMiddleware] Parsing 23andMe file...');
      
      // Read file content
      const content = await this.readFile(file);
      
      // Parse raw data
      const variants = this.parseRawData(content);
      
      // Extract key variants
      const keyVariants = this.extractKeyVariants(variants);
      
      // Analyze risk factors
      const riskFactors = this.analyzeRiskFactors(keyVariants);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(keyVariants, riskFactors);
      
      // Create profile
      const profile: GeneticProfile = {
        uploadDate: new Date(),
        variantCount: variants.length,
        keyVariants,
        riskFactors,
        recommendations,
        encrypted: encryptionConfig.enabled
      };
      
      // Encrypt if requested
      if (encryptionConfig.enabled && encryptionConfig.password) {
        this.rawData = await this.encryptData(content, encryptionConfig.password);
      } else {
        this.rawData = content;
      }
      
      // Save locally
      this.profile = profile;
      this.saveProfile();
      
      console.log('[GeneticMiddleware] Parsed successfully:', {
        variants: variants.length,
        keyVariants: keyVariants.length,
        encrypted: encryptionConfig.enabled
      });
      
      return profile;
      
    } catch (error: any) {
      console.error('[GeneticMiddleware] Parsing failed:', error);
      throw new Error(`Failed to parse 23andMe file: ${error.message}`);
    }
  }
  
  // =========================================================================
  // FILE READING
  // =========================================================================
  
  private async readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('File reading error'));
      };
      
      reader.readAsText(file);
    });
  }
  
  // =========================================================================
  // DATA PARSING
  // =========================================================================
  
  private parseRawData(content: string): GeneticVariant[] {
    const variants: GeneticVariant[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Skip comments and empty lines
      if (line.startsWith('#') || line.trim() === '') continue;
      
      // Parse TSV format: rsid, chromosome, position, genotype
      const parts = line.split('\t');
      if (parts.length < 4) continue;
      
      const [rsid, chromosome, position, genotype] = parts;
      
      // Skip if invalid
      if (!rsid.startsWith('rs')) continue;
      
      variants.push({
        rsid,
        chromosome,
        position: parseInt(position),
        genotype
      });
    }
    
    return variants;
  }
  
  private extractKeyVariants(allVariants: GeneticVariant[]): GeneticVariant[] {
    const keyVariants: GeneticVariant[] = [];
    
    for (const variant of allVariants) {
      const snpInfo = KEY_SNPS[variant.rsid as keyof typeof KEY_SNPS];
      
      if (snpInfo) {
        keyVariants.push({
          ...variant,
          gene: snpInfo.gene,
          clinicalSignificance: snpInfo.significance
        });
      }
    }
    
    return keyVariants;
  }
  
  // =========================================================================
  // RISK ANALYSIS
  // =========================================================================
  
  private analyzeRiskFactors(keyVariants: GeneticVariant[]): string[] {
    const risks: string[] = [];
    
    for (const variant of keyVariants) {
      // MTHFR variants
      if (variant.rsid === 'rs1801133' && (variant.genotype === 'TT' || variant.genotype === 'CT')) {
        risks.push('MTHFR C677T variant: Consider methylfolate supplementation');
      }
      
      // COMT variants
      if (variant.rsid === 'rs4680') {
        if (variant.genotype === 'AA') {
          risks.push('COMT Met/Met: Slow dopamine clearance - may benefit from stress management');
        } else if (variant.genotype === 'GG') {
          risks.push('COMT Val/Val: Fast dopamine clearance - may benefit from dopamine support');
        }
      }
      
      // APOE variants
      if (variant.rsid === 'rs429358' && variant.genotype.includes('C')) {
        risks.push('APOE ε4 carrier: Increased Alzheimer\'s risk - prioritize brain health');
      }
      
      // VDR variants
      if (variant.rsid === 'rs2228570') {
        risks.push('VDR variant: Monitor vitamin D levels closely');
      }
    }
    
    return risks;
  }
  
  // =========================================================================
  // RECOMMENDATIONS
  // =========================================================================
  
  private generateRecommendations(keyVariants: GeneticVariant[], riskFactors: string[]): string[] {
    const recommendations: string[] = [];
    
    // MTHFR recommendations
    const hasMTHFR = keyVariants.some(v => v.gene === 'MTHFR');
    if (hasMTHFR) {
      recommendations.push('Consider methylated B vitamins (methylfolate, methylcobalamin)');
      recommendations.push('Monitor homocysteine levels');
    }
    
    // COMT recommendations
    const hasCOMT = keyVariants.some(v => v.gene === 'COMT');
    if (hasCOMT) {
      recommendations.push('Optimize stress management practices');
      recommendations.push('Consider magnesium supplementation');
    }
    
    // APOE recommendations
    const hasAPOE = keyVariants.some(v => v.gene === 'APOE');
    if (hasAPOE) {
      recommendations.push('Prioritize cardiovascular health');
      recommendations.push('Consider omega-3 fatty acids');
      recommendations.push('Maintain cognitive stimulation');
    }
    
    // VDR recommendations
    const hasVDR = keyVariants.some(v => v.gene === 'VDR');
    if (hasVDR) {
      recommendations.push('Monitor vitamin D levels (target 50-80 ng/mL)');
      recommendations.push('Consider vitamin D3 supplementation');
    }
    
    return recommendations;
  }
  
  // =========================================================================
  // ENCRYPTION (WEB CRYPTO API)
  // =========================================================================
  
  private async encryptData(data: string, password: string): Promise<string> {
    try {
      // Generate key from password
      const encoder = new TextEncoder();
      const passwordData = encoder.encode(password);
      
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordData,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );
      
      const salt = crypto.getRandomValues(new Uint8Array(16));
      
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );
      
      // Encrypt data
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encodedData = encoder.encode(data);
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
      );
      
      // Combine salt + iv + encrypted data
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);
      
      // Convert to base64
      return this.arrayBufferToBase64(combined);
      
    } catch (error: any) {
      console.error('[GeneticMiddleware] Encryption failed:', error);
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }
  
  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  // =========================================================================
  // PERSISTENCE (LOCAL ONLY - NEVER SENT TO SERVER)
  // =========================================================================
  
  private loadProfile() {
    // SSR Safety: Only access localStorage in browser
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem('vagalsync_genetic_profile');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.profile = {
          ...parsed,
          uploadDate: new Date(parsed.uploadDate)
        };
      } catch (error) {
        console.error('[GeneticMiddleware] Failed to load profile:', error);
      }
    }
    
    const storedData = localStorage.getItem('vagalsync_genetic_data');
    if (storedData) {
      this.rawData = storedData;
    }
  }
  
  private saveProfile() {
    // SSR Safety: Only access localStorage in browser
    if (typeof window === 'undefined') return;
    
    if (this.profile) {
      localStorage.setItem('vagalsync_genetic_profile', JSON.stringify(this.profile));
    }
    
    if (this.rawData) {
      localStorage.setItem('vagalsync_genetic_data', this.rawData);
    }
  }
  
  // =========================================================================
  // PUBLIC API
  // =========================================================================
  
  getProfile(): GeneticProfile | null {
    return this.profile;
  }
  
  hasProfile(): boolean {
    return this.profile !== null;
  }
  
  deleteAllData() {
    this.profile = null;
    this.rawData = '';
    
    // SSR Safety: Only access localStorage in browser
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vagalsync_genetic_profile');
      localStorage.removeItem('vagalsync_genetic_data');
    }
    
    console.log('[GeneticMiddleware] All genetic data deleted');
  }
  
  getPrivacyAudit(): any {
    return {
      dataLocation: 'Local browser storage only',
      encryption: this.profile?.encrypted ? 'AES-256-GCM' : 'None',
      serverUpload: 'Never - all processing is client-side',
      thirdPartySharing: 'Never',
      dataRetention: 'Until user deletes',
      exportable: true,
      deletable: true
    };
  }
  
  exportData(): string {
    return this.rawData;
  }
}

// Export singleton instance
export const geneticDataMiddleware = new GeneticDataMiddleware();
