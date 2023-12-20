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

const positionTexture = new TextureLoader().load('20230702185753.png', render)

const m1Texture = new TextureLoader().load('20230702185753_l4_mask.png', render)
const m2Texture = new TextureLoader().load('20230702185753_r3_mask.png', render)
const m3Texture = new TextureLoader().load('20230702185753_l3_mask.png', render)
const m4Texture = new TextureLoader().load('20230702185753_r2_mask.png', render)
const m5Texture = new TextureLoader().load('20230702185753_l2_mask.png', render)
const m6Texture = new TextureLoader().load('20230702185753_r1_mask.png', render)
const m7Texture = new TextureLoader().load('20230702185753_l1_mask.png', render)

const m1 = setupMaterial(positionTexture, m1Texture, pSize, xMax, yMax, zMax)
const m2 = setupMaterial(positionTexture, m2Texture, pSize, xMax, yMax, zMax)
const m3 = setupMaterial(positionTexture, m3Texture, pSize, xMax, yMax, zMax)
const m4 = setupMaterial(positionTexture, m4Texture, pSize, xMax, yMax, zMax)
const m5 = setupMaterial(positionTexture, m5Texture, pSize, xMax, yMax, zMax)
const m6 = setupMaterial(positionTexture, m6Texture, pSize, xMax, yMax, zMax)
const m7 = setupMaterial(positionTexture, m7Texture, pSize, xMax, yMax, zMax)

const p1 = new THREE.Mesh(geometry, m1)
const p2 = new THREE.Mesh(geometry, m2)
const p3 = new THREE.Mesh(geometry, m3)
const p4 = new THREE.Mesh(geometry, m4)
const p5 = new THREE.Mesh(geometry, m5)
const p6 = new THREE.Mesh(geometry, m6)
const p7 = new THREE.Mesh(geometry, m7)

const meshList = [ p1, p2, p3, p4, p5, p6, p7 ]
meshList.forEach((mesh) => scene.add(mesh))

// GUI
const params = { face: true, flatten: 1 }
meshList.forEach((mesh, i) => { params[i + 1] = true })

const gui = new GUI()
gui.add(params, 'face').name('face').onChange(render)
gui.add(params, 'flatten', 0, 1, 0.01).name('flatten').onChange(render)
meshList.forEach((mesh, i) => { gui.add(params, i + 1).name(i + 1).onChange(render) })

// Renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(sizes.width, sizes.height)

// Controls
const controls = new ArcballControls(camera, canvas, scene)
controls.addEventListener('change', render)

// Render
function render() {
    meshList.forEach((mesh, i) => {
        mesh.visible = params[i + 1]
        mesh.material.uniforms.uFace.value = params.face
        mesh.material.uniforms.uFlatten.value = params.flatten
    })

    renderer.render(scene, camera)
}

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

function setupMaterial(positionTexture, maskTexture, pSize, xMax, yMax, zMax) {
    const material = new Shader()

    material.uniforms.uPSize.value = pSize
    material.uniforms.uFace.value = true
    material.uniforms.uFlatten.value = 1.0
    material.uniforms.uBox.value = new THREE.Vector3(xMax, yMax, zMax)

    positionTexture.minFilter = THREE.NearestFilter
    positionTexture.magFilter = THREE.NearestFilter
    material.uniforms.tDiffuse.value = positionTexture

    maskTexture.minFilter = THREE.NearestFilter
    maskTexture.magFilter = THREE.NearestFilter
    material.uniforms.tMask.value = maskTexture

    return material
}

