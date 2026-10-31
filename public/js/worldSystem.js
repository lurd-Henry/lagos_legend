import * as THREE from "three";

export class WorldSystems {

    constructor(scene) {
        this.scene = scene;
        this.colliders = [];
        this.interactables = [];

        this.playerRadius = 0.8;

        this.interactionDistance = 5;

        this.currentInteraction = null;

        this.createInteractionUI();
    }

    // =================================
    // COLLISION SYSTEM
    // =================================

    addCollider(x, z, width, depth) {

        this.colliders.push({
            minX: x - width / 2,
            maxX: x + width / 2,
            minZ: z - depth / 2,
            maxZ: z + depth / 2
        });

    }

    collides(x, z) {

        const radius = this.playerRadius;

        for (const box of this.colliders) {

            const closestX = THREE.MathUtils.clamp(
                x,
                box.minX,
                box.maxX
            );

            const closestZ = THREE.MathUtils.clamp(
                z,
                box.minZ,
                box.maxZ
            );

            const dx = x - closestX;
            const dz = z - closestZ;

            if (dx * dx + dz * dz < radius * radius) {
                return true;
            }

        }

        return false;
    }

    movePlayer(player, moveX, moveZ, speed, delta) {

        const nextX = player.position.x + moveX * speed * delta;
        const nextZ = player.position.z + moveZ * speed * delta;

        // Horizontal collision
        if (!this.collides(nextX, player.position.z)) {
            player.position.x = nextX;
        }

        // Vertical collision
        if (!this.collides(player.position.x, nextZ)) {
            player.position.z = nextZ;
        }

    }

    // =================================
    // INTERACTION SYSTEM
    // =================================

    addInteractable(object) {

        this.interactables.push(object);

    }

    createInteractionUI() {

    const container = document.getElementById("game-container");

    if (!container) {
        console.error("Game container not found!");
        return;
    }

    const button = document.createElement("button");

    button.id = "game-interact-button";
    button.textContent = "INTERACT";

    Object.assign(button.style, {
        position: "absolute",
        bottom: "125px",
        right: "25px",
        display: "none",
        padding: "15px 22px",
        border: "2px solid white",
        borderRadius: "12px",
        background: "#202020",
        color: "white",
        fontWeight: "bold",
        fontSize: "13px",
        zIndex: "100",
        cursor: "pointer",
        touchAction: "manipulation"
    });

    container.appendChild(button);

    this.button = button;

    button.addEventListener("click", () => {
        this.interact();
    });

}

    updateInteractions(player) {

    if (!this.button || !player) return;

    let nearest = null;
    let nearestDistance = Infinity;

    for (const object of this.interactables) {

        const distance = Math.hypot(
            player.position.x - object.x,
            player.position.z - object.z
        );

        if (
            distance < this.interactionDistance &&
            distance < nearestDistance
        ) {
            nearest = object;
            nearestDistance = distance;
        }

    }

    this.currentInteraction = nearest;

    if (nearest) {

        this.button.style.display = "block";
        this.button.textContent = nearest.buttonText || "INTERACT";

    } else {

        this.button.style.display = "none";

    }

}
    interact() {

        if (!this.currentInteraction) return;

        if (typeof this.currentInteraction.action === "function") {

            this.currentInteraction.action();

        }

    }

}
