export function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatScore(value: number) {
  return `${value.toFixed(1)}/10`;
}

export function formatCurrency(min: number, max: number, currency = "USD") {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  return `${formatter.format(min)} - ${formatter.format(max)}`;
}
