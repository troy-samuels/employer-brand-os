# BRANDOS CODEX DEVELOPMENT GUIDE
**Version:** 1.0  
**Purpose:** Complete technical blueprint for building world-class BrandOS platform  
**Standards:** Enterprise-grade quality, 100-developer team coordination level

---

## 🎯 MISSION STATEMENT

Build BrandOS as the definitive AI employment optimization platform - a product that enterprises trust with their most critical hiring data. Every line of code, every design decision, and every user interaction must reflect world-class SaaS quality.

**Quality Standard:** This product competes directly with established enterprise software. Build accordingly.

---

## 🏗️ TECHNICAL ARCHITECTURE

### **Core Technology Stack**
```yaml
Frontend Framework: Next.js 14.1+ (App Router)
Language: TypeScript 5.0+ (strict mode)
Styling: Tailwind CSS 3.4+ + HeadlessUI
Backend: Supabase (PostgreSQL + Edge Functions)
Authentication: Supabase Auth with RLS
File Storage: Supabase Storage
Real-time: Supabase Realtime
Deployment: Vercel (Pro plan features)
CDN: Vercel Edge Network
Monitoring: Vercel Analytics + Uptime monitoring
Email: Resend API
PDF Generation: Puppeteer + React-PDF
```

### **Project Structure (Exact)**
```
brandos/
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── .env.local.example
├── .env.local
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   ├── pixel/
│   │   └── brandos-pixel.js
│   └── images/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── audit/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── jobs/
│   │   │   ├── analytics/
│   │   │   ├── settings/
│   │   │   └── components/
│   │   ├── api/
│   │   │   ├── audit/
│   │   │   │   └── route.ts
│   │   │   ├── pixel/
│   │   │   │   └── route.ts
│   │   │   ├── jobs/
│   │   │   │   └── route.ts
│   │   │   └── analytics/
│   │   │       └── route.ts
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── callback/
│   │   └── pixel/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── table.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── loading.tsx
│   │   │   └── chart.tsx
│   │   ├── audit/
│   │   │   ├── audit-form.tsx
│   │   │   ├── audit-results.tsx
│   │   │   ├── audit-report.tsx
│   │   │   └── competitive-analysis.tsx
│   │   ├── dashboard/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── job-table.tsx
│   │   │   ├── job-editor.tsx
│   │   │   ├── analytics-dashboard.tsx
│   │   │   └── pixel-status.tsx
│   │   ├── landing/
│   │   │   ├── hero.tsx
│   │   │   ├── features.tsx
│   │   │   ├── pricing.tsx
│   │   │   ├── testimonials.tsx
│   │   │   └── cta.tsx
│   │   └── shared/
│   │       ├── header.tsx
│   │       ├── footer.tsx
│   │       └── navigation.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── types.ts
│   │   ├── audit/
│   │   │   ├── audit-engine.ts
│   │   │   ├── llm-testing.ts
│   │   │   ├── compliance-checker.ts
│   │   │   └── report-generator.ts
│   │   ├── pixel/
│   │   │   ├── pixel-manager.ts
│   │   │   ├── schema-generator.ts
│   │   │   └── analytics-tracker.ts
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   ├── validation.ts
│   │   │   ├── formatting.ts
│   │   │   └── constants.ts
│   │   └── hooks/
│   │       ├── use-audit.ts
│   │       ├── use-jobs.ts
│   │       ├── use-analytics.ts
│   │       └── use-pixel.ts
│   └── types/
│       ├── audit.ts
│       ├── jobs.ts
│       ├── analytics.ts
│       └── database.ts
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   └── functions/
└── docs/
    ├── deployment.md
    ├── api.md
    └── pixel-integration.md
```

---

## 🎨 DESIGN SYSTEM SPECIFICATIONS

### **Color Palette (Exact Values)**
```css
:root {
  /* Primary Brand Colors */
  --brand-primary: #0066CC;
  --brand-primary-hover: #0052A3;
  --brand-primary-light: #E6F3FF;
  
  /* Status Colors */
  --success: #10B981;
  --success-light: #ECFDF5;
  --warning: #F59E0B;
  --warning-light: #FFFBEB;
  --error: #EF4444;
  --error-light: #FEF2F2;
  
  /* Neutral Colors */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;
  
  /* Background & Surface */
  --background: #FFFFFF;
  --surface: #F9FAFB;
  --border: #E5E7EB;
  --border-focus: #0066CC;
  
  /* Text Colors */
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  --text-white: #FFFFFF;
}
```

### **Typography System**
```css
/* Font Family */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Typography Scale */
.text-xs { font-size: 12px; line-height: 16px; }
.text-sm { font-size: 14px; line-height: 20px; }
.text-base { font-size: 16px; line-height: 24px; }
.text-lg { font-size: 18px; line-height: 28px; }
.text-xl { font-size: 20px; line-height: 28px; }
.text-2xl { font-size: 24px; line-height: 32px; }
.text-3xl { font-size: 30px; line-height: 36px; }
.text-4xl { font-size: 36px; line-height: 40px; }
.text-5xl { font-size: 48px; line-height: 1; }

/* Font Weights */
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

### **Component Specifications**

#### **Button Component**
```typescript
// components/ui/button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// Exact styling classes:
// Primary: bg-brand-primary hover:bg-brand-primary-hover text-white
// Secondary: bg-gray-100 hover:bg-gray-200 text-gray-900
// Ghost: hover:bg-gray-100 text-gray-700
// Destructive: bg-error hover:bg-red-600 text-white

