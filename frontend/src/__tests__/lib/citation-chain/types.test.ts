/**
 * @module __tests__/lib/citation-chain/types.test
 * Tests for citation-chain shared type constants.
 */

import { describe, expect, it } from "vitest";

import {
  CITATION_CHAIN_MODEL_IDS,
  SOURCE_TYPES,
} from "@/lib/citation-chain/types";

describe("citation-chain types", () => {
  it("exposes the three required model ids", () => {
    expect(CITATION_CHAIN_MODEL_IDS).toEqual(["chatgpt", "claude", "perplexity"]);
  });

  it("exposes supported source type buckets", () => {
    expect(SOURCE_TYPES).toEqual([
      "review-platform",
      "employer",
      "forum",
      "news",
      "other",
    ]);
  });
});
