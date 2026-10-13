import Dexie, { type EntityTable } from "dexie";

export interface SavedMediaItem {
  id?: number;
  type: "reflection" | "dialogue" | "multiscene" | "general";
  title: string;
  category?: string;
  quote?: string;
  quoteLines?: Array<{ text: string; color?: string; style?: string; is_highlight?: boolean }>;
  imagePrompt?: string;
  imagePromptClean?: string;
  imageBase64?: string; // Cache de la imagen renderizada
  scriptNarration?: string;
  audioBase64?: string; // Cache del audio MP3
  hashtags?: string[];
  scenes?: Array<{
    sceneNumber: number;
    slideText: string;
    speechText: string;
    imagePrompt: string;
    imageBase64?: string;
  }>;
  createdAt: number;
  favorite?: boolean;
}

const db = new Dexie("ShortIADatabase") as Dexie & {
  mediaItems: EntityTable<SavedMediaItem, "id">;
};

// Definir schema de Dexie
db.version(1).stores({
  mediaItems: "++id, type, title, category, createdAt, favorite"
});

export { db };

// Métodos auxiliares de acceso a memoria
export async function saveMediaItem(item: Omit<SavedMediaItem, "id" | "createdAt">): Promise<number> {
  const id = await db.mediaItems.add({
    ...item,
    createdAt: Date.now(),
    favorite: false
  });
  return Number(id);
}

export async function getRecentMediaItems(limit: number = 30): Promise<SavedMediaItem[]> {
  return await db.mediaItems.orderBy("createdAt").reverse().limit(limit).toArray();
}

export async function deleteMediaItem(id: number): Promise<void> {
  await db.mediaItems.delete(id);
}

export async function toggleFavoriteMediaItem(id: number, currentFav: boolean): Promise<void> {
  await db.mediaItems.update(id, { favorite: !currentFav });
}
