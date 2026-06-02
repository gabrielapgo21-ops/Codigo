/**
 * Tiny, dependency-free SRT parser.
 * Returns cues with absolute start/end in seconds (matching the narration timeline).
 */

export type Caption = {
  index: number;
  startSec: number;
  endSec: number;
  text: string;
};

const timeToSec = (t: string): number => {
  // 00:00:01,500  (comma or dot for ms)
  const m = t.trim().match(/(\d+):(\d+):(\d+)[,.](\d+)/);
  if (!m) return 0;
  const [, hh, mm, ss, ms] = m;
  return (
    Number(hh) * 3600 +
    Number(mm) * 60 +
    Number(ss) +
    Number(ms) / 10 ** ms.length
  );
};

export const parseSrt = (raw: string): Caption[] => {
  const cues: Caption[] = [];
  // Normalize line endings, split on blank lines.
  const blocks = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.split('\n').filter((l) => l.length > 0);
    if (lines.length < 2) continue;

    // First line may be the numeric index (optional in some SRTs).
    let cursor = 0;
    let index = cues.length + 1;
    if (/^\d+$/.test(lines[0].trim())) {
      index = Number(lines[0].trim());
      cursor = 1;
    }

    const timeLine = lines[cursor];
    const tm = timeLine.match(/(.+?)-->(.+)/);
    if (!tm) continue;

    const startSec = timeToSec(tm[1]);
    const endSec = timeToSec(tm[2]);
    const text = lines
      .slice(cursor + 1)
      .join('\n')
      // strip basic SRT/HTML markup
      .replace(/<[^>]+>/g, '')
      .trim();

    if (!text) continue;
    cues.push({index, startSec, endSec, text});
  }

  return cues;
};
