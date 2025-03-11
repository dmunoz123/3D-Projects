// Cannot acces UV here as not a predefined plane, we created it with buffergeometry and are using Points here, so each vertex of the geometry (Point) is one particle (with x,y,z) and geometry is created into a plane using two triangles. instead, use gl_PointCoord to access UV


void main()
{
  // create circular pattern
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
  // (check 36:00 of threejsjourney for re-explanation)
  float strength = 0.05 / distanceToCenter - 0.05 * 2.0;

  gl_FragColor = vec4(1.0, 1.0, 1.0, strength);

  
}