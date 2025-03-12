import { useCubeTexture, meshBounds } from "@react-three/drei";
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
  const meshRef = useRef()
  /**
   * Base
   */
  // Debug
  const {
    metalness,
    roughness,
    transmission,
    thickness,
    clearcoat,
    ccRoughness,
    ior,
    irid,
    iridIOR,
    reflectivity,
    sheen,
    sheenRoughness,
    sheenColor,
    color,
    envMapOn,
  } = useControls("Customize Material", {
    envMapOn: { value: true },
    metalness: { value: 0, min: -1.0, max: 1.0, step: 0.001 },
    roughness: { value: 0.5, min: -1.0, max: 1.0, step: 0.001 },
    transmission: { value: 0.01, min: -1.0, max: 1.0, step: 0.001 },
    thickness: { value: 1.5, min: 0.0, max: 10.0, step: 0.001 },
    clearcoat: { value: 1.0, min: 0.0, max: 1.0, step: 0.001 },
    ccRoughness: { value: 0.01, min: 0.0, max: 1.0, step: 0.001 },
    ior: { value: 1.5, min: 0.0, max: 10.0, step: 0.001 },
    irid: { value: 0.0, min: 0.0, max: 1.0, step: 0.001 },
    iridIOR: { value: 1.3, min: 1.0, max: 2.333, step: 0.001 },
    reflectivity: { value: 0.5, min: 0.0, max: 1.5, step: 0.001 },
    sheen: { value: 0.5, min: 0.0, max: 1.0, step: 0.001 },
    sheenRoughness: { value: 0.5, min: 0.0, max: 1.0, step: 0.001 },
    sheenColor: "#000000",
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
    uWTimeFreq: { value: 0.12, min: 0, max: 2, step: 0.001 },
    // more than 1.3 causes anti-aliasing effect
    uWStrength: { value: 1.0, min: 0, max: 1.3, step: 0.001 },

    uColorA: "#6a6ad5",
    uColorB: "#00ff36",

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

      uColorA: new THREE.Uniform(new THREE.Color("#6a6ad5")),
      uColorB: new THREE.Uniform(new THREE.Color("#00ff36")),

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
    let geo = new THREE.IcosahedronGeometry(2.0, 55);
    geo = mergeVertices(geo);
    geo.computeTangents();
    return geo;
  }, []);

  const depthMaterial = useMemo(
    () =>
      new CustomShaderMaterial1({
        baseMaterial: THREE.MeshDepthMaterial,
        vertexShader: wobbleVertexShader,
        uniforms: uniforms,
        depthPacking: THREE.RGBADepthPacking,
      }),
    [uniforms]
  );

  // Use a memoized clock and a ref for previous time
  const clock = useMemo(() => new THREE.Clock(), []);
  const previousTimeRef = useRef(0);
  useFrame(() => {
    const elapsedTime = clock.getElapsedTime();
    previousTimeRef.current = elapsedTime;

    uniforms.uTime.value = elapsedTime;
  });

  const eventHandler = () => {
    const hueA = Math.random();
    const hueB = Math.random(0.3289572);

    uniforms.uColorA.value.setHSL(hueA, 1.0, Math.random());
    uniforms.uColorB.value.setHSL(hueB, 1.0, Math.random());
  };

  return (
    <>
      <mesh
        ref={meshRef}
        raycast={meshBounds}
        receiveShadow
        castShadow
        geometry={icoGeometry}
        customDepthMaterial={depthMaterial}
        onPointerEnter={() => document.body.style.cursor = 'pointer'}
        onPointerLeave={() => document.body.style.cursor = 'default'}
        onClick={eventHandler}
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
          clearcoat={clearcoat}
          clearcoatRoughness={ccRoughness}
          ior={ior}
          reflectivity={reflectivity}
          sheen={sheen}
          sheenRoughness={sheenRoughness}
          sheenColor={sheenColor}
          iridescence={irid}
          iridescenceIOR={iridIOR}
          thickness={thickness}
          transparent={true}
          wireframe={false}
          envMap={envMapOn ? texture : null}
        />
      </mesh>
    </>
  );
}
