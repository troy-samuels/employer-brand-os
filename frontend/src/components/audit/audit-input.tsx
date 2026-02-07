"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";

interface AuditInputProps {
  onSubmit: (input: string) => void;
  isLoading?: boolean;
}

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
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-950 placeholder:text-neutral-500 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          disabled={isLoading || !value.trim()}
        >
          Scan Your Brand
        </Button>
      </div>
    </form>
  );
}
