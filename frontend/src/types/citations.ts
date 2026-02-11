/**
 * @module types/citations
 * Data model for AI citation tracking — which sources LLMs cite when
 * answering questions about an employer.
 */

export interface CitationSource {
  url: string;
  domain: string;
  title: string;
  type:
    | "employer-controlled"
    | "review-platform"
    | "social-media"
    | "news"
    | "wiki"
    | "forum"
    | "other";
  frequency: number;
  lastSeen: string;
}

export interface ModelCitation {
  modelId:
    | "chatgpt"
    | "google-ai"
    | "perplexity"
    | "copilot"
    | "claude"
    | "meta-ai";
  citations: CitationSource[];
  totalCitations: number;
  employerControlledPct: number;
  topSource: CitationSource;
}

export interface CompanyCitationReport {
  companyDomain: string;
  companyName: string;
  modelCitations: ModelCitation[];
  allSources: CitationSource[];
  employerControlledPct: number;
  topUncontrolledSource: CitationSource;
  generatedAt: string;
}
