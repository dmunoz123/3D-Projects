import { useCubeTexture } from "@react-three/drei";
import { useThree } from '@react-three/fiber'
import { useEffect } from "react";

export default function CubeBackground() {
  const { scene } = useThree();
  const texture = useCubeTexture(
    ["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"],
    { path: "/" }
  );

  useEffect(() => {
    scene.background = texture;
  }, [texture, scene]);

  return null;
}
