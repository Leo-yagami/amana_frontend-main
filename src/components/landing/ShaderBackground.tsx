'use client'

import { useEffect, useRef, useState } from 'react'

const vertexShader = `#version 300 es
precision mediump float;

in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`

const fragmentShader = `#version 300 es
precision mediump float;

uniform vec2 uResolution;
uniform float uTime;
uniform bool uLightMode;
uniform vec2 uMousePos;
uniform bool uIsMobile;

in vec2 vUv;
out vec4 outColor;

// Subtle hash noise
float hash(vec2 p) {
  float h = dot(p, vec2(127.1, 311.7));
  return fract(sin(h) * 43758.5453);
}

// Simple Perlin-like noise
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  
  // Smooth interpolation
  f = f * f * (3.0 - 2.0 * f);
  
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  
  float ab = mix(a, b, f.x);
  float cd = mix(c, d, f.x);
  return mix(ab, cd, f.y);
}

void main() {
  vec2 uv = vUv;
  
  // Subtle fine grain texture (premium feel)
  float grain = noise(uv * 80.0) * 0.015;
  
  // Slow, subtle flowing pattern
  float flow = sin(uv.y * 2.0 + uTime * 0.15) * 0.008;
  flow += cos(uv.x * 1.5 - uTime * 0.12) * 0.005;
  
  // Mouse-responsive subtle influence (desktop only)
  vec2 mouseShift = vec2(0.0);
  if (!uIsMobile) {
    mouseShift = (uMousePos - 0.5) * 0.06;
  } else {
    // Mobile: time-based subtle drift
    mouseShift = vec2(sin(uTime * 0.15) * 0.03, cos(uTime * 0.18) * 0.03);
  }
  
  // Very subtle radial influence from mouse/center
  vec2 distToMouse = uv - (0.5 + mouseShift);
  float mouseInfluence = length(distToMouse);
  mouseInfluence = smoothstep(1.2, 0.0, mouseInfluence) * 0.008;
  
  // Combine all subtle effects
  float totalEffect = grain + flow + mouseInfluence;
  
  if (uLightMode) {
    // Light mode: barely visible premium texture
    vec3 bgColor = vec3(1.0, 1.0, 1.0);
    vec3 finalColor = bgColor - (totalEffect * 0.05);
    outColor = vec4(finalColor, 1.0);
  } else {
    // Dark mode: very subtle cyan-tinted shimmer
    vec3 bgColor = vec3(0.08, 0.09, 0.11);
    
    // Extremely subtle cyan undertone (doesn't lighten or change mood)
    vec3 shimmer = vec3(0.12, 0.11, 0.105) * totalEffect * 0.4;
    
    vec3 finalColor = bgColor + shimmer;
    
    outColor = vec4(finalColor, 1.0);
  }
}`

interface ShaderBackgroundProps {
  lightMode?: boolean
}

export default function ShaderBackground({ lightMode = false }: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGL2RenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const isMobileRef = useRef(false)

  // Track mouse movement
  useEffect(() => {
    isMobileRef.current = window.innerWidth < 768

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobileRef.current) return
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: 1.0 - e.clientY / window.innerHeight,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Initialize WebGL
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2')
    if (!gl) {
      console.error('WebGL2 not supported')
      return
    }

    glRef.current = gl

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      isMobileRef.current = window.innerWidth < 768
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Compile shaders
    const compileShader = (source: string, type: number): WebGLShader | null => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader))
        return null
      }
      return shader
    }

    const vs = compileShader(vertexShader, gl.VERTEX_SHADER)
    const fs = compileShader(fragmentShader, gl.FRAGMENT_SHADER)

    if (!vs || !fs) {
      window.removeEventListener('resize', resizeCanvas)
      return
    }

    // Link program
    const program = gl.createProgram()
    if (!program) {
      window.removeEventListener('resize', resizeCanvas)
      return
    }

    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      window.removeEventListener('resize', resizeCanvas)
      return
    }

    programRef.current = program
    gl.useProgram(program)

    // Set up position buffer
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    )

    const posLocation = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(posLocation)
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0)

    // Get uniform locations
    const resolutionLoc = gl.getUniformLocation(program, 'uResolution')
    const timeLoc = gl.getUniformLocation(program, 'uTime')
    const lightModeLoc = gl.getUniformLocation(program, 'uLightMode')
    const mousePosLoc = gl.getUniformLocation(program, 'uMousePos')
    const isMobileLoc = gl.getUniformLocation(program, 'uIsMobile')

    gl.uniform2f(resolutionLoc, canvas.width, canvas.height)

    // Animation loop
    let startTime = Date.now()
    let animId: number | null = null

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000

      gl.uniform1f(timeLoc, elapsed)
      gl.uniform1i(lightModeLoc, lightMode ? 1 : 0)
      gl.uniform2f(mousePosLoc, mousePos.x, mousePos.y)
      gl.uniform1i(isMobileLoc, isMobileRef.current ? 1 : 0)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      animId = requestAnimationFrame(animate)
    }

    animId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animId) cancelAnimationFrame(animId)
    }
  }, [lightMode, mousePos])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
