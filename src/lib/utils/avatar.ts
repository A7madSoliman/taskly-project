/**
 * Derives a 2-character uppercase avatar initials string from a user's name.
 *
 * Rules:
 * - Multi-word name ("Mahmoud Taha") -> "MT" (first char of 1st word + first char of 2nd word)
 * - Single-word name ("Mahmoud") -> "MA" (first two chars of single word)
 * - Empty / unusable name -> "US" (default fallback)
 */
export function getInitials(name?: string | null): string {
  if (!name || typeof name !== "string") return "US";

  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "US";

  if (words.length === 1) {
    const word = words[0];
    if (word.length === 1) return word.toUpperCase() + "S";
    return word.slice(0, 2).toUpperCase();
  }

  const first = words[0][0] || "";
  const second = words[1][0] || "";
  const combined = (first + second).toUpperCase();

  return combined || "US";
}
