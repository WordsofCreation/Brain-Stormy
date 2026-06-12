import { useEffect, type CSSProperties } from 'react'

import { useMediaQuery } from '../hooks/useMediaQuery'

type BrainHeroSceneProps = {
  reducedMotion?: boolean | null
}

type PathTrace = {
  d: string
  tone: 'cyan' | 'violet' | 'magenta' | 'white'
  delay: string
  width?: number
}

type BrainNode = {
  x: number
  y: number
  size: number
  tone: 'cyan' | 'violet' | 'magenta' | 'white'
  delay: string
}

type LightningBolt = {
  points: string
  delay: string
  tone: 'cyan' | 'violet' | 'white'
}

const fallbackStyle = {
  '--brain-cyan': '#35e7ff',
  '--brain-violet': '#8b5cf6',
  '--brain-magenta': '#e879f9',
} as CSSProperties

const cortexPaths: PathTrace[] = [
  {
    d: 'M232 271 C190 214 215 145 288 128 C351 113 398 152 400 215 C402 276 350 308 286 292',
    tone: 'cyan',
    delay: '0s',
    width: 3.4,
  },
  {
    d: 'M393 211 C402 145 456 111 522 129 C589 148 618 214 584 272 C551 328 465 325 420 279',
    tone: 'violet',
    delay: '-1.8s',
    width: 3.4,
  },
  {
    d: 'M276 147 C246 174 251 215 285 231 C329 252 365 221 348 179 C337 151 307 139 276 147',
    tone: 'white',
    delay: '-0.7s',
  },
  {
    d: 'M478 145 C443 158 429 192 446 224 C467 261 520 258 546 225 C570 194 554 153 519 143',
    tone: 'magenta',
    delay: '-1.2s',
  },
  {
    d: 'M236 237 C287 210 330 211 383 247 C425 276 473 288 552 250',
    tone: 'cyan',
    delay: '-2.2s',
    width: 2.6,
  },
  {
    d: 'M265 290 C328 337 430 346 516 301',
    tone: 'violet',
    delay: '-3.1s',
    width: 2.8,
  },
  {
    d: 'M287 116 C331 75 399 90 421 145 C448 86 524 76 565 123',
    tone: 'white',
    delay: '-0.2s',
    width: 2.5,
  },
  {
    d: 'M209 205 C165 225 159 293 208 338 C258 384 337 375 378 329',
    tone: 'magenta',
    delay: '-3.7s',
    width: 2.5,
  },
  {
    d: 'M425 329 C469 382 552 371 603 321 C651 274 635 205 590 181',
    tone: 'cyan',
    delay: '-4.1s',
    width: 2.5,
  },
  {
    d: 'M381 102 C385 171 386 236 385 342',
    tone: 'violet',
    delay: '-1.4s',
    width: 2.2,
  },
  {
    d: 'M222 328 C209 377 253 417 316 410 C366 405 390 374 384 337',
    tone: 'cyan',
    delay: '-2.8s',
  },
  {
    d: 'M421 337 C415 379 447 411 505 413 C573 414 617 373 594 323',
    tone: 'magenta',
    delay: '-3.4s',
  },
]

const neuralNodes: BrainNode[] = [
  { x: 286, y: 128, size: 7, tone: 'cyan', delay: '0s' },
  { x: 400, y: 215, size: 5, tone: 'violet', delay: '-1.2s' },
  { x: 522, y: 129, size: 7, tone: 'magenta', delay: '-2.1s' },
  { x: 348, y: 179, size: 5, tone: 'white', delay: '-0.4s' },
  { x: 446, y: 224, size: 6, tone: 'cyan', delay: '-2.8s' },
  { x: 265, y: 290, size: 5, tone: 'violet', delay: '-1.8s' },
  { x: 516, y: 301, size: 6, tone: 'white', delay: '-3.2s' },
  { x: 316, y: 410, size: 6, tone: 'magenta', delay: '-2.4s' },
  { x: 505, y: 413, size: 6, tone: 'cyan', delay: '-3.8s' },
  { x: 603, y: 321, size: 5, tone: 'violet', delay: '-0.9s' },
]

