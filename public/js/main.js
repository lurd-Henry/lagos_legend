import * as THREE from "three";

import {
    createCharacter,
    updateCharacter
} from "./character.js";


// ==========================================
// LAGOS LEGENDS - STAGE 2.2 + 2.3
// ==========================================


// HTML ELEMENTS

const container = document.getElementById("game-container");
const coordinates = document.getElementById("coordinates");


// ==========================================
// SCENE
// ==========================================

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

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.5)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

container.appendChild(renderer.domElement);


// ==========================================
// LIGHTING
// ==========================================

scene.add(
    new THREE.HemisphereLight(
        0xffffff,
        0x777766,
        2
    )
);

const sunlight = new THREE.DirectionalLight(
    0xffffff,
    2
);

sunlight.position.set(20, 30, 15);

scene.add(sunlight);


// ==========================================
// ENVIRONMENT
// ==========================================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({
        color: 0x77966a
    })
);

ground.rotation.x = -Math.PI / 2;

scene.add(ground);


// ROAD

const road = new THREE.Mesh(
    new THREE.BoxGeometry(12, 0.12, 100),
    new THREE.MeshStandardMaterial({
        color: 0x454545
    })
);

scene.add(road);


// ROAD MARKINGS

for (let z = -45; z <= 45; z += 10) {

    const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.04, 4),
        new THREE.MeshBasicMaterial({
            color: 0xffffff
        })
    );

    line.position.set(0, 0.08, z);

    scene.add(line);
}


// ==========================================
// BUILDINGS
// ==========================================

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


// ==========================================
// PLAYER
// ==========================================

const player = createCharacter();

scene.add(player);


// ==========================================
// CHARACTER CUSTOMISATION
// ==========================================

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


// CHANGE APPEARANCE

Object.entries(selectors).forEach(([property, id]) => {

    const element = document.getElementById(id);

    element.addEventListener("change", () => {

        updateCharacter(player, {
            [property]: Number(element.value)
        });

    });

});


// RANDOMISE

document.getElementById("randomise-button").addEventListener(
    "click",
    () => {

        const randomAppearance = {};

        Object.entries(selectors).forEach(([property, id]) => {

            const element = document.getElementById(id);

            const value = Math.floor(
                Math.random() * element.options.length
            );

            element.value = value;

            randomAppearance[property] = value;

        });

        updateCharacter(player, randomAppearance);

    }
);


// RESET

document.getElementById("reset-button").addEventListener(
    "click",
    () => {

        const defaults = {
            skin: 1,
            hairstyle: 0,
            hair: 0,
            top: 0,
            trousers: 0,
            shoes: 0
        };

        Object.entries(selectors).forEach(([property, id]) => {

            document.getElementById(id).value =
                defaults[property];

        });

        updateCharacter(player, defaults);

    }
);


// ==========================================
// CAMERA
// ==========================================

camera.position.set(0, 6, 9);

camera.lookAt(0, 1, 0);


// ==========================================
// KEYBOARD
// ==========================================

const keys = {};

window.addEventListener("keydown", event => {

    keys[event.key.toLowerCase()] = true;

});

window.addEventListener("keyup", event => {

    keys[event.key.toLowerCase()] = false;

});


// ==========================================
// MOBILE JOYSTICK
// ==========================================

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

    let x = event.clientX - (
        rect.left + rect.width / 2
    );

    let y = event.clientY - (
        rect.top + rect.height / 2
    );

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


// ==========================================
// ANIMATION
// ==========================================

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


    // PLAYER MOVEMENT

    if (moving) {

        player.position.x += direction.x * speed * delta;

        player.position.z += direction.y * speed * delta;

        player.rotation.y = Math.atan2(
            direction.x,
            direction.y
        );

    }


    // CHARACTER ANIMATION

    player.userData.animate(
        clock.elapsedTime,
        moving,
        running
    );


    // CAMERA FOLLOW

    const target = new THREE.Vector3(
        player.position.x,
        player.position.y + 5.5,
        player.position.z + 8
    );

    camera.position.lerp(target, 0.08);

    camera.lookAt(
        player.position.x,
        player.position.y + 1,
        player.position.z
    );


    // COORDINATES

    coordinates.textContent =
        `X: ${player.position.x.toFixed(1)} | Z: ${player.position.z.toFixed(1)}`;


    renderer.render(scene, camera);

}


// ==========================================
// RESIZE
// ==========================================

window.addEventListener("resize", () => {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

});


// ==========================================
// START GAME
// ==========================================

animate();

console.log("LAGOS LEGENDS: Stage 2 loaded successfully!");
