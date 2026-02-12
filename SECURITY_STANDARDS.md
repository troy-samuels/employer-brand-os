# Security Standards Alignment

## Purpose
This document lists the external security standards and frameworks used to guide BrandOS security controls. It is a reference for our internal protocol and does **not** represent a formal certification or audit attestation.

## Standards referenced
- **OWASP ASVS (Application Security Verification Standard)** — application-level control requirements for authentication, access control, input handling, and security logging.
- **OWASP Top 10** — common web application risk categories used to drive threat modeling and mitigation priorities.
- **NIST Cybersecurity Framework (CSF) 2.0** — governance and risk-management structure for Identify/Protect/Detect/Respond/Recover.
- **NIST SP 800-53 Rev. 5** — catalog of security & privacy controls for access control, auditing, incident response, and configuration management.
- **ISO/IEC 27001:2022** — information security management system (ISMS) requirements and continuous improvement lifecycle.
- **CIS Critical Security Controls v8.1** — prioritized safeguards for secure configurations, vulnerability management, and access control.
- **SOC 2 Trust Services Criteria** — security, availability, confidentiality, processing integrity, and privacy expectations for SaaS providers.

## Protocol mapping (high level)
- **Secure configuration & hardening**: CSP headers, CSRF validation, and sanitized output align with OWASP ASVS and OWASP Top 10 categories.
- **Access control & identity**: Supabase auth with RLS and protected dashboard/API routes align with NIST 800-53 AC controls and ISO 27001 access control domains.
- **Monitoring & response**: health and monitoring endpoints support NIST CSF Detect/Respond practices and SOC 2 Security/Availability criteria.
- **Change management & governance**: audit briefs and structured remediation tracking map to ISO 27001 ISMS requirements and NIST CSF governance expectations.

## References
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework)
- [NIST SP 800-53 Rev. 5](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)
- [ISO/IEC 27001:2022](https://www.iso.org/standard/27001)
- [CIS Critical Security Controls v8.1](https://www.cisecurity.org/controls/v8-1)
- [SOC 2 Trust Services Criteria](https://www.aicpa-cima.com/resources/article/trust-services-criteria)
