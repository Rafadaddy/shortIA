"use client";

export interface HistoryItem {
  id: string;
  category: string; // "Videos Infantiles", "Naturaleza Salvaje", "Videos Motivacionales", "Reflexiones", etc.
  title: string;
  subtitle?: string;
  createdAt: number;
  script?: string;
  prompts?: {
    scene_number?: number;
    title?: string;
    image_prompt?: string;
    animation_prompt?: string;
    narration?: string;
  }[];
  metadata?: Record<string, unknown>;
}

const STORAGE_KEY = "shortia_creations_history";
const MAX_HISTORY_ITEMS = 60;

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("[HistoryStorage] Error loading history:", e);
    return [];
  }
}

export function saveHistoryItem(item: Omit<HistoryItem, "id" | "createdAt"> & { id?: string }): HistoryItem {
  if (typeof window === "undefined") return item as HistoryItem;
  try {
    const history = getHistory();
    const newItem: HistoryItem = {
      ...item,
      id: item.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };

    // Si ya existe uno con el mismo id o título muy similar reciente, lo reemplaza
    const existingIndex = history.findIndex(h => h.id === newItem.id || (h.category === newItem.category && h.title === newItem.title));
    let updated: HistoryItem[];
    if (existingIndex !== -1) {
      updated = [newItem, ...history.filter((_, idx) => idx !== existingIndex)];
    } else {
      updated = [newItem, ...history];
    }

    if (updated.length > MAX_HISTORY_ITEMS) {
      updated = updated.slice(0, MAX_HISTORY_ITEMS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newItem;
  } catch (e) {
    console.error("[HistoryStorage] Error saving item:", e);
    return item as HistoryItem;
  }
}

export function deleteHistoryItem(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const history = getHistory();
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("[HistoryStorage] Error deleting item:", e);
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("[HistoryStorage] Error clearing history:", e);
  }
}
