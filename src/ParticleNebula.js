import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function ParticleCloud() {
  const ref = useRef()
  const particleCount = 5000
  
  const particles = useMemo(() => {
    const temp = new Float32Array(particleCount * 3)
    for (let i = 0; i < temp.length; i += 3) {
      temp[i] = (Math.random() - 0.5) * 10     // x
      temp[i + 1] = (Math.random() - 0.5) * 10 // y
      temp[i + 2] = (Math.random() - 0.5) * 10 // z
    }
    return temp
  }, [])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10
      ref.current.rotation.y -= delta / 15
    }
  })

  return (
    <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#8844aa"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  )
}

function ParticleNebula() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ParticleCloud />
    </Canvas>
  )
}

export default ParticleNebula