"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  defaultObjectSizing,
  getShaderColorFromString,
  meshGradientFragmentShader,
  meshGradientMeta,
  paperVertexShaderSource,
  ShaderFitOptions,
  type ShaderFit,
} from "@/lib/paper-shaders/mesh-gradient";

type WebGLResources = {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  positionBuffer: WebGLBuffer;
  uniforms: {
    u_time: WebGLUniformLocation;
    u_resolution: WebGLUniformLocation;
    u_pixelRatio: WebGLUniformLocation;
    u_colors0: WebGLUniformLocation;
    u_colorsCount: WebGLUniformLocation;
    u_distortion: WebGLUniformLocation;
    u_swirl: WebGLUniformLocation;
    u_grainMixer: WebGLUniformLocation;
    u_grainOverlay: WebGLUniformLocation;
    u_fit: WebGLUniformLocation;
    u_rotation: WebGLUniformLocation;
    u_scale: WebGLUniformLocation;
    u_offsetX: WebGLUniformLocation;
    u_offsetY: WebGLUniformLocation;
    u_originX: WebGLUniformLocation;
    u_originY: WebGLUniformLocation;
    u_worldWidth: WebGLUniformLocation;
    u_worldHeight: WebGLUniformLocation;
    u_imageAspectRatio: WebGLUniformLocation | null;
    u_pxSize: WebGLUniformLocation | null;
  };
};

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("MeshGradient: failed to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) ?? "Unknown shader error";
    gl.deleteShader(shader);
    throw new Error(info);
  }
  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("MeshGradient: failed to create program");
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) ?? "Unknown program error";
    gl.deleteProgram(program);
    throw new Error(info);
  }
  return program;
}

function requireUniform(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
): WebGLUniformLocation {
  const location = gl.getUniformLocation(program, name);
  if (!location) throw new Error(`MeshGradient: missing uniform ${name}`);
  return location;
}

export type MeshGradientProps = React.HTMLAttributes<HTMLDivElement> & {
  colors?: string[];
  speed?: number;
  frame?: number;
  maxPixelCount?: number;
  minPixelRatio?: number;
  distortion?: number;
  swirl?: number;
  grainMixer?: number;
  grainOverlay?: number;
  fit?: ShaderFit;
  rotation?: number;
  scale?: number;
  originX?: number;
  originY?: number;
  offsetX?: number;
  offsetY?: number;
  worldWidth?: number;
  worldHeight?: number;
};

