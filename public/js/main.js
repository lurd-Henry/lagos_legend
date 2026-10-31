import * as THREE from "three";

import {
    createCharacter,
    updateCharacter
} from "./character.js";

const container = document.getElementById("game-container");
const coordinates = document.getElementById("coordinates");

// =====================================
// SCENE SETUP
// =====================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x9bcbd8);
scene.fog = new THREE.Fog(0x9bcbd8, 90, 260);

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

const renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: "high-performance"
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);

container.appendChild(renderer.domElement);

// =====================================
// LIGHTING
// =====================================

scene.add(
    new THREE.HemisphereLight(0xffffff, 0x777766, 2)
);

const sunlight = new THREE.DirectionalLight(0xffffff, 2);

sunlight.position.set(50, 80, 30);
scene.add(sunlight);

// =====================================
// GROUND
// =====================================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(350, 350),
    new THREE.MeshStandardMaterial({
        color: 0x77966a
    })
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.08;

scene.add(ground);

// =====================================
// ROAD SYSTEM
// =====================================

const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x454545
});

const pavementMaterial = new THREE.MeshStandardMaterial({
    color: 0x999999
});

function createRoad(x, z, width, length, horizontal = false) {

    const road = new THREE.Mesh(
        new THREE.BoxGeometry(
            horizontal ? length : width,
            0.12,
            horizontal ? width : length
        ),
        roadMaterial
    );

    road.position.set(x, 0, z);
    scene.add(road);

    // Pavements
    for (const side of [-1, 1]) {

        const pavement = new THREE.Mesh(
            new THREE.BoxGeometry(
                horizontal ? length : 2,
                0.18,
                horizontal ? 2 : length
            ),
            pavementMaterial
        );

        pavement.position.set(
            horizontal ? x : x + side * (width / 2 + 1),
            0.02,
            horizontal ? z + side * (width / 2 + 1) : z
        );

        scene.add(pavement);
    }
}

// Main north-south road
createRoad(0, 0, 14, 280);

// East-west road
createRoad(0, 0, 14, 280, true);

// =====================================
// ROAD MARKINGS
// =====================================

const lineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff
});

// Main road markings
for (let z = -130; z <= 130; z += 12) {

    const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.04, 5),
        lineMaterial
    );

    line.position.set(0, 0.09, z);
    scene.add(line);
}

// Crossroad markings
for (let x = -130; x <= 130; x += 12) {

    const line = new THREE.Mesh(
        new THREE.BoxGeometry(5, 0.04, 0.2),
        lineMaterial
    );

    line.position.set(x, 0.09, 0);
    scene.add(line);
}

// =====================================
// BUILDING MATERIALS
// =====================================

const cityColors = [
    0xd5c3a3,
    0xc5b7a0,
    0xaaaeb5,
    0xc7a18a,
    0xd4d0c5
];

const residentialColors = [
    0xd6b18a,
    0xc98c69,
    0xd8c6a0,
    0xb9a28b,
    0xd2b7a0
];

// =====================================
// CITY BUILDINGS
// =====================================

function createCityBuilding(x, z, width, depth, height, color) {

    const building = new THREE.Group();

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshStandardMaterial({
            color,
            flatShading: true
        })
    );

    body.position.y = height / 2;
    building.add(body);

    // Roof
    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.5, 0.5, depth + 0.5),
        new THREE.MeshStandardMaterial({
            color: 0x555555
        })
    );

    roof.position.y = height + 0.2;
    building.add(roof);

    // Windows
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x527b91,
        metalness: 0.2,
        roughness: 0.3
    });

    const floors = Math.max(1, Math.floor(height / 4));

    for (let floor = 0; floor < floors; floor++) {

        for (let i = 0; i < 3; i++) {

            const windowMesh = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 1.4, 1.5),
                windowMaterial
            );

            windowMesh.position.set(
                width / 2 + 0.06,
                2 + floor * 3.5,
                -depth / 3 + i * (depth / 3)
            );

            building.add(windowMesh);
        }
    }

    building.position.set(x, 0, z);
    scene.add(building);
}

// =====================================
// LOCAL RESIDENTIAL BUILDINGS
// =====================================

