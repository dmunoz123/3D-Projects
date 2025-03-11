import { useGLTF, useTexture } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useControls } from "leva";

import portalVertexShader from "./shaders/portal/vertex.glsl";
import portalFragmentShader from "./shaders/portal/fragment.glsl";

export default function PortalScene() {
  const threeRender = useThree();
  const portalMaterialRef = useRef(null);
  const portalObj = useGLTF("../static/portalScene.glb");
  const { ClearColor, PersonalFav, ColorStart, ColorEnd } = useControls(
    "Portal",
    {
      ClearColor: "#122f55",
      ColorStart: "#17a32a",
      ColorEnd: "#36d81e",
    }
  );

  // Texture Loader (causing a re-render)
  const bakedTexture = useTexture("../static/portalBaked.jpg");
  bakedTexture.flipY = false;
  bakedTexture.colorSpace = THREE.SRGBColorSpace;

  /**
   **Materials
   */
  // Baked Material
  const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });

  // Light Emissive Material (lamp)
  const poleLightColorMaterial = new THREE.MeshBasicMaterial({
    color: 0xc45940,
  });

  // Portal Material
  const portalColorMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorStart: { value: new THREE.Color(0x17a32a) },
      uColorEnd: { value: new THREE.Color(0x36d81e) },
    },
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader,
  });

  portalMaterialRef.current = portalColorMaterial;

  // Find meshes and assing materials only once
  useEffect(() => {
    // native js function find() no threejs
    const bakedMesh = portalObj.scene.children.find(
      (child) => child.name === "Baked"
    );
    const poleLightAMesh = portalObj.scene.children.find(
      (child) => child.name === "poleLightA"
    );
    const poleLightBMesh = portalObj.scene.children.find(
      (child) => child.name === "poleLightB"
    );
    const portalLightMesh = portalObj.scene.children.find(
      (child) => child.name === "portalLight"
    );

    if (bakedMesh) bakedMesh.material = bakedMaterial;
    if (poleLightAMesh) poleLightAMesh.material = poleLightColorMaterial;
    if (poleLightBMesh) poleLightBMesh.material = poleLightColorMaterial;
    if (portalLightMesh) portalLightMesh.material = portalColorMaterial;

    // Background Color
    threeRender.gl.setClearColor(ClearColor);
  });

  useEffect(() => {
    if (!portalMaterialRef.current) return;

    // Update shader colors from Leva controls
    portalMaterialRef.current.uniforms.uColorStart.value.set(ColorStart);
    portalMaterialRef.current.uniforms.uColorEnd.value.set(ColorEnd);

    portalMaterialRef.current.uniforms.uColorStart.needsUpdate = true;
    portalMaterialRef.current.uniforms.uColorEnd.needsUpdate = true;
  }, [ColorStart, ColorEnd]);

  // Debugging
  //console.log("Canvas Scene (Updated every frame):", threeRender);

  useFrame((state) => {
    portalColorMaterial.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <>
      <primitive object={portalObj.scene} />
    </>
  );
}
