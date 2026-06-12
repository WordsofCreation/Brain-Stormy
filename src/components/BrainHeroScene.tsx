import { useEffect, type CSSProperties } from 'react'

type BrainHeroSceneProps = {
  reducedMotion?: boolean | null
}

type Tone = 'green' | 'cyan' | 'violet' | 'white'

type CircuitPath = {
  d: string
  tone: Tone
  width?: number
  delay: string
}

type NeuralNode = {
  x: number
  y: number
  r: number
  tone: Tone
  delay: string
}

type CodeColumn = {
  x: number
  y: number
  value: string
  opacity: number
  delay: string
  tone: 'cyan' | 'violet' | 'white'
}

const logoStyle = {
  '--logo-green': '#9df7c8',
  '--logo-cyan': '#5ff0b2',
  '--logo-violet': '#8f7dff',
  '--logo-white': '#effff6',
} as CSSProperties

const matrixColumns: CodeColumn[] = [
  { x: 45, y: 72, value: '01\u00a010\u00a011\u00a000', opacity: 0.4, delay: '0s', tone: 'cyan' },
  { x: 116, y: 32, value: 'AI\u00a001\u00a0//\u00a010', opacity: 0.3, delay: '-1.4s', tone: 'white' },
  { x: 236, y: 92, value: '10\u00a0UX\u00a001\u00a011', opacity: 0.36, delay: '-2.8s', tone: 'violet' },
  { x: 645, y: 62, value: 'SaaS\u00a001\u00a010', opacity: 0.28, delay: '-0.8s', tone: 'cyan' },
  { x: 790, y: 118, value: '11\u00a000\u00a001\u00a010', opacity: 0.34, delay: '-2.1s', tone: 'violet' },
  { x: 914, y: 44, value: 'NODE\u00a010\u00a001', opacity: 0.26, delay: '-3.2s', tone: 'white' },
]

const circuitPaths: CircuitPath[] = [
  {
    d: 'M122 287 C91 265 91 219 124 197 C120 154 154 124 195 134 C218 95 279 96 300 137 C342 125 380 155 374 198 C408 216 409 263 376 287 Z',
    tone: 'cyan',
    width: 5,
    delay: '0s',
  },
  {
    d: 'M145 218 H205 L224 190 H278 L300 220 H352',
    tone: 'green',
    width: 4,
    delay: '-0.5s',
  },
  {
    d: 'M139 253 H188 L211 278 H270 L294 252 H358',
    tone: 'cyan',
    width: 4,
    delay: '-1.1s',
  },
  {
    d: 'M177 173 L214 207 L246 176 L292 211 L332 174',
    tone: 'violet',
    width: 3.5,
    delay: '-1.7s',
  },
  {
    d: 'M188 298 L219 266 L250 298 L288 262 L321 295',
    tone: 'green',
    width: 3.5,
    delay: '-2.3s',
  },
  {
    d: 'M250 136 V170 M250 302 V334 M123 241 H89 M376 242 H411',
    tone: 'white',
    width: 3,
    delay: '-2.9s',
  },
]

const neuralNodes: NeuralNode[] = [
  { x: 124, y: 197, r: 7, tone: 'cyan', delay: '0s' },
  { x: 195, y: 134, r: 8, tone: 'green', delay: '-0.4s' },
  { x: 300, y: 137, r: 8, tone: 'violet', delay: '-0.8s' },
  { x: 374, y: 198, r: 7, tone: 'cyan', delay: '-1.2s' },
  { x: 145, y: 218, r: 6, tone: 'green', delay: '-1.6s' },
  { x: 224, y: 190, r: 6, tone: 'white', delay: '-2s' },
  { x: 300, y: 220, r: 6, tone: 'green', delay: '-2.4s' },
  { x: 188, y: 253, r: 6, tone: 'cyan', delay: '-2.8s' },
  { x: 294, y: 252, r: 6, tone: 'violet', delay: '-3.2s' },
  { x: 250, y: 334, r: 7, tone: 'white', delay: '-3.6s' },
]

function toneClass(tone: Tone) {
  return `brain-logo__tone--${tone}`
}