export function MeshGradient({
  className,
  colors = ["#e0eaff", "#241d9a", "#f75092", "#9f50d3"],
  speed = 1,
  frame = 0,
  maxPixelCount = 1920 * 1080 * 4,
  minPixelRatio = 2,
  distortion = 0.8,
  swirl = 0.1,
  grainMixer = 0,
  grainOverlay = 0,
  fit = defaultObjectSizing.fit,
  rotation = defaultObjectSizing.rotation,
  scale = defaultObjectSizing.scale,
  originX = defaultObjectSizing.originX,
  originY = defaultObjectSizing.originY,
  offsetX = defaultObjectSizing.offsetX,
  offsetY = defaultObjectSizing.offsetY,
  worldWidth = defaultObjectSizing.worldWidth,
  worldHeight = defaultObjectSizing.worldHeight,
  ...divProps
}: MeshGradientProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const webglRef = React.useRef<WebGLResources | null>(null);
  const rafIdRef = React.useRef<number | null>(null);
  const lastRenderTimeRef = React.useRef<number>(0);
  const currentFrameRef = React.useRef<number>(frame);
  const currentSpeedRef = React.useRef<number>(speed);
  const renderScaleRef = React.useRef<number>(1);
  const resolutionChangedRef = React.useRef<boolean>(true);
  const maxPixelCountRef = React.useRef<number>(maxPixelCount);
  const minPixelRatioRef = React.useRef<number>(minPixelRatio);

  maxPixelCountRef.current = maxPixelCount;
  minPixelRatioRef.current = minPixelRatio;

  const colorsVec4 = React.useMemo(() => {
    const maxCount = meshGradientMeta.maxColorCount;
    const packed = new Float32Array(maxCount * 4);
    const count = Math.min(maxCount, colors.length);
    for (let i = 0; i < count; i++) {
      const [r, g, b, a] = getShaderColorFromString(colors[i]);
      packed[i * 4 + 0] = r;
      packed[i * 4 + 1] = g;
      packed[i * 4 + 2] = b;
      packed[i * 4 + 3] = a;
    }
    return { packed, count };
  }, [colors]);

  const uniformInputsRef = React.useRef({
    colorsPacked: colorsVec4.packed,
    colorsCount: colorsVec4.count,
    distortion,
    swirl,
    grainMixer,
    grainOverlay,
    fit,
    rotation,
    scale,
    offsetX,
    offsetY,
    originX,
    originY,
    worldWidth,
    worldHeight,
  });

  uniformInputsRef.current = {
    colorsPacked: colorsVec4.packed,
    colorsCount: colorsVec4.count,
    distortion,
    swirl,
    grainMixer,
    grainOverlay,
    fit,
    rotation,
    scale,
    offsetX,
    offsetY,
    originX,
    originY,
    worldWidth,
    worldHeight,
  };

  const render = React.useCallback((now: number) => {
    const webgl = webglRef.current;
    const canvas = canvasRef.current;
    if (!webgl || !canvas) return;

    const previousTime = lastRenderTimeRef.current || now;
    const dt = now - previousTime;
    lastRenderTimeRef.current = now;
    if (currentSpeedRef.current !== 0) {
      currentFrameRef.current += dt * currentSpeedRef.current;
    }

    const { gl, program, uniforms } = webgl;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    gl.uniform1f(uniforms.u_time, currentFrameRef.current * 1e-3);
    if (resolutionChangedRef.current) {
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.u_pixelRatio, renderScaleRef.current);
      resolutionChangedRef.current = false;
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (currentSpeedRef.current !== 0) {
      rafIdRef.current = requestAnimationFrame(render);
    } else {
      rafIdRef.current = null;
    }
  }, []);

  const requestRender = React.useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }
    rafIdRef.current = requestAnimationFrame(render);
  }, [render]);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl2", {
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        powerPreference: "low-power",
      });
    } catch {
      gl = null;
    }
    if (!gl) return;

    gl.clearColor(0, 0, 0, 0);
    gl.disable(gl.DEPTH_TEST);

    let program: WebGLProgram;
    try {
      program = createProgram(gl, paperVertexShaderSource, meshGradientFragmentShader);
    } catch (error) {
      console.error("MeshGradient: shader compile/link failed", error);
      return;
    }

    gl.useProgram(program);
    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      u_time: requireUniform(gl, program, "u_time"),
      u_resolution: requireUniform(gl, program, "u_resolution"),
      u_pixelRatio: requireUniform(gl, program, "u_pixelRatio"),
      u_colors0: requireUniform(gl, program, "u_colors[0]"),
      u_colorsCount: requireUniform(gl, program, "u_colorsCount"),
      u_distortion: requireUniform(gl, program, "u_distortion"),
      u_swirl: requireUniform(gl, program, "u_swirl"),
      u_grainMixer: requireUniform(gl, program, "u_grainMixer"),
      u_grainOverlay: requireUniform(gl, program, "u_grainOverlay"),
      u_fit: requireUniform(gl, program, "u_fit"),
      u_rotation: requireUniform(gl, program, "u_rotation"),
      u_scale: requireUniform(gl, program, "u_scale"),
      u_offsetX: requireUniform(gl, program, "u_offsetX"),
      u_offsetY: requireUniform(gl, program, "u_offsetY"),
      u_originX: requireUniform(gl, program, "u_originX"),
      u_originY: requireUniform(gl, program, "u_originY"),
      u_worldWidth: requireUniform(gl, program, "u_worldWidth"),
      u_worldHeight: requireUniform(gl, program, "u_worldHeight"),
      u_imageAspectRatio: gl.getUniformLocation(program, "u_imageAspectRatio"),
      u_pxSize: gl.getUniformLocation(program, "u_pxSize"),
    };

    webglRef.current = { gl, program, positionBuffer, uniforms };

    const setInitialUniforms = () => {
      const inputs = uniformInputsRef.current;
      gl.useProgram(program);
      gl.uniform4fv(uniforms.u_colors0, inputs.colorsPacked);
      gl.uniform1f(uniforms.u_colorsCount, inputs.colorsCount);
      gl.uniform1f(uniforms.u_distortion, inputs.distortion);
      gl.uniform1f(uniforms.u_swirl, inputs.swirl);
      gl.uniform1f(uniforms.u_grainMixer, inputs.grainMixer);
      gl.uniform1f(uniforms.u_grainOverlay, inputs.grainOverlay);
      gl.uniform1f(uniforms.u_fit, ShaderFitOptions[inputs.fit]);
      gl.uniform1f(uniforms.u_rotation, inputs.rotation);
      gl.uniform1f(uniforms.u_scale, inputs.scale);
      gl.uniform1f(uniforms.u_offsetX, inputs.offsetX);
      gl.uniform1f(uniforms.u_offsetY, inputs.offsetY);
      gl.uniform1f(uniforms.u_originX, inputs.originX);
      gl.uniform1f(uniforms.u_originY, inputs.originY);
      gl.uniform1f(uniforms.u_worldWidth, inputs.worldWidth);
      gl.uniform1f(uniforms.u_worldHeight, inputs.worldHeight);
      if (uniforms.u_imageAspectRatio) gl.uniform1f(uniforms.u_imageAspectRatio, 1);
      if (uniforms.u_pxSize) gl.uniform1f(uniforms.u_pxSize, 1);
    };

    setInitialUniforms();

    const handleResize = () => {
      const bounds = container.getBoundingClientRect();
      const cssWidth = Math.max(1, Math.round(bounds.width));
      const cssHeight = Math.max(1, Math.round(bounds.height));
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const targetRenderScale = Math.max(dpr, minPixelRatioRef.current);
      const targetPixelWidth = cssWidth * targetRenderScale;
      const targetPixelHeight = cssHeight * targetRenderScale;
      const maxPixelCountHeadroom =
        Math.sqrt(maxPixelCountRef.current) /
        Math.sqrt(targetPixelWidth * targetPixelHeight);
      const scaleToMeetMaxPixelCount = Number.isFinite(maxPixelCountHeadroom)
        ? Math.min(1, maxPixelCountHeadroom)
        : 1;
      const newWidth = Math.max(1, Math.round(targetPixelWidth * scaleToMeetMaxPixelCount));
      const newHeight = Math.max(1, Math.round(targetPixelHeight * scaleToMeetMaxPixelCount));
      const newRenderScale = newWidth / cssWidth;

      if (canvas.width !== newWidth || canvas.height !== newHeight || renderScaleRef.current !== newRenderScale) {
        renderScaleRef.current = newRenderScale;
        canvas.width = newWidth;
        canvas.height = newHeight;
        resolutionChangedRef.current = true;
        gl.viewport(0, 0, newWidth, newHeight);
        render(performance.now());
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    return () => {
      resizeObserver.disconnect();
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      webglRef.current = null;
      try {
        gl.deleteBuffer(positionBuffer);
        gl.deleteProgram(program);
      } catch {
        // noop
      }
    };
  }, [render]);

  React.useEffect(() => {
    const webgl = webglRef.current;
    if (!webgl) return;
    const { gl, uniforms } = webgl;
    gl.useProgram(webgl.program);
    gl.uniform4fv(uniforms.u_colors0, colorsVec4.packed);
    gl.uniform1f(uniforms.u_colorsCount, colorsVec4.count);
    requestRender();
  }, [colorsVec4, requestRender]);

  React.useEffect(() => {
    const webgl = webglRef.current;
    if (!webgl) return;
    const { gl, uniforms } = webgl;
    gl.useProgram(webgl.program);
    gl.uniform1f(uniforms.u_distortion, distortion);
    gl.uniform1f(uniforms.u_swirl, swirl);
    gl.uniform1f(uniforms.u_grainMixer, grainMixer);
    gl.uniform1f(uniforms.u_grainOverlay, grainOverlay);
    requestRender();
  }, [distortion, swirl, grainMixer, grainOverlay, requestRender]);

  React.useEffect(() => {
    const webgl = webglRef.current;
    if (!webgl) return;
    const { gl, uniforms } = webgl;
    gl.useProgram(webgl.program);
    gl.uniform1f(uniforms.u_fit, ShaderFitOptions[fit]);
    gl.uniform1f(uniforms.u_rotation, rotation);
    gl.uniform1f(uniforms.u_scale, scale);
    gl.uniform1f(uniforms.u_offsetX, offsetX);
    gl.uniform1f(uniforms.u_offsetY, offsetY);
    gl.uniform1f(uniforms.u_originX, originX);
    gl.uniform1f(uniforms.u_originY, originY);
    gl.uniform1f(uniforms.u_worldWidth, worldWidth);
    gl.uniform1f(uniforms.u_worldHeight, worldHeight);
    if (uniforms.u_imageAspectRatio) gl.uniform1f(uniforms.u_imageAspectRatio, 1);
    if (uniforms.u_pxSize) gl.uniform1f(uniforms.u_pxSize, 1);
    requestRender();
  }, [
    fit,
    rotation,
    scale,
    offsetX,
    offsetY,
    originX,
    originY,
    worldWidth,
    worldHeight,
    requestRender,
  ]);

  React.useEffect(() => {
    currentSpeedRef.current = speed;
    requestRender();
  }, [speed, requestRender]);

  React.useEffect(() => {
    currentFrameRef.current = frame;
    requestRender();
  }, [frame, requestRender]);

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      {...divProps}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
    </div>
  );
}
