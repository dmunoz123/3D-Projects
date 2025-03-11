import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useEffect, useMemo } from "react";
import { Points } from "@react-three/drei";
import firefliesVertexShader from "./shaders/fireflies/vertex.glsl";
import firefliesFragmentShader from "./shaders/fireflies/fragment.glsl";
import { useControls } from "leva";

export default function Fireflies() {
  const { gl } = useThree();
  const materialRef = useRef();
  const pointsRef = useRef();
  const PixelSize = 228.0;
  const firefliesCount = 30.0;
  const { uPixelSizeDebug, FireFliesInView } = useControls("FireFlies", {
    uPixelSizeDebug: {
      value: 228.0,
      min: 0.0,
      max: 1000.0,
      step: 1.0,
    },
  });

  const { positionArray, scaleArray } = useMemo(() => {
    // size of array is firefliesCount * three values per count (x, y, z)
    const positionArray = new Float32Array(firefliesCount * 3);
    const scaleArray = new Float32Array(firefliesCount);
    // fill array with random values at each position's relative axis (0: x, 1: y, 2: z)
    for (let i = 0; i < firefliesCount; i++) {
      positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4;
      positionArray[i * 3 + 1] = Math.random() * 1.4;
      positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4;

      scaleArray[i] = Math.random();
    }
    return { positionArray, scaleArray };
  }, [firefliesCount]);

  const uniforms = useMemo(
    () => ({
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uPixelSize: { value: PixelSize },
      uTime: { value: 0 },
    }),
    []
  );

  // Update the uniform value when uPixelSizeDebug changes.
  useEffect(() => {
    uniforms.uPixelSize.value = uPixelSizeDebug;
    if (materialRef.current) {
      materialRef.current.needsUpdate = true;
    }
    // uniforms.uPixelSize is a stable object, no need to include
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uPixelSizeDebug]);

  //  ChatGPT
  useEffect(() => {
    // Define the resize handler that updates the uniform value.
    const handleResize = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.uPixelRatio.value = gl.getPixelRatio();
      }
    };

    // Add the resize event listener
    window.addEventListener("resize", handleResize);

    // Optionally, call it once on mount to set the correct value immediately.
    handleResize();

    // Clean up the event listener on unmount.
    return () => window.removeEventListener("resize", handleResize);
  }, [gl]);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });
  //console.log(uniforms)

  return (
    <>
      <Points ref={pointsRef} positions={positionArray}>
        <bufferAttribute
          attach="geometry-attributes-aScale"
          array={scaleArray}
          count={scaleArray.length}
          itemSize={1}
        />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={firefliesVertexShader}
          fragmentShader={firefliesFragmentShader}
          // Needed for manipulation of alpa in fragment shader
          transparent={true}
          blending={2}
          depthWrite={false}
        />
      </Points>
    </>
  );
}
