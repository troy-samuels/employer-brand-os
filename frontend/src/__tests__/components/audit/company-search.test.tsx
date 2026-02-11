/**
 * @module __tests__/components/audit/company-search.test
 * Module implementation for company-search.test.tsx.
 */

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CompanySearch,
  type CompanySearchResult,
} from "@/components/audit/company-search";

function createCompanyResponse(companies: CompanySearchResult[]): Response {
  return new Response(JSON.stringify({ companies }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForDebounce(ms: number): Promise<void> {
  await act(async () => {
    await sleep(ms);
  });
}

describe("CompanySearch", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("calls the company API after the 300ms debounce window", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createCompanyResponse([
        {
          id: "11111111-1111-1111-1111-111111111111",
          name: "Meridian Talent",
          domain: "meridian.example",
          industry: "Software",
          employee_count: 420,
        },
      ]),
    );

    render(<CompanySearch onSubmit={vi.fn()} />);

    const input = screen.getByPlaceholderText("Enter your company name");
    fireEvent.change(input, { target: { value: "Merid" } });

    expect(fetchSpy).not.toHaveBeenCalled();

    await waitForDebounce(250);
    expect(fetchSpy).not.toHaveBeenCalled();

    await waitForDebounce(100);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const firstCallUrl = String(fetchSpy.mock.calls[0]?.[0] ?? "");
    expect(firstCallUrl).toContain("/api/companies/search?q=Merid");
  });

  it("supports keyboard navigation and enter-to-select behavior", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createCompanyResponse([
        {
          id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          name: "Meridian Finance",
          domain: "meridian-finance.example",
          industry: "Finance",
          employee_count: 1250,
        },
        {
          id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
          name: "Meridian Labs",
          domain: "meridianlabs.example",
          industry: "Biotech",
          employee_count: 890,
        },
      ]),
    );

    render(<CompanySearch onSubmit={vi.fn()} />);

    const input = screen.getByPlaceholderText("Enter your company name");
    fireEvent.change(input, { target: { value: "Merid" } });

    await waitForDebounce(350);

    await screen.findByText("Meridian Finance");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input).toHaveValue("Meridian Labs");
    expect(screen.getByRole("button", { name: /run free audit/i })).toBeEnabled();
  });

  it("shows URL fallback when the search returns no companies", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(createCompanyResponse([]));

    render(<CompanySearch onSubmit={vi.fn()} />);

    const input = screen.getByPlaceholderText("Enter your company name");
    fireEvent.change(input, { target: { value: "NoMatch" } });

    await waitForDebounce(350);

    await waitFor(() => {
      expect(
        screen.getByText("Can't find your company? Enter your website URL instead"),
      ).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("https://your-company.com")).toBeInTheDocument();
  });
});
