/**
 * @module lib/citation-chain/prompts
 * Standardised employer audit prompt templates.
 */

import type { PromptCategory, PromptCategoryId } from "@/lib/citation-chain/types";

/**
 * Default role used in role-based prompt templates.
 */
export const DEFAULT_EMPLOYER_ROLE = "Software Engineer";

/**
 * The eight required prompt categories for citation chain analysis.
 */
export const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: "salary",
    label: "Salary",
    template: "What is the salary for a {role} at {company}?",
    googleTemplate: "{company} {role} salary",
  },
  {
    id: "culture",
    label: "Culture",
    template: "What is the work culture like at {company}?",
    googleTemplate: "{company} employee culture",
  },
  {
    id: "benefits",
    label: "Benefits",
    template: "What benefits does {company} offer employees?",
    googleTemplate: "{company} employee benefits",
  },
  {
    id: "remote_policy",
    label: "Remote Policy",
    template: "What is the remote and hybrid work policy at {company}?",
    googleTemplate: "{company} remote policy",
  },
  {
    id: "interview",
    label: "Interview",
    template: "What is the interview process for {role} at {company}?",
    googleTemplate: "{company} interview process {role}",
  },
  {
    id: "competitors",
    label: "Competitors",
    template: "Who are the main employer competitors to {company}?",
    googleTemplate: "{company} competitors employer",
  },
  {
    id: "reviews",
    label: "Reviews",
    template: "How do employees review working at {company}?",
    googleTemplate: "{company} employee reviews",
  },
  {
    id: "growth",
    label: "Growth",
    template: "Is {company} growing and hiring in 2026?",
    googleTemplate: "{company} hiring growth",
  },
];

/**
 * Interpolate placeholders in a template string.
 */
export function interpolatePromptTemplate(
  template: string,
  values: Record<"company" | "role", string>
): string {
  return template
    .replaceAll("{company}", values.company)
    .replaceAll("{role}", values.role);
}

/**
 * Return a prompt category definition by id.
 */
export function getPromptCategory(categoryId: PromptCategoryId): PromptCategory {
  const category = PROMPT_CATEGORIES.find((item) => item.id === categoryId);
  if (!category) {
    throw new Error(`Unknown prompt category: ${categoryId}`);
  }
  return category;
}

/**
 * Build an LLM prompt for a specific category/company pair.
 */
export function buildLlmPrompt(
  categoryId: PromptCategoryId,
  companyName: string,
  role: string = DEFAULT_EMPLOYER_ROLE
): string {
  const category = getPromptCategory(categoryId);
  return interpolatePromptTemplate(category.template, {
    company: companyName,
    role,
  });
}

/**
 * Build a Google query for a specific category/company pair.
 */
export function buildGoogleQuery(
  categoryId: PromptCategoryId,
  companyName: string,
  role: string = DEFAULT_EMPLOYER_ROLE
): string {
  const category = getPromptCategory(categoryId);
  return interpolatePromptTemplate(category.googleTemplate, {
    company: companyName,
    role,
  });
}
