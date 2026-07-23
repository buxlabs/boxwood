// Characters that do not decompose to ASCII via NFD normalization
const CHARACTER_MAP = {
  ł: "l",
  Ł: "L",
  ø: "o",
  Ø: "O",
  đ: "d",
  Đ: "D",
  ß: "ss",
  æ: "ae",
  Æ: "AE",
  œ: "oe",
  Œ: "OE",
}

// Combining diacritical marks left over after NFD normalization
const DIACRITICS_REGEXP = /[̀-ͯ]/g

/**
 * Convert a heading text into a URL-friendly anchor slug
 * "Mój tytuł" -> "moj-tytul"
 * @param {string} text - The text to slugify
 * @returns {string} - The slug (may be empty for non-alphanumeric input)
 */
function slugify(text) {
  if (!text || typeof text !== "string") {
    return ""
  }

  return text
    .replace(/[łŁøØđĐßæÆœŒ]/g, (character) => CHARACTER_MAP[character])
    .normalize("NFD")
    .replace(DIACRITICS_REGEXP, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

module.exports = { slugify }
