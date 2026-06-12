import { useEffect, type CSSProperties } from 'react'

type BrainHeroSceneProps = {
  reducedMotion?: boolean | null
}

type StrokeTone = 'cyan' | 'violet' | 'magenta' | 'white'

type CortexPath = {
  d: string
  tone: StrokeTone
  delay: string
  width?: number
}

type BrainNode = {
  x: number
  y: number
  r: number
  tone: StrokeTone
  delay: string
}

type StormBolt = {
  points: string
  tone: StrokeTone
  delay: string
}

const brainStyle = {
  '--brain-cyan': '#35e7ff',
  '--brain-violet': '#8b5cf6',
  '--brain-magenta': '#e879f9',
  '--brain-white': '#f0fdff',
} as CSSProperties

const cortexPaths: CortexPath[] = [
  {
    d: 'M198 245 C142 211 154 135 223 107 C282 82 343 113 355 178 C366 239 313 286 238 269',
    tone: 'cyan',
    delay: '0s',
    width: 5,
  },
  {
    d: 'M190 289 C126 298 101 388 163 445 C224 501 334 475 356 388 C373 322 292 283 190 289',
    tone: 'violet',
    delay: '-0.7s',
    width: 4.5,
  },
  {
    d: 'M562 245 C621 211 603 134 536 106 C476 80 414 114 404 178 C395 239 444 287 523 269',
    tone: 'magenta',
    delay: '-1.4s',
    width: 5,
  },
  {
    d: 'M570 289 C636 297 659 389 596 445 C535 501 424 475 403 388 C387 321 468 283 570 289',
    tone: 'cyan',
    delay: '-2.1s',
    width: 4.5,
  },
  {
    d: 'M241 119 C210 148 215 192 256 210 C302 231 336 194 321 153 C309 121 275 104 241 119',
    tone: 'white',
    delay: '-2.8s',
  },
  {
    d: 'M514 118 C549 146 541 191 503 211 C458 234 421 198 436 154 C447 121 480 103 514 118',
    tone: 'white',
    delay: '-3.5s',
  },
  {
    d: 'M174 205 C234 177 300 188 350 240 C294 236 246 251 205 294',
    tone: 'cyan',
    delay: '-0.35s',
    width: 3.8,
  },
  {
    d: 'M585 205 C524 177 459 188 410 240 C464 238 513 252 555 294',
    tone: 'violet',
    delay: '-1.05s',
    width: 3.8,
  },
  {
    d: 'M202 382 C248 327 315 333 352 392 C309 415 259 418 202 382',
    tone: 'magenta',
    delay: '-1.75s',
    width: 3.6,
  },
  {
    d: 'M557 382 C512 327 443 333 407 392 C452 416 502 418 557 382',
    tone: 'cyan',
    delay: '-2.45s',
    width: 3.6,
  },
  {
    d: 'M380 94 C374 182 374 319 381 466',
    tone: 'white',
    delay: '-3.15s',
    width: 3.2,
  },
  {
    d: 'M151 331 C243 312 315 321 382 360 C449 321 518 312 609 331',
    tone: 'violet',
    delay: '-3.85s',
    width: 3.6,
  },
  {
    d: 'M241 464 C286 516 361 498 381 445 C401 499 475 516 521 464',
    tone: 'magenta',
    delay: '-4.55s',
    width: 4,
  },
]

const nodes: BrainNode[] = [
  { x: 223, y: 107, r: 8, tone: 'cyan', delay: '0s' },
  { x: 321, y: 153, r: 7, tone: 'white', delay: '-0.5s' },
  { x: 174, y: 205, r: 7, tone: 'violet', delay: '-1s' },
  { x: 205, y: 294, r: 7, tone: 'magenta', delay: '-1.5s' },
  { x: 352, y: 392, r: 8, tone: 'cyan', delay: '-2s' },
  { x: 536, y: 106, r: 8, tone: 'magenta', delay: '-2.5s' },
  { x: 436, y: 154, r: 7, tone: 'white', delay: '-3s' },
  { x: 585, y: 205, r: 7, tone: 'cyan', delay: '-3.5s' },
  { x: 555, y: 294, r: 7, tone: 'violet', delay: '-4s' },
  { x: 407, y: 392, r: 8, tone: 'magenta', delay: '-4.5s' },
  { x: 381, y: 466, r: 9, tone: 'white', delay: '-5s' },
]

const stormBolts: StormBolt[] = [
  {
    points: '83,113 162,151 121,179 240,225 193,253 329,333',
    tone: 'cyan',
    delay: '0s',
  },
  {
    points: '674,111 593,151 634,180 516,226 565,253 429,334',
    tone: 'magenta',
    delay: '-1.2s',
  },
  {
    points: '382,17 420,111 391,103 431,211 399,199 438,318',
    tone: 'white',
    delay: '-2.4s',
  },
  {
    points: '54,397 177,365 139,407 294,393 243,444 381,423',
    tone: 'violet',
    delay: '-3.6s',
  },
  {
    points: '704,397 581,365 620,407 464,393 515,444 377,423',
    tone: 'cyan',
    delay: '-4.8s',
  },
]

function toneClass(tone: StrokeTone) {
  return `brain-storm-v3__tone--${tone}`
}

export function BrainHeroScene({ reducedMotion = false }: BrainHeroSceneProps) {
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty(
      '--brain-rendering',
      reducedMotion ? 'storm-brain-reduced' : 'storm-brain-v3',
    )
    return () => {
      root.style.removeProperty('--brain-rendering')
    }
  }, [reducedMotion])

  return (
    <div
      className={`brain-hero-scene brain-storm-v3${reducedMotion ? ' brain-storm-v3--reduced' : ''}`}
      style={brainStyle}
      aria-hidden="true"
    >
      <div className="brain-storm-v3__plasma" />
      <div className="brain-storm-v3__orbit brain-storm-v3__orbit--one" />
      <div className="brain-storm-v3__orbit brain-storm-v3__orbit--two" />
      <div className="brain-storm-v3__particles" />

      <svg
        className="brain-storm-v3__svg"
        viewBox="0 0 760 560"
        role="presentation"
      >
        <defs>
          <filter
            id="brain-storm-v3-glow"
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
          >
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0.12  0 1 0 0 0.72  0 0 1 0 1  0 0 0 1 0"
              result="coloredBlur"
            />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient
            id="brain-storm-v3-outline"
            x1="80"
            x2="680"
            y1="80"
            y2="500"
          >
            <stop offset="0%" stopColor="#35e7ff" />
            <stop offset="45%" stopColor="#f0fdff" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
          <radialGradient id="brain-storm-v3-fill" cx="50%" cy="45%" r="58%">
            <stop offset="0%" stopColor="#35e7ff" stopOpacity="0.42" />
            <stop offset="48%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#020712" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse
          className="brain-storm-v3__floor"
          cx="380"
          cy="500"
          rx="230"
          ry="34"
        />
        <path
          className="brain-storm-v3__brain-fill"
          d="M151 331 C95 279 99 178 166 114 C216 66 300 58 379 116 C461 58 544 66 594 114 C662 178 666 279 609 331 C671 403 604 503 521 464 C477 526 408 515 381 445 C351 516 282 526 241 464 C157 504 91 403 151 331 Z"
        />
        <path
          className="brain-storm-v3__brain-outline"
          d="M151 331 C95 279 99 178 166 114 C216 66 300 58 379 116 C461 58 544 66 594 114 C662 178 666 279 609 331 C671 403 604 503 521 464 C477 526 408 515 381 445 C351 516 282 526 241 464 C157 504 91 403 151 331 Z"
        />

        {cortexPaths.map((path) => (
          <path
            key={path.d}
            className={`brain-storm-v3__cortex ${toneClass(path.tone)}`}
            d={path.d}
            pathLength="1"
            style={
              {
                '--trace-delay': path.delay,
                '--trace-width': path.width ?? 4,
              } as CSSProperties
            }
          />
        ))}

        {stormBolts.map((bolt) => (
          <polyline
            key={bolt.points}
            className={`brain-storm-v3__bolt ${toneClass(bolt.tone)}`}
            points={bolt.points}
            pathLength="1"
            style={{ '--bolt-delay': bolt.delay } as CSSProperties}
          />
        ))}

        {nodes.map((node) => (
          <g
            key={`${node.x}-${node.y}`}
            className="brain-storm-v3__node"
            style={{ '--node-delay': node.delay } as CSSProperties}
          >
            <circle
              className={`brain-storm-v3__node-halo ${toneClass(node.tone)}`}
              cx={node.x}
              cy={node.y}
              r={node.r * 3.3}
            />
            <circle
              className={`brain-storm-v3__node-core ${toneClass(node.tone)}`}
              cx={node.x}
              cy={node.y}
              r={node.r}
            />
          </g>
        ))}
      </svg>

      <div className="brain-storm-v3__vignette" />
    </div>
  )
}
