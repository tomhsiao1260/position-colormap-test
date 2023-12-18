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

        void main()
        {
          vec4 color = texture2D( tDiffuse, uv );
          vec3 center = vec3(0.5);
          vec3 pos = color.xyz - center;

          vec3 newPosition = pos + uFlatten * (position - pos);

          vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;

          gl_Position = projectedPosition;

          vUv = uv;
        }
      `,

      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;

        void main() {
          vec4 color = texture2D( tDiffuse, vUv );

          if (color.r + color.g + color.b < 0.01) { gl_FragColor = vec4(0.0); return; }
          gl_FragColor = color;
        }
      `
    });

    this.setValues(params);
  }
}
