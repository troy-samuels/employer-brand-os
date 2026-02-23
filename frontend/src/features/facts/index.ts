/**
 * @module features/facts/index
 * Module implementation for index.ts.
 */

// Components
export { CompanyFactsForm } from './components/company-facts-form';
export { EmployerQuestionnaire } from './components/employer-questionnaire';

// Actions
export { saveCompanyFacts, getCompanyFacts } from './actions/save-facts';
export { getEmployerFacts, getCompanyInfo } from './actions/get-employer-facts';

// Schema & Types (legacy)
export {
  companyFactsSchema,
  type CompanyFactsFormData,
  BENEFIT_OPTIONS,
  CURRENCY_OPTIONS,
  REMOTE_POLICY_OPTIONS,
} from './schemas/facts.schema';

export type { OrganizationData, EmployerFactData, SaveFactsResult } from './types/facts.types';

// Employer Facts (new comprehensive system)
export {
  employerFactsSchema,
  type EmployerFactsFormData,
} from './schemas/employer-facts.schema';

export type { EmployerFacts, AEOOutput } from './types/employer-facts.types';
