import { LocalStorage } from "@raycast/api";
import type { QuickWeightResult } from "@ferroscale/metal-core/quick";

export const HISTORY_KEY = "ferroscale-recent-calculations";
const MAX_HISTORY = 10;

export interface HistoryEntry {
  query: string;
  result: QuickWeightResult;
  timestamp: number;
}

export function normalizeHistoryResult(
  result: QuickWeightResult,
): QuickWeightResult {
  const totalWeightTonne =
    result.totalWeightTonne ?? result.totalWeightKg / 1000;
  const linearDensityKgPerM =
    result.linearDensityKgPerM ??
    (result.lengthMm > 0 ? result.unitWeightKg / (result.lengthMm / 1000) : 0);

  return { ...result, totalWeightTonne, linearDensityKgPerM };
}

export async function loadCalculationHistory(): Promise<HistoryEntry[]> {
  const raw = await LocalStorage.getItem<string>(HISTORY_KEY);
  if (!raw) return [];

  try {
    const entries = JSON.parse(raw) as HistoryEntry[];
    return entries.map((entry) => ({
      ...entry,
      result: normalizeHistoryResult(entry.result),
    }));
  } catch {
    return [];
  }
}

export async function saveCalculationHistory(
  entries: HistoryEntry[],
): Promise<void> {
  await LocalStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

export async function saveCalculationToHistory(
  query: string,
  result: QuickWeightResult,
): Promise<HistoryEntry[]> {
  const existing = await loadCalculationHistory();
  const entry: HistoryEntry = {
    query,
    result: normalizeHistoryResult(result),
    timestamp: Date.now(),
  };
  const filtered = existing.filter((item) => item.query !== query);
  const updated = [entry, ...filtered].slice(0, MAX_HISTORY);

  await saveCalculationHistory(updated);
  return updated;
}

export async function removeCalculationHistoryEntry(
  entries: HistoryEntry[],
  timestamp: number,
): Promise<HistoryEntry[]> {
  const updated = entries.filter((entry) => entry.timestamp !== timestamp);
  await saveCalculationHistory(updated);
  return updated;
}

export async function clearCalculationHistory(): Promise<void> {
  await LocalStorage.removeItem(HISTORY_KEY);
}
