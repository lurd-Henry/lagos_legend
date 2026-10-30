import * as THREE from "three";

const container = document.getElementById("game-container");

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x9bcbd8);
scene.fog = new THREE.Fog(0x9bcbd8, 35, 100);

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    200
);

const renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: "high-performance"
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);

container.appendChild(renderer.domElement);


// LIGHTING
scene.add(new THREE.HemisphereLight(0xffffff, 0x777766, 2));

const sunlight = new THREE.DirectionalLight(0xffffff, 2);
sunlight.position.set(20, 30, 15);
scene.add(sunlight);


// GROUND
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: 0x77966a })
);

ground.rotation.x = -Math.PI / 2;
scene.add(ground);


// ROAD
const road = new THREE.Mesh(
    new THREE.BoxGeometry(12, 0.12, 100),
    new THREE.MeshStandardMaterial({ color: 0x454545 })
);

scene.add(road);


// ROAD MARKINGS
for (let z = -45; z <= 45; z += 10) {

    const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.04, 4),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );

    line.position.set(0, 0.08, z);
    scene.add(line);
}


// BUILDINGS
function createBuilding(x, z, width, height, color) {

    const building = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, 8),
        new THREE.MeshStandardMaterial({
            color,
            flatShading: true
        })
    );

    building.position.set(x, height / 2, z);
    scene.add(building);
}

createBuilding(-12, -15, 9, 8, 0xd8b48a);
createBuilding(-12, 0, 9, 11, 0xb87e55);
createBuilding(-12, 15, 9, 7, 0xd6c59c);

createBuilding(12, -15, 9, 10, 0xc28c69);
createBuilding(12, 0, 9, 8, 0xd9c3a0);
createBuilding(12, 15, 9, 12, 0xb98a66);


// PLAYER
const player = new THREE.Group();

const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.45, 0.8, 3, 6),
    new THREE.MeshStandardMaterial({
        color: 0x2454a6,
        flatShading: true
    })
);

body.position.y = 1;
player.add(body);

const head = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.35, 1),
    new THREE.MeshStandardMaterial({
        color: 0x986747,
        flatShading: true
    })
);

head.position.y = 1.85;
player.add(head);

scene.add(player);


// CAMERA
camera.position.set(0, 6, 9);
camera.lookAt(0, 1, 0);


// KEYBOARD
const keys = {};

window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});


// MOBILE JOYSTICK
const joystick = document.getElementById("joystick");
const knob = document.getElementById("joystick-knob");

let joystickX = 0;
let joystickY = 0;
let pointerId = null;

function resetJoystick() {
    joystickX = 0;
    joystickY = 0;
    pointerId = null;
    knob.style.transform = "translate(0px, 0px)";
}

function updateJoystick(e) {

    const rect = joystick.getBoundingClientRect();

    let x = e.clientX - (rect.left + rect.width / 2);
    let y = e.clientY - (rect.top + rect.height / 2);

    const max = 35;
    const distance = Math.hypot(x, y);

    if (distance > max) {
        x = x / distance * max;
        y = y / distance * max;
    }

    joystickX = x / max;
    joystickY = y / max;

    knob.style.transform = `translate(${x}px, ${y}px)`;
}

joystick.addEventListener("pointerdown", e => {
    if (pointerId !== null) return;

    pointerId = e.pointerId;
    joystick.setPointerCapture(pointerId);
    updateJoystick(e);
});

joystick.addEventListener("pointermove", e => {
    if (e.pointerId === pointerId) {
        updateJoystick(e);
    }
});

joystick.addEventListener("pointerup", e => {
    if (e.pointerId === pointerId) resetJoystick();
});

joystick.addEventListener("pointercancel", resetJoystick);


// GAME LOOP
const clock = new THREE.Clock();
const direction = new THREE.Vector2();

function animate() {

    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    let moveX = joystickX;
    let moveZ = joystickY;

    if (keys["w"] || keys["arrowup"]) moveZ -= 1;
    if (keys["s"] || keys["arrowdown"]) moveZ += 1;
    if (keys["a"] || keys["arrowleft"]) moveX -= 1;
    if (keys["d"] || keys["arrowright"]) moveX += 1;

    direction.set(moveX, moveZ);

    if (direction.length() > 1) {
        direction.normalize();
    }

    player.position.x += direction.x * 7 * delta;
    player.position.z += direction.y * 7 * delta;

    if (direction.length() > 0.05) {
        player.rotation.y = Math.atan2(direction.x, direction.y);
    }

    const target = new THREE.Vector3(
        player.position.x,
        player.position.y + 6,
        player.position.z + 9
    );

    camera.position.lerp(target, 0.08);

    camera.lookAt(
        player.position.x,
        player.position.y + 1,
        player.position.z
    );

    document.getElementById("coordinates").textContent =
        `X: ${player.position.x.toFixed(1)} | Z: ${player.position.z.toFixed(1)}`;

    renderer.render(scene, camera);
}

animate();


// RESIZE
window.addEventListener("resize", () => {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});
