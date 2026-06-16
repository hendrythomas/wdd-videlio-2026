/**
 * Decodeert HTML die WordPress teruggeeft via de REST API.
 * Gebruik dit overal waar je post.title.rendered of vergelijkbare
 * WordPress velden weergeeft.
 * 
 * Bron: ClaudeAI
 */
export function decodeHtml(html) {
  if (!html) return '';

  const entities = {
    '&#8211;': '–',
    '&#8212;': '—',
    '&#8216;': '\u2018',
    '&#8217;': '\u2019',
    '&#8220;': '\u201C',
    '&#8221;': '\u201D',
    '&#8230;': '…',
    '&#039;': "'",
    '&#39;': "'",
    '&nbsp;': ' ',
    '&amp;': '&',
    '&quot;': '"',
    '&lt;': '<',
    '&gt;': '>',
  };

  let result = html;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.split(entity).join(char);
  }

  result = result.replace(/&#(\d+);/g, (_, code) =>
    String.fromCharCode(parseInt(code, 10))
  );

  return result;
}

/**
 * Strip alle HTML tags uit een string (bijv. voor excerpts).
 * Decodeert ook automatisch entities.
 */
export function stripHtml(html) {
  if (!html) return '';
  return decodeHtml(html.replace(/<[^>]*>/g, '').trim());
}