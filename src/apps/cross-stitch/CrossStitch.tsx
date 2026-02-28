import { useState, useRef, useEffect, useCallback } from 'react'
import './CrossStitch.css'

// ── Types ────────────────────────────────────────────────────────────────────

type RGB = [number, number, number]

interface PaletteEntry {
  rgb: RGB
  symbol: string
  label: string
  type: 'full' | 'empty'
}

interface CrossStitchPattern {
  palette: PaletteEntry[]
  grid: number[]      // flat: grid[y * width + x] = palette index
  width: number
  height: number
}

// ── Symbol sets ──────────────────────────────────────────────────────────────

const FULL_SYMS = [
  '✕','●','■','▲','◆','★','♥','▼','✦','❋',
  '✿','⊕','⊗','◈','◉','▸','◂','⬟','⬢','⊞',
  '⊠','⊡','⊟','⋈','⋆','⌘','☀','✴','❖','◐',
  '◑','◒','◓','⬤','⬡','⬠','⬣','⊹','✶','✸',
  '✹','✺','✻','✼','✽','✾','❀','❁','❂','❃',
  '❄','❅','❆','❇','❈','❉','❊','✠','⁂','※',
  '⊛','⊜','⊝','▣','▤','▥','▦','⊢','⊣','⊤',
  '⊥','⊦','⊧','⊨','⊩','⊪','⊫','⊬','⊭','⊮',
  '⊯','⊰','⊱','⊲','⊳','⊴','⊵','⊶','⊷','⊸',
  '⊺','⊻','⊼','⊽','⊾','⋀','⋁','⋂','⋃','⋄',
]

// ── Colour name helper ───────────────────────────────────────────────────────

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return [0, 0, Math.round(l * 100)]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / d + 2) / 6
  else h = ((rn - gn) / d + 4) / 6
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function colorLabel(rgb: RGB, idx: number): string {
  const [h, s, l] = rgbToHsl(...rgb)
  let name: string
  if (s < 15) {
    name = l < 25 ? 'Black' : l > 75 ? 'White' : 'Grey'
  } else if (h < 15 || h >= 345) {
    name = 'Red'
  } else if (h < 40) {
    name = 'Orange'
  } else if (h < 65) {
    name = 'Yellow'
  } else if (h < 155) {
    name = 'Green'
  } else if (h < 185) {
    name = 'Cyan'
  } else if (h < 255) {
    name = 'Blue'
  } else if (h < 295) {
    name = 'Violet'
  } else {
    name = 'Pink'
  }
  const shade = l < 35 ? 'Dark ' : l > 65 ? 'Light ' : ''
  return `${shade}${name} ${idx + 1}`
}

function dist2(a: RGB, b: RGB): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
}

/** Median-cut quantisation – returns up to `k` representative colours. */
function medianCut(pixels: RGB[], k: number): RGB[] {
  if (!pixels.length) return [[128, 128, 128]]
  let buckets: RGB[][] = [pixels.slice()]
  while (buckets.length < k) {
    let maxRange = 0, bi = 0, bc = 0
    for (let i = 0; i < buckets.length; i++) {
      for (let c = 0; c < 3; c++) {
        let mn = 255, mx = 0
        for (const p of buckets[i]) {
          if (p[c] < mn) mn = p[c]
          if (p[c] > mx) mx = p[c]
        }
        const r = mx - mn
        if (r > maxRange) { maxRange = r; bi = i; bc = c }
      }
    }
    if (maxRange === 0) break
    const ch = bc
    const bk = [...buckets[bi]].sort((a, b) => a[ch] - b[ch])
    const mid = bk.length >> 1
    buckets.splice(bi, 1, bk.slice(0, mid), bk.slice(mid))
    buckets = buckets.filter(b => b.length > 0)
  }
  return buckets.map(bk => [
    Math.round(bk.reduce((s, p) => s + p[0], 0) / bk.length),
    Math.round(bk.reduce((s, p) => s + p[1], 0) / bk.length),
    Math.round(bk.reduce((s, p) => s + p[2], 0) / bk.length),
  ] as RGB)
}

// ── Pattern building ─────────────────────────────────────────────────────────

