/**
 * @module features/facts/index
 * Module implementation for index.ts.
 */

// Components
export { CompanyFactsForm } from './components/company-facts-form';

// Actions
export { saveCompanyFacts, getCompanyFacts } from './actions/save-facts';

// Schema & Types
export {
  companyFactsSchema,
  type CompanyFactsFormData,
  BENEFIT_OPTIONS,
  CURRENCY_OPTIONS,
  REMOTE_POLICY_OPTIONS,
} from './schemas/facts.schema';

export type { OrganizationData, EmployerFactData, SaveFactsResult } from './types/facts.types';
