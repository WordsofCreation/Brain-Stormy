import { Float, PerspectiveCamera } from '@react-three/drei'
import { Canvas, useFrame, type RootState } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react'
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

type BrainNetwork = {
  pointPositions: Float32Array
  edgePositions: Float32Array
  nodes: BrainPoint[]
  sparks: Float32Array
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
}

const fallbackStyle =
  {
    '--brain-cyan': palette.cyan,
    '--brain-violet': palette.violet,
    '--brain-magenta': palette.magenta,
  } as CSSProperties

function createBrainNetwork(density: number, lineDistance: number): BrainNetwork {
  const points: BrainPoint[] = []
  const pointPositions: number[] = []
  const sparks: number[] = []
  const nodeEvery = density > 520 ? 11 : 9

  for (let i = 0; i < density; i += 1) {
    const hemisphere = i % 2 === 0 ? -1 : 1
    const t = (i + 0.5) / density
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    const theta = i * goldenAngle
    const y = 1 - 2 * t
    const radial = Math.sqrt(Math.max(0, 1 - y * y))
    const lobeBias = 0.82 + 0.22 * Math.sin(theta * 2.1) + 0.08 * Math.cos(y * 7)

    let x = hemisphere * (0.22 + radial * Math.cos(theta) * 1.06 * lobeBias)
    let z = radial * Math.sin(theta) * 0.78 * lobeBias
    const foldedY = y * 0.9 + 0.1 * Math.sin(theta * 3 + hemisphere)

    const frontBackTaper = 1 - 0.18 * Math.max(0, z)
    x *= frontBackTaper
    z += 0.2 * Math.cos(y * Math.PI) - 0.05

    const crease = Math.abs(x) < 0.19 ? 0.28 : 1
    const cortexRipple = 0.08 * Math.sin(theta * 7.5 + y * 6) + 0.045 * Math.cos(theta * 4 - z * 5)

    const position = new THREE.Vector3(
      x + cortexRipple * hemisphere * 0.35,
      foldedY + cortexRipple * 0.28,
      z * crease + cortexRipple,
    )

    if (position.y < -0.82 && Math.abs(position.x) > 1.02) {
      position.x *= 0.82
      position.y += 0.12
    }

    pointPositions.push(position.x, position.y, position.z)
    sparks.push((Math.random() - 0.5) * 5.8, (Math.random() - 0.5) * 3.4, (Math.random() - 0.5) * 3.2)

    if (i % nodeEvery === 0 || Math.sin(theta * 2.4) > 0.96) {
      points.push({
        position,
        nodeScale: 0.018 + ((i % 17) / 17) * 0.036,
        hue: i % 3,
      })
    }
  }

  const edgePositions: number[] = []
  const maxEdges = density > 520 ? 420 : 260
  let edges = 0

  for (let i = 0; i < density && edges < maxEdges; i += 1) {
    const ax = pointPositions[i * 3]
    const ay = pointPositions[i * 3 + 1]
    const az = pointPositions[i * 3 + 2]

    for (let j = i + 7; j < density && edges < maxEdges; j += density > 520 ? 17 : 23) {
      const bx = pointPositions[j * 3]
      const by = pointPositions[j * 3 + 1]
      const bz = pointPositions[j * 3 + 2]
      const distance = Math.hypot(ax - bx, ay - by, az - bz)
      const bridgesHemispheres = Math.abs(ax + bx) < 0.32 && Math.abs(ay - by) < 0.32

      if (distance < lineDistance || (bridgesHemispheres && distance < lineDistance * 1.5 && edges % 5 === 0)) {
        edgePositions.push(ax, ay, az, bx, by, bz)
        edges += 1
      }
    }
  }

  return {
    pointPositions: new Float32Array(pointPositions),
    edgePositions: new Float32Array(edgePositions),
    nodes: points,
    sparks: new Float32Array(sparks),
  }
}

function NeuralNodes({ nodes }: { nodes: BrainPoint[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const colorArray = useMemo(
    () => nodes.map((node) => new THREE.Color(node.hue === 0 ? palette.cyan : node.hue === 1 ? palette.violet : palette.magenta)),
    [nodes],
  )

  useLayoutEffect(() => {
    if (!meshRef.current) {
      return
    }

    const matrix = new THREE.Matrix4()
    nodes.forEach((node, index) => {
      matrix.compose(node.position, new THREE.Quaternion(), new THREE.Vector3(node.nodeScale, node.nodeScale, node.nodeScale))
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
      <sphereGeometry args={[1, 14, 14]} />
      <meshBasicMaterial transparent opacity={0.95} toneMapped={false} vertexColors />
    </instancedMesh>
  )
}

function BrainCore({ density, lineDistance, reducedMotion }: BrainCoreProps) {
  const groupRef = useRef<THREE.Group>(null)
  const glassRef = useRef<THREE.Mesh>(null)
  const network = useMemo(() => createBrainNetwork(density, lineDistance), [density, lineDistance])

  useFrame((state: RootState) => {
    const elapsed = state.clock.getElapsedTime()
    const group = groupRef.current

    if (!group) {
      return
    }

    if (reducedMotion) {
      group.rotation.set(0.04, -0.2, 0)
      return
    }

    const pointerX = THREE.MathUtils.clamp(state.pointer.x, -0.75, 0.75)
    const pointerY = THREE.MathUtils.clamp(state.pointer.y, -0.75, 0.75)
    const scrollNudge = typeof window === 'undefined' ? 0 : Math.min(window.scrollY / 1200, 0.7)

    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, -0.22 + pointerX * 0.18 + elapsed * 0.035 + scrollNudge * 0.12, 0.035)
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, 0.03 - pointerY * 0.08, 0.035)
    group.position.y = Math.sin(elapsed * 0.72) * 0.055
    const breath = 1 + Math.sin(elapsed * 1.05) * 0.018
    group.scale.setScalar(breath)

    if (glassRef.current) {
      glassRef.current.rotation.y = elapsed * 0.025
      glassRef.current.rotation.z = Math.sin(elapsed * 0.35) * 0.025
    }
  })

  return (
    <group ref={groupRef} scale={1.74} rotation={[0.04, -0.24, -0.02]}>
      <Float speed={reducedMotion ? 0 : 1.15} rotationIntensity={reducedMotion ? 0 : 0.18} floatIntensity={reducedMotion ? 0 : 0.3}>
        <mesh ref={glassRef} scale={[1.28, 1.04, 0.88]}>
          <sphereGeometry args={[1.12, 64, 64]} />
          <meshPhysicalMaterial
            color="#65e7ff"
            transparent
            opacity={0.12}
            roughness={0.18}
            metalness={0.04}
            transmission={0.72}
            thickness={0.72}
            ior={1.38}
            clearcoat={1}
            clearcoatRoughness={0.12}
            emissive="#1239ff"
            emissiveIntensity={0.22}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[network.pointPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.014} color={palette.cyan} transparent opacity={0.72} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>

        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[network.edgePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={palette.blue} transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} />
        </lineSegments>

        <NeuralNodes nodes={network.nodes} />

        <points rotation={[0.1, 0.35, 0]}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[network.sparks, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.009} color={palette.magenta} transparent opacity={0.42} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
      </Float>
    </group>
  )
}

function BrainFallback() {
  return (
    <div className="brain-fallback" style={fallbackStyle} aria-hidden="true">
      <div className="brain-fallback__halo" />
      <div className="brain-fallback__brain">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}

export function BrainHeroScene({ reducedMotion = false }: BrainHeroSceneProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(max-width: 1023px)')
  const shouldFallback = reducedMotion || isMobile
  const density = isTablet ? 420 : 720

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
      <Canvas
        dpr={isTablet ? [1, 1.35] : [1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 4.7], fov: 40 }}
        performance={{ min: 0.55 }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 4.7]} fov={40} />
        <color attach="background" args={['#020712']} />
        <ambientLight intensity={0.62} />
        <pointLight position={[-2.8, 1.9, 2.7]} color={palette.cyan} intensity={12} distance={7} />
        <pointLight position={[2.8, -1.1, 2.2]} color={palette.magenta} intensity={9} distance={6} />
        <pointLight position={[0, 2.6, -1.2]} color={palette.violet} intensity={8} distance={6} />
        <BrainCore density={density} lineDistance={isTablet ? 0.34 : 0.28} reducedMotion={Boolean(reducedMotion)} />
      </Canvas>
      <div className="brain-hero-scene__vignette" />
    </div>
  )
}
