/**
 * Minimal QR code encoder — byte mode, EC level M, versions 1–5.
 * Enough capacity for ticket codes and short URLs (up to 84 chars).
 * Returns a boolean module matrix; rendering is left to the caller.
 */

type Version = 1 | 2 | 3 | 4 | 5;

// EC level M block structure per version: [dataCodewords, ecPerBlock, blocks]
const EC_M: Record<Version, { data: number; ecPerBlock: number; blocks: number }> = {
  1: { data: 16, ecPerBlock: 10, blocks: 1 },
  2: { data: 28, ecPerBlock: 16, blocks: 1 },
  3: { data: 44, ecPerBlock: 26, blocks: 1 },
  4: { data: 64, ecPerBlock: 18, blocks: 2 },
  5: { data: 86, ecPerBlock: 24, blocks: 2 },
};

const ALIGNMENT: Record<Version, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
};

// ─── GF(256) arithmetic for Reed–Solomon ───
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGeneratorPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], GF_EXP[i]);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly.reverse(); // highest degree first, constant last
}

function rsEncode(data: number[], ecLen: number): number[] {
  const gen = rsGeneratorPoly(ecLen);
  const rem = new Array(ecLen).fill(0);
  for (const byte of data) {
    const factor = byte ^ rem.shift()!;
    rem.push(0);
    for (let i = 0; i < ecLen; i++) rem[i] ^= gfMul(gen[i + 1], factor);
  }
  return rem;
}

// ─── Bit buffer ───
class BitBuffer {
  bits: number[] = [];
  push(value: number, length: number) {
    for (let i = length - 1; i >= 0; i--) this.bits.push((value >> i) & 1);
  }
}

function buildCodewords(text: string, version: Version): number[] {
  const bytes = new TextEncoder().encode(text);
  const { data: dataLen } = EC_M[version];
  const buf = new BitBuffer();
  buf.push(0b0100, 4); // byte mode
  buf.push(bytes.length, 8); // char count (8 bits for v1–9 byte mode)
  for (const b of bytes) buf.push(b, 8);

  const capacityBits = dataLen * 8;
  // terminator (up to 4 zero bits)
  buf.push(0, Math.min(4, capacityBits - buf.bits.length));
  while (buf.bits.length % 8 !== 0) buf.bits.push(0);

  const codewords: number[] = [];
  for (let i = 0; i < buf.bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | buf.bits[i + j];
    codewords.push(byte);
  }
  const pads = [0xec, 0x11];
  let p = 0;
  while (codewords.length < dataLen) codewords.push(pads[p++ % 2]);
  return codewords;
}

function interleave(codewords: number[], version: Version): number[] {
  const { ecPerBlock, blocks } = EC_M[version];
  const perBlock = Math.floor(codewords.length / blocks);
  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];
  for (let b = 0; b < blocks; b++) {
    const block = codewords.slice(b * perBlock, (b + 1) * perBlock);
    dataBlocks.push(block);
    ecBlocks.push(rsEncode(block, ecPerBlock));
  }
  const out: number[] = [];
  for (let i = 0; i < perBlock; i++) for (let b = 0; b < blocks; b++) out.push(dataBlocks[b][i]);
  for (let i = 0; i < ecPerBlock; i++) for (let b = 0; b < blocks; b++) out.push(ecBlocks[b][i]);
  return out;
}

// ─── Matrix construction ───
type Matrix = (boolean | null)[][]; // null = unset data module

function makeMatrix(version: Version): { m: Matrix; func: boolean[][] } {
  const size = version * 4 + 17;
  const m: Matrix = Array.from({ length: size }, () => new Array(size).fill(null));
  const func: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));

  function set(r: number, c: number, v: boolean) {
    m[r][c] = v;
    func[r][c] = true;
  }

  function finder(r: number, c: number) {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        const inRing =
          dr >= 0 &&
          dr <= 6 &&
          dc >= 0 &&
          dc <= 6 &&
          (dr === 0 || dr === 6 || dc === 0 || dc === 6);
        const inCore = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        set(rr, cc, inRing || inCore);
      }
    }
  }
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);

  // timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!func[6][i]) set(6, i, i % 2 === 0);
    if (!func[i][6]) set(i, 6, i % 2 === 0);
  }

  // alignment patterns
  const centers = ALIGNMENT[version];
  for (const r of centers) {
    for (const c of centers) {
      if (func[r][c]) continue; // overlaps a finder
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
        }
      }
    }
  }

  // dark module + reserve format info areas
  set(size - 8, 8, true);
  for (let i = 0; i < 9; i++) {
    if (!func[8][i]) set(8, i, false);
    if (!func[i][8]) set(i, 8, false);
  }
  for (let i = 0; i < 8; i++) {
    if (!func[8][size - 1 - i]) set(8, size - 1 - i, false);
    if (!func[size - 1 - i][8]) set(size - 1 - i, 8, false);
  }

  return { m, func };
}

