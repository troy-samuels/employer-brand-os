export async function trackPixelEvent(event_type: string, event_data: Record<string, unknown>) {
  return {
    success: true,
    event_type,
    event_data,
    timestamp: new Date().toISOString(),
  };
}
