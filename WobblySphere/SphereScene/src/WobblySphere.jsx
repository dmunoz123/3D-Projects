import { useCubeTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useControls } from "leva";
import CustomShaderMaterial from "three-custom-shader-material";
import CustomShaderMaterial1 from "three-custom-shader-material/vanilla";
import { useMemo, useEffect, useRef } from "react";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

import wobbleVertexShader from "./shaders/wobble/vertex.glsl";
import wobbleFragmentShader from "./shaders/wobble/fragment.glsl";

export default function WobblySphere() {
  /**
   * Base
   */
  // Debug
  const {
    metalness,
    roughness,
    transmission,
    thickness,
    ior,
    color,
    envMapOn,
  } = useControls("Customize Material", {
    envMapOn: { value: true },
    metalness: { value: 0, min: -1.0, max: 1.0, step: 0.001 },
    roughness: { value: 0.5, min: -1.0, max: 1.0, step: 0.001 },
    transmission: { value: 0, min: -1.0, max: 1.0, step: 0.001 },
    thickness: { value: 1.5, min: 0.0, max: 10.0, step: 0.001 },
    ior: { value: 1.5, min: 0.0, max: 10.0, step: 0.001 },
    color: "#ffffff",
  });

  const {
    uPosFreq,
    uTimeFreq,
    uStrength,
    uWPosFreq,
    uWTimeFreq,
    uWStrength,
    uColorA,
    uColorB,
    uShift,
  } = useControls("Material Movement", {
    uPosFreq: { value: 0.5, min: 0, max: 2, step: 0.001 },
    uTimeFreq: { value: 0.4, min: 0, max: 2, step: 0.001 },
    uStrength: { value: 0.3, min: 0, max: 2, step: 0.001 },

    uWPosFreq: { value: 0.38, min: 0, max: 2, step: 0.001 },
    uWTimeFreqQ: { value: 0.12, min: 0, max: 2, step: 0.001 },
    // more than 1.3 causes anti-aliasing effect
    uWStrength: { value: 1.0, min: 0, max: 1.3, step: 0.001 },

    uColorA: "#0000ff",
    uColorB: "#00ff00",

    uShift: { value: 0.01, min: 0.0001, max: 2.0, step: 0.001 },
  });

  const texture = useCubeTexture(
    ["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"],
    { path: "/" }
  );

  const uniforms = useMemo(
    () => ({
      uTime: new THREE.Uniform(0),
      uPositionFrequency: new THREE.Uniform(0.5),
      uTimeFrequency: new THREE.Uniform(0.4),
      uStrength: new THREE.Uniform(0.3),

      uWarpPositionFrequency: new THREE.Uniform(0.38),
      uWarpTimeFrequency: new THREE.Uniform(0.12),
      uWarpStrength: new THREE.Uniform(1.7),

      uColorA: new THREE.Uniform(new THREE.Color("#0000ff")),
      uColorB: new THREE.Uniform(new THREE.Color("#00ff00")),

      uShift: new THREE.Uniform(0.01),
    }),
    []
  );

  useEffect(() => {
    uniforms.uPositionFrequency.value = uPosFreq;
    uniforms.uTimeFrequency.value = uTimeFreq;
    uniforms.uStrength.value = uStrength;

    uniforms.uWarpPositionFrequency.value = uWPosFreq;
    uniforms.uWarpTimeFrequency.value = uWTimeFreq;
    uniforms.uWarpStrength.value = uWStrength;

    uniforms.uColorA.value.set(uColorA);
    uniforms.uColorB.value.set(uColorB);

    uniforms.uShift.value = uShift;
  }, [
    uPosFreq,
    uTimeFreq,
    uStrength,
    uWPosFreq,
    uWTimeFreq,
    uWStrength,
    uColorA,
    uColorB,
    uShift,
    uniforms,
  ]);

  // Create and modify the icosahedron geometry once
  const icoGeometry = useMemo(() => {
    let geo = new THREE.IcosahedronGeometry(2.0, 50);
    geo = mergeVertices(geo);
    geo.computeTangents();
    return geo;
  }, []);

  const depthMaterial = new CustomShaderMaterial1({
    baseMaterial: THREE.MeshDepthMaterial,
    vertexShader: wobbleVertexShader,
    uniforms: uniforms,

    //MeshDepthMaterial
    depthPacking: THREE.RGBADepthPacking,
  });

  // Use a memoized clock and a ref for previous time
  const clock = useMemo(() => new THREE.Clock(), []);
  const previousTimeRef = useRef(0);
  useFrame(() => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTimeRef.current;
    previousTimeRef.current = elapsedTime;

    uniforms.uTime.value = elapsedTime;
  });

  return (
    <>
      <mesh
        receiveShadow
        castShadow
        geometry={icoGeometry}
        customDepthMaterial={depthMaterial}
      >
        <CustomShaderMaterial
          // CSM
          baseMaterial={THREE.MeshPhysicalMaterial}
          vertexShader={wobbleVertexShader}
          fragmentShader={wobbleFragmentShader}
          uniforms={uniforms}
          // MeshPhysicalMaterial
          metalness={metalness}
          roughness={roughness}
          color={color}
          transmission={transmission}
          ior={ior}
          thickness={thickness}
          transparent={true}
          wireframe={false}
          envMap={envMapOn ? texture : null}
        />
      </mesh>
      <mesh position={[0.0, -2.0, -4.0]} receiveShadow>
        <planeGeometry args={[15, 15, 15]} />
        <meshStandardMaterial />
      </mesh>
    </>
  );
}