export function BrainHeroScene({ reducedMotion = false }: BrainHeroSceneProps) {
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty(
      '--brain-rendering',
      reducedMotion ? 'brain-logo-reduced' : 'brain-logo-cyberpunk',
    )
    return () => {
      root.style.removeProperty('--brain-rendering')
    }
  }, [reducedMotion])

  return (
    <div
      className={`brain-hero-scene brain-logo${reducedMotion ? ' brain-logo--reduced' : ''}`}
      style={logoStyle}
      aria-label="Brain Stormy cyberpunk SaaS logo"
      role="img"
    >
      <div className="brain-logo__ambient" />
      <div className="brain-logo__grid" />
      <div className="brain-logo__scanline" />

      <svg className="brain-logo__mark" viewBox="0 0 1040 430" role="presentation">
        <defs>
          <filter id="brain-logo-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.10  0 1 0 0 0.95  0 0 1 0 0.85  0 0 0 0.95 0"
              result="coloredBlur"
            />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="brain-logo-outline" x1="88" x2="412" y1="110" y2="324">
            <stop offset="0%" stopColor="#5ff0b2" />
            <stop offset="46%" stopColor="#9df7c8" />
            <stop offset="100%" stopColor="#8f7dff" />
          </linearGradient>
          <linearGradient id="brain-logo-wordmark" x1="460" x2="1010" y1="130" y2="330">
            <stop offset="0%" stopColor="#effff6" />
            <stop offset="48%" stopColor="#9df7c8" />
            <stop offset="100%" stopColor="#5ff0b2" />
          </linearGradient>
          <radialGradient id="brain-logo-core" cx="47%" cy="49%" r="63%">
            <stop offset="0%" stopColor="#9df7c8" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#5ff0b2" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#010806" stopOpacity="0" />
          </radialGradient>
        </defs>

        <title>Brain Stormy</title>

        {matrixColumns.map((column) => (
          <text
            key={`${column.x}-${column.value}`}
            className="brain-logo__code"
            x={column.x}
            y={column.y}
            opacity={column.opacity}
            style={{ '--code-delay': column.delay } as CSSProperties}
          >
            {column.value}
          </text>
        ))}

        <ellipse className="brain-logo__base" cx="250" cy="346" rx="178" ry="28" />
        <path
          className="brain-logo__cloud-fill"
          d="M122 287 C91 265 91 219 124 197 C120 154 154 124 195 134 C218 95 279 96 300 137 C342 125 380 155 374 198 C408 216 409 263 376 287 Z"
        />
        <path
          className="brain-logo__cloud-outline"
          d="M122 287 C91 265 91 219 124 197 C120 154 154 124 195 134 C218 95 279 96 300 137 C342 125 380 155 374 198 C408 216 409 263 376 287 Z"
        />

        {circuitPaths.map((path) => (
          <path
            key={path.d}
            className={`brain-logo__circuit ${toneClass(path.tone)}`}
            d={path.d}
            pathLength="1"
            style={
              {
                '--circuit-delay': path.delay,
                '--circuit-width': path.width ?? 4,
              } as CSSProperties
            }
          />
        ))}

        <path
          className="brain-logo__lightning"
          d="M266 151 L225 238 H264 L227 322 L328 208 H280 L311 151 Z"
        />
        <path
          className="brain-logo__lightning-core"
          d="M266 151 L225 238 H264 L227 322 L328 208 H280 L311 151 Z"
        />

        {neuralNodes.map((node) => (
          <g
            key={`${node.x}-${node.y}`}
            className="brain-logo__node"
            style={{ '--node-delay': node.delay } as CSSProperties}
          >
            <circle
              className={`brain-logo__node-halo ${toneClass(node.tone)}`}
              cx={node.x}
              cy={node.y}
              r={node.r * 3.2}
            />
            <circle
              className={`brain-logo__node-core ${toneClass(node.tone)}`}
              cx={node.x}
              cy={node.y}
              r={node.r}
            />
          </g>
        ))}

        <line className="brain-logo__divider" x1="438" x2="438" y1="112" y2="322" />
        <text className="brain-logo__wordmark brain-logo__wordmark--brain" x="480" y="190">
          BRAIN
        </text>
        <text className="brain-logo__wordmark brain-logo__wordmark--stormy" x="480" y="284">
          STORMY
        </text>
        <text className="brain-logo__tagline" x="484" y="326">
          NEURAL IDEATION PLATFORM
        </text>
      </svg>

      <div className="brain-logo__vignette" />
    </div>
  )
}
