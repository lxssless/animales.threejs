import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as dat from 'dat.gui';

// Cargar modelo Alpaca
const fileUrl = new URL('../assets/Alpaca.gltf', import.meta.url);

// Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Escena y cámara
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);

// Controles de órbita
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

// Fondo tipo cielo azul
scene.background = new THREE.Color(0x87ceeb);

// Iluminación
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const luzDireccional = new THREE.DirectionalLight(0xffffff, 1);
luzDireccional.position.set(10, 10, 10);
scene.add(luzDireccional);

// Suelo con textura de pasto
const textureLoader = new THREE.TextureLoader();
const texturaPasto = textureLoader.load(new URL('../assets/grass.jpg', import.meta.url));
texturaPasto.wrapS = THREE.RepeatWrapping;
texturaPasto.wrapT = THREE.RepeatWrapping;
texturaPasto.repeat.set(10, 10);

const suelo = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ map: texturaPasto })
);
suelo.rotation.x = -Math.PI / 2;
suelo.receiveShadow = true;
scene.add(suelo);

// Interfaz gráfica (GUI)
const gui = new dat.GUI();
const opciones = {
    'Color principal': 0x787a79,
    'Color claro': 0xb9b9b9,
    'Color oscuro': 0x383838,
    'Pezuñas': 0x46423c,
    'Cabello': 0x383838,
    'Hocico': 0x3d3426,
    'Ojo oscuro': 0x181818,
    'Ojo claro': 0xe0e0e0,
};
const coloresPorDefecto = { ...opciones };

// Animación
let mixer;
const reloj = new THREE.Clock();
let acciones = {};
let accionActiva;

// Cargar el modelo y animaciones
const cargador = new GLTFLoader();
cargador.load(fileUrl.href, function (gltf) {
    const modelo = gltf.scene;
    scene.add(modelo);

    // Controles de color en GUI
    gui.addColor(opciones, 'Color principal').onChange(e => modelo.getObjectByName('Cube')?.material.color.setHex(e));
    gui.addColor(opciones, 'Color claro').onChange(e => modelo.getObjectByName('Cube_1')?.material.color.setHex(e));
    gui.addColor(opciones, 'Color oscuro').onChange(e => modelo.getObjectByName('Cube_2')?.material.color.setHex(e));
    gui.addColor(opciones, 'Pezuñas').onChange(e => modelo.getObjectByName('Cube_3')?.material.color.setHex(e));
    gui.addColor(opciones, 'Cabello').onChange(e => modelo.getObjectByName('Cube_4')?.material.color.setHex(e));
    gui.addColor(opciones, 'Hocico').onChange(e => modelo.getObjectByName('Cube_5')?.material.color.setHex(e));
    gui.addColor(opciones, 'Ojo oscuro').onChange(e => modelo.getObjectByName('Cube_6')?.material.color.setHex(e));
    gui.addColor(opciones, 'Ojo claro').onChange(e => modelo.getObjectByName('Cube_7')?.material.color.setHex(e));

    // Botón para resetear colores
    gui.add({ 'Restablecer colores': () => {
        Object.keys(coloresPorDefecto).forEach(clave => opciones[clave] = coloresPorDefecto[clave]);
        modelo.getObjectByName('Cube')?.material.color.setHex(opciones['Color principal']);
        modelo.getObjectByName('Cube_1')?.material.color.setHex(opciones['Color claro']);
        modelo.getObjectByName('Cube_2')?.material.color.setHex(opciones['Color oscuro']);
        modelo.getObjectByName('Cube_3')?.material.color.setHex(opciones['Pezuñas']);
        modelo.getObjectByName('Cube_4')?.material.color.setHex(opciones['Cabello']);
        modelo.getObjectByName('Cube_5')?.material.color.setHex(opciones['Hocico']);
        modelo.getObjectByName('Cube_6')?.material.color.setHex(opciones['Ojo oscuro']);
        modelo.getObjectByName('Cube_7')?.material.color.setHex(opciones['Ojo claro']);
    }}, 'Restablecer colores').name('🔄 Resetear colores');

    // Animaciones
    if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(modelo);
        gltf.animations.forEach(clip => {
            acciones[clip.name] = mixer.clipAction(clip);
        });

        // GUI para elegir animaciones
        const carpetaAnimaciones = gui.addFolder('🎞️ Selección de animación');
        const selectorAnim = { 'Animación actual': gltf.animations[0].name };

        accionActiva = acciones[selectorAnim['Animación actual']];
        accionActiva.play();

        carpetaAnimaciones.add(selectorAnim, 'Animación actual', Object.keys(acciones)).onChange(nombre => {
            if (accionActiva) accionActiva.stop();
            accionActiva = acciones[nombre];
            accionActiva.reset().play();
        });
    }
}, undefined, error => console.error(error));

// Bucle de animación
function animar() {
    const delta = reloj.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animar);

// Ajuste en cambio de tamaño de ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
