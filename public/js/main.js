import * as THREE from "three";

import {
    createCharacter,
    updateCharacter,
    appearanceOptions
} from "./character.js";

// ==========================================
// LAGOS LEGENDS - STAGE 2
// MODULAR CHARACTER SYSTEM
// ==========================================

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


// ==========================================
// LIGHTING
// ==========================================

scene.add(
    new THREE.HemisphereLight(0xffffff, 0x777766, 2)
);

const sunlight = new THREE.DirectionalLight(0xffffff, 2);

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


// ==========================================
// CHARACTER CUSTOMISATION CONFIGURATION
// ==========================================

const characterSettings = {

    skinTone: 0x986747,

    outfit: 0x2454a6,

    trousers: 0x252b38,

    shoes: 0x171717,

    hair: 0x17110e

};


// ==========================================
// CHARACTER BUILDER
// ==========================================

function createCharacter(settings = {}) {

    const appearance = {
        ...characterSettings,
        ...settings
    };

    const character = new THREE.Group();

    const skinMaterial = new THREE.MeshStandardMaterial({
        color: appearance.skinTone,
        flatShading: true
    });

    const outfitMaterial = new THREE.MeshStandardMaterial({
        color: appearance.outfit,
        flatShading: true
    });

    const trousersMaterial = new THREE.MeshStandardMaterial({
        color: appearance.trousers,
        flatShading: true
    });

    const shoeMaterial = new THREE.MeshStandardMaterial({
        color: appearance.shoes,
        flatShading: true
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
        color: appearance.hair,
        flatShading: true
    });


    function makePart(geometry, material, parent, position) {

        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(...position);

        parent.add(mesh);

        return mesh;
    }


    // TORSO

    const torso = makePart(
        new THREE.CapsuleGeometry(0.38, 0.65, 3, 7),
        outfitMaterial,
        character,
        [0, 1.25, 0]
    );


    // NECK

    makePart(
        new THREE.CylinderGeometry(0.12, 0.14, 0.2, 6),
        skinMaterial,
        character,
        [0, 1.77, 0]
    );


    // HEAD

    const headGroup = new THREE.Group();

    headGroup.position.y = 1.95;

    character.add(headGroup);

    makePart(
        new THREE.IcosahedronGeometry(0.34, 1),
        skinMaterial,
        headGroup,
        [0, 0, 0]
    );


    // HAIR

    makePart(
        new THREE.SphereGeometry(
            0.35,
            8,
            6,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2
        ),
        hairMaterial,
        headGroup,
        [0, 0.08, 0]
    );


    // ARMS

    function createArm(side) {

        const arm = new THREE.Group();

        arm.position.set(side * 0.43, 1.48, 0);

        character.add(arm);

        makePart(
            new THREE.CapsuleGeometry(0.13, 0.52, 3, 5),
            outfitMaterial,
            arm,
            [0, -0.34, 0]
        );

        makePart(
            new THREE.SphereGeometry(0.14, 6, 5),
            skinMaterial,
            arm,
            [0, -0.68, 0]
        );

        return arm;
    }


    const leftArm = createArm(-1);
    const rightArm = createArm(1);


    // LEGS

    function createLeg(side) {

        const leg = new THREE.Group();

        leg.position.set(side * 0.19, 0.85, 0);

        character.add(leg);

        makePart(
            new THREE.CapsuleGeometry(0.17, 0.55, 3, 5),
            trousersMaterial,
            leg,
            [0, -0.36, 0]
        );

        makePart(
            new THREE.BoxGeometry(0.28, 0.15, 0.48),
            shoeMaterial,
            leg,
            [0, -0.77, 0.08]
        );

        return leg;
    }


    const leftLeg = createLeg(-1);
    const rightLeg = createLeg(1);


    // ANIMATION REFERENCES

    character.userData.parts = {

        torso,

        headGroup,

        leftArm,
        rightArm,

        leftLeg,
        rightLeg

    };


    character.userData.animationTime = 0;

    return character;
}


