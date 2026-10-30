import * as THREE from "three";

export const appearanceOptions = {
    skin: [
        { name: "Light Brown", color: 0xc18b65 },
        { name: "Brown", color: 0x986747 },
        { name: "Dark Brown", color: 0x70452f },
        { name: "Deep Brown", color: 0x4b2d20 }
    ],

    hair: [
        { name: "Black", color: 0x17110e },
        { name: "Dark Brown", color: 0x382318 },
        { name: "Blonde", color: 0xb78a43 }
    ],

    hairstyles: [
        "Low Cut",
        "Afro",
        "Short Hair",
        "Bald"
    ],

    tops: [
        { name: "Blue Hoodie", color: 0x2454a6 },
        { name: "Black Shirt", color: 0x222222 },
        { name: "White Shirt", color: 0xe8e8e8 },
        { name: "Red Jacket", color: 0x9d2525 },
        { name: "Green Shirt", color: 0x326b42 }
    ],

    trousers: [
        { name: "Black", color: 0x252b38 },
        { name: "Blue Jeans", color: 0x344c76 },
        { name: "Grey", color: 0x777777 },
        { name: "Cream", color: 0xc6b99b }
    ],

    shoes: [
        { name: "Black", color: 0x171717 },
        { name: "White", color: 0xececec },
        { name: "Red", color: 0x9d2525 }
    ]
};


