import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import { createRoot } from "react-dom/client";
import "./index.css";
import Portal from "./Portal.jsx";
import Fireflies from "./Fireflies";
// import { useControls } from "leva";

// function App() {
//   const { clearColor, clearColor2 } = useControls({
//     position: 2,
//   });

//   return (
//     <Canvas style={{ background: clearColor }}>
//       <PerspectiveCamera
//         makeDefault
//         fov={45}
//         near={0.1}
//         far={100}
//         position={[4, 2, 4]}
//       />
//       <OrbitControls />
//       <R3F />
//     </Canvas>
//   );
// }

// createRoot(document.getElementById("root")).render(<App />);

createRoot(document.getElementById("root")).render(
  <Canvas style={{ background: "black" }}>
    <PerspectiveCamera
      makeDefault
      fov={45}
      near={0.1}
      far={100}
      position={[4, 2, 4]}
    />
    <OrbitControls />
    <Portal />
    <Fireflies />

  </Canvas>
);
