import { ShaderMaterial, DoubleSide } from "three"

export class Shader extends ShaderMaterial {
  constructor(params) {
    super({
      side: DoubleSide,
      transparent: true,

      uniforms: {
        tDiffuse: { value: null },
        uFlatten: { value: 1.0 },
      },

      vertexShader: /* glsl */ `
        uniform sampler2D tDiffuse;
        uniform float uFlatten;
        varying vec2 vUv;

        attribute vec3 center;
        varying vec3 vCenter;

        void main()
        {
          vec4 color = texture2D( tDiffuse, uv );
          vec3 origin = vec3(0.5);
          vec3 pos = color.xyz - origin;

          vec3 newPosition = pos + uFlatten * (position - pos);

          vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;

          gl_Position = projectedPosition;

          vCenter = center;
          vUv = uv;
        }
      `,

      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse;

        varying vec2 vUv;
        varying vec3 vCenter;

        void main() {
          vec4 color = texture2D( tDiffuse, vUv );

          // if (color.r + color.g + color.b < 0.01) { gl_FragColor = vec4(0.0); return; }
          gl_FragColor = color;

          // Wireframe
          float thickness = 1.0;
          vec3 afwidth = fwidth(vCenter.xyz);
          vec3 edge3 = smoothstep((thickness - 1.0) * afwidth, thickness * afwidth, vCenter.xyz);
          float edge = 1.0 - min(min(edge3.x, edge3.y), edge3.z);

          gl_FragColor.rgb = gl_FrontFacing ? color.rgb : vec3(0.4, 0.4, 0.5);
          gl_FragColor.a = edge;
        }
      `
    });

    this.setValues(params);
  }
}
