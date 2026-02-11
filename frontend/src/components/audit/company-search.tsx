/**
 * @module components/audit/company-search
 * Company autocomplete input for selecting an employer before running an audit.
 */

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;
const MAX_COMPANY_RESULTS = 8;
const CONTROL_CHARACTER_REGEX = /[\u0000-\u001F\u007F]/g;
const ANGLE_BRACKET_REGEX = /[<>]/g;

/**
 * Defines the CompanySearchResult contract.
 */
export interface CompanySearchResult {
  id: string;
  name: string;
  domain: string;
  industry: string | null;
  employee_count: number | null;
}

interface CompanySearchResponse {
  companies: CompanySearchResult[];
}

/**
 * Defines the CompanySearchProps contract.
 */
export interface CompanySearchProps {
  onSubmit: (input: string) => void;
  isLoading?: boolean;
}

function sanitizeTextInput(value: string): string {
  return value
    .replace(CONTROL_CHARACTER_REGEX, "")
    .replace(ANGLE_BRACKET_REGEX, "")
    .replace(/\s+/g, " ")
    .trimStart();
}

function normalizeAuditTarget(value: string): string | null {
  const sanitized = sanitizeTextInput(value).trim();
  if (!sanitized) {
    return null;
  }

  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(sanitized);
  const candidate = hasScheme ? sanitized : `https://${sanitized}`;

  try {
    const parsed = new URL(candidate);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }
    return hasScheme ? parsed.toString() : parsed.hostname;
  } catch {
    return null;
  }
}

function formatEmployeeCount(employeeCount: number | null): string {
  if (typeof employeeCount !== "number" || !Number.isFinite(employeeCount) || employeeCount <= 0) {
    return "";
  }

  return `${employeeCount.toLocaleString()} employees`;
}

function sanitizeCompanyRecord(company: CompanySearchResult): CompanySearchResult {
  return {
    id: company.id.replace(/[^a-zA-Z0-9-]/g, ""),
    name: sanitizeTextInput(company.name).trim(),
    domain: sanitizeTextInput(company.domain).trim().toLowerCase(),
    industry: company.industry ? sanitizeTextInput(company.industry).trim() : null,
    employee_count:
      typeof company.employee_count === "number" && Number.isFinite(company.employee_count)
        ? Math.max(0, Math.trunc(company.employee_count))
        : null,
  };
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/**
 * Renders a company autocomplete input with keyboard navigation and fallback URL mode.
 * @param props - Callback and loading state for running an audit.
 * @returns Company search UI for selecting an employer.
 */
export function CompanySearch({
  onSubmit,
  isLoading = false,
}: CompanySearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanySearchResult | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const trimmedQuery = query.trim();
  const shouldSearch = trimmedQuery.length >= MIN_QUERY_LENGTH;
  const showFallback = shouldSearch && hasSearched && !isSearching && results.length === 0;
  const normalizedFallbackUrl = useMemo(() => normalizeAuditTarget(fallbackUrl), [fallbackUrl]);
  const shouldShowRunButton = Boolean(selectedCompany) || showFallback;
  const canRunAudit = Boolean(selectedCompany || normalizedFallbackUrl) && !isLoading;

  const handleSelectCompany = useCallback((company: CompanySearchResult) => {
    setSelectedCompany(company);
    setQuery(company.name);
    setResults([]);
    setIsDropdownOpen(false);
    setActiveIndex(-1);
    setHasSearched(false);
    setFallbackUrl("");
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isLoading) {
        return;
      }

      if (selectedCompany) {
        onSubmit(selectedCompany.domain);
        return;
      }

      if (normalizedFallbackUrl) {
        onSubmit(normalizedFallbackUrl);
      }
    },
    [isLoading, normalizedFallbackUrl, onSubmit, selectedCompany],
  );

  const handleQueryKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        if (results.length === 0) {
          return;
        }
        event.preventDefault();
        setIsDropdownOpen(true);
        setActiveIndex((previousIndex) =>
          previousIndex < results.length - 1 ? previousIndex + 1 : 0,
        );
        return;
      }

      if (event.key === "ArrowUp") {
        if (results.length === 0) {
          return;
        }
        event.preventDefault();
        setIsDropdownOpen(true);
        setActiveIndex((previousIndex) =>
          previousIndex > 0 ? previousIndex - 1 : results.length - 1,
        );
        return;
      }

      if (event.key === "Enter" && isDropdownOpen && activeIndex >= 0) {
        event.preventDefault();
        const targetCompany = results[activeIndex];
        if (targetCompany) {
          handleSelectCompany(targetCompany);
        }
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setIsDropdownOpen(false);
        setActiveIndex(-1);
      }
    },
    [activeIndex, handleSelectCompany, isDropdownOpen, results],
  );

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const currentContainer = containerRef.current;
      if (!currentContainer) {
        return;
      }

      if (!currentContainer.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (!shouldSearch) {
      setResults([]);
      setActiveIndex(-1);
      setIsDropdownOpen(false);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    if (selectedCompany && selectedCompany.name === trimmedQuery) {
      return;
    }

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const queryParams = new URLSearchParams({ q: trimmedQuery });
        const response = await fetch(`/api/companies/search?${queryParams.toString()}`, {
          method: "GET",
          signal: abortController.signal,
        });

        if (!response.ok) {
          setResults([]);
          setIsDropdownOpen(false);
          setActiveIndex(-1);
          setHasSearched(true);
          return;
        }

        const payload = (await response.json()) as CompanySearchResponse;
        const sanitizedResults = payload.companies
          .slice(0, MAX_COMPANY_RESULTS)
          .map((company) => sanitizeCompanyRecord(company))
          .filter((company) => company.name.length > 0 && company.domain.length > 0);

        setResults(sanitizedResults);
        setIsDropdownOpen(sanitizedResults.length > 0);
        setActiveIndex(sanitizedResults.length > 0 ? 0 : -1);
        setHasSearched(true);
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }
        setResults([]);
        setIsDropdownOpen(false);
        setActiveIndex(-1);
        setHasSearched(true);
      } finally {
        if (!abortController.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      abortController.abort();
      window.clearTimeout(timeoutId);
    };
  }, [selectedCompany, shouldSearch, trimmedQuery]);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div ref={containerRef} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(event) => {
              const nextQuery = sanitizeTextInput(event.target.value);
              setQuery(nextQuery);
              if (selectedCompany && nextQuery.trim() !== selectedCompany.name) {
                setSelectedCompany(null);
              }
            }}
            onFocus={() => {
              if (results.length > 0) {
                setIsDropdownOpen(true);
              }
            }}
            onKeyDown={handleQueryKeyDown}
            placeholder="Enter your company name"
            disabled={isLoading}
            role="combobox"
            aria-expanded={isDropdownOpen}
            aria-autocomplete="list"
            aria-controls="company-search-results"
            aria-activedescendant={activeIndex >= 0 ? `company-result-${activeIndex}` : undefined}
            aria-label="Enter your company name"
            className="w-full rounded-xl border border-neutral-200 bg-white px-5 py-3.5 pr-11 text-base text-neutral-950 placeholder:text-neutral-400 shadow-sm focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200"
          />
          {isSearching && (
            <span
              className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-neutral-200 border-t-brand-accent"
              aria-hidden
            />
          )}
        </div>

        {isDropdownOpen && results.length > 0 && (
          <div
            id="company-search-results"
            role="listbox"
            className="absolute left-1/2 z-20 mt-2 max-h-80 w-full max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-lg sm:left-0 sm:max-w-none sm:translate-x-0"
          >
            {results.map((company, index) => {
              const isActive = index === activeIndex;
              const metadata = [company.domain, company.industry, formatEmployeeCount(company.employee_count)]
                .filter(Boolean)
                .join(" • ");

              return (
                <button
                  id={`company-result-${index}`}
                  key={company.id || `${company.name}-${company.domain}`}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelectCompany(company)}
                  className={cn(
                    "flex w-full flex-col items-start gap-1 border-b border-neutral-100 px-4 py-3 text-left last:border-b-0",
                    isActive ? "bg-brand-accent/10" : "hover:bg-neutral-50",
                  )}
                >
                  <span className="text-sm font-semibold text-neutral-900">{company.name}</span>
                  {metadata && <span className="text-xs text-neutral-500">{metadata}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {showFallback && (
        <div className="mt-4 space-y-3 rounded-xl border border-dashed border-neutral-300 bg-white/90 p-4 text-left">
          <p className="text-sm text-neutral-600">
            Can&apos;t find your company? Enter your website URL instead
          </p>
          <input
            type="text"
            value={fallbackUrl}
            onChange={(event) => setFallbackUrl(sanitizeTextInput(event.target.value))}
            placeholder="https://your-company.com"
            disabled={isLoading}
            aria-label="Company website URL"
            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      )}

      {shouldShowRunButton && (
        <div className="mt-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            disabled={!canRunAudit}
            className="w-full rounded-xl shadow-md shadow-brand-accent/20 transition-all duration-200 hover:shadow-lg hover:shadow-brand-accent/30"
          >
            Run Free Audit
          </Button>
        </div>
      )}
    </form>
  );
}
