export const RESEARCH_API_ENABLED = process.env.TIKTOK_RESEARCH_API_ENABLED === 'true';

export async function fetchResearchApiSignals(_keywords: string[]): Promise<any[]> {
  if (!RESEARCH_API_ENABLED) return [];
  return [];
}
