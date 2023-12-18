import { ShaderMaterial, DoubleSide } from "three"

export class Shader extends ShaderMaterial {
  constructor(params) {
    super({
      side: DoubleSide,
      transparent: true,

      uniforms: {
        tDiffuse: { value: null },
      },

      vertexShader: /* glsl */ `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;

        void main()
        {
            vec3 newPosition = position;

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
          gl_FragColor = color;
        }
      `
    });

    this.setValues(params);
  }
}
