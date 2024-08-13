export const stripQuotes = (inputString: string | null | undefined): string => {
  if (!inputString) return "";

  const quoteChars = new Set([
    '"',
    "'",
    "`",
    "‘",
    "’",
    "“",
    "”",
    "‚",
    "„",
    "‛",
    "‟",
    "‹",
    "›",
    "«",
    "»",
    "′",
    "″",
    "‴",
    "⁗",
  ]);

  const trimmedString = inputString.trim();

  const firstChar = trimmedString.charAt(0);
  const lastChar = trimmedString.charAt(trimmedString.length - 1);

  if (quoteChars.has(firstChar) && quoteChars.has(lastChar)) {
    return trimmedString.substring(1, trimmedString.length - 1);
  }

  return trimmedString;
};

/**
 * Replaces ellipses with three periods.
 */
export function replaceEllipses(text: string): string {
  return text.replace(/…/g, "...");
}
