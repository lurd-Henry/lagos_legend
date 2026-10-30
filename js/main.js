import * as THREE from 'three';

// GAME SETUP
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

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.5)
);

container.appendChild(renderer.domElement);


// LIGHTING
scene.add(new THREE.HemisphereLight(
    0xffffff,
    0x777766,
    2
));

const sunlight = new THREE.DirectionalLight(
    0xffffff,
    2
);

sunlight.position.set(20, 30, 15);

scene.add(sunlight);


// GROUND
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({
        color: 0x77966a,
        roughness: 1
    })
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.05;

scene.add(ground);


// ROAD
const road = new THREE.Mesh(
    new THREE.BoxGeometry(12, 0.12, 100),
    new THREE.MeshStandardMaterial({
        color: 0x454545
    })
);

road.position.set(0, 0, 0);

scene.add(road);


// ROAD MARKINGS
for (let z = -45; z <= 45; z += 10) {

    const marking = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.04, 4),
        new THREE.MeshBasicMaterial({
            color: 0xffffff
        })
    );

    marking.position.set(0, 0.08, z);

    scene.add(marking);
}


// BUILDINGS
function createBuilding(x, z, width, height, color) {

    const building = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, 8),
        new THREE.MeshStandardMaterial({
            color: color,
            roughness: 1
        })
    );

    building.position.set(
        x,
        height / 2,
        z
    );

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
camera.lookAt(player.position);


// MOVEMENT
const keys = {};

let joystickX = 0;
let joystickY = 0;

const speed = 7;

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});


// MOBILE JOYSTICK
const joystick = document.getElementById("joystick");
const knob = document.getElementById("joystick-knob");

let joystickPointer = null;

function resetJoystick() {

    joystickX = 0;
    joystickY = 0;

    joystickPointer = null;

    knob.style.transform = "translate(0px, 0px)";
}

joystick.addEventListener("pointerdown", (e) => {

    joystickPointer = e.pointerId;

    joystick.setPointerCapture(e.pointerId);

    updateJoystick(e);
});

joystick.addEventListener("pointermove", (e) => {

    if (e.pointerId !== joystickPointer) return;

    updateJoystick(e);
});

joystick.addEventListener("pointerup", resetJoystick);
joystick.addEventListener("pointercancel", resetJoystick);


function updateJoystick(e) {

    const rect = joystick.getBoundingClientRect();

    let x = e.clientX - (rect.left + rect.width / 2);
    let y = e.clientY - (rect.top + rect.height / 2);

    const max = 35;

    const distance = Math.sqrt(x * x + y * y);

    if (distance > max) {

        x = (x / distance) * max;
        y = (y / distance) * max;

    }

    joystickX = x / max;
    joystickY = y / max;

    knob.style.transform =
        `translate(${x}px, ${y}px)`;
}


// GAME LOOP
const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    let moveX = joystickX;
    let moveZ = joystickY;

    if (keys["w"] || keys["arrowup"]) moveZ -= 1;
    if (keys["s"] || keys["arrowdown"]) moveZ += 1;

    if (keys["a"] || keys["arrowleft"]) moveX -= 1;
    if (keys["d"] || keys["arrowright"]) moveX += 1;

    const direction = new THREE.Vector2(moveX, moveZ);

    if (direction.length() > 1) {
        direction.normalize();
    }

    player.position.x += direction.x * speed * delta;
    player.position.z += direction.y * speed * delta;

    // Turn player toward movement
    if (direction.length() > 0.05) {

        player.rotation.y = Math.atan2(
            direction.x,
            direction.y
        );

    }

    // Follow player
    const targetCamera = new THREE.Vector3(
        player.position.x,
        player.position.y + 6,
        player.position.z + 9
    );

    camera.position.lerp(targetCamera, 0.08);

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

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

});