function createHouse(x, z, width, depth, color) {

    const house = new THREE.Group();

    // Main walls
    const walls = new THREE.Mesh(
        new THREE.BoxGeometry(width, 4, depth),
        new THREE.MeshStandardMaterial({
            color,
            flatShading: true
        })
    );

    walls.position.y = 2;
    house.add(walls);

    // Roof
    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(width * 0.8, 2.5, 4),
        new THREE.MeshStandardMaterial({
            color: 0x984b36
        })
    );

    roof.position.y = 5;
    roof.rotation.y = Math.PI / 4;
    house.add(roof);

    // Door
    const door = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 2.4, 0.12),
        new THREE.MeshStandardMaterial({
            color: 0x573b29
        })
    );

    door.position.set(0, 1.2, depth / 2 + 0.08);
    house.add(door);

    // Front windows
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x547a91
    });

    for (const side of [-1, 1]) {

        const windowMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1.3, 1.1, 0.12),
            windowMaterial
        );

        windowMesh.position.set(
            side * (width / 3),
            2.5,
            depth / 2 + 0.08
        );

        house.add(windowMesh);
    }

    house.position.set(x, 0, z);
    scene.add(house);
}

// =====================================
// COMMERCIAL DISTRICT
// =====================================

// Left side
createCityBuilding(-22, -25, 12, 12, 17, cityColors[0]);
createCityBuilding(-22, 0, 12, 12, 23, cityColors[2]);
createCityBuilding(-22, 25, 12, 12, 14, cityColors[3]);

// Right side
createCityBuilding(22, -25, 12, 12, 20, cityColors[1]);
createCityBuilding(22, 0, 12, 12, 15, cityColors[4]);
createCityBuilding(22, 25, 12, 12, 25, cityColors[0]);

// =====================================
// RESIDENTIAL DISTRICT
// =====================================

// Residential houses behind commercial buildings
createHouse(-42, -30, 10, 12, residentialColors[0]);
createHouse(-42, -10, 11, 13, residentialColors[1]);
createHouse(-42, 15, 10, 12, residentialColors[2]);
createHouse(-42, 40, 12, 14, residentialColors[3]);

createHouse(42, -30, 11, 13, residentialColors[1]);
createHouse(42, -10, 10, 12, residentialColors[3]);
createHouse(42, 15, 12, 14, residentialColors[0]);
createHouse(42, 40, 10, 12, residentialColors[2]);

// =====================================
// PLAYER
// =====================================

const player = createCharacter();

scene.add(player);

// =====================================
// CHARACTER CUSTOMISATION
// =====================================

const panel = document.getElementById("character-panel");
const customiseButton = document.getElementById("customise-button");
const closeButton = document.getElementById("close-panel");

customiseButton.addEventListener("click", () => {
    panel.classList.add("open");
});

closeButton.addEventListener("click", () => {
    panel.classList.remove("open");
});

const selectors = {
    skin: "skin-select",
    hairstyle: "hairstyle-select",
    hair: "hair-select",
    top: "top-select",
    trousers: "trousers-select",
    shoes: "shoes-select"
};

Object.entries(selectors).forEach(([property, id]) => {

    const element = document.getElementById(id);

    element.addEventListener("change", () => {

        updateCharacter(player, {
            [property]: Number(element.value)
        });

    });

});

// Randomise
document.getElementById("randomise-button").addEventListener("click", () => {

    const randomAppearance = {};

    Object.entries(selectors).forEach(([property, id]) => {

        const element = document.getElementById(id);

        const value = Math.floor(Math.random() * element.options.length);

        element.value = value;

        randomAppearance[property] = value;

    });

    updateCharacter(player, randomAppearance);

});

// Reset
document.getElementById("reset-button").addEventListener("click", () => {

    const defaults = {
        skin: 1,
        hairstyle: 0,
        hair: 0,
        top: 0,
        trousers: 0,
        shoes: 0
    };

    Object.entries(selectors).forEach(([property, id]) => {

        document.getElementById(id).value = defaults[property];

    });

    updateCharacter(player, defaults);

});

// =====================================
// CAMERA
// =====================================

// =====================================
// THIRD-PERSON CAMERA SYSTEM
// =====================================

let cameraYaw = 0;
let cameraPitch = 0.25;

const cameraDistance = 9;
const cameraHeight = 2.5;

let cameraTouchId = null;
let lastTouchX = 0;
let lastTouchY = 0;

let mouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

const cameraSensitivity = 0.006;

function updateCamera() {

    const horizontalDistance =
        cameraDistance * Math.cos(cameraPitch);

    const cameraX =
        player.position.x +
        Math.sin(cameraYaw) * horizontalDistance;

    const cameraZ =
        player.position.z +
        Math.cos(cameraYaw) * horizontalDistance;

    const cameraY =
        player.position.y +
        cameraHeight +
        cameraDistance * Math.sin(cameraPitch);

    const targetPosition = new THREE.Vector3(
        cameraX,
        cameraY,
        cameraZ
    );

    camera.position.lerp(targetPosition, 0.15);

    camera.lookAt(
        player.position.x,
        player.position.y + 1.5,
        player.position.z
    );
}
// =====================================
// MOBILE CAMERA TOUCH CONTROLS
// =====================================