// ==========================================
// CREATE PLAYER
// ==========================================

const player = createCharacter();

scene.add(player);


// ==========================================
// CHANGE CHARACTER APPEARANCE
// ==========================================

function updateCharacterAppearance(settings) {

    const parts = player.userData.parts;

    if (settings.skinTone !== undefined) {

        parts.headGroup.children[0].material.color.set(
            settings.skinTone
        );

        player.traverse(object => {

            if (object.geometry?.type === "CapsuleGeometry" &&
                object.material.color.getHex() === characterSettings.skinTone) {

                object.material.color.set(settings.skinTone);
            }

        });

    }

    if (settings.outfit !== undefined) {

        parts.torso.material.color.set(settings.outfit);

        parts.leftArm.children[0].material.color.set(settings.outfit);
        parts.rightArm.children[0].material.color.set(settings.outfit);

    }

    if (settings.trousers !== undefined) {

        parts.leftLeg.children[0].material.color.set(settings.trousers);
        parts.rightLeg.children[0].material.color.set(settings.trousers);

    }

}


// ==========================================
// CAMERA
// ==========================================

camera.position.set(0, 6, 9);

camera.lookAt(0, 1, 0);


// ==========================================
// KEYBOARD CONTROLS
// ==========================================

const keys = {};

window.addEventListener("keydown", e => {

    keys[e.key.toLowerCase()] = true;

});

window.addEventListener("keyup", e => {

    keys[e.key.toLowerCase()] = false;

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

    if (e.pointerId === pointerId) {

        resetJoystick();

    }

});


joystick.addEventListener("pointercancel", resetJoystick);


// ==========================================
// ANIMATION SYSTEM
// ==========================================

function animateCharacter(speed, running, delta) {

    const parts = player.userData.parts;

    const moving = speed > 0.05;

    player.userData.animationTime += delta *
        (running ? 13 : 8);

    const time = player.userData.animationTime;

    if (moving) {

        const swing = Math.sin(time) * (running ? 0.85 : 0.55);

        parts.leftLeg.rotation.x = swing;
        parts.rightLeg.rotation.x = -swing;

        parts.leftArm.rotation.x = -swing * 0.7;
        parts.rightArm.rotation.x = swing * 0.7;

        parts.torso.rotation.x = running ? -0.08 : 0;

    } else {

        const breathing = Math.sin(time * 1.5) * 0.025;

        parts.torso.scale.y = 1 + breathing;

        parts.headGroup.rotation.y =
            Math.sin(time * 0.5) * 0.04;

        parts.leftLeg.rotation.x = THREE.MathUtils.lerp(
            parts.leftLeg.rotation.x,
            0,
            0.15
        );

        parts.rightLeg.rotation.x = THREE.MathUtils.lerp(
            parts.rightLeg.rotation.x,
            0,
            0.15
        );

        parts.leftArm.rotation.x = THREE.MathUtils.lerp(
            parts.leftArm.rotation.x,
            0,
            0.15
        );

        parts.rightArm.rotation.x = THREE.MathUtils.lerp(
            parts.rightArm.rotation.x,
            0,
            0.15
        );

    }

}


// ==========================================
// GAME LOOP
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


    if (moving) {

        player.position.x += direction.x * speed * delta;

        player.position.z += direction.y * speed * delta;

        player.rotation.y = Math.atan2(
            direction.x,
            direction.y
        );

    }


    // CHARACTER ANIMATION

    animateCharacter(
        direction.length(),
        running,
        delta
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

    document.getElementById("coordinates").textContent =

        `X: ${player.position.x.toFixed(1)} | Z: ${player.position.z.toFixed(1)}`;


    renderer.render(scene, camera);

}

animate();


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
// CHARACTER SYSTEM READY
// ==========================================

console.log("Lagos Legends: Character system loaded.");
