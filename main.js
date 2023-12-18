import './style.css'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ArcballControls } from 'three/addons/controls/ArcballControls.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import { Shader } from './Shader'

const xMax = 8096
const yMax = 7888
const zMax = 14370

const textureWidth = 1738
const textureHeight = 1351

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Scene
const scene = new THREE.Scene()

// Camera
const aspect = sizes.width / sizes.height
const camera = new THREE.OrthographicCamera(-1 * aspect, 1 * aspect, 1, -1, 0.01, 100)
camera.up.set(0, -1, 0)
camera.position.z = -1.0
scene.add(camera)

window.addEventListener(
    'resize',
    () => {
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight

        const aspect = sizes.width / sizes.height
        camera.left = -1 * aspect
        camera.right = 1 * aspect
        camera.top = 1
        camera.bottom = -1
        camera.updateProjectionMatrix()
        renderer.setSize(sizes.width, sizes.height)
        render()
    },
    false
)

// Plane
const pSize = 2
const geometry = new THREE.PlaneGeometry(pSize, pSize * textureHeight / textureWidth, 100, 100)
setupAttributes(geometry)

const material = new Shader()
const positionTexture = new TextureLoader().load('position.png', render)
material.uniforms.tDiffuse.value = positionTexture
material.uniforms.uPSize.value = pSize
material.uniforms.uFace.value = true
material.uniforms.uFlatten.value = 1.0
material.uniforms.uBox.value = new THREE.Vector3(xMax, yMax, zMax)

const plane = new THREE.Mesh(geometry, material)
scene.add(plane)

// GUI
const gui = new GUI()
gui.add(material.uniforms.uFace, 'value').name('face').onChange(render)
gui.add(material.uniforms.uFlatten, 'value', 0, 1, 0.01).name('flatten').onChange(render)

// Renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(sizes.width, sizes.height)

// Controls
const controls = new ArcballControls(camera, canvas, scene)
// const controls = new OrbitControls(camera, canvas)
// controls.target = new THREE.Vector3(0,0,0)
controls.addEventListener('change', render)

// Render
function render() { renderer.render(scene, camera) }

// Wireframe Shader: https://github.com/mrdoob/three.js/blob/dev/examples/webgl_materials_wireframe.html
function setupAttributes(geometry) {
    const vectors = [
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 1)
    ]

    const position = geometry.attributes.position
    const centers = new Float32Array(position.count * 3)

    for (let i = 0, l = position.count; i<l; i ++) {
        vectors[ i % 3 ].toArray(centers, i * 3)
    }
    geometry.setAttribute('center', new THREE.BufferAttribute(centers, 3))
}

