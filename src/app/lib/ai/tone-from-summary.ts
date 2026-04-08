/**
 * Map the TONE line from the summarization template to auto-reply tone keys.
 * Safe for client and server.
 */

export type ReplyToneKey = 'professional' | 'friendly' | 'concise' | 'detailed';

export function inferReplyToneFromSummary(summary: string): ReplyToneKey {
  if (!summary || typeof summary !== 'string') return 'professional';
  const toneSection =
    summary.match(/\bTONE\s*\n+\s*([^\n]+)/im) ||
    summary.match(/\bTONE[:\s]+\s*([^\n]+)/im);
  const phrase = (toneSection?.[1] || '').toLowerCase();
  if (!phrase.trim()) return 'professional';
  if (/casual|warm|friendly|conversational|informal/.test(phrase)) return 'friendly';
  if (/brief|short|concise|minimal|terse/.test(phrase)) return 'concise';
  if (/detailed|thorough|lengthy|comprehensive/.test(phrase)) return 'detailed';
  if (/negotiat|urgent|directive|firm/.test(phrase)) return 'professional';
  if (/formal|professional|business|polished/.test(phrase)) return 'professional';
  return 'professional';
}
