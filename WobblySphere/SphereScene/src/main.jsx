import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useControls } from "leva";
import "./index.css";
import WobblySphere from "./WobblySphere.jsx";
import CubeBackground from "./EnvironmentCube";

export default function App() {
  // Create Leva controls for the directional light settings.
  const { lightColor, lightIntensity } = useControls("Directional Light", {
    lightColor: { value: "#ffffff" },
    lightIntensity: { value: 1.5, min: 0, max: 5, step: 0.1 },
  });

  return (
    <Canvas shadows>
      <PerspectiveCamera
        makeDefault
        fov={45}
        near={0.1}
        far={100}
        position={[5, 2, 15]}
      />
      <CubeBackground />
      <directionalLight
        // Pass the Leva-controlled values into the light's args.
        args={[lightColor, lightIntensity]}
        position={[0.0, 3.0, 5.0]}
        castShadow
      />
      <OrbitControls enableDamping />
      {/* <Environment files="satara_night_4k.hdr" background /> */}
      <WobblySphere />
    </Canvas>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
