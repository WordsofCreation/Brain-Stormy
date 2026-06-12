import { Float, PerspectiveCamera } from '@react-three/drei'
import { Canvas, useFrame, type RootState } from '@react-three/fiber'
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
} from 'react'
import * as THREE from 'three'

import { useMediaQuery } from '../hooks/useMediaQuery'

type BrainHeroSceneProps = {
  reducedMotion?: boolean | null
}

type BrainPoint = {
  position: THREE.Vector3
  nodeScale: number
  hue: number
}

type LightningBolt = {
  seed: number
  points: THREE.Vector3[]
  color: string
  speed: number
  offset: number
}

type BrainNetwork = {
  pointPositions: Float32Array
  edgePositions: Float32Array
  ridgePositions: Float32Array
  sulciPositions: Float32Array
  nodes: BrainPoint[]
  sparks: Float32Array
  storm: Float32Array
  lightning: LightningBolt[]
}

type BrainCoreProps = {
  density: number
  lineDistance: number
  reducedMotion: boolean
}

const palette = {
  cyan: '#35e7ff',
  blue: '#38bdf8',
  violet: '#8b5cf6',
  magenta: '#e879f9',
  electric: '#f0fdff',
}

const fallbackStyle = {
  '--brain-cyan': palette.cyan,
  '--brain-violet': palette.violet,
  '--brain-magenta': palette.magenta,
} as CSSProperties

