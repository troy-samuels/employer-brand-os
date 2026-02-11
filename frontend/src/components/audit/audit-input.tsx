/**
 * @module components/audit/audit-input
 * Module implementation for audit-input.tsx.
 */

"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";

interface AuditInputProps {
  onSubmit: (input: string) => void;
  isLoading?: boolean;
}

/**
 * Executes AuditInput.
 * @param param1 - param1 input.
 * @returns The resulting value.
 */
export function AuditInput({ onSubmit, isLoading = false }: AuditInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = value.trim();
      if (!trimmed || isLoading) return;
      onSubmit(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your company name or website"
          disabled={isLoading}
          aria-label="Company name or website"
          className="flex-1 rounded-xl border border-neutral-200 bg-white px-5 py-3.5 text-base text-neutral-950 placeholder:text-neutral-400 shadow-sm focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200"
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          disabled={isLoading || !value.trim()}
          className="rounded-xl shadow-md shadow-brand-accent/20 hover:shadow-lg hover:shadow-brand-accent/30 transition-all duration-200"
        >
          Scan Your Brand
        </Button>
      </div>
    </form>
  );
}
