/**
 * @module components/audit/entity-confusion-alert
 * Alert banner for showing entity confusion findings in audit results.
 */

import { AlertTriangle, CircleAlert, ShieldAlert } from "lucide-react";

import type {
  EntityConfusionResult,
  EntityConfusionSeverity,
} from "@/lib/citation-chain/entity-detection";
import type { CitationChainModelId } from "@/lib/citation-chain/types";
import { cn } from "@/lib/utils";

interface SeverityStyles {
  container: string;
  icon: string;
  chip: string;
}

const SEVERITY_STYLES: Record<Exclude<EntityConfusionSeverity, "none">, SeverityStyles> = {
  high: {
    container: "border-red-300 bg-red-50 text-red-950",
    icon: "text-red-700",
    chip: "border-red-300 bg-red-100 text-red-900",
  },
  medium: {
    container: "border-amber-300 bg-amber-50 text-amber-950",
    icon: "text-amber-700",
    chip: "border-amber-300 bg-amber-100 text-amber-900",
  },
  low: {
    container: "border-yellow-300 bg-yellow-50 text-yellow-950",
    icon: "text-yellow-700",
    chip: "border-yellow-300 bg-yellow-100 text-yellow-900",
  },
};

const MODEL_LABELS: Record<CitationChainModelId, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  perplexity: "Perplexity",
};

const SEVERITY_ICONS: Record<Exclude<EntityConfusionSeverity, "none">, typeof CircleAlert> = {
  high: ShieldAlert,
  medium: AlertTriangle,
  low: CircleAlert,
};

/**
 * Props for the `EntityConfusionAlert` component.
 */
export interface EntityConfusionAlertProps {
  /** Confusion analysis result from `detectEntityConfusion`. */
  result: EntityConfusionResult;
  /** Optional wrapper class names. */
  className?: string;
}

/**
 * Render an entity confusion warning banner when confusion is detected.
 */
export function EntityConfusionAlert({ result, className }: EntityConfusionAlertProps) {
  if (!result.isConfused) {
    return null;
  }

  const severity = result.severity === "none" ? "low" : result.severity;
  const styles = SEVERITY_STYLES[severity];
  const confusedEntityCount = result.confusedEntities.length;
  const affectedModels = collectAffectedModels(result);
  const SeverityIcon = SEVERITY_ICONS[severity];

  return (
    <section
      role="alert"
      aria-live="polite"
      className={cn("rounded-2xl border p-5 shadow-sm", styles.container, className)}
      data-severity={severity}
    >
      <div className="flex items-start gap-3">
        <SeverityIcon className={cn("mt-0.5 h-5 w-5 shrink-0", styles.icon)} aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">Entity confusion detected</h3>
          <p className="mt-1 text-sm leading-relaxed">
            {confusedEntityCount > 0
              ? `${confusedEntityCount} similarly named ${
                confusedEntityCount === 1 ? "entity was" : "entities were"
              } detected across ${formatModelList(affectedModels)}.`
              : `Only ${result.correctIdentificationRate}% of models identified the correct company.`}
          </p>
        </div>
      </div>

      {result.confusedEntities.length > 0 && (
        <ul className="mt-4 space-y-2">
          {result.confusedEntities.map((entity) => (
            <li key={entity.name} className="rounded-xl border border-current/25 bg-white/65 p-3">
              <p className="text-sm font-semibold">{entity.name}</p>
              <p className="mt-1 text-xs text-current/90">
                Mentioned in {formatModelList(entity.mentionedInModels)}
              </p>
              <p className="mt-1 text-xs text-current/80">{entity.evidenceSnippet}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-current/80">
          Severity
        </span>
        <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", styles.chip)}>
          {severity}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-current/90">{result.recommendation}</p>

      <details className="mt-4 rounded-xl border border-current/20 bg-white/60 p-3">
        <summary className="cursor-pointer text-sm font-semibold">Learn more</summary>
        <p className="mt-2 text-xs leading-relaxed text-current/90">
          When AI attributes salaries, benefits, or employee sentiment to the wrong company,
          candidates can form incorrect perceptions. This creates brand risk, legal exposure, and
          avoidable hiring conversion loss. Consistent legal entity naming, domain references, and
          structured data help models disambiguate your business from similarly named entities.
        </p>
      </details>
    </section>
  );
}

function collectAffectedModels(result: EntityConfusionResult): CitationChainModelId[] {
  const modelSet = new Set<CitationChainModelId>();

  for (const entity of result.confusedEntities) {
    for (const modelId of entity.mentionedInModels) {
      modelSet.add(modelId);
    }
  }

  return Array.from(modelSet).sort((left, right) => left.localeCompare(right));
}

function formatModelList(modelIds: CitationChainModelId[]): string {
  if (modelIds.length === 0) {
    return "the evaluated models";
  }

  const labels = modelIds.map((modelId) => MODEL_LABELS[modelId] ?? modelId);
  if (labels.length === 1) {
    return labels[0] ?? "";
  }

  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1] ?? ""}`;
}
