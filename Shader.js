import { ShaderMaterial, DoubleSide } from "three"

export class Shader extends ShaderMaterial {
  constructor(params) {
    super({
      side: DoubleSide,
      transparent: true,

      uniforms: {
        uBox: { value: null },
        tDiffuse: { value: null },
        tMask: { value: null },
        uFace: { value: true },
        uFlatten: { value: 1.0 },
        uPSize: { value: 1.0 },
      },

      vertexShader: /* glsl */ `
        uniform vec3 uBox;
        uniform float uPSize;
        uniform sampler2D tDiffuse;
        uniform float uFlatten;
        varying vec2 vUv;

        attribute vec3 center;
        varying vec3 vCenter;

        void main()
        {
          vec3 o = vec3(0.5);
          vec4 p = texture2D(tDiffuse, vec2(uv.x, 1.0 - uv.y));
          vec3 pos = (p.xyz - o) * (uBox / uBox.z) * uPSize;

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
        uniform sampler2D tMask;
        uniform bool uFace;

        varying vec2 vUv;
        varying vec3 vCenter;

        void main() {
          vec4 maskColor = texture2D(tMask, vec2(vUv.x, 1.0 - vUv.y));
          vec4 faceColor = texture2D(tDiffuse, vec2(vUv.x, 1.0 - vUv.y));
          vec4 edgeColor = gl_FrontFacing ? vec4(1.0) : vec4(0.4, 0.4, 0.5, 1.0);

          if (faceColor.a < 0.01) discard;
          if (maskColor.r < 0.01) discard;

          // Wireframe
          float thickness = 1.0;
          vec3 afwidth = fwidth(vCenter.xyz);
          vec3 edge3 = smoothstep((thickness - 1.0) * afwidth, thickness * afwidth, vCenter.xyz);
          float edge = 1.0 - min(min(edge3.x, edge3.y), edge3.z);

          gl_FragColor = uFace ? faceColor : edgeColor;
          gl_FragColor.a = uFace ? 1.0 : edge;
        }
      `
    });

    this.setValues(params);
  }
}
