uniform float uTime;
uniform float uPixelRatio;
uniform float uPixelSize;

attribute float aScale;

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

void main() 
{

  // Generate a per-particle random offset (using vUv as a seed).
  // This offset will be used to vary the particle's time.
  float particleOffset = random(uv);

  // Create a local time variable for each particle.
  float localTime = uTime + particleOffset;

  // Create a random phase offset using uv as a seed.
  float randomYPhase = (random(uv * 3.0) - 0.5) * 1.2;  
  // Create a random amplitude factor between 0.5 and 1.2.
  float randomYAmplitude = 0.5 + random(uv * 4.0) * 0.4;

  // Use the random function to create slight offsets.
  // Here we compute two random offsets using uv as a seed.
  // You could also use aScale or another attribute.
  float randomAngleOffset = (random(uv * 1.0) - 0.5) * 0.5;  // Random offset for angle.
  float randomOrbitOffset = (random(uv * 2.0) - 0.5) * 0.1;  // Random offset for radius.

  // Compute an angle for the circular motion.
  // Adding aScale (or another attribute) creates variation between fireflies.
  float angle = localTime * 0.5 + aScale;

   // Define an orbit radius (you can adjust or even tie this to aScale)
  float orbitRadius = 0.3 + randomOrbitOffset;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  modelPosition.y += (sin(localTime * 0.5 + modelPosition.x + randomYPhase) * aScale * 0.2 * randomYAmplitude) + 0.2;

  // Update the x and z coordinates to create circular motion.
  // This will make the fireflies orbit horizontally.
  modelPosition.x += cos(angle) * orbitRadius * 0.05;
  modelPosition.z += sin(angle) * orbitRadius * 0.25;
  // Keep between -1 and 1
  modelPosition.x = clamp(modelPosition.x, -1.5, 1.5);
  modelPosition.z = -clamp(modelPosition.z, -1.5, 1.5);

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;
  
  gl_PointSize = uPixelSize * aScale * uPixelRatio;
  gl_PointSize *= (1.0 / -viewPosition.z);
  gl_Position = projectionPosition;
}