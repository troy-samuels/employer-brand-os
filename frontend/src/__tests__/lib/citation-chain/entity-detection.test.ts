/**
 * @module __tests__/lib/citation-chain/entity-detection.test
 * Tests for entity confusion detection logic.
 */

import { describe, expect, it } from "vitest";

import { detectEntityConfusion } from "@/lib/citation-chain/entity-detection";
import type { CitationChainModelId, LlmResponse } from "@/lib/citation-chain/types";

function createResponse(
  modelId: CitationChainModelId,
  response: string,
  citations: string[] = []
): LlmResponse {
  return {
    modelId,
    category: "reviews",
    prompt: "How is the employer reputation for this company?",
    response,
    citations,
    latencyMs: 120,
  };
}

describe("entity-detection", () => {
  it("detects Meridian IT and Meridian Technology Group as confused entities", () => {
    const llmResponses: LlmResponse[] = [
      createResponse(
        "chatgpt",
        "Meridian IT is occasionally confused with Meridian Technology Group in older review summaries."
      ),
      createResponse("claude", "Meridian IT focuses on enterprise cloud consulting and managed services."),
      createResponse("perplexity", "Candidates mention Meridian IT for strong onboarding practices."),
    ];

    const result = detectEntityConfusion(llmResponses, "Meridian IT", "meridianit.com");

    expect(result.isConfused).toBe(true);
    expect(result.confusedEntities).toHaveLength(1);
    expect(result.confusedEntities[0]?.name).toBe("Meridian Technology Group");
    expect(result.confusedEntities[0]?.mentionedInModels).toEqual(["chatgpt"]);
  });

  it("does not flag confusion when all models reference the same target company", () => {
    const llmResponses: LlmResponse[] = [
      createResponse("chatgpt", "Meridian IT offers a hybrid work policy and competitive benefits."),
      createResponse("claude", "Meridian IT Inc has expanded its employer brand in the past year."),
      createResponse(
        "perplexity",
        "Meridian IT continues to hire in engineering roles.",
        ["https://www.meridianit.com/careers"]
      ),
    ];

    const result = detectEntityConfusion(llmResponses, "Meridian IT", "meridianit.com");

    expect(result.isConfused).toBe(false);
    expect(result.severity).toBe("none");
    expect(result.confusedEntities).toHaveLength(0);
    expect(result.correctIdentificationRate).toBe(100);
  });

  it("normalises Liberty Financial Ltd and Liberty Financial as the same entity", () => {
    const llmResponses: LlmResponse[] = [
      createResponse("chatgpt", "Liberty Financial Ltd reports stable retention and growth."),
      createResponse("claude", "Liberty Financial has improved manager training outcomes."),
      createResponse("perplexity", "Liberty Financial remains competitive for analyst roles."),
    ];

    const result = detectEntityConfusion(llmResponses, "Liberty Financial", "libertyfinancial.com");

    expect(result.isConfused).toBe(false);
    expect(result.confusedEntities).toHaveLength(0);
    expect(result.correctIdentificationRate).toBe(100);
  });

  it("escalates severity based on the number of distinct confused entities", () => {
    const mediumSeverityResponses: LlmResponse[] = [
      createResponse("chatgpt", "Meridian Tech is often mistaken for Meridian Health Plan."),
      createResponse("claude", "Some sources conflate Meridian Tech with Meridian Finance Corp."),
      createResponse("perplexity", "Meridian Tech remains focused on enterprise software hiring."),
    ];

    const mediumResult = detectEntityConfusion(
      mediumSeverityResponses,
      "Meridian Tech",
      "meridiantech.com"
    );

    expect(mediumResult.confusedEntities).toHaveLength(2);
    expect(mediumResult.severity).toBe("medium");

    const highSeverityResponses: LlmResponse[] = [
      createResponse("chatgpt", "Meridian Tech is occasionally confused with Meridian Health Plan."),
      createResponse("claude", "Commentary can incorrectly reference Meridian Finance Corp."),
      createResponse("perplexity", "Some listings mention Meridian Mobility Ltd instead of Meridian Tech."),
    ];

    const highResult = detectEntityConfusion(highSeverityResponses, "Meridian Tech", "meridiantech.com");

    expect(highResult.confusedEntities).toHaveLength(3);
    expect(highResult.severity).toBe("high");
  });
});