// Sizes:
// sm: px-3 py-1.5 text-sm
// md: px-4 py-2 text-base  
// lg: px-6 py-3 text-lg
```

#### **Input Component**
```typescript
// components/ui/input.tsx
interface InputProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'url';
  value?: string;
  onChange?: (value: string) => void;
}

// Styling requirements:
// Base: border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary
// Error state: border-error focus:ring-error focus:border-error
// Disabled: bg-gray-50 text-gray-400 cursor-not-allowed
```

#### **Card Component**
```typescript
// components/ui/card.tsx
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Styling:
// Default: bg-white rounded-lg
// Bordered: bg-white border border-gray-200 rounded-lg
// Elevated: bg-white shadow-lg rounded-lg
// Padding sm: p-4, md: p-6, lg: p-8
```

---

## 📊 DATABASE SCHEMA (EXACT IMPLEMENTATION)

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  website_url TEXT,
  industry TEXT,
  employee_count TEXT,
  locations JSONB DEFAULT '[]'::jsonb,
  pixel_installed_at TIMESTAMPTZ,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT companies_domain_check CHECK (domain ~ '^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$')
);

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  full_name TEXT,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job postings table
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  employment_type TEXT CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'temporary', 'internship')),
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
  remote_eligible BOOLEAN DEFAULT false,
  location JSONB, -- {city, state, country, address}
  salary_range JSONB, -- {min, max, currency, period}
  benefits TEXT[],
  requirements TEXT[],
  responsibilities TEXT[],
  ats_job_id TEXT,
  external_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'closed')),
  posted_date DATE DEFAULT CURRENT_DATE,
  expires_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT job_postings_salary_check CHECK (
    salary_range IS NULL OR 
    (salary_range->>'min')::numeric <= (salary_range->>'max')::numeric
  )
);

-- Audit results table
CREATE TABLE audit_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  email TEXT, -- For non-registered users
  company_domain TEXT NOT NULL,
  company_name TEXT NOT NULL,
  overall_score DECIMAL(3,1) CHECK (overall_score >= 0 AND overall_score <= 10),
  technical_score DECIMAL(3,1) CHECK (technical_score >= 0 AND technical_score <= 10),
  ai_visibility_score DECIMAL(3,1) CHECK (ai_visibility_score >= 0 AND ai_visibility_score <= 10),
  compliance_score DECIMAL(3,1) CHECK (compliance_score >= 0 AND compliance_score <= 10),
  competitive_score DECIMAL(3,1) CHECK (competitive_score >= 0 AND competitive_score <= 10),
  issues JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  competitors_analyzed JSONB DEFAULT '[]'::jsonb,
  compliance_violations JSONB DEFAULT '[]'::jsonb,
  llm_test_results JSONB DEFAULT '{}'::jsonb,
  pdf_report_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  user_agent TEXT,
  ip_address INET,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index for common queries
  INDEX idx_analytics_company_type_time ON analytics_events(company_id, event_type, timestamp),
  INDEX idx_analytics_timestamp ON analytics_events(timestamp)
);

-- Pixel installations table
CREATE TABLE pixel_installations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  installation_method TEXT CHECK (installation_method IN ('gtm', 'direct', 'wordpress')),
  domain TEXT NOT NULL,
  pixel_id TEXT UNIQUE NOT NULL,
  configuration JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'removed')),
  last_seen_at TIMESTAMPTZ,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance monitoring table
CREATE TABLE compliance_monitoring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  job_posting_id UUID REFERENCES job_postings(id),
  jurisdiction TEXT NOT NULL, -- 'california', 'nyc', 'colorado', etc.
  law_reference TEXT NOT NULL, -- 'SB 1162', 'Local Law 144', etc.
  compliance_status TEXT CHECK (compliance_status IN ('compliant', 'violation', 'warning')),
  violation_details JSONB,
  auto_fixed BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pixel_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_monitoring ENABLE ROW LEVEL SECURITY;

-- RLS Policies (implement proper access control)
CREATE POLICY "Users can view their own company data" ON companies
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE company_id = companies.id
  ));

CREATE POLICY "Users can manage their company's jobs" ON job_postings
  FOR ALL USING (auth.uid() IN (
    SELECT up.id FROM user_profiles up WHERE up.company_id = job_postings.company_id
  ));

-- Triggers for updated_at columns
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_companies
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_user_profiles
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_job_postings
  BEFORE UPDATE ON job_postings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_pixel_installations
  BEFORE UPDATE ON pixel_installations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();
```

---