renderer.domElement.addEventListener("pointerdown", event => {

    // Ignore the left side: joystick owns movement.
    if (event.clientX < window.innerWidth * 0.45) return;

    if (cameraTouchId !== null) return;

    cameraTouchId = event.pointerId;

    lastTouchX = event.clientX;
    lastTouchY = event.clientY;

    renderer.domElement.setPointerCapture(event.pointerId);

});

renderer.domElement.addEventListener("pointermove", event => {

    if (event.pointerId !== cameraTouchId) return;

    const deltaX = event.clientX - lastTouchX;
    const deltaY = event.clientY - lastTouchY;

    cameraYaw -= deltaX * cameraSensitivity;

    cameraPitch += deltaY * cameraSensitivity;

    cameraPitch = THREE.MathUtils.clamp(
        cameraPitch,
        -0.35,
        0.85
    );

    lastTouchX = event.clientX;
    lastTouchY = event.clientY;

});

function releaseCameraTouch(event) {

    if (event.pointerId === cameraTouchId) {
        cameraTouchId = null;
    }

}

renderer.domElement.addEventListener("pointerup", releaseCameraTouch);
renderer.domElement.addEventListener("pointercancel", releaseCameraTouch);
// =====================================
// PC MOUSE CAMERA CONTROLS
// =====================================

renderer.domElement.addEventListener("mousedown", event => {

    if (event.button !== 2) return;

    mouseDown = true;

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;

});

window.addEventListener("mouseup", () => {
    mouseDown = false;
});

window.addEventListener("mousemove", event => {

    if (!mouseDown) return;

    const deltaX = event.clientX - lastMouseX;
    const deltaY = event.clientY - lastMouseY;

    cameraYaw -= deltaX * cameraSensitivity;
    cameraPitch += deltaY * cameraSensitivity;

    cameraPitch = THREE.MathUtils.clamp(
        cameraPitch,
        -0.35,
        0.85
    );

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;

});

renderer.domElement.addEventListener("contextmenu", event => {
    event.preventDefault();
});
// =====================================
// KEYBOARD CONTROLS
// =====================================

const keys = {};

window.addEventListener("keydown", event => {
    keys[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", event => {
    keys[event.key.toLowerCase()] = false;
});

// =====================================
// MOBILE JOYSTICK
// =====================================

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

function updateJoystick(event) {

    const rect = joystick.getBoundingClientRect();

    let x = event.clientX - (rect.left + rect.width / 2);
    let y = event.clientY - (rect.top + rect.height / 2);

    const max = 35;

    const distance = Math.hypot(x, y);

    if (distance > max) {

        x = (x / distance) * max;
        y = (y / distance) * max;

    }

    joystickX = x / max;
    joystickY = y / max;

    knob.style.transform = `translate(${x}px, ${y}px)`;
}

joystick.addEventListener("pointerdown", event => {

    if (pointerId !== null) return;

    event.preventDefault();

    pointerId = event.pointerId;

    joystick.setPointerCapture(pointerId);

    updateJoystick(event);

});

joystick.addEventListener("pointermove", event => {

    if (event.pointerId === pointerId) {
        updateJoystick(event);
    }

});

joystick.addEventListener("pointerup", event => {

    if (event.pointerId === pointerId) {
        resetJoystick();
    }

});

joystick.addEventListener("pointercancel", resetJoystick);

// =====================================
// GAME LOOP
// =====================================

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

    const moving = direction.length() > 0.05;
    const running = !!keys["shift"];

    const speed = running ? 12 : 7;

    if (moving) {

    // Calculate movement relative to camera direction
    const forwardX = -Math.sin(cameraYaw);
    const forwardZ = -Math.cos(cameraYaw);

    const rightX = Math.cos(cameraYaw);
    const rightZ = -Math.sin(cameraYaw);

    // Convert joystick input into world direction
    const worldX =
        rightX * direction.x +
        forwardX * -direction.y;

    const worldZ =
        rightZ * direction.x +
        forwardZ * -direction.y;

    // Move character
    player.position.x += worldX * speed * delta;
    player.position.z += worldZ * speed * delta;

    // Rotate character towards movement direction
    player.rotation.y = Math.atan2(worldX, worldZ);

}

    player.userData.animate(
        clock.elapsedTime,
        moving,
        running
    );

    // Camera follows player
    updateCamera();
    coordinates.textContent =
        `X: ${player.position.x.toFixed(1)} | Z: ${player.position.z.toFixed(1)}`;

    renderer.render(scene, camera);
}

animate();

// =====================================
// RESIZE
// =====================================

window.addEventListener("resize", () => {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

});

console.log("LAGOS LEGENDS: STAGE 3.1 - 3.3 LOADED!");