function buildPattern(
  imgData: ImageData,
  targetW: number,
  targetH: number,
  numColors: number,
): CrossStitchPattern {
  const { data, width, height } = imgData

  // 1. Sample pixels for quantisation (cap at 40 000 samples for speed)
  const step = Math.max(1, Math.floor((width * height) / 40000))
  const samples: RGB[] = []
  for (let i = 0; i < width * height; i += step) {
    if (data[i * 4 + 3] > 64)
      samples.push([data[i * 4], data[i * 4 + 1], data[i * 4 + 2]])
  }

  // 2. Quantise → full-stitch colours
  const fullColors = medianCut(samples, numColors)
  const WHITE: RGB = [255, 255, 255]

  // 3. Build palette: full → empty(white)
  const palette: PaletteEntry[] = []
  fullColors.forEach((rgb, i) => {
    palette.push({ rgb, symbol: FULL_SYMS[i % FULL_SYMS.length], label: colorLabel(rgb, i), type: 'full' })
  })
  const emptyIdx = palette.length
  palette.push({ rgb: WHITE, symbol: ' ', label: 'Empty', type: 'empty' })

  // 4. Down-sample: for each target cell find the nearest palette colour
  const grid: number[] = new Array(targetW * targetH)
  for (let ty = 0; ty < targetH; ty++) {
    for (let tx = 0; tx < targetW; tx++) {
      const sx = Math.min(Math.floor(((tx + 0.5) / targetW) * width), width - 1)
      const sy = Math.min(Math.floor(((ty + 0.5) / targetH) * height), height - 1)
      const off = (sy * width + sx) * 4
      if (data[off + 3] < 64) { grid[ty * targetW + tx] = emptyIdx; continue }
      const px: RGB = [data[off], data[off + 1], data[off + 2]]
      let md = Infinity, mi = emptyIdx
      for (let pi = 0; pi < palette.length; pi++) {
        const d = dist2(px, palette[pi].rgb)
        if (d < md) { md = d; mi = pi }
      }
      grid[ty * targetW + tx] = mi
    }
  }

  return { palette, grid, width: targetW, height: targetH }
}

// ── Canvas rendering ─────────────────────────────────────────────────────────

const BASE_CELL = 20   // px at zoom = 1

