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
