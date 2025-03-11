#include ../includes/simplexNoise4d.glsl

uniform float uTime;
uniform float uPositionFrequency;
uniform float uTimeFrequency;
uniform float uStrength;

uniform float uWarpPositionFrequency;
uniform float uWarpTimeFrequency;
uniform float uWarpStrength;

uniform float uShift;

attribute vec4 tangent;

varying float vWobble;

float getWobble(vec3 position)
{
  vec3 warpedPosition = position;
  warpedPosition += simplexNoise4d(vec4(
    position * uWarpPositionFrequency,
    uTime * uWarpTimeFrequency
  )) * uWarpStrength;

  return simplexNoise4d(vec4(
    warpedPosition * uPositionFrequency, // XYZ
    uTime * uTimeFrequency // W
  )) * uStrength;
}

void main()
{

  vec3 biTangent = cross(normal, tangent.xyz);

  // Neighbours Position
  float shift = uShift;
  vec3 positionA = csm_Position + tangent.xyz * shift;
  vec3 positionB = csm_Position + biTangent * shift;

  // Wobble
  float wobble = getWobble(csm_Position);
  csm_Position += wobble * normal;
  positionA    += getWobble(positionA) * normal;
  positionB    += getWobble(positionB) * normal;
  

  // compute normal (direction normalized for length of1)
  vec3 toA = normalize(positionA - csm_Position);
  vec3 toB = normalize(positionB - csm_Position);
  csm_Normal = cross(toA, toB);

  // varyings
  vWobble = wobble / uStrength;
}