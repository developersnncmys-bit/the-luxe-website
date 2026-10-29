// Clients for the House-page content: the singleton document + two list
// collections (materials, craft principles). The admin's "The House" tab
// edits all three.

import { apiFetch } from "./api";

// ---------- Singleton house content ----------
// Backed by /api/house-content (singleton document). Carries section
// headers/lead paragraphs for Materials + Craft, plus the brand story block.

export type HouseContent = {
  materialsHeadline?: string;
  materialsLead?: string;
  craftHeadline?: string;
  craftLead?: string;
  craftImage?: string;
  craftImageAttribution?: string;
  storyPullQuote?: string;
  storyBody?: string;
};

export async function fetchHouseContent(): Promise<HouseContent> {
  // Backend auto-creates the singleton on first GET, so this always resolves
  // to a valid object (possibly with every field blank).
  return await apiFetch<HouseContent>("/api/house-content");
}

// ---------- Materials ----------
// Backed by /api/materials. Each entry is a card in the Materials grid on
// The House page.

export type Material = {
  id: string; // slug
  name: string;
  description?: string;
  image?: string;
  order?: number;
};

type MaterialsResponse = { items: Material[]; total: number };

export async function fetchMaterials(): Promise<Material[]> {
  const { items } = await apiFetch<MaterialsResponse>("/api/materials");
  // Backend sorts by { order: 1, name: 1 } — keep that.
  return items;
}

// ---------- Craft principles ----------
// Backed by /api/craft-principles. Each entry is one row in the numbered
// list on the Craft section.

export type CraftPrinciple = {
  id: string; // slug
  title: string;
  body?: string;
  order?: number;
};

type CraftPrinciplesResponse = { items: CraftPrinciple[]; total: number };

export async function fetchCraftPrinciples(): Promise<CraftPrinciple[]> {
  const { items } = await apiFetch<CraftPrinciplesResponse>("/api/craft-principles");
  return items;
}
