// Zero-dependency PNG icon generator for MAMMOVIE.
// Draws a pink maskable icon with a stylised ribbon. Uses Node's built-in zlib only.
const zlib = require('zlib')
const fs = require('fs')

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1))
  }
  return ~c >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const body = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function makePNG(size, draw) {
  const bytesPerPixel = 4
  const stride = size * bytesPerPixel
  // raw image data with a filter byte (0) at the start of each row
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0 // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = draw(x, y, size)
      const off = y * (stride + 1) + 1 + x * bytesPerPixel
      raw[off] = r; raw[off + 1] = g; raw[off + 2] = b; raw[off + 3] = a
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8        // bit depth
  ihdr[9] = 6        // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const idat = zlib.deflateSync(raw, { level: 9 })
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

// Colours
const BG = [216, 27, 96]      // pink-600
const BG2 = [160, 18, 71]     // pink-900 (gradient bottom)
const RIBBON = [255, 255, 255]

// Classic awareness ribbon: two thin strokes that cross near the top,
// forming an open loop above the crossing and two tails below.
function ribbonAlpha(x, y, size) {
  const cx = size / 2
  const nx = (x - cx) / (size * 0.5)
  const ny = (y - size * 0.5) / (size * 0.5)
  const w = 0.085 // stroke half-width (thinner = more ribbon-like)

  // Tails below the crossing (crossing point around ny = -0.1)
  const cross = -0.12
  let on = false
  if (ny > cross) {
    const legL = Math.abs((nx) - 0.42 * (ny - cross))   // goes down-right
    const legR = Math.abs((nx) + 0.42 * (ny - cross))   // goes down-left
    if ((legL < w || legR < w) && ny < 0.92) on = true
  }
  // Open loop above the crossing: an arc (ring segment), not a filled dome
  const loopCx = 0, loopCy = cross - 0.26
  const lx = nx - loopCx, ly = ny - loopCy
  const rr = Math.sqrt(lx * lx + ly * ly)
  const ang = Math.atan2(ly, lx) // -pi..pi
  // draw ring where radius matches and angle is in the lower 3/4 (open at very top)
  if (Math.abs(rr - 0.3) < w && ly < 0.34) on = true
  return on
}

function draw(x, y, size) {
  const r = size / 2
  const dx = x - r, dy = y - r
  const dist = Math.sqrt(dx * dx + dy * dy)
  // maskable: fill whole square (safe zone). Rounded look via subtle vignette only.
  // vertical gradient background
  const tg = y / size
  const bg = [
    Math.round(BG[0] + (BG2[0] - BG[0]) * tg),
    Math.round(BG[1] + (BG2[1] - BG[1]) * tg),
    Math.round(BG[2] + (BG2[2] - BG[2]) * tg),
  ]
  if (ribbonAlpha(x, y, size)) return [RIBBON[0], RIBBON[1], RIBBON[2], 255]
  return [bg[0], bg[1], bg[2], 255]
}

for (const size of [192, 512]) {
  const png = makePNG(size, draw)
  fs.writeFileSync(`public/icon-${size}.png`, png)
  console.log(`wrote public/icon-${size}.png (${png.length} bytes)`)
}
