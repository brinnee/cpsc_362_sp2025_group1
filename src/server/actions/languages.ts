import { db } from "~/server/db";
import { sql } from "drizzle-orm";
import { languages } from "~/server/db/schema";
import type { Language } from "~/lib/types";

type LanguageIdObject = {
  languageId: number | null;
};

export async function getLanguagesByIds(ids: LanguageIdObject[]): Promise<Language[]> {
  // Check if ids array is empty
  if (!ids || ids.length === 0) {
    return [];
  }

  // Extract the languageId values from the array of objects
  const languageIds = ids.map(item => item.languageId).filter(Boolean);

  // Query for languages that match these IDs
  const results = await db
    .select({
      id: languages.id,
      name: languages.name,
    })
    .from(languages)
    .where(
      sql`${languages.id} IN (${sql.join(languageIds.map(id => sql`${id}`), sql`, `)})`
    );

  // Transform to match Language type
  const languagesData: Language[] = results.map(lang => ({
    value: lang.id.toString(),
    label: lang.name ?? "Unknown Language",
  }));

  return languagesData;
}