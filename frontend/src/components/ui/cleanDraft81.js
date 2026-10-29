/** Corrige Markdown superficial en el texto editable, sin modificar datos clínicos. */
export function cleanDraft81(raw) {
  return String(raw ?? '')
    .replace(/\*\*([\s\S]*?)\*\*/g, '$1')
    .replace(/__([^\n]*?)__/g, '$1')
    .replace(/^\s*#{1,5}\s+/gm, '')
    .replace(/^```(?:json)?\s*$/gmi, '')
    .trim();
}