const seeded = (value: number) => {
  const x = Math.sin(value * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function brainSurfacePoint(
  theta: number,
  y: number,
  hemisphere: -1 | 1,
  pulse = 0,
) {
  const radial = Math.sqrt(Math.max(0, 1 - y * y))
  const lobeBias =
    0.9 +
    0.18 * Math.sin(theta * 2.4 + hemisphere * 0.5) +
    0.08 * Math.cos(y * 7.2)
  const temporalTuck = 1 - 0.18 * Math.max(0, -y - 0.24)
  const frontalBulge = 1 + 0.14 * Math.max(0, Math.sin(theta + 0.35))
  const cerebellumLift = y < -0.58 ? 0.72 : 1

  let x =
    hemisphere *
    (0.18 + radial * Math.cos(theta) * 1.05 * lobeBias * temporalTuck)
  let z = radial * Math.sin(theta) * 0.76 * lobeBias * frontalBulge
  let foldedY =
    y * 0.94 + 0.1 * Math.sin(theta * 3.1 + hemisphere) - 0.04 * Math.max(0, -y)

  const crease = Math.abs(x) < 0.2 ? 0.22 : 1
  const sulci =
    0.055 * Math.sin(theta * 9.5 + y * 9 + pulse) +
    0.038 * Math.cos(theta * 15.2 - y * 4.7) +
    0.025 * Math.sin((x + z) * 12)

  x += sulci * hemisphere * 0.42
  z = z * crease + sulci + 0.18 * Math.cos(y * Math.PI) - 0.08
  foldedY = foldedY * cerebellumLift + sulci * 0.24

  if (foldedY < -0.78 && Math.abs(x) > 0.98) {
    x *= 0.84
    foldedY += 0.14
  }

  return new THREE.Vector3(x, foldedY, z)
}

function createBrainNetwork(
  density: number,
  lineDistance: number,
): BrainNetwork {
  const nodes: BrainPoint[] = []
  const pointPositions: number[] = []
  const sparks: number[] = []
  const storm: number[] = []
  const ridgePositions: number[] = []
  const sulciPositions: number[] = []
  const nodeEvery = density > 700 ? 9 : 8
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < density; i += 1) {
    const hemisphere = i % 2 === 0 ? -1 : 1
    const t = (i + 0.5) / density
    const theta = i * goldenAngle
    const y = 1 - 2 * t
    const position = brainSurfacePoint(theta, y, hemisphere)

    pointPositions.push(position.x, position.y, position.z)
    sparks.push(
      (seeded(i + 2) - 0.5) * 6.1,
      (seeded(i + 11) - 0.5) * 3.7,
      (seeded(i + 23) - 0.5) * 3.5,
    )

    if (i < density * 0.72) {
      const angle = seeded(i + 31) * Math.PI * 2
      const radius = 1.8 + seeded(i + 41) * 1.18
      storm.push(
        Math.cos(angle) * radius,
        (seeded(i + 43) - 0.5) * 2.55,
        Math.sin(angle) * radius * 0.58 + (seeded(i + 53) - 0.5) * 0.42,
      )
    }

    if (i % nodeEvery === 0 || Math.sin(theta * 2.7) > 0.955) {
      nodes.push({
        position,
        nodeScale: 0.018 + seeded(i + 71) * 0.04,
        hue: i % 4,
      })
    }
  }

  const maxEdges = density > 700 ? 610 : 330
  let edges = 0
  const edgePositions: number[] = []

  for (let i = 0; i < density && edges < maxEdges; i += 1) {
    const ax = pointPositions[i * 3]
    const ay = pointPositions[i * 3 + 1]
    const az = pointPositions[i * 3 + 2]

    for (
      let j = i + 9;
      j < density && edges < maxEdges;
      j += density > 700 ? 13 : 19
    ) {
      const bx = pointPositions[j * 3]
      const by = pointPositions[j * 3 + 1]
      const bz = pointPositions[j * 3 + 2]
      const distance = Math.hypot(ax - bx, ay - by, az - bz)
      const corpusBridge =
        Math.abs(ax + bx) < 0.3 &&
        Math.abs(ay - by) < 0.28 &&
        Math.abs(az - bz) < 0.62

      if (
        distance < lineDistance ||
        (corpusBridge && distance < lineDistance * 1.65 && edges % 4 === 0)
      ) {
        edgePositions.push(ax, ay, az, bx, by, bz)
        edges += 1
      }
    }
  }

  ;([-1, 1] as const).forEach((hemisphere) => {
    for (let band = 0; band < 17; band += 1) {
      const y = -0.82 + band * 0.102
      let previous: THREE.Vector3 | null = null
      for (let segment = 0; segment <= 82; segment += 1) {
        const theta = -Math.PI * 0.96 + (segment / 82) * Math.PI * 1.92
        const point = brainSurfacePoint(
          theta + Math.sin(band * 1.7) * 0.14,
          y + Math.sin(segment * 0.22 + band) * 0.026,
          hemisphere,
        )
        if (previous) {
          ridgePositions.push(
            previous.x,
            previous.y,
            previous.z,
            point.x,
            point.y,
            point.z,
          )
        }
        previous = point
      }
    }

    for (let stripe = 0; stripe < 12; stripe += 1) {
      const theta = -2.45 + stripe * 0.43
      let previous: THREE.Vector3 | null = null
      for (let segment = 0; segment <= 54; segment += 1) {
        const y = 0.92 - (segment / 54) * 1.8
        const point = brainSurfacePoint(
          theta + Math.sin(segment * 0.36) * 0.08,
          y,
          hemisphere,
        )
        point.multiplyScalar(0.993)
        if (previous) {
          sulciPositions.push(
            previous.x,
            previous.y,
            previous.z,
            point.x,
            point.y,
            point.z,
          )
        }
        previous = point
      }
    }
  })

  const lightning: LightningBolt[] = Array.from({ length: 7 }, (_, index) => {
    const angle = (index / 7) * Math.PI * 2 + 0.22
    const start = new THREE.Vector3(
      Math.cos(angle) * 2.1,
      1.24 - seeded(index + 80) * 0.72,
      Math.sin(angle) * 0.85,
    )
    const end = new THREE.Vector3(
      Math.cos(angle + 2.05) * 0.42,
      -0.3 + seeded(index + 91) * 0.82,
      Math.sin(angle + 1.2) * 0.48,
    )
    const points = Array.from({ length: 9 }, (_, pointIndex) => {
      const t = pointIndex / 8
      const point = start.clone().lerp(end, t)
      point.x += (seeded(index * 30 + pointIndex) - 0.5) * 0.22
      point.y += (seeded(index * 30 + pointIndex + 4) - 0.5) * 0.18
      point.z += (seeded(index * 30 + pointIndex + 8) - 0.5) * 0.18
      return point
    })

    return {
      seed: index + 1,
      points,
      color: index % 2 === 0 ? palette.cyan : palette.magenta,
      speed: 0.85 + seeded(index + 101) * 0.65,
      offset: seeded(index + 112) * Math.PI * 2,
    }
  })

  return {
    pointPositions: new Float32Array(pointPositions),
    edgePositions: new Float32Array(edgePositions),
    ridgePositions: new Float32Array(ridgePositions),
    sulciPositions: new Float32Array(sulciPositions),
    nodes,
    sparks: new Float32Array(sparks),
    storm: new Float32Array(storm),
    lightning,
  }
}

function NeuralNodes({ nodes }: { nodes: BrainPoint[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const colorArray = useMemo(
    () =>
      nodes.map(
        (node) =>
          new THREE.Color(
            node.hue === 0
              ? palette.cyan
              : node.hue === 1
                ? palette.violet
                : node.hue === 2
                  ? palette.magenta
                  : palette.electric,
          ),
      ),
    [nodes],
  )

  useLayoutEffect(() => {
    if (!meshRef.current) {
      return
    }

    const matrix = new THREE.Matrix4()
    nodes.forEach((node, index) => {
      matrix.compose(
        node.position,
        new THREE.Quaternion(),
        new THREE.Vector3(node.nodeScale, node.nodeScale, node.nodeScale),
      )
      meshRef.current?.setMatrixAt(index, matrix)
      meshRef.current?.setColorAt(index, colorArray[index])
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  }, [colorArray, nodes])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, nodes.length]}>
      <sphereGeometry args={[1, 18, 18]} />
      <meshBasicMaterial
        transparent
        opacity={0.98}
        toneMapped={false}
        vertexColors
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  )
}

function Lightning({
  bolt,
  reducedMotion,
}: {
  bolt: LightningBolt
  reducedMotion: boolean
}) {
  const geometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(bolt.points),
    [bolt.points],
  )
  const groupRef = useRef<THREE.Group>(null)
  const lineRef = useRef<THREE.Line>(null)
  const glowRef = useRef<THREE.Line>(null)

  useFrame((state: RootState) => {
    if (reducedMotion) {
      return
    }

    const elapsed = state.clock.getElapsedTime()
    const flash =
      Math.max(0, Math.sin(elapsed * bolt.speed * 4.6 + bolt.offset)) ** 5

    if (groupRef.current) {
      groupRef.current.position.x =
        Math.sin(elapsed * bolt.speed * 2.1 + bolt.offset) * 0.025
      groupRef.current.position.y =
        Math.cos(elapsed * bolt.speed * 1.8 + bolt.offset) * 0.018
      groupRef.current.scale.setScalar(0.98 + flash * 0.06)
    }
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial
      material.opacity = 0.34 + flash * 0.62
    }
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.LineBasicMaterial
      material.opacity = 0.08 + flash * 0.25
    }
  })

  return (
    <group ref={groupRef}>
      <line ref={glowRef} geometry={geometry}>
        <lineBasicMaterial
          color={bolt.color}
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          linewidth={4}
        />
      </line>
      <line ref={lineRef} geometry={geometry}>
        <lineBasicMaterial
          color={palette.electric}
          transparent
          opacity={0.62}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </line>
    </group>
  )
}