## 🎯 LANDING PAGE SPECIFICATIONS

### **Hero Section Requirements**
```typescript
// components/landing/hero.tsx
export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-white to-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Headline - EXACT TEXT */}
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Is Your Company <span className="text-brand-primary">Invisible</span> to AI Job Search?
          </h1>
          
          {/* Subheadline - EXACT TEXT */}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            40% of job seekers now use ChatGPT and Perplexity to find opportunities. 
            Most employer websites aren't optimized for AI discovery. Fix this in 24 hours.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="primary" size="lg">
              Get Free AI Visibility Audit
            </Button>
            <Button variant="secondary" size="lg">
              Watch 2-Minute Demo
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
            <span>✓ 5-minute analysis</span>
            <span>✓ Professional PDF report</span>
            <span>✓ No signup required</span>
            <span>✓ Used by 500+ companies</span>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### **Audit Form Section**
```typescript
// components/audit/audit-form.tsx
interface AuditFormData {
  companyDomain: string;
  companyName: string;
  email: string;
  industry?: string;
}

export default function AuditForm() {
  const [formData, setFormData] = useState<AuditFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>();
  
  // Form styling requirements:
  // - White background with subtle shadow
  // - Rounded corners (12px)
  // - Proper field spacing (24px between fields)
  // - Loading states with spinners
  // - Clear error messaging
  // - Progressive enhancement
  
  return (
    <section className="py-16 bg-white">
      <div className="max-w-2xl mx-auto px-4">
        <Card variant="elevated" padding="lg">
          <h2 className="text-3xl font-bold text-center mb-8">
            Free AI Employment Visibility Audit
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Company Website"
              placeholder="example.com"
              value={formData?.companyDomain}
              onChange={(value) => setFormData({...formData, companyDomain: value})}
              error={errors?.companyDomain}
              required
            />
            
            <Input
              label="Company Name"
              placeholder="Acme Corp"
              value={formData?.companyName}
              onChange={(value) => setFormData({...formData, companyName: value})}
              error={errors?.companyName}
              required
            />
            
            <Input
              type="email"
              label="Email Address"
              placeholder="you@company.com"
              value={formData?.email}
              onChange={(value) => setFormData({...formData, email: value})}
              error={errors?.email}
              required
            />
            
            <Button 
              variant="primary" 
              size="lg" 
              loading={isLoading}
              className="w-full"
            >
              {isLoading ? 'Analyzing...' : 'Start Free Analysis'}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
```

---

## ⚡ SMART PIXEL SPECIFICATIONS

### **Pixel JavaScript (EXACT IMPLEMENTATION)**
```javascript
// public/pixel/brandos-pixel.js
(function() {
  'use strict';
  
  // Configuration
  const CONFIG = {
    API_BASE: 'https://api.brandos.io/v1',
    VERSION: '1.0.0',
    MAX_RETRIES: 3,
    TIMEOUT: 10000,
    DEBUG: false
  };
  
  class BrandOSPixel {
    constructor() {
      this.isInitialized = false;
      this.companyId = null;
      this.pixelId = null;
      this.performanceMetrics = {};
      this.retryCount = 0;
      
      this.init();
    }
    
    init() {
      try {
        this.startPerformanceTracking();
        this.loadConfiguration();
        this.validateConfiguration();
        this.loadEmploymentData();
      } catch (error) {
        this.handleError('Initialization failed', error);
      }
    }
    
    loadConfiguration() {
      const script = document.querySelector('[data-brandos-company-id]');
      if (!script) {
        throw new Error('BrandOS pixel script not found. Ensure data-brandos-company-id attribute is set.');
      }
      
      this.companyId = script.getAttribute('data-brandos-company-id');
      this.pixelId = script.getAttribute('data-brandos-pixel-id') || this.generatePixelId();
      this.environment = script.getAttribute('data-brandos-env') || 'production';
      
      if (script.hasAttribute('data-brandos-debug')) {
        CONFIG.DEBUG = true;
      }
    }
    
    validateConfiguration() {
      if (!this.companyId || this.companyId.length < 10) {
        throw new Error('Invalid company ID. Contact BrandOS support.');
      }
      
      // Validate domain
      const currentDomain = window.location.hostname;
      if (!this.isValidDomain(currentDomain)) {
        this.log('warn', `Unexpected domain: ${currentDomain}`);
      }
    }
    
    async loadEmploymentData() {
      const url = `${CONFIG.API_BASE}/companies/${this.companyId}/employment-data`;
      
      try {
        const response = await this.fetchWithRetry(url, {
          headers: {
            'X-BrandOS-Version': CONFIG.VERSION,
            'X-BrandOS-Pixel-ID': this.pixelId,
            'X-BrandOS-Referrer': window.location.hostname,
            'X-BrandOS-User-Agent': navigator.userAgent
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        this.employmentData = data;
        
        await this.injectStructuredData();
        this.trackPixelLoad();
        this.isInitialized = true;
        
        this.log('info', 'BrandOS pixel loaded successfully', {
          jobCount: data.jobs?.length || 0,
          companyId: this.companyId
        });
        
      } catch (error) {
        this.handleError('Failed to load employment data', error);
      }
    }
    
    async injectStructuredData() {
      if (!this.employmentData || !this.employmentData.jobs) {
        this.log('warn', 'No employment data available for structured data injection');
        return;
      }
      
      // Remove existing BrandOS structured data
      const existingScripts = document.querySelectorAll('script[data-brandos-schema]');
      existingScripts.forEach(script => script.remove());
      
      // Generate JSON-LD schema
      const schema = this.generateJobPostingSchema();
      
      // Inject structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-brandos-schema', 'true');
      script.setAttribute('data-brandos-version', CONFIG.VERSION);
      script.textContent = JSON.stringify(schema, null, 2);
      
      document.head.appendChild(script);
      
      this.log('info', 'Structured data injected', {
        jobCount: this.employmentData.jobs.length,
        schemaSize: script.textContent.length
      });
    }
    
    generateJobPostingSchema() {
      const jobs = this.employmentData.jobs || [];
      const company = this.employmentData.company || {};
      
      if (jobs.length === 0) {
        return {
          "@context": "https://schema.org/",
          "@type": "Organization",
          "name": company.name,
          "url": company.website,
          "dateModified": new Date().toISOString()
        };
      }
      
      return {
        "@context": "https://schema.org/",
        "@type": "Organization",
        "name": company.name,
        "url": company.website,
        "dateModified": new Date().toISOString(),
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Job Opportunities",
          "itemListElement": jobs.map(job => this.generateJobSchema(job))
        }
      };
    }
    
    generateJobSchema(job) {
      return {
        "@type": "JobPosting",
        "title": job.title,
        "description": job.description,
        "identifier": {
          "@type": "PropertyValue",
          "name": job.ats_job_id ? "ATS ID" : "Internal ID",
          "value": job.ats_job_id || job.id
        },
        "datePosted": job.posted_date,
        "dateModified": new Date().toISOString(),
        "validThrough": job.expires_date,
        "employmentType": this.mapEmploymentType(job.employment_type),
        "workFromHome": job.remote_eligible,
        "hiringOrganization": {
          "@type": "Organization",
          "name": this.employmentData.company.name,
          "sameAs": this.employmentData.company.website,
          "logo": this.employmentData.company.logo_url
        },
        "jobLocation": job.location ? {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": job.location.city,
            "addressRegion": job.location.state,
            "addressCountry": job.location.country
          }
        } : undefined,
        "baseSalary": job.salary_range ? {
          "@type": "MonetaryAmount",
          "currency": job.salary_range.currency || "USD",
          "value": {
            "@type": "QuantitativeValue",
            "minValue": job.salary_range.min,
            "maxValue": job.salary_range.max,
            "unitText": job.salary_range.period || "YEAR"
          }
        } : undefined,
        "qualifications": job.requirements?.join("; "),
        "responsibilities": job.responsibilities?.join("; "),
        "benefits": job.benefits?.join("; "),
        "experienceRequirements": job.experience_level,
        "educationRequirements": job.education_requirements,
        "skills": job.skills?.join(", ")
      };
    }
    
    mapEmploymentType(type) {
      const mappings = {
        'full-time': 'FULL_TIME',
        'part-time': 'PART_TIME',
        'contract': 'CONTRACTOR',
        'temporary': 'TEMPORARY',
        'internship': 'INTERN'
      };
      return mappings[type] || 'FULL_TIME';
    }
    
    async fetchWithRetry(url, options) {
      for (let attempt = 0; attempt <= CONFIG.MAX_RETRIES; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            return response;
          }
          
          if (attempt === CONFIG.MAX_RETRIES) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
        } catch (error) {
          if (attempt === CONFIG.MAX_RETRIES) {
            throw error;
          }
          
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    trackPixelLoad() {
      this.performanceMetrics.loadComplete = performance.now();
      this.performanceMetrics.totalDuration = 
        this.performanceMetrics.loadComplete - this.performanceMetrics.loadStart;
      
      // Send analytics
      this.sendAnalytics('pixel_loaded', {
        performance: this.performanceMetrics,
        jobCount: this.employmentData.jobs?.length || 0,
        hasComplianceData: !!this.employmentData.compliance,
        timestamp: Date.now()
      });
    }
    
    async sendAnalytics(eventType, data) {
      try {
        await fetch(`${CONFIG.API_BASE}/analytics/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-BrandOS-Company-ID': this.companyId,
            'X-BrandOS-Pixel-ID': this.pixelId
          },
          body: JSON.stringify({
            event_type: eventType,
            event_data: data,
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        this.log('warn', 'Analytics tracking failed', error);
      }
    }
    
    startPerformanceTracking() {
      this.performanceMetrics.loadStart = performance.now();
    }
    
    generatePixelId() {
      return 'px_' + Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
    }
    
    isValidDomain(domain) {
      // Basic domain validation
      return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(domain);
    }
    
    handleError(message, error) {
      this.log('error', message, error);
      
      // Send error analytics
      this.sendAnalytics('pixel_error', {
        error_message: message,
        error_details: error.message,
        stack: error.stack,
        company_id: this.companyId,
        pixel_id: this.pixelId,
        url: window.location.href,
        user_agent: navigator.userAgent
      });
    }
    
    log(level, message, data) {
      if (!CONFIG.DEBUG && level === 'info') return;
      
      const logMethod = console[level] || console.log;
      const prefix = `[BrandOS Pixel]`;
      
      if (data) {
        logMethod(`${prefix} ${message}`, data);
      } else {
        logMethod(`${prefix} ${message}`);
      }
    }
  }
  
  // Auto-initialize when DOM is ready
  function initializePixel() {
    if (window.brandOSPixel) {
      console.warn('[BrandOS Pixel] Already initialized');
      return;
    }
    
    window.brandOSPixel = new BrandOSPixel();
  }
  
  // Initialize based on document state
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePixel);
  } else {
    initializePixel();
  }
  
  // Expose pixel for debugging
  if (window.location.hostname === 'localhost' || window.location.search.includes('brandos_debug=1')) {
    window.brandOSPixelDebug = {
      getPixel: () => window.brandOSPixel,
      getPerformance: () => window.brandOSPixel?.performanceMetrics,
      getEmploymentData: () => window.brandOSPixel?.employmentData,
      reinject: () => window.brandOSPixel?.injectStructuredData()
    };
  }
})();
```

---

## 📊 DASHBOARD SPECIFICATIONS

### **Dashboard Layout Requirements**
```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar - EXACT WIDTH: 256px */}
        <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
          <DashboardSidebar />
        </aside>
        
        {/* Main Content */}
        <div className="flex-1 ml-64">
          {/* Header - EXACT HEIGHT: 64px */}
          <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
            <DashboardHeader />
          </header>
          
          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
```

### **Sidebar Navigation**
```typescript
// components/dashboard/sidebar.tsx
const navigationItems = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: HomeIcon,
    badge: null
  },
  {
    name: 'Job Postings',
    href: '/dashboard/jobs',
    icon: BriefcaseIcon,
    badge: (count: number) => count > 0 ? count.toString() : null
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: ChartBarIcon,
    badge: null
  },
  {
    name: 'Pixel Status',
    href: '/dashboard/pixel',
    icon: CodeBracketIcon,
    badge: (status: string) => status === 'error' ? '!' : null
  },
  {
    name: 'Compliance',
    href: '/dashboard/compliance',
    icon: ShieldCheckIcon,
    badge: (violations: number) => violations > 0 ? violations.toString() : null
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: CogIcon,
    badge: null
  }
];

// Styling requirements:
// - Active state: bg-brand-primary-light border-r-2 border-brand-primary text-brand-primary
// - Hover state: bg-gray-50 text-gray-900
// - Icon size: 20px (w-5 h-5)
// - Badge styling: bg-red-100 text-red-600 px-2 py-1 text-xs rounded-full
```

### **Job Management Table**
```typescript
// components/dashboard/job-table.tsx
interface JobTableProps {
  jobs: JobPosting[];
  onEdit: (job: JobPosting) => void;
  onDelete: (jobId: string) => void;
  onToggleStatus: (jobId: string, status: string) => void;
}

// Table styling requirements:
// - Zebra striping: even rows bg-gray-50
// - Header: bg-gray-100 border-b-2 border-gray-200 font-medium text-gray-900
// - Cell padding: px-6 py-4
// - Action buttons: icon-only, hover states
// - Status badges: Active (green), Paused (yellow), Closed (gray)
// - Mobile responsive: stack on mobile, horizontal scroll on tablet

const columns = [
  { key: 'title', label: 'Job Title', sortable: true },
  { key: 'department', label: 'Department', sortable: true },
  { key: 'location', label: 'Location', sortable: false },
  { key: 'employment_type', label: 'Type', sortable: true },
  { key: 'posted_date', label: 'Posted', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
];
```

### **Job Editor Modal**
```typescript
// components/dashboard/job-editor.tsx
interface JobEditorProps {
  job?: JobPosting;
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: JobPosting) => Promise<void>;
}

// Modal requirements:
// - Full-screen overlay: bg-black/50
// - Modal width: max-w-4xl
// - Modal positioning: centered
// - Form validation: real-time + on submit
// - Auto-save: every 30 seconds
// - Preview mode: side-by-side with form
// - Compliance checking: real-time as user types
// - Rich text editor: for description field
// - Location autocomplete: Google Places API
// - Salary suggestions: based on market data
```

---

## 🔌 API ROUTE SPECIFICATIONS

### **Audit API Endpoint**
```typescript
// app/api/audit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuditEngine } from '@/lib/audit/audit-engine';
import { RateLimiter } from '@/lib/utils/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 audits per IP per hour
    const rateLimiter = new RateLimiter();
    const isAllowed = await rateLimiter.check(request.ip, 'audit', 3, 3600);
    
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const { companyDomain, companyName, email } = body;
    
    // Validation
    const validation = validateAuditRequest({ companyDomain, companyName, email });
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors },
        { status: 400 }
      );
    }
    
    // Run audit
    const auditEngine = new AuditEngine();
    const auditResult = await auditEngine.runComprehensiveAudit({
      domain: companyDomain,
      name: companyName,
      email
    });
    
    // Generate PDF report
    const pdfUrl = await generateAuditPDF(auditResult);
    
    // Save to database
    const savedAudit = await saveAuditResult({
      ...auditResult,
      pdf_report_url: pdfUrl
    });
    
    // Send email with report
    await sendAuditEmail(email, {
      companyName,
      auditId: savedAudit.id,
      pdfUrl,
      score: auditResult.overall_score
    });
    
    return NextResponse.json({
      success: true,
      audit_id: savedAudit.id,
      overall_score: auditResult.overall_score,
      pdf_url: pdfUrl,
      recommendations: auditResult.recommendations.slice(0, 3) // Top 3 for preview
    });
    
  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function validateAuditRequest(data: any) {
  const errors: string[] = [];
  
  if (!data.companyDomain) {
    errors.push('Company domain is required');
  } else if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(data.companyDomain)) {
    errors.push('Invalid domain format');
  }
  
  if (!data.companyName || data.companyName.length < 2) {
    errors.push('Valid company name is required');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email address is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}
```

### **Pixel Data API**
```typescript
// app/api/pixel/companies/[id]/employment-data/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    const pixelId = request.headers.get('X-BrandOS-Pixel-ID');
    const referrer = request.headers.get('X-BrandOS-Referrer');
    
    // Validate company and pixel
    const company = await getCompanyById(companyId);
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    
    // Validate domain
    if (referrer && !isValidReferrer(referrer, company.domain)) {
      console.warn(`Invalid referrer: ${referrer} for company: ${company.domain}`);
    }
    
    // Get active job postings
    const jobs = await getActiveJobPostings(companyId);
    
    // Apply compliance filtering
    const compliantJobs = await applyComplianceRules(jobs, referrer);
    
    // Track pixel request
    await trackPixelRequest({
      company_id: companyId,
      pixel_id: pixelId,
      referrer,
      job_count: compliantJobs.length,
      user_agent: request.headers.get('User-Agent'),
      timestamp: new Date()
    });
    
    return NextResponse.json({
      company: {
        name: company.name,
        website: company.website_url,
        logo_url: company.logo_url
      },
      jobs: compliantJobs.map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        department: job.department,
        employment_type: job.employment_type,
        experience_level: job.experience_level,
        remote_eligible: job.remote_eligible,
        location: job.location,
        salary_range: job.salary_range,
        benefits: job.benefits,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        ats_job_id: job.ats_job_id,
        posted_date: job.posted_date,
        expires_date: job.expires_date
      })),
      generated_at: new Date().toISOString(),
      ttl: 300 // 5 minutes
    });
    
  } catch (error) {
    console.error('Pixel data API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## 🧪 TESTING REQUIREMENTS

### **Testing Strategy**
```typescript
// __tests__/setup.ts
import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

// Mock server for API calls
export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### **Component Testing Requirements**
```typescript
// __tests__/components/audit-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuditForm } from '@/components/audit/audit-form';

describe('AuditForm', () => {
  it('should validate required fields', async () => {
    render(<AuditForm />);
    
    const submitButton = screen.getByRole('button', { name: /start free analysis/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/company website is required/i)).toBeInTheDocument();
      expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
    });
  });
  
  it('should submit valid data', async () => {
    const mockOnSubmit = jest.fn();
    render(<AuditForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/company website/i), {
      target: { value: 'example.com' }
    });
    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { value: 'Example Corp' }
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /start free analysis/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        companyDomain: 'example.com',
        companyName: 'Example Corp',
        email: 'test@example.com'
      });
    });
  });
});
```

### **E2E Testing Requirements**
```typescript
// e2e/audit-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete audit flow', async ({ page }) => {
  // Navigate to landing page
  await page.goto('/');
  
  // Fill out audit form
  await page.fill('[data-testid="company-domain"]', 'testcompany.com');
  await page.fill('[data-testid="company-name"]', 'Test Company');
  await page.fill('[data-testid="email"]', 'test@testcompany.com');
  
  // Submit audit
  await page.click('[data-testid="submit-audit"]');
  
  // Wait for loading
  await expect(page.locator('[data-testid="audit-loading"]')).toBeVisible();
  
  // Wait for results (up to 2 minutes)
  await expect(page.locator('[data-testid="audit-results"]')).toBeVisible({ timeout: 120000 });
  
  // Verify results display
  await expect(page.locator('[data-testid="overall-score"]')).toBeVisible();
  await expect(page.locator('[data-testid="recommendations"]')).toBeVisible();
  await expect(page.locator('[data-testid="pdf-download"]')).toBeVisible();
  
  // Test PDF download
  const downloadPromise = page.waitForEvent('download');
  await page.click('[data-testid="pdf-download"]');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/audit-report-.+\.pdf/);
});

test('pixel performance monitoring', async ({ page }) => {
  // Navigate to test page with pixel
  await page.goto('/test-pixel');
  
  // Monitor console for pixel logs
  const logs: string[] = [];
  page.on('console', msg => logs.push(msg.text()));
  
  // Wait for pixel to load
  await page.waitForTimeout(2000);
  
  // Verify pixel loaded successfully
  const pixelLoaded = logs.some(log => log.includes('BrandOS pixel loaded successfully'));
  expect(pixelLoaded).toBe(true);
  
  // Check structured data injection
  const structuredData = await page.locator('script[type="application/ld+json"]').count();
  expect(structuredData).toBeGreaterThan(0);
  
  // Verify performance metrics
  const performance = await page.evaluate(() => window.brandOSPixelDebug?.getPerformance());
  expect(performance?.totalDuration).toBeLessThan(2000); // Under 2 seconds
});
```

---

## 🚀 DEPLOYMENT SPECIFICATIONS

### **Environment Configuration**
```env
# .env.local.example
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Configuration  
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@brandos.io

# API Configuration
NEXT_PUBLIC_API_URL=https://api.brandos.io
PIXEL_CDN_URL=https://pixel.brandos.io

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://app.brandos.io

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
VERCEL_ANALYTICS_ID=your-vercel-analytics-id

# Rate Limiting
REDIS_URL=redis://localhost:6379
RATE_LIMIT_MAX_REQUESTS=100

# External APIs
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_PLACES_API_KEY=your-google-places-key

# Error Tracking
SENTRY_DSN=your-sentry-dsn
```

### **Vercel Configuration**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "installCommand": "npm ci",
  "regions": ["iad1", "sfo1", "lhr1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    },
    "app/api/audit/route.ts": {
      "maxDuration": 120
    }
  },
  "headers": [
    {
      "source": "/pixel/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=86400, s-maxage=86400"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://app.brandos.io"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-Requested-With, Content-Type, Authorization, X-BrandOS-Company-ID"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/dashboard",
      "has": [
        {
          "type": "cookie",
          "key": "supabase-auth-token",
          "value": "(?<token>.*)"
        }
      ],
      "destination": "/dashboard/overview",
      "permanent": false
    }
  ]
}
```

### **Build and Deployment Script**
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting BrandOS deployment..."

# Environment check
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ VERCEL_TOKEN not set"
    exit 1
fi

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ SUPABASE_ACCESS_TOKEN not set"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm run test:ci

# Type checking
echo "🔍 Type checking..."
npm run type-check

# Build application
echo "🏗️ Building application..."
npm run build

# Deploy database migrations
echo "🗄️ Deploying database migrations..."
npx supabase db deploy --project-ref $SUPABASE_PROJECT_REF

# Deploy to Vercel
echo "🌍 Deploying to Vercel..."
npx vercel --prod --token $VERCEL_TOKEN

# Verify deployment
echo "✅ Verifying deployment..."
npm run test:e2e:production

echo "🎉 Deployment complete!"
```

---

## ⚡ PERFORMANCE REQUIREMENTS

### **Performance Benchmarks (MUST ACHIEVE)**
```yaml
Landing Page:
  First Contentful Paint: < 1.5s
  Largest Contentful Paint: < 2.5s
  Cumulative Layout Shift: < 0.1
  First Input Delay: < 100ms
  Time to Interactive: < 3.5s

Dashboard:
  Initial Load: < 2.0s
  Navigation: < 500ms
  Table Rendering (1000 rows): < 1.0s
  Form Submission: < 300ms
  Chart Rendering: < 800ms

Pixel:
  Load Time: < 1.0s
  Injection Time: < 500ms
  Size: < 5KB gzipped
  Memory Usage: < 1MB
  Error Rate: < 0.1%

API Endpoints:
  Audit Generation: < 120s
  Job Data Fetch: < 500ms
  Analytics Query: < 2.0s
  Authentication: < 200ms
  CRUD Operations: < 300ms
```

### **Performance Monitoring**
```typescript
// lib/monitoring/performance.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  trackPageLoad(page: string) {
    if (typeof window === 'undefined') return;
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    const metrics = {
      page,
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domContentLoadedEventEnd - navigation.responseEnd,
      fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      lcp: this.getLCP(),
      cls: this.getCLS(),
      fid: this.getFID(),
      timestamp: Date.now()
    };
    
    this.sendMetrics(metrics);
  }
  
  trackAPICall(endpoint: string, duration: number, status: number) {
    this.sendMetrics({
      type: 'api_call',
      endpoint,
      duration,
      status,
      timestamp: Date.now()
    });
  }
  
  trackUserInteraction(action: string, element: string, duration?: number) {
    this.sendMetrics({
      type: 'user_interaction',
      action,
      element,
      duration,
      timestamp: Date.now()
    });
  }
  
  private sendMetrics(metrics: any) {
    // Send to analytics endpoint
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    }).catch(console.error);
  }
}
```

---

## 🔒 SECURITY REQUIREMENTS

### **Security Checklist (MANDATORY)**
```yaml
Authentication & Authorization:
  ✓ Supabase RLS policies implemented
  ✓ JWT token validation on all protected routes
  ✓ Session timeout (24 hours)
  ✓ Password requirements (8+ chars, mixed case, numbers)
  ✓ MFA support ready for enterprise

Input Validation:
  ✓ All user inputs sanitized and validated
  ✓ SQL injection prevention (parameterized queries)
  ✓ XSS prevention (HTML escaping)
  ✓ CSRF protection enabled
  ✓ File upload restrictions (type, size, scanning)

Data Protection:
  ✓ PII encryption at rest
  ✓ TLS 1.3 for all connections
  ✓ API rate limiting implemented
  ✓ Data retention policies enforced
  ✓ GDPR compliance measures

Infrastructure:
  ✓ Content Security Policy configured
  ✓ HTTPS enforced (HSTS headers)
  ✓ Secure headers (X-Frame-Options, etc.)
  ✓ Environment variables secured
  ✓ Dependency scanning automated

Monitoring:
  ✓ Security event logging
  ✓ Anomaly detection
  ✓ Failed login attempt monitoring
  ✓ Data access audit trails
  ✓ Error tracking (Sentry)
```

### **Content Security Policy**
```typescript
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://cdn.supabase.co;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https:;
  font-src 'self' https://fonts.gstatic.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'false'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];
```

---

## 📋 QUALITY STANDARDS

### **Code Quality Requirements**
```typescript
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "prefer-const": "error",
    "no-var": "error",
    "react-hooks/exhaustive-deps": "error"
  }
}
```

### **TypeScript Standards**
```typescript
// All functions must have explicit return types
function calculateAuditScore(data: AuditData): number {
  return data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
}

// Interfaces must be exported and documented
export interface JobPosting {
  /** Unique identifier for the job posting */
  id: string;
  /** Human-readable job title */
  title: string;
  /** Full job description in HTML format */
  description: string;
  /** Employment type classification */
  employment_type: 'full-time' | 'part-time' | 'contract' | 'temporary' | 'internship';
  /** Whether the position supports remote work */
  remote_eligible: boolean;
  /** Salary range information */
  salary_range?: {
    min: number;
    max: number;
    currency: string;
    period: 'hour' | 'month' | 'year';
  };
}

// Error handling must be comprehensive
async function fetchJobData(companyId: string): Promise<JobPosting[]> {
  try {
    const response = await fetch(`/api/companies/${companyId}/jobs`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.jobs;
    
  } catch (error) {
    console.error('Failed to fetch job data:', error);
    throw new Error('Unable to load job data. Please try again.');
  }
}
```

### **Component Standards**
```typescript
// All components must follow this pattern
interface ComponentProps {
  /** Required props must be documented */
  title: string;
  /** Optional props must have default values or be explicitly optional */
  className?: string;
  /** Event handlers must be properly typed */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function Component({ 
  title, 
  className = '', 
  onClick 
}: ComponentProps): JSX.Element {
  // State must be properly typed
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Event handlers must be useCallback for performance
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setIsLoading(true);
    onClick?.(event);
  }, [onClick]);
  
  // Loading states must be handled
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <button 
      className={cn('base-button-styles', className)}
      onClick={handleClick}
    >
      {title}
    </button>
  );
}
```

---

## 🎯 FINAL REQUIREMENTS

### **Pre-Launch Checklist**
```yaml
✓ All components responsive (mobile, tablet, desktop)
✓ All forms have proper validation and error handling  
✓ All API endpoints have proper error responses
✓ All database queries use proper indexes
✓ All images optimized and compressed
✓ All fonts loaded efficiently
✓ All external resources have fallbacks
✓ All user flows tested end-to-end
✓ All security measures implemented and tested
✓ All performance benchmarks met
✓ All accessibility standards met (WCAG 2.1 AA)
✓ All browser compatibility tested (Chrome, Firefox, Safari, Edge)
✓ All monitoring and analytics configured
✓ All error tracking configured
✓ All deployment scripts tested
✓ All environment variables documented
✓ All API documentation complete
✓ All user documentation complete
```

### **Success Criteria**
The BrandOS platform must achieve:
1. **100% uptime** during business hours
2. **Sub-second response times** for all user interactions
3. **Zero security vulnerabilities** in production
4. **90%+ user satisfaction** in initial testing
5. **Enterprise-grade reliability** from day one

---

## 🎨 DESIGN EXCELLENCE STANDARDS

This platform represents BrandOS in the marketplace. Every pixel, every interaction, every message must reflect:
- **Professionalism**: Enterprise customers trust their most important data with us
- **Reliability**: The product works flawlessly under all conditions  
- **Simplicity**: Complex functionality presented in intuitive interfaces
- **Performance**: Fast, responsive, and delightful to use
- **Scalability**: Built to handle massive growth from day one

**Build BrandOS as if 100 world-class developers collaborated on every detail. This is the standard of quality that will define our success.**