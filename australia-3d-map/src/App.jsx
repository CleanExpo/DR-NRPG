import React, { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, OrbitControls } from '@react-three/drei'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { geoMercator, geoPath } from 'd3-geo'
import { calculateDistance } from './utils/geoMath'
import './App.css'

// Camera Effects Hook
export const useCameraEffects = () => {
  const { camera } = useThree()
  
  const triggerShake = (intensity = 0.5) => {
    const originalPos = { ...camera.position }
    gsap.to(camera.position, {
      x: originalPos.x + (Math.random() - 0.5) * intensity,
      y: originalPos.y + (Math.random() - 0.5) * intensity,
      duration: 0.05,
      repeat: 5,
      yoyo: true,
      onComplete: () => {
        gsap.to(camera.position, { ...originalPos, duration: 0.1 })
      }
    })
  }
  return { triggerShake }
}

// Emergency System Hook
const useEmergencySystem = (contractors) => {
  const [showForm, setShowForm] = useState(false);
  const [activeIncident, setActiveIncident] = useState(null);

  const checkCoverageAndReport = (incidentCoords) => {
    // Spatial math: Calculate distance between incident and each contractor
    const isCovered = contractors.some(contractor => {
      const distance = calculate3DDistance(incidentCoords, contractor.position);
      const radiusThreshold = contractor.tier; // 25, 50, or 100
      return distance <= radiusThreshold;
    });

    if (isCovered) {
      setActiveIncident(incidentCoords);
      setShowForm(true);
      // triggerShake would need to be called from within Canvas context
    } else {
      alert("No contractors currently onboarded for this territory.");
    }
  };

  return { showForm, setShowForm, checkCoverageAndReport, activeIncident };
};

// Helper function to calculate 3D distance (for visual positioning)
const calculate3DDistance = (pos1, pos2) => {
  const dx = pos1[0] - pos2[0];
  const dy = pos1[1] - pos2[1];
  const dz = pos1[2] - pos2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

// Emergency Work Form Component
const EmergencyWorkForm = ({ incidentData, contractor, onClose }) => {
  return (
    <div className="fixed top-0 right-0 h-full w-[450px] bg-slate-950/60 backdrop-blur-3xl border-l border-white/10 p-8 z-[100] shadow-[-20px_0_80px_rgba(0,0,0,0.8)] animate-slide-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-white italic tracking-tighter">EMERGENCY WORK FORM</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-400 uppercase font-bold tracking-widest mb-1">Assigned Responder</p>
          <p className="text-white font-mono">{contractor?.name || 'N/A'} — {contractor?.tier || 0}km Tier</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 uppercase font-bold">Damage Type</label>
            <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded text-white focus:border-blue-500 outline-none">
              <option>Flood / Water Damage</option>
              <option>Fire / Smoke Recovery</option>
              <option>Structural Impact</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs text-slate-400 uppercase font-bold">Priority Level</label>
            <div className="flex gap-2 mt-2">
              {['Standard', 'Urgent', 'Catastrophic'].map(level => (
                <button key={level} type="button" className="flex-1 py-2 bg-slate-800 border border-slate-700 text-xs text-white hover:bg-red-600 transition-colors uppercase font-bold">
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:bg-red-500 transition-all mt-8">
            Dispatch Recovery Team
          </button>
        </form>
      </div>
    </div>
  );
};

// 3D Terrain with elevation
const Terrain = () => {
  const meshRef = useRef()
  
  useEffect(() => {
    if (!meshRef.current) return
    
    const geometry = meshRef.current.geometry
    const positions = geometry.attributes.position
    
    // Generate terrain elevation
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getZ(i)
      
      // Create varied terrain using noise-like function
      const elevation = 
        Math.sin(x * 0.2) * Math.cos(z * 0.2) * 0.3 +
        Math.sin(x * 0.5) * 0.15 +
        Math.cos(z * 0.3) * 0.1
      
      positions.setY(i, elevation)
    }
    
    positions.needsUpdate = true
    geometry.computeVertexNormals()
  }, [])

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[40, 40, 128, 128]} />
      <meshStandardMaterial 
        color="#2a3441"       // A deep, desaturated slate blue
        roughness={0.85}      // Prevents shiny plastic reflections
        metalness={0.1}       // Keeps it looking like stone/matte plastic
        flatShading={false}   // Ensure smooth surfaces
      />
    </mesh>
  )
}

// Ocean/Water plane
const Ocean = () => {
  const meshRef = useRef()
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime()
      meshRef.current.material.uniforms.time.value = time
    }
  })

  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color('#1e3a5f') }
    },
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.z += sin(pos.x * 2.0 + time) * 0.1;
        pos.z += cos(pos.y * 2.0 + time * 0.5) * 0.1;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying vec2 vUv;
      void main() {
        gl_FragColor = vec4(color, 0.6);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
      <planeGeometry args={[50, 50, 32, 32]} />
      <primitive object={waterMaterial} attach="material" />
    </mesh>
  )
}
const Starfield = () => {
  useEffect(() => {
    const stars = []
    for (let i = 0; i < 500; i++) {
      const star = new THREE.Vector3(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      )
      stars.push(star)
    }
  }, [])

  return (
    <group>
      {Array.from({ length: 500 }).map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 200,
          (Math.random() - 0.5) * 200,
          (Math.random() - 0.5) * 200
        ]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color={`hsl(${Math.random() * 60 + 200}, 100%, ${Math.random() * 50 + 50}%)`} />
        </mesh>
      ))}
    </group>
  )
}

// Enhanced incident ripple effect
const IncidentRipple = ({ position, resolved }) => {
  const rippleRef = useRef()

  useFrame(({ clock }) => {
    if (rippleRef.current) {
      const time = clock.getElapsedTime() * 2
      rippleRef.current.scale.x = rippleRef.current.scale.y = 1 + time
      rippleRef.current.material.opacity = Math.max(0, 1 - (time % 2) / 2)
    }
  })

  return (
    <mesh ref={rippleRef} position={[position[0], 0.55, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.2, 0.3, 32]} />
      <meshBasicMaterial color={resolved ? '#22c55e' : '#ff4444'} transparent opacity={0.8} />
    </mesh>
  )
}
const CameraController = () => {
  const { camera } = useRef(new THREE.Camera()).current || {}
  const mouseDown = useRef(false)
  const mouse = useRef({ x: 0, y: 0 })
  const rotation = useRef({ x: 0, y: 0 })

  useFrame(({ camera }) => {
    camera.position.x = 15 * Math.sin(rotation.current.y) * Math.cos(rotation.current.x)
    camera.position.y = 10 + 5 * Math.sin(rotation.current.x)
    camera.position.z = 15 * Math.cos(rotation.current.y) * Math.cos(rotation.current.x)
    camera.lookAt(0, 0, 0)
  })

  useEffect(() => {
    const handleMouseDown = (e) => {
      mouseDown.current = true
      mouse.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = (e) => {
      if (!mouseDown.current) return
      const dx = (e.clientX - mouse.current.x) * 0.01
      const dy = (e.clientY - mouse.current.y) * 0.01
      rotation.current.y += dx
      rotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.current.x + dy))
      mouse.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
      mouseDown.current = false
    }

    const handleWheel = (e) => {
      e.preventDefault()
      rotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.current.x + e.deltaY * 0.001))
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return null
}

const Ground = () => {
  return null // Replaced by Terrain component
}

// Helper to center GeoJSON data
const centerGeoData = (data) => {
  const projection = geoMercator().center([133, -25]).scale(500);
  return data.features.map(feature => {
    // Logic to translate Lat/Long to centered 3D coordinates
    // This ensures your "Raised" states aren't skewed
    return feature;
  });
};

// Australian States as 3D extruded regions
const AustralianMap = ({ geoData }) => {
  const stateColors = {
    'NSW': '#3b82f6',
    'VIC': '#6366f1',
    'QLD': '#8b5cf6',
    'WA': '#ec4899',
    'SA': '#f59e0b',
    'NT': '#ef4444',
    'TAS': '#06b6d4',
  }

  const groupRef = useRef()

  return (
    <group ref={groupRef}>
      {geoData?.features.map((feature) => {
        const stateName = feature.properties.abbr
        const coords = feature.geometry.coordinates[0]
        
        // Create 3D extruded shape from coordinates
        const shape = new THREE.Shape()
        
        coords.forEach((coord, idx) => {
          // Scale coordinates to fit our scene
          const x = (coord[0] - 130) / 5 - 3
          const z = -(coord[1] + 25) / 5
          
          if (idx === 0) {
            shape.moveTo(x, z)
          } else {
            shape.lineTo(x, z)
          }
        })

        const extrudeSettings = {
          steps: 1,
          depth: 1.5,           // Thickness of the "block"
          bevelEnabled: true,
          bevelThickness: 0.15, // Rounded top edge
          bevelSize: 0.1,       // Expansion of the bevel
          bevelOffset: 0,
          bevelSegments: 8      // Smoothness
        }

        return (
          <group key={stateName}>
            {/* Main state body */}
            <mesh 
              position={[0, 0, 0]} 
              rotation={[-Math.PI / 2, 0, 0]} 
              castShadow 
              receiveShadow
              // Adding a tiny scale reduction (0.99) creates the 
              // gap between states seen on the CORE site
              scale={[0.99, 0.99, 1]}
            >
              <extrudeGeometry args={[shape, extrudeSettings]} />
              <meshPhysicalMaterial 
                color="#1a222f"           /* Deep CORE Slate */
                roughness={0.9}           /* Matte finish */
                metalness={0.1}           /* Non-metallic */
                clearcoat={0.05}          /* Subtle top sheen */
                clearcoatRoughness={0.1} 
                flatShading={false} 
              />
            </mesh>

            {/* State border glow */}
            <mesh position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <extrudeGeometry args={[shape, { depth: 0.01 }]} />
              <meshBasicMaterial
                color={stateColors[stateName]}
                transparent
                opacity={0.5}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// 3D Building models for contractor locations
const ContractorBuilding = ({ position, tier, color }) => {
  const buildingRef = useRef()
  const lightRef = useRef()
  
  const heightMap = { 25: 0.6, 50: 1.2, 75: 1.8, 100: 2.5 }
  const height = heightMap[tier]

  useEffect(() => {
    if (buildingRef.current) {
      gsap.from(buildingRef.current.position, {
        y: 8,
        duration: 1.5,
        ease: "bounce.out"
      })
      gsap.from(buildingRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1,
        ease: "back.out(1.7)"
      })
    }
  }, [])

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const pulse = 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.5
      lightRef.current.intensity = pulse
    }
  })

  return (
    <group position={position}>
      {/* Main building structure */}
      <group ref={buildingRef}>
        {/* Base foundation */}
        <mesh position={[0, height / 4, 0]} castShadow>
          <boxGeometry args={[0.4, height / 2, 0.4]} />
          <meshStandardMaterial
            color={color}
            roughness={0.3}
            metalness={0.7}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Top section */}
        <mesh position={[0, height / 2 + 0.3, 0]} castShadow>
          <boxGeometry args={[0.35, 0.3, 0.35]} />
          <meshStandardMaterial
            color={color}
            roughness={0.2}
            metalness={0.8}
            emissive={color}
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Antenna */}
        <mesh position={[0, height / 2 + 0.6, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1}
          />
        </mesh>

        {/* Communication array */}
        <mesh position={[0, height / 2 + 0.75, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>

      {/* Coverage zone visualization */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[tier / 80, tier / 75, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glowing base circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Point light from building */}
      <pointLight
        ref={lightRef}
        position={[0, height / 2, 0]}
        color={color}
        intensity={2}
        distance={5}
        decay={2}
      />
    </group>
  )
}

export default function App() {
  const [incidents, setIncidents] = useState([])
  const [stats, setStats] = useState({ totalIncidents: 0, resolved: 0, avgTime: 0 })
  const [geoData, setGeoData] = useState(null)
  const [currentMouseCoords, setCurrentMouseCoords] = useState([0, 0, 0])
  const [assignedContractor, setAssignedContractor] = useState(null)
  
  // Define contractors array first so we can pass to hook
  const contractors = [
    { id: 1, name: 'Karalee HQ', position: [2, 0.8, -1], tier: 100, state: 'NSW', color: '#60a5fa', lat: -33.8688, lng: 151.2093 },
    { id: 2, name: 'Melbourne Central', position: [1.5, 0.8, -2.5], tier: 100, state: 'VIC', color: '#60a5fa', lat: -37.8136, lng: 144.9631 },
    { id: 3, name: 'Brisbane North', position: [2.8, 0.8, 1], tier: 50, state: 'QLD', color: '#fbbf24', lat: -27.4698, lng: 153.0251 },
    { id: 4, name: 'Brisbane South', position: [2.2, 0.8, 0], tier: 50, state: 'QLD', color: '#fbbf24', lat: -27.4698, lng: 153.0251 },
    { id: 5, name: 'Perth Metro', position: [-2.5, 0.8, 0], tier: 75, state: 'WA', color: '#a78bfa', lat: -31.9505, lng: 115.8605 },
    { id: 6, name: 'Adelaide Central', position: [0, 0.8, -1], tier: 50, state: 'SA', color: '#fbbf24', lat: -34.9285, lng: 138.6007 },
    { id: 7, name: 'Darwin Hub', position: [0.5, 0.8, 1.2], tier: 75, state: 'NT', color: '#a78bfa', lat: -12.4634, lng: 130.8456 },
    { id: 8, name: 'Hobart Base', position: [2.5, 0.8, -3], tier: 25, state: 'TAS', color: '#f87171', lat: -42.8821, lng: 147.3272 },
  ]

  // Use emergency system hook to manage form state
  const { showForm, setShowForm, checkCoverageAndReport, activeIncident } = useEmergencySystem(contractors)

  useEffect(() => {
    fetch('/data/regions-australia.json')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error('Failed to load map data:', err))
  }, [])

  const triggerSimulation = () => {
    const incidentPos = [(Math.random() - 0.5) * 12, 0.5, (Math.random() - 0.5) * 10]
    const newIncident = {
      id: Date.now(),
      position: incidentPos,
      type: ['fire', 'flood', 'medical'][Math.floor(Math.random() * 3)],
      timestamp: new Date(),
      resolved: false,
    }
    setIncidents([...incidents, newIncident])
    setStats(prev => ({ ...prev, totalIncidents: prev.totalIncidents + 1 }))
  }

  const resolveIncident = (id) => {
    setIncidents(incidents.map(inc => inc.id === id ? { ...inc, resolved: true } : inc))
    setStats(prev => ({ ...prev, resolved: prev.resolved + 1 }))
  }

  const handleEmergencyClick = (incidentLocation) => {
    // Find if any contractor's radius covers this point
    const assignedContractor = contractors.find(c => {
      const dist = calculateDistance(incidentLocation.lat, incidentLocation.lng, c.lat, c.lng);
      return dist <= c.tier; // tier = 25, 50, or 100
    });

    if (assignedContractor) {
      // triggerShake(1.2); // Visual feedback of impact - would need Canvas context
      setAssignedContractor(assignedContractor);
      setActiveIncident(incidentLocation);
      setShowForm(true); // Open the Emergency Work Form
    } else {
      // Visual feedback for "No Coverage"
      alert("No contractors currently onboarded for this territory.");
    }
  };

  return (
    <div className="relative h-screen w-full bg-[#080a0f]">
      <div className="scanlines scanlines-active" />
      
      {/* HUD Overlay */}
      <div className="fixed top-5 left-5 w-80 bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl overflow-hidden" style={{ color: 'white', zIndex: 100, fontFamily: 'monospace' }}>
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
        <h1 className="text-white font-bold tracking-tight text-xl mb-1">NRPG DISASTER RECOVERY</h1>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-4">Live Network Monitor</p>
        <div className="h-px w-full bg-gradient-to-r from-blue-500/50 to-transparent mb-4" />
        <p style={{ margin: '4px 0', color: '#94a3b8', fontSize: '12px' }}>📍 Territory: Australia</p>
        <p style={{ margin: '4px 0', color: '#94a3b8', fontSize: '12px' }}>Status: ACTIVE</p>
        <div style={{ marginTop: '12px', paddingTop: '12px', fontSize: '12px' }}>
          <div className="h-px w-full bg-gradient-to-r from-blue-500/50 to-transparent mb-3" />
          <p style={{ margin: '4px 0', color: '#60a5fa' }}>🛡️ Active Contractors: {contractors.length}</p>
          <p style={{ margin: '4px 0', color: '#fbbf24' }}>🚨 Total Incidents: {stats.totalIncidents}</p>
          <p style={{ margin: '4px 0', color: '#22c55e' }}>✅ Resolved: {stats.resolved}</p>
        </div>
      </div>
      
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', zIndex: 100, fontFamily: 'monospace', marginTop: '200px' }}>
        <button 
          onClick={() => handleEmergencyClick({ lat: -33.8688, lng: 151.2093 })}
          className="bg-red-600 px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(220,38,38,0.5)]"
        >
          🚨 Report Emergency
        </button>
      </div>

      {showForm && (
        <EmergencyWorkForm 
          incidentData={activeIncident}
          contractor={assignedContractor}
          onClose={() => setShowForm(false)} 
        />
      )}

      {/* Incident List */}
      <div style={{ position: 'absolute', bottom: 20, left: 20, color: 'white', zIndex: 100, fontFamily: 'monospace', maxHeight: '350px', overflowY: 'auto' }}>
        {incidents.length > 0 && (
          <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-2xl" style={{ fontSize: '11px' }}>
            <h2 className="text-xs uppercase tracking-widest text-red-400 font-bold mb-2">
              🚨 Active Incidents ({incidents.filter(i => !i.resolved).length})
            </h2>
            <div className="h-px w-full bg-gradient-to-r from-red-500/50 to-transparent mb-4" />
            <div>
              {incidents.slice(-5).map((incident) => (
                <div 
                  key={incident.id} 
                  style={{
                    padding: '8px',
                    marginBottom: '6px',
                    background: incident.resolved ? 'rgba(34, 197, 94, 0.15)' : 'rgba(220, 38, 38, 0.15)',
                    borderLeft: `3px solid ${incident.resolved ? '#22c55e' : '#dc2626'}`,
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ color: incident.resolved ? '#22c55e' : '#fca5a5' }}>
                    {incident.type.toUpperCase()} - ID:{incident.id.toString().slice(-4)}
                  </span>
                  {!incident.resolved && (
                    <button
                      onClick={() => resolveIncident(incident.id)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '10px',
                        background: '#22c55e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#16a34a'}
                      onMouseLeave={(e) => e.target.style.background = '#22c55e'}
                    >
                      RESOLVE
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contractor List */}
      <div style={{ position: 'absolute', top: 20, right: 20, color: 'white', zIndex: 100, fontFamily: 'monospace', maxWidth: '320px' }}>
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-2xl" style={{ fontSize: '11px', maxHeight: '450px', overflowY: 'auto' }}>
          <h2 className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-2">
            ⚡ Contractor Network
          </h2>
          <div className="h-px w-full bg-gradient-to-r from-purple-500/50 to-transparent mb-4" />
          <div>
            {contractors.map((c) => (
              <div key={c.id} style={{ padding: '8px', marginBottom: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', borderLeft: `3px solid ${c.color}` }}>
                <p style={{ margin: '0', color: c.color, fontWeight: 'bold' }}>{c.name}</p>
                <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontSize: '10px' }}>{c.state} • {c.tier}km Tier</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Canvas shadows camera={{ position: [12, 12, 12], fov: 40 }}>
        {/* Professional dark background */}
        <color attach="background" args={['#080a0f']} /> 
        
        {/* The Environment provides the soft reflections on the bevels */}
        <Environment preset="city" /> 
        
        <Suspense fallback={null}>
          <group position={[0, -1, 0]}>
            {/* Key Light: Casts the primary shadows */}
            <directionalLight 
              position={[10, 20, 10]} 
              intensity={1.5} 
              castShadow 
              shadow-mapSize={[2048, 2048]} 
            />

            {/* Fill Light: Softens the dark side of the blocks */}
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
            
            {/* Fog for depth */}
            <fog attach="fog" args={['#0f172a', 10, 50]} />
            
            {/* 3D Environment */}
            <Starfield />
            <Terrain />
            <Ocean />
            <Ground />
            {geoData && <AustralianMap geoData={geoData} />}
            
            {contractors.map(contractor => (
              <ContractorBuilding
                key={contractor.id}
                position={contractor.position}
                tier={contractor.tier}
                color={contractor.color}
              />
            ))}

            {incidents.map(incident => (
              <group key={incident.id}>
                <IncidentRipple position={incident.position} resolved={incident.resolved} />
                <mesh 
                  position={incident.position}
                  onClick={() => resolveIncident(incident.id)}
                  castShadow
                >
                  <sphereGeometry args={[0.3, 32, 32]} />
                  <meshStandardMaterial 
                    color={incident.resolved ? '#22c55e' : '#ff4444'} 
                    emissive={incident.resolved ? '#22c55e' : '#ff0000'} 
                    emissiveIntensity={2}
                    roughness={0.2}
                    metalness={0.8}
                  />
                </mesh>
              </group>
            ))}
            
            {/* ContactShadows grounds the map so it doesn't look like it's floating */}
            <ContactShadows 
              rotation-x={Math.PI / 2} 
              position={[0, 0, 0]} 
              opacity={0.7} 
              width={40} 
              height={40} 
              blur={2.5} 
              far={2} 
            />
          </group>
        </Suspense>
        
        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2.2} 
          makeDefault 
        />
      </Canvas>
    </div>
  )
}