function drawCanvas(
  canvas: HTMLCanvasElement,
  pattern: CrossStitchPattern,
  stitched: boolean[],
  zoom: number,
) {
  const cs = Math.max(4, Math.round(BASE_CELL * zoom))
  const { palette, grid, width, height } = pattern
  canvas.width = width * cs
  canvas.height = height * cs
  const ctx = canvas.getContext('2d')!

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pi = grid[y * width + x]
      const entry = palette[pi]
      const [r, g, b] = entry.rgb
      const px = x * cs, py = y * cs
      const done = stitched[y * width + x]

      // Background
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(px, py, cs, cs)

      if (entry.type !== 'empty') {
        if (done) {
          // Stitched overlay
          ctx.fillStyle = 'rgba(34,197,94,0.65)'
          ctx.fillRect(px, py, cs, cs)
          if (cs >= 10) {
            ctx.fillStyle = '#fff'
            ctx.font = `bold ${Math.round(cs * 0.7)}px sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('✓', px + cs / 2, py + cs / 2)
          }
        } else if (cs >= 10) {
          const lum = 0.299 * r + 0.587 * g + 0.114 * b
          ctx.fillStyle = lum > 140 ? '#1a1a1a' : '#f0f0f0'
          ctx.font = `${Math.round(cs * 0.65)}px monospace`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(entry.symbol, px + cs / 2, py + cs / 2)
        }
      }

      // Cell border
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'
      ctx.lineWidth = 0.5
      ctx.strokeRect(px + 0.25, py + 0.25, cs - 0.5, cs - 0.5)
    }
  }

  // Bold grid lines every 10 cells
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'
  ctx.lineWidth = 1
  for (let x = 0; x <= width; x += 10) {
    ctx.beginPath(); ctx.moveTo(x * cs, 0); ctx.lineTo(x * cs, height * cs); ctx.stroke()
  }
  for (let y = 0; y <= height; y += 10) {
    ctx.beginPath(); ctx.moveTo(0, y * cs); ctx.lineTo(width * cs, y * cs); ctx.stroke()
  }
}

// ── LocalStorage keys ────────────────────────────────────────────────────────

const LS_PATTERN  = 'crossstitch_pattern'
const LS_STITCHED = 'crossstitch_stitched'

// ── Main component ───────────────────────────────────────────────────────────

function loadSavedState(): { pattern: CrossStitchPattern | null; stitched: boolean[]; view: 'setup' | 'pattern' } {
  try {
    const sp = localStorage.getItem(LS_PATTERN)
    const ss = localStorage.getItem(LS_STITCHED)
    if (sp && ss) {
      return {
        pattern: JSON.parse(sp) as CrossStitchPattern,
        stitched: JSON.parse(ss) as boolean[],
        view: 'pattern',
      }
    }
  } catch { /* ignore corrupt data */ }
  return { pattern: null, stitched: [], view: 'setup' }
}

export function CrossStitch() {
  const [saved] = useState(() => loadSavedState())

  const [view, setView]         = useState<'setup' | 'pattern'>(saved.view)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imgSize, setImgSize]   = useState<[number, number]>([0, 0])
  const [numColors, setNumColors] = useState(8)
  const [stitchSize, setStitchSize] = useState(50)

  // Derive width/height locked to the image's aspect ratio
  const heightToWidthRatio = imgSize[0] > 0 ? imgSize[1] / imgSize[0] : 1
  const stitchW = stitchSize
  const stitchH = Math.max(5, Math.round(stitchSize * heightToWidthRatio))
  const [pattern, setPattern]   = useState<CrossStitchPattern | null>(saved.pattern)
  const [stitched, setStitched] = useState<boolean[]>(saved.stitched)
  const [zoom, setZoom]         = useState(1)
  const [generating, setGenerating] = useState(false)

  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const zoomRef     = useRef(zoom)

  // Keep zoomRef in sync
  useEffect(() => { zoomRef.current = zoom }, [zoom])

  // ── Redraw canvas when pattern / stitched / zoom changes ────────────────
  useEffect(() => {
    if (!canvasRef.current || !pattern) return
    drawCanvas(canvasRef.current, pattern, stitched, zoom)
  }, [pattern, stitched, zoom])

  // ── Persist stitched state ──────────────────────────────────────────────
  useEffect(() => {
    if (pattern && stitched.length > 0)
      localStorage.setItem(LS_STITCHED, JSON.stringify(stitched))
  }, [stitched, pattern])

  // ── Pinch-to-zoom (imperative, non-passive) ─────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || view !== 'pattern') return

    let startDist = 0, startZoom = 1

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        startDist = Math.sqrt(dx * dx + dy * dy)
        startZoom = zoomRef.current
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (startDist > 0) {
          const newZoom = Math.min(5, Math.max(0.2, startZoom * (dist / startDist)))
          setZoom(newZoom)
        }
      }
    }

    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
    }
  }, [view])

  // ── Image upload ────────────────────────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const url = ev.target?.result as string
      setImageUrl(url)
      const img = new Image()
      img.onload = () => {
        setImgSize([img.naturalWidth, img.naturalHeight])
        setStitchSize(Math.max(5, Math.round(img.naturalWidth / 20)))
      }
      img.src = url
    }
    reader.readAsDataURL(file)
  }

  // ── Generate pattern ────────────────────────────────────────────────────
  const handleGenerate = () => {
    if (!imageUrl || !imgSize[0]) return
    setGenerating(true)
    setTimeout(() => {
      const c = document.createElement('canvas')
      c.width = imgSize[0]; c.height = imgSize[1]
      const ctx = c.getContext('2d')!
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        const imgData = ctx.getImageData(0, 0, imgSize[0], imgSize[1])
        const p = buildPattern(imgData, stitchW, stitchH, numColors)
        const s = new Array(stitchW * stitchH).fill(false)
        setPattern(p)
        setStitched(s)
        setZoom(1)
        setView('pattern')
        setGenerating(false)
        localStorage.setItem(LS_PATTERN,  JSON.stringify(p))
        localStorage.setItem(LS_STITCHED, JSON.stringify(s))
      }
      img.src = imageUrl
    }, 50)
  }

  // ── Toggle a cell ───────────────────────────────────────────────────────
  const toggleCell = useCallback((gx: number, gy: number) => {
    if (!pattern) return
    setStitched(prev => {
      const next = [...prev]
      next[gy * pattern.width + gx] = !next[gy * pattern.width + gx]
      return next
    })
  }, [pattern])

  // ── Canvas click / tap ──────────────────────────────────────────────────
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!pattern) return
    const canvas = e.currentTarget
    const rect   = canvas.getBoundingClientRect()
    const cs     = Math.max(4, Math.round(BASE_CELL * zoom))
    const gx = Math.floor((e.clientX - rect.left) / cs)
    const gy = Math.floor((e.clientY - rect.top)  / cs)
    if (gx >= 0 && gx < pattern.width && gy >= 0 && gy < pattern.height)
      toggleCell(gx, gy)
  }

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleClear = () => {
    if (!pattern) return
    if (!window.confirm('Clear all progress? This cannot be undone.')) return
    const cleared = new Array(pattern.width * pattern.height).fill(false)
    setStitched(cleared)
    localStorage.setItem(LS_STITCHED, JSON.stringify(cleared))
  }

  const handleDownloadPdf = () => window.print()

  // ── Derived stats ───────────────────────────────────────────────────────
  const emptyIdx    = pattern ? pattern.palette.length - 1 : -1
  const nonEmptyTotal = pattern ? pattern.grid.filter(i => i !== emptyIdx).length : 0
  const stitchedCount = stitched.filter(Boolean).length

  // ══════════════════════════════════════════════════════════════════════════
  // ── Setup view ────────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  if (view === 'setup') {
    return (
      <div className="cross-stitch">
        <div className="cs-header">
          <h1>🧵 Cross-Stitch Pattern Generator</h1>
          <p>Upload an image to generate a printable cross-stitch pattern.</p>
        </div>

        <div className="cs-setup">
          <div className="cs-form">
            <div className="cs-field">
              <label htmlFor="cs-file-input">Upload Image</label>
              <input
                id="cs-file-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="cs-file-input"
              />
            </div>

            {imageUrl && (
              <div className="cs-preview">
                <img src={imageUrl} alt="Uploaded preview" />
                <p className="cs-preview-size">{imgSize[0]} × {imgSize[1]} px</p>
              </div>
            )}

            <div className="cs-field">
              <label htmlFor="cs-colors">Thread Colours: <strong>{numColors}</strong></label>
              <input
                id="cs-colors"
                type="range"
                min={2}
                max={100}
                value={numColors}
                onChange={e => setNumColors(+e.target.value)}
                className="cs-range"
              />
              <div className="cs-range-labels"><span>2</span><span>100</span></div>
            </div>

            <div className="cs-field">
              <label htmlFor="cs-size">
                Grid Size: <strong>{stitchW} × {stitchH} stitches</strong>
              </label>
              <input
                id="cs-size"
                type="range"
                min={5}
                max={500}
                value={stitchSize}
                onChange={e => setStitchSize(+e.target.value)}
                className="cs-range"
              />
              <div className="cs-range-labels"><span>5</span><span>500</span></div>
              <div className="cs-field-row">
                <div className="cs-field">
                  <label htmlFor="cs-width-display">Width (stitches)</label>
                  <input
                    id="cs-width-display"
                    type="number"
                    value={stitchW}
                    readOnly
                    className="cs-number-input cs-number-input--readonly"
                  />
                </div>
                <div className="cs-field">
                  <label htmlFor="cs-height-display">Height (stitches)</label>
                  <input
                    id="cs-height-display"
                    type="number"
                    value={stitchH}
                    readOnly
                    className="cs-number-input cs-number-input--readonly"
                  />
                </div>
              </div>
            </div>

            <p className="cs-hint">Height is locked to the image's aspect ratio.</p>

            <button
              className="cs-generate-btn"
              onClick={handleGenerate}
              disabled={!imageUrl || generating}
            >
              {generating ? '⏳ Generating…' : '🎨 Generate Pattern'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ── Pattern view ──────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="cross-stitch cs-pattern-view">

      {/* Toolbar */}
      <div className="cs-toolbar no-print">
        <button onClick={() => setView('setup')} className="cs-btn">← Setup</button>

        <div className="cs-zoom-controls">
          <button onClick={() => setZoom(z => Math.max(0.2, +(z - 0.25).toFixed(2)))} className="cs-btn cs-btn-icon">−</button>
          <span className="cs-zoom-label">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(5, +(z + 0.25).toFixed(2)))} className="cs-btn cs-btn-icon">+</button>
        </div>

        <span className="cs-progress-text">
          {stitchedCount} / {nonEmptyTotal} stitched
        </span>

        <div className="cs-toolbar-actions">
          <button onClick={handleDownloadPdf} className="cs-btn cs-btn-primary">📄 PDF</button>
          <button onClick={handleClear}       className="cs-btn cs-btn-danger">🗑 Clear</button>
        </div>
      </div>

      {/* Scrollable pattern canvas */}
      <div className="cs-canvas-container">
        <canvas
          ref={canvasRef}
          className="cs-canvas"
          onClick={handleCanvasClick}
        />
      </div>

      {/* Colour key */}
      <div className="cs-key">
        <h3>Colour Key</h3>
        <div className="cs-key-grid">
          {pattern?.palette
            .filter(e => e.type !== 'empty')
            .map((entry, i) => {
              const [r, g, b] = entry.rgb
              const lum = 0.299 * r + 0.587 * g + 0.114 * b
              return (
                <div key={i} className="cs-key-item">
                  <div
                    className="cs-key-swatch"
                    style={{
                      background: `rgb(${r},${g},${b})`,
                      color: lum > 140 ? '#1a1a1a' : '#f0f0f0',
                    }}
                  >
                    <span className="cs-key-symbol">{entry.symbol}</span>
                  </div>
                  <span className="cs-key-label">{entry.label}</span>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