export function createCharacter(settings = {}) {

    const character = new THREE.Group();

    const defaults = {
        skin: 1,
        hair: 0,
        hairstyle: 0,
        top: 0,
        trousers: 0,
        shoes: 0
    };

    character.userData.appearance = {
        ...defaults,
        ...settings
    };

    const parts = {};

    function material(color) {
        return new THREE.MeshStandardMaterial({
            color,
            roughness: 0.85,
            flatShading: true
        });
    }

    function addPart(name, geometry, mat, parent, position) {

        const mesh = new THREE.Mesh(geometry, mat);

        mesh.name = name;
        mesh.position.set(...position);

        mesh.castShadow = true;

        parent.add(mesh);

        parts[name] = mesh;

        return mesh;
    }

    function capsule(name, radius, length, mat, parent, position) {
        return addPart(
            name,
            new THREE.CapsuleGeometry(radius, length, 3, 7),
            mat,
            parent,
            position
        );
    }

    function sphere(name, radius, mat, parent, position, scale = [1, 1, 1]) {

        const mesh = addPart(
            name,
            new THREE.SphereGeometry(radius, 10, 8),
            mat,
            parent,
            position
        );

        mesh.scale.set(...scale);

        return mesh;
    }

    function box(name, size, mat, parent, position) {
        return addPart(
            name,
            new THREE.BoxGeometry(...size),
            mat,
            parent,
            position
        );
    }


    const appearance = character.userData.appearance;

    const skinMat = material(
        appearanceOptions.skin[appearance.skin].color
    );

    const hairMat = material(
        appearanceOptions.hair[appearance.hair].color
    );

    const topMat = material(
        appearanceOptions.tops[appearance.top].color
    );

    const trouserMat = material(
        appearanceOptions.trousers[appearance.trousers].color
    );

    const shoeMat = material(
        appearanceOptions.shoes[appearance.shoes].color
    );

    const whiteMat = material(0xffffff);
    const eyeMat = material(0x17110e);


    // BODY / TORSO

    const torso = new THREE.Group();

    torso.position.y = 1.25;

    character.add(torso);

    capsule(
        "torso",
        0.37,
        0.55,
        topMat,
        torso,
        [0, 0, 0]
    );


    // NECK

    capsule(
        "neck",
        0.12,
        0.13,
        skinMat,
        character,
        [0, 1.73, 0]
    );


    // HEAD

    const head = new THREE.Group();

    head.position.set(0, 1.98, 0);

    character.add(head);

    sphere(
        "head",
        0.34,
        skinMat,
        head,
        [0, 0, 0],
        [0.88, 1.12, 0.9]
    );


    // EARS

    sphere(
        "leftEar",
        0.09,
        skinMat,
        head,
        [-0.31, 0, 0],
        [0.55, 1, 0.6]
    );

    sphere(
        "rightEar",
        0.09,
        skinMat,
        head,
        [0.31, 0, 0],
        [0.55, 1, 0.6]
    );


    // NOSE

    sphere(
        "nose",
        0.075,
        skinMat,
        head,
        [0, -0.04, 0.29],
        [0.8, 0.8, 1.2]
    );


    // EYES

    sphere(
        "leftEye",
        0.045,
        whiteMat,
        head,
        [-0.12, 0.07, 0.285]
    );

    sphere(
        "rightEye",
        0.045,
        whiteMat,
        head,
        [0.12, 0.07, 0.285]
    );

    sphere(
        "leftPupil",
        0.023,
        eyeMat,
        head,
        [-0.12, 0.07, 0.325]
    );

    sphere(
        "rightPupil",
        0.023,
        eyeMat,
        head,
        [0.12, 0.07, 0.325]
    );


    // HAIRSTYLE

    const hair = new THREE.Group();

    hair.position.y = 0.23;

    head.add(hair);

    function updateHair(style) {

        while (hair.children.length) {

            const child = hair.children[0];

            hair.remove(child);

            child.geometry.dispose();

        }

        if (style === 3) return;

        let geometry;

        if (style === 1) {

            geometry = new THREE.SphereGeometry(
                0.39,
                10,
                8
            );

        } else if (style === 2) {

            geometry = new THREE.SphereGeometry(
                0.35,
                10,
                8,
                0,
                Math.PI * 2,
                0,
                Math.PI / 2
            );

        } else {

            geometry = new THREE.SphereGeometry(
                0.35,
                10,
                8,
                0,
                Math.PI * 2,
                0,
                Math.PI / 2
            );

        }

        const mesh = new THREE.Mesh(geometry, hairMat);

        mesh.position.y = 0.02;

        hair.add(mesh);

    }

    updateHair(appearance.hairstyle);


    // ARMS

    function createArm(side, name) {

        const pivot = new THREE.Group();

        pivot.position.set(side * 0.43, 1.48, 0);

        character.add(pivot);

        capsule(
            name + "Sleeve",
            0.14,
            0.38,
            topMat,
            pivot,
            [0, -0.25, 0]
        );

        capsule(
            name + "Hand",
            0.105,
            0.16,
            skinMat,
            pivot,
            [0, -0.55, 0]
        );

        return pivot;

    }

    const leftArm = createArm(-1, "left");
    const rightArm = createArm(1, "right");


    // LEGS

    function createLeg(side, name) {

        const pivot = new THREE.Group();

        pivot.position.set(side * 0.19, 0.88, 0);

        character.add(pivot);

        capsule(
            name + "Trouser",
            0.16,
            0.57,
            trouserMat,
            pivot,
            [0, -0.34, 0]
        );

        box(
            name + "Shoe",
            [0.3, 0.16, 0.45],
            shoeMat,
            pivot,
            [0, -0.72, 0.08]
        );

        return pivot;

    }

    const leftLeg = createLeg(-1, "left");
    const rightLeg = createLeg(1, "right");


    character.userData.parts = {
        torso,
        head,
        hair,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg
    };


    character.userData.materials = {
        skinMat,
        hairMat,
        topMat,
        trouserMat,
        shoeMat
    };


    character.userData.updateHair = updateHair;

    character.userData.animate = function(time, moving, running) {

        const swing = moving
            ? Math.sin(time * (running ? 13 : 8)) * (running ? 0.8 : 0.5)
            : 0;

        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;

        leftArm.rotation.x = -swing * 0.75;
        rightArm.rotation.x = swing * 0.75;

        torso.position.y = 1.25 +
            (moving ? 0 : Math.sin(time * 2) * 0.015);

        head.rotation.y = moving
            ? 0
            : Math.sin(time) * 0.035;

    };


    return character;
}


// ==========================================
// UPDATE APPEARANCE
// ==========================================

export function updateCharacter(character, changes) {

    const appearance = character.userData.appearance;
    const materials = character.userData.materials;

    Object.assign(appearance, changes);

    if (changes.skin !== undefined) {

        materials.skinMat.color.set(
            appearanceOptions.skin[appearance.skin].color
        );

    }

    if (changes.hair !== undefined) {

        materials.hairMat.color.set(
            appearanceOptions.hair[appearance.hair].color
        );

    }

    if (changes.top !== undefined) {

        materials.topMat.color.set(
            appearanceOptions.tops[appearance.top].color
        );

    }

    if (changes.trousers !== undefined) {

        materials.trouserMat.color.set(
            appearanceOptions.trousers[appearance.trousers].color
        );

    }

    if (changes.shoes !== undefined) {

        materials.shoeMat.color.set(
            appearanceOptions.shoes[appearance.shoes].color
        );

    }

    if (changes.hairstyle !== undefined) {

        character.userData.updateHair(appearance.hairstyle);

    }

}
