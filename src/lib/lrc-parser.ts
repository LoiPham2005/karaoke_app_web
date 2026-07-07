// Parser cho định dạng LRC.
//
// Mỗi dòng có thể có 1 hoặc nhiều timestamp ở đầu, ví dụ:
//   [00:12.34] Lời bài hát
//   [00:12.34][01:05.00] Đoạn điệp khúc lặp lại
// Timestamp dạng [mm:ss.xx] hoặc [mm:ss.xxx] (xx/xxx là phần trăm/phần nghìn giây),
// phần thập phân có thể bỏ qua ([mm:ss]).
//
// Các dòng metadata ([ar:], [ti:], [al:], [by:], [offset:]...) không có timestamp
// thời gian sẽ bị loại bỏ. Dòng rỗng cũng bị bỏ.

export interface LyricLine {
  time: number; // giây
  text: string;
}

// Bắt từng tag thời gian [mm:ss], [mm:ss.xx], [mm:ss.xxx] ở đầu dòng.
const TIME_TAG = /\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;

/** Parse chuỗi LRC → mảng { time, text } đã sort tăng dần theo time. */
export function parseLrc(lrc: string): LyricLine[] {
  if (!lrc) return [];

  const result: LyricLine[] = [];

  for (const rawLine of lrc.split(/\r?\n/)) {
    // Reset lastIndex vì regex có cờ /g và dùng lại qua nhiều vòng lặp.
    TIME_TAG.lastIndex = 0;

    const times: number[] = [];
    let match: RegExpExecArray | null;
    let lastTagEnd = 0;

    while ((match = TIME_TAG.exec(rawLine)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      // Phần thập phân: "5" → 0.5s, "05" → 0.05s, "050" → 0.050s.
      const frac = match[3] ? parseInt(match[3], 10) / Math.pow(10, match[3].length) : 0;
      times.push(minutes * 60 + seconds + frac);
      lastTagEnd = TIME_TAG.lastIndex;
    }

    // Không có timestamp hợp lệ → metadata hoặc rác → bỏ.
    if (times.length === 0) continue;

    const text = rawLine.slice(lastTagEnd).trim();
    if (!text) continue; // dòng rỗng (chỉ có timestamp) → bỏ.

    for (const time of times) {
      result.push({ time, text });
    }
  }

  return result.sort((a, b) => a.time - b.time);
}
