// Dotted world map, generated once with the "dotted-map" package (height 56,
// diagonal grid). Each string is one row of dots, packed four columns per hex
// digit. Odd rows sit half a column to the left of even rows.
export const MAP_WIDTH = 111;
export const MAP_HEIGHT = 56;
export const MAP_ROW_STEP = 0.8660254;

export const MAP_ROWS: string[] = [
  '100078bf03ff00008042ffffffc0',
  '3f803ecfc3ff8001c003fffffff8',
  '7fdf3ddb81fe0007e00afffffffe',
  '7fffc968c3fc0007fa7d7ffffffe',
  '7ffffffbc3f0000ffbfefffffffe',
  '5ffffff0e3f0a00fe9fffffffffe',
  'fffffff383c0e01ee7fffffffffe',
  '1fffffd0c1e0601efffffffffffe',
  '7fffff8081800039fffffffffffe',
  '7fffff8300c0003dfffffffffff6',
  'ffffff038000007d7fffffffffe6',
  '383fff83a000002cfffffffffe24',
  '101fff83e0000218fffffffffc18',
  '100fffe1f0000219fffffffff81c',
  '400ffff7f0000627fffffffff018',
  '0007fffbfc00073ffffffffffe08',
  '0007fffff800037ffffffffffe10',
  '0003ffffc40000fffffffffffd00',
  '0003ffffcc0003fffffffffffe00',
  '0001ffffe00001fff73ffffffc00',
  '0001ffffa00001ff8efffffff200',
  '0001ffff8000078b837fffffe200',
  '0003fffe0000072a7f7ffffec000',
  '0001fffe000007017f3ffffe4200',
  '0001fffc000004e07ffffffe4400',
  '0000fffc000003e00fffffff1000',
  '00007ff800000ffa1fffffff0000',
  '00001fc8000007ffff7fffff0000',
  '00001e0800001fffff7ffffe0000',
  '00000f0000001fffefabfffe0000',
  '00000e0800003fffefe3fffd0000',
  '0000072000001ffff7e0f9e00000',
  '000003c000003ffff7c0e1e10000',
  '0000007000003ffffb80c0f00000',
  '0000001000003ffffc00c0f18000',
  '00000001c0001fffff8040000000',
  '00000003f0001fffff0020808000',
  '00000003fe00053fff0000420000',
  '00000003fe00001ffe0000cc0000',
  '00000007ff00001ffc00004e0000',
  '00000007ffc0001ff800006d1c40',
  '00000007fff0000ff80000208340',
  '00000007fff0000ff000000c0200',
  '00000003fff00007f80000000004',
  '00000003ffe0000ff80000001200',
  '00000001ffe0000ff90000007900',
  '00000000ffc0001ff3000000ff00',
  '000000007fe0000ff1000003ff82',
  '00000000ff80000fe2000007ff80',
  '000000007f000007e0000007ffe0',
  '00000000fe000007c0000007ffc0',
  '00000000fe000003c0000003ffe0',
  '00000000fc000007800000038fc0',
  '00000000f80000000000000207c0',
  '00000001f8000000000000000380',
  '00000000e0000000000000000000',
  '00000001e0000000000000000100',
  '00000001e0000000000000000080',
  '00000001c0000000000000000000',
  '00000001c0000000000000000000',
  '0000000180000000000000000000',
  '0000000180000000000000000000',
  '0000000190000000000000000000',
  '00000000c0000000000000000000',
  '00000000c0000000000000000000',
];

export interface MapDot {
  x: number;
  y: number;
}

/** Unpacks MAP_ROWS into dot centres in map units. */
export function decodeMapDots(): MapDot[] {
  const dots: MapDot[] = [];
  MAP_ROWS.forEach((row, r) => {
    const offset = r % 2 === 0 ? 0.5 : 0;
    for (let i = 0; i < row.length; i++) {
      const nibble = parseInt(row[i], 16);
      for (let b = 0; b < 4; b++) {
        if (nibble & (8 >> b)) dots.push({ x: i * 4 + b + offset, y: r * MAP_ROW_STEP });
      }
    }
  });
  return dots;
}

export interface MapCity extends MapDot {
  name: string;
}

export const MAP_CITIES: MapCity[] = [
  { name: 'Nairobi', x: 68, y: 33.77 },
  { name: 'Lagos', x: 56.5, y: 31.18 },
  { name: 'Johannesburg', x: 65, y: 42.44 },
  { name: 'Cairo', x: 66, y: 23.38 },
  { name: 'London', x: 55.5, y: 13.86 },
  { name: 'Frankfurt', x: 58, y: 14.72 },
  { name: 'Madrid', x: 54.5, y: 19.05 },
  { name: 'New York', x: 31.5, y: 19.05 },
  { name: 'San Francisco', x: 15, y: 19.92 },
  { name: 'Toronto', x: 29.5, y: 17.32 },
  { name: 'São Paulo', x: 40.5, y: 41.57 },
  { name: 'Dubai', x: 74, y: 25.11 },
  { name: 'Mumbai', x: 79.5, y: 27.71 },
  { name: 'Singapore', x: 89.5, y: 32.91 },
  { name: 'Tokyo', x: 101.5, y: 20.78 },
  { name: 'Sydney', x: 105, y: 45.9 },
];