function BrainCore({ density, lineDistance, reducedMotion }: BrainCoreProps) {
  const groupRef = useRef<THREE.Group>(null)
  const shellRef = useRef<THREE.Mesh>(null)
  const stormRef = useRef<THREE.Points>(null)
  const sparkRef = useRef<THREE.Points>(null)
  const network = useMemo(
    () => createBrainNetwork(density, lineDistance),
    [density, lineDistance],
  )

  useFrame((state: RootState) => {
    const elapsed = state.clock.getElapsedTime()
    const group = groupRef.current

    if (!group) {
      return
    }

    if (reducedMotion) {
      group.rotation.set(0.05, -0.24, -0.02)
      return
    }

    const pointerX = THREE.MathUtils.clamp(state.pointer.x, -0.75, 0.75)
    const pointerY = THREE.MathUtils.clamp(state.pointer.y, -0.75, 0.75)
    const scrollNudge =
      typeof window === 'undefined' ? 0 : Math.min(window.scrollY / 1200, 0.7)

    group.rotation.y = THREE.MathUtils.lerp(
      group.rotation.y,
      -0.24 + pointerX * 0.16 + elapsed * 0.04 + scrollNudge * 0.12,
      0.035,
    )
    group.rotation.x = THREE.MathUtils.lerp(
      group.rotation.x,
      0.05 - pointerY * 0.07 + Math.sin(elapsed * 0.42) * 0.025,
      0.035,
    )
    group.rotation.z = Math.sin(elapsed * 0.28) * 0.028
    group.position.y = Math.sin(elapsed * 0.72) * 0.06
    group.scale.setScalar(1 + Math.sin(elapsed * 1.04) * 0.018)

    if (shellRef.current) {
      shellRef.current.rotation.y = elapsed * 0.035
      shellRef.current.rotation.z = Math.sin(elapsed * 0.35) * 0.025
    }
    if (stormRef.current) {
      stormRef.current.rotation.y = -elapsed * 0.16
      stormRef.current.rotation.z = Math.sin(elapsed * 0.24) * 0.16
    }
    if (sparkRef.current) {
      sparkRef.current.rotation.y = elapsed * 0.24
      sparkRef.current.rotation.x = Math.sin(elapsed * 0.33) * 0.12
    }
  })

  return (
    <group ref={groupRef} scale={1.92} rotation={[0.05, -0.24, -0.02]}>
      <Float
        speed={reducedMotion ? 0 : 1.2}
        rotationIntensity={reducedMotion ? 0 : 0.15}
        floatIntensity={reducedMotion ? 0 : 0.3}
      >
        <mesh ref={shellRef} scale={[1.3, 1.05, 0.88]}>
          <sphereGeometry args={[1.12, 96, 96]} />
          <meshPhysicalMaterial
            color="#65e7ff"
            transparent
            opacity={0.1}
            roughness={0.08}
            metalness={0.02}
            transmission={0.78}
            thickness={0.9}
            ior={1.42}
            clearcoat={1}
            clearcoatRoughness={0.08}
            emissive="#1d4cff"
            emissiveIntensity={0.25}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[network.pointPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.013}
            color={palette.cyan}
            transparent
            opacity={0.76}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[network.ridgePositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={palette.electric}
            transparent
            opacity={0.18}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>

        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[network.sulciPositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={palette.violet}
            transparent
            opacity={0.2}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>

        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[network.edgePositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={palette.blue}
            transparent
            opacity={0.32}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>

        <NeuralNodes nodes={network.nodes} />

        <points ref={sparkRef} rotation={[0.1, 0.35, 0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[network.sparks, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.011}
            color={palette.magenta}
            transparent
            opacity={0.48}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        <points ref={stormRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[network.storm, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.012}
            color={palette.electric}
            transparent
            opacity={0.36}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {network.lightning.map((bolt) => (
          <Lightning
            key={bolt.seed}
            bolt={bolt}
            reducedMotion={reducedMotion}
          />
        ))}
      </Float>
    </group>
  )
}

function BrainFallback() {
  return (
    <div className="brain-fallback" style={fallbackStyle} aria-hidden="true">
      <div className="brain-fallback__halo" />
      <div className="brain-fallback__storm-ring" />
      <div className="brain-fallback__brain">
        <span />
        <span />
        <span />
        <span />
        <span />
        <i />
        <i />
        <i />
      </div>
    </div>
  )
}

export function BrainHeroScene({ reducedMotion = false }: BrainHeroSceneProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(max-width: 1023px)')
  const shouldFallback = reducedMotion || isMobile
  const density = isTablet ? 560 : 980

  useEffect(() => {
    if (typeof window !== 'undefined' && !shouldFallback) {
      const root = document.documentElement
      root.style.setProperty('--brain-rendering', 'active')
      return () => {
        root.style.removeProperty('--brain-rendering')
      }
    }

    return undefined
  }, [shouldFallback])

  if (shouldFallback) {
    return <BrainFallback />
  }

  return (
    <div className="brain-hero-scene" aria-hidden="true">
      <div className="brain-hero-scene__aurora" />
      <div className="brain-hero-scene__storm" />
      <Canvas
        dpr={isTablet ? [1, 1.35] : [1, 1.8]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        camera={{ position: [0, 0, 5], fov: 38 }}
        performance={{ min: 0.55 }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={38} />
        <color attach="background" args={['#020712']} />
        <ambientLight intensity={0.72} />
        <pointLight
          position={[-2.8, 1.9, 2.7]}
          color={palette.cyan}
          intensity={14}
          distance={7}
        />
        <pointLight
          position={[2.8, -1.1, 2.2]}
          color={palette.magenta}
          intensity={11}
          distance={6}
        />
        <pointLight
          position={[0, 2.8, -1.2]}
          color={palette.violet}
          intensity={10}
          distance={6}
        />
        <pointLight
          position={[0.2, -2.4, 2.6]}
          color={palette.electric}
          intensity={8}
          distance={5}
        />
        <BrainCore
          density={density}
          lineDistance={isTablet ? 0.34 : 0.27}
          reducedMotion={Boolean(reducedMotion)}
        />
      </Canvas>
      <div className="brain-hero-scene__vignette" />
    </div>
  )
}
