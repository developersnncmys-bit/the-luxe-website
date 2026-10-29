// Thin client for /api/journal — the admin's Journal / Studio entries that
// back the StudioShowcase on the /journal (The Studio) page.

import { apiFetch } from "./api";

export type JournalEntry = {
  id: string;          // slug
  name: string;        // title (shown as the big uppercase heading)
  category?: string;   // small-caps label beside the number (e.g. "STUDIO", "OBJECT")
  region?: string;
  author?: string;
  hero?: string;       // main image shown on one side of the alternating layout
  // Additional angles gallery — thumbnails under the "N OTHER ANGLES" grid.
  images?: string[];
  pull_quote?: string;
  body?: string;       // description paragraph
  order?: number;
  active?: boolean;
};

type ListResponse = { items: JournalEntry[]; total: number };

export async function fetchJournalEntries(): Promise<JournalEntry[]> {
  const { items } = await apiFetch<ListResponse>("/api/journal");
  // Backend already sorts by { order, createdAt desc }. Filter inactive
  // defensively (backend already hides them from non-admin reads).
  return items.filter((e) => e.active !== false);
}