const lightningBolts: LightningBolt[] = [
  {
    points: '118,148 191,184 154,202 252,246 213,257 340,318',
    delay: '0s',
    tone: 'cyan',
  },
  {
    points: '642,132 552,181 590,196 497,249 536,261 420,318',
    delay: '-1.7s',
    tone: 'violet',
  },
  {
    points: '386,30 414,112 391,105 422,202 396,190 424,297',
    delay: '-3s',
    tone: 'white',
  },
  {
    points: '96,337 206,315 181,347 305,344 268,378 410,361',
    delay: '-4.2s',
    tone: 'cyan',
  },
]

function toneClass(tone: string) {
  return `brain-tone-${tone}`
}

export function BrainHeroScene({ reducedMotion = false }: BrainHeroSceneProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty(
      '--brain-rendering',
      reducedMotion ? 'reduced' : 'css-hologram',
    )
    return () => {
      root.style.removeProperty('--brain-rendering')
    }
  }, [reducedMotion])

  return (
    <div
      className={`brain-hero-scene brain-hero-scene--hologram${reducedMotion ? ' brain-hero-scene--reduced' : ''}${isMobile ? ' brain-hero-scene--mobile' : ''}`}
      style={fallbackStyle}
      aria-hidden="true"
    >
      <div className="brain-hero-scene__aurora" />
      <div className="brain-hero-scene__storm" />
      <div className="brain-hologram">
        <div className="brain-hologram__depth brain-hologram__depth--back" />
        <div className="brain-hologram__depth brain-hologram__depth--front" />
        <svg
          className="brain-hologram__svg"
          viewBox="0 0 760 520"
          role="presentation"
        >
          <defs>
            <filter
              id="brain-glow"
              x="-40%"
              y="-40%"
              width="180%"
              height="180%"
            >
              <feGaussianBlur stdDeviation="5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="brain-core-fill" cx="50%" cy="48%" r="55%">
              <stop offset="0%" stopColor="#35e7ff" stopOpacity="0.34" />
              <stop offset="48%" stopColor="#8b5cf6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#020712" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="brain-stroke" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#35e7ff" />
              <stop offset="50%" stopColor="#f0fdff" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
          </defs>

          <ellipse
            className="brain-hologram__shadow"
            cx="383"
            cy="444"
            rx="210"
            ry="38"
          />
          <path
            className="brain-hologram__mass"
            d="M221 331 C154 286 154 188 217 133 C262 94 318 91 372 119 C426 80 513 88 575 136 C645 190 656 294 594 356 C543 408 464 424 386 380 C321 423 258 410 221 331 Z"
          />
          <path
            className="brain-hologram__rim"
            d="M221 331 C154 286 154 188 217 133 C262 94 318 91 372 119 C426 80 513 88 575 136 C645 190 656 294 594 356 C543 408 464 424 386 380 C321 423 258 410 221 331 Z"
          />
          <path
            className="brain-hologram__center"
            d="M382 111 C381 176 382 254 383 382"
          />

          {cortexPaths.map((path) => (
            <path
              key={path.d}
              className={`brain-hologram__trace ${toneClass(path.tone)}`}
              d={path.d}
              pathLength="1"
              style={
                {
                  '--trace-delay': path.delay,
                  '--trace-width': path.width ?? 2.2,
                } as CSSProperties
              }
            />
          ))}

          {lightningBolts.map((bolt) => (
            <polyline
              key={bolt.points}
              className={`brain-hologram__bolt ${toneClass(bolt.tone)}`}
              points={bolt.points}
              style={{ '--bolt-delay': bolt.delay } as CSSProperties}
            />
          ))}

          {neuralNodes.map((node) => (
            <g
              key={`${node.x}-${node.y}`}
              className="brain-hologram__node"
              style={{ '--node-delay': node.delay } as CSSProperties}
            >
              <circle
                className={`brain-hologram__node-glow ${toneClass(node.tone)}`}
                cx={node.x}
                cy={node.y}
                r={node.size * 2.6}
              />
              <circle
                className={`brain-hologram__node-core ${toneClass(node.tone)}`}
                cx={node.x}
                cy={node.y}
                r={node.size}
              />
            </g>
          ))}
        </svg>
      </div>
      <div className="brain-hero-scene__vignette" />
    </div>
  )
}