function placeData(m: Matrix, func: boolean[][], codewords: number[]) {
  const size = m.length;
  let bitIndex = 0;
  const totalBits = codewords.length * 8;
  let upward = true;
  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col = 5; // skip timing column
    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i;
      for (const c of [col, col - 1]) {
        if (func[row][c]) continue;
        let bit = false;
        if (bitIndex < totalBits) {
          bit = ((codewords[bitIndex >> 3] >> (7 - (bitIndex & 7))) & 1) === 1;
        }
        m[row][c] = bit;
        bitIndex++;
      }
    }
    upward = !upward;
  }
}

const MASKS: ((r: number, c: number) => boolean)[] = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function formatBits(mask: number): number {
  // EC level M = 0b00
  const data = (0b00 << 3) | mask;
  let rem = data << 10;
  const gen = 0b10100110111;
  for (let i = 14; i >= 10; i--) {
    if ((rem >> i) & 1) rem ^= gen << (i - 10);
  }
  return ((data << 10) | rem) ^ 0b101010000010010;
}

function drawFormat(m: Matrix, mask: number) {
  const size = m.length;
  const bits = formatBits(mask);
  const bit = (i: number) => ((bits >> i) & 1) === 1;

  // around top-left finder (bit 14 → bit 0)
  const coordsA: [number, number][] = [
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 7],
    [8, 8],
    [7, 8],
    [5, 8],
    [4, 8],
    [3, 8],
    [2, 8],
    [1, 8],
    [0, 8],
  ];
  // split copy: bottom-left column + top-right row
  const coordsB: [number, number][] = [
    [size - 1, 8],
    [size - 2, 8],
    [size - 3, 8],
    [size - 4, 8],
    [size - 5, 8],
    [size - 6, 8],
    [size - 7, 8],
    [8, size - 8],
    [8, size - 7],
    [8, size - 6],
    [8, size - 5],
    [8, size - 4],
    [8, size - 3],
    [8, size - 2],
    [8, size - 1],
  ];
  coordsA.forEach(([r, c], i) => {
    m[r][c] = bit(14 - i);
  });
  coordsB.forEach(([r, c], i) => {
    m[r][c] = bit(14 - i);
  });
}

function penalty(m: boolean[][]): number {
  const size = m.length;
  let score = 0;

  // rule 1: runs of same color ≥5 in row/col
  for (let axis = 0; axis < 2; axis++) {
    for (let i = 0; i < size; i++) {
      let run = 1;
      for (let j = 1; j < size; j++) {
        const cur = axis === 0 ? m[i][j] : m[j][i];
        const prev = axis === 0 ? m[i][j - 1] : m[j - 1][i];
        if (cur === prev) {
          run++;
          if (j === size - 1 && run >= 5) score += run - 2;
        } else {
          if (run >= 5) score += run - 2;
          run = 1;
        }
      }
    }
  }

  // rule 2: 2×2 blocks
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      if (m[r][c] === m[r][c + 1] && m[r][c] === m[r + 1][c] && m[r][c] === m[r + 1][c + 1]) {
        score += 3;
      }
    }
  }

  // rule 3: finder-like patterns 1011101 with 4 light modules on either side
  const pat1 = [true, false, true, true, true, false, true, false, false, false, false];
  const pat2 = [...pat1].reverse();
  for (let axis = 0; axis < 2; axis++) {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j <= size - 11; j++) {
        for (const pat of [pat1, pat2]) {
          let match = true;
          for (let k = 0; k < 11; k++) {
            const v = axis === 0 ? m[i][j + k] : m[j + k][i];
            if (v !== pat[k]) {
              match = false;
              break;
            }
          }
          if (match) score += 40;
        }
      }
    }
  }

  // rule 4: dark module proportion
  let dark = 0;
  for (const row of m) for (const v of row) if (v) dark++;
  const percent = (dark * 100) / (size * size);
  score += Math.floor(Math.abs(percent - 50) / 5) * 10;
  return score;
}

/** Encode text into a QR module matrix (true = dark). Throws if text is too long. */
export function encodeQR(text: string): boolean[][] {
  const byteLen = new TextEncoder().encode(text).length;
  let version: Version | null = null;
  for (const v of [1, 2, 3, 4, 5] as Version[]) {
    // capacity = data codewords − 2 (mode + count overhead)
    if (byteLen <= EC_M[v].data - 2) {
      version = v;
      break;
    }
  }
  if (!version) throw new Error(`QR payload too long: ${byteLen} bytes`);

  const codewords = interleave(buildCodewords(text, version), version);
  const { m, func } = makeMatrix(version);
  placeData(m, func, codewords);

  let best: boolean[][] | null = null;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const candidate: boolean[][] = m.map((row, r) =>
      row.map((v, c) => {
        const val = v === null ? false : v;
        return func[r][c] ? val : val !== MASKS[mask](r, c);
      }),
    );
    // format info is drawn after masking (it is never masked)
    const withFormat = candidate.map((row) => [...row]);
    drawFormat(withFormat as Matrix, mask);
    const score = penalty(withFormat);
    if (score < bestScore) {
      bestScore = score;
      best = withFormat;
    }
  }
  return best!;
}
