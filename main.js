import './style.css'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import { Shader } from './Shader'

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Save sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
})

// Scene
const scene = new THREE.Scene()

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 1
scene.add(camera)

// Plane
const geometry = new THREE.PlaneGeometry(1, 1351 / 1738, 100, 100)
const material = new Shader()
const positionTexture = new TextureLoader().load('position.png')
material.uniforms.tDiffuse.value = positionTexture
material.uniforms.uFlatten.value = 1.0

const plane = new THREE.Mesh(geometry, material)
scene.add(plane)

// GUI
const gui = new GUI()
gui.add(material.uniforms.uFlatten, 'value', 0, 1, 0.01).name('flatten')

// Renderer
const canvas = document.querySelector('.webgl')

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(sizes.width, sizes.height)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target = new THREE.Vector3(0,0,0)
controls.enableDamping = true

// Tick
const tick = () =>
{
    // Controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Keep looping
    window.requestAnimationFrame(tick)
}
tick()

