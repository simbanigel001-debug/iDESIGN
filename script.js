// State Management
let modules = [
    { id: 1, type: "shelves", width: 600, shelvesCount: 4, drawersCount: 0, drawerType: "internal", doorsCount: 2, doorHeight: 2100 }
];

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotation = { x: -15, y: -20 };

// Initial Setup on Page Load
window.onload = function() {
    setup3DControls();
    calculateCabinetSetup();
};

function setup3DControls() {
    const viewport = document.getElementById("canvas-viewport");
    const stage = document.getElementById("stage");

    viewport.addEventListener("mousedown", (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };

        rotation.y += deltaMove.x * 0.5;
        rotation.x -= deltaMove.y * 0.5;

        // Keep vertical rotation within reasonable limits
        rotation.x = Math.max(-60, Math.min(60, rotation.x));

        stage.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Touch support for mobile devices
    viewport.addEventListener("touchstart", (e) => {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    window.addEventListener("touchend", () => {
        isDragging = false;
    });

    window.addEventListener("touchmove", (e) => {
        if (!isDragging) return;

        const deltaMove = {
            x: e.touches[0].clientX - previousMousePosition.x,
            y: e.touches[0].clientY - previousMousePosition.y
        };

        rotation.y += deltaMove.x * 0.5;
        rotation.x -= deltaMove.y * 0.5;
        rotation.x = Math.max(-60, Math.min(60, rotation.x));

        stage.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
}

function syncBackingThickness() {
    const backSelect = document.getElementById("backMaterial");
    const selectedOption = backSelect.options[backSelect.selectedIndex];
    const thicknessInput = document.getElementById("backThickness");
    thicknessInput.value = selectedOption.getAttribute("data-thick");
    calculateCabinetSetup();
}

// Module Configuration Operations
function addNewModule() {
    const id = modules.length > 0 ? Math.max(...modules.map(m => m.id)) + 1 : 1;
    modules.push({
        id: id,
        type: "shelves",
        width: 500,
        shelvesCount: 3,
        drawersCount: 0,
        drawerType: "internal",
        doorsCount: 1,
        doorHeight: 2100
    });
    calculateCabinetSetup();
}

function removeModule(id) {
    modules = modules.filter(m => m.id !== id);
    calculateCabinetSetup();
}

function updateModuleParam(id, param, value) {
    const mod = modules.find(m => m.id === id);
    if (mod) {
        if (param === "type" || param === "drawerType") {
            mod[param] = value;
        } else {
            mod[param] = parseInt(value) || 0;
        }
        calculateCabinetSetup();
    }
}

// Render UI Modules Control Panel
function renderModulesControlPanel() {
    const listContainer = document.getElementById("modules-list");
    listContainer.innerHTML = "";
    
    let totalComputedWidth = 0;

    modules.forEach((mod, index) => {
        totalComputedWidth += mod.width;
        const card = document.createElement("div");
        card.className = "module-card";
        card.innerHTML = `
            <div class="module-card-header">
                <span class="module-title">Unit ${index + 1} (Width: ${mod.width}mm)</span>
                <button class="btn-delete" onclick="removeModule(${mod.id})">Remove</button>
            </div>
            
            <div class="input-grid">
                <div class="input-group">
                    <label>Width (mm)</label>
                    <input type="number" value="${mod.width}" max="1000" oninput="updateModuleParam(${mod.id}, 'width', this.value)">
                </div>
                <div class="input-group">
                    <label>Layout Type</label>
                    <select onchange="updateModuleParam(${mod.id}, 'type', this.value)">
                        <option value="shelves" ${mod.type === 'shelves' ? 'selected' : ''}>Shelving Unit</option>
                        <option value="wardrobe" ${mod.type === 'wardrobe' ? 'selected' : ''}>Hanging Wardrobe</option>
                    </select>
                </div>
            </div>

            <div class="input-grid">
                <div class="input-group">
                    <label>Shelves</label>
                    <input type="number" value="${mod.shelvesCount}" oninput="updateModuleParam(${mod.id}, 'shelvesCount', this.value)">
                </div>
                <div class="input-group">
                    <label>Drawers</label>
                    <input type="number" value="${mod.drawersCount}" oninput="updateModuleParam(${mod.id}, 'drawersCount', this.value)">
                </div>
            </div>

            <div class="input-grid">
                <div class="input-group">
                    <label>Drawer Setup</label>
                    <select onchange="updateModuleParam(${mod.id}, 'drawerType', this.value)">
                        <option value="internal" ${mod.drawerType === 'internal' ? 'selected' : ''}>Internal (Hidden)</option>
                        <option value="external" ${mod.drawerType === 'external' ? 'selected' : ''}>External (Exposed Fronts)</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>No. of Doors</label>
                    <select onchange="updateModuleParam(${mod.id}, 'doorsCount', this.value)">
                        <option value="0" ${mod.doorsCount === 0 ? 'selected' : ''}>No Doors (Open)</option>
                        <option value="1" ${mod.doorsCount === 1 ? 'selected' : ''}>Single Door</option>
                        <option value="2" ${mod.doorsCount === 2 ? 'selected' : ''}>Double Doors</option>
                    </select>
                </div>
            </div>

            <div class="input-grid" ${mod.doorsCount > 0 ? '' : 'style="display:none;"'}>
                <div class="input-group" style="grid-column: span 2;">
                    <label>Custom Door Height (mm)</label>
                    <input type="number" value="${mod.doorHeight}" oninput="updateModuleParam(${mod.id}, 'doorHeight', this.value)">
                </div>
            </div>
        `;
        listContainer.innerHTML += card.outerHTML;
    });

    document.getElementById("viewport-badge").innerText = `${modules.length} Unit(s) Loaded`;

    // Warn if any unit exceeds standard board layouts
    const warning = document.getElementById("modular-warning");
    const hasOverlarge = modules.some(m => m.width > 1000);
    warning.style.display = hasOverlarge ? "block" : "none";
}

// 3D Cabinet Construction & Math Engine
function calculateCabinetSetup() {
    renderModulesControlPanel();

    const stage = document.getElementById("stage");
    stage.innerHTML = "";

    // Grab Global Values
    const totalHeight = parseInt(document.getElementById("height").value) || 2000;
    const totalDepth = parseInt(document.getElementById("depth").value) || 600;
    const thk = parseInt(document.getElementById("thickness").value) || 16;
    const kickHeight = parseInt(document.getElementById("kickHeight").value) || 100;
    const topTrack = parseInt(document.getElementById("topTrack").value) || 0;
    const exposedSides = document.getElementById("exposedSides").value;
    const backThk = parseInt(document.getElementById("backThickness").value) || 16;
    const doorStyle = document.getElementById("doorStyle").value;
    const handleStyle = document.getElementById("handleStyle").value;

    const carcassMat = document.getElementById("carcassMaterial").value;
    const faceMat = document.getElementById("faceMaterial").value;
    const backMat = document.getElementById("backMaterial").value;

    let totalWidth = modules.reduce((sum, m) => sum + m.width, 0);
    if (totalWidth === 0) return;

    // Scale 3D models down to fit comfortably in viewport (e.g., 1mm = 0.18px)
    const scale = 0.18;
    const wScaled = totalWidth * scale;
    const hScaled = totalHeight * scale;
    const dScaled = totalDepth * scale;
    const thkScaled = thk * scale;
    const kickScaled = kickHeight * scale;
    const backThkScaled = backThk * scale;

    // Set stage boundary
    stage.style.width = `${wScaled}px`;
    stage.style.height = `${hScaled}px`;
    stage.style.transformStyle = "preserve-3d";

    // Helper function to draw a solid 3D block (instead of a flat 2D plane)
    function create3DBlock(x, y, z, w, h, d, colorClass, borderHex = '#cbd5e1', contentHTML = '') {
        const block = document.createElement("div");
        block.className = `panel-3d ${colorClass}`;
        block.style.width = `${w}px`;
        block.style.height = `${h}px`;
        block.style.position = "absolute";
        block.style.left = `${x}px`;
        block.style.top = `${y}px`;
        block.style.transform = `translate3d(0, 0, ${z}px)`;
        block.style.transformStyle = "preserve-3d";

        // Face mappings (Carcass gets true CSS isometric rendering)
        const faces = [
            { t: `translate3d(0,0,${d}px)`, w: w, h: h }, // Front
            { t: `rotateY(180deg)`, w: w, h: h }, // Back
            { t: `rotateY(-90deg) translate3d(0,0,0)`, w: d, h: h, o: 'left' }, // Left Side
            { t: `rotateY(90deg) translate3d(0,0,${w}px)`, w: d, h: h, o: 'left' }, // Right Side
            { t: `rotateX(90deg) translate3d(0,0,0)`, w: w, h: d, o: 'top' }, // Top
            { t: `rotateX(-90deg) translate3d(0,0,${h}px)`, w: w, h: d, o: 'top' } // Bottom
        ];

        faces.forEach((f, idx) => {
            const side = document.createElement("div");
            side.className = `side-${idx}`;
            side.style.position = "absolute";
            side.style.width = `${f.w}px`;
            side.style.height = `${f.h}px`;
            side.style.transform = f.t;
            if (f.o) side.style.transformOrigin = f.o;
            
            // Add custom visual styling
            side.style.border = `1px solid ${borderHex}`;
            side.style.boxSizing = "border-box";
            side.style.backgroundColor = "inherit";

            if (idx === 0 && contentHTML) {
                side.innerHTML = contentHTML;
            }
            block.appendChild(side);
        });

        stage.appendChild(block);
    }

    // Color Class Mapping
    const carcassColorClass = `color-${carcassMat.toLowerCase().replace(/ /g, "-")}`;
    const faceColorClass = `color-${faceMat.toLowerCase().replace(/ /g, "-")}`;
    const backColorClass = `color-${backMat.toLowerCase().replace(/ /g, "-")}`;

    // 1. Render Plinth / Kickplate
    create3DBlock(
        0, 
        (totalHeight - kickHeight) * scale, 
        thkScaled, 
        wScaled, 
        kickScaled, 
        (totalDepth - thk) * scale, 
        carcassColorClass
    );

    // 2. Render Outer Structural Carcass Gables
    const internalHeight = totalHeight - kickHeight - topTrack - thk;
    const internalY = topTrack * scale;

    // Left End Gable
    create3DBlock(0, internalY, 0, thkScaled, internalHeight * scale, dScaled, carcassColorClass);
    // Right End Gable
    create3DBlock(wScaled - thkScaled, internalY, 0, thkScaled, internalHeight * scale, dScaled, carcassColorClass);
    // Top Plate
    create3DBlock(0, internalY, 0, wScaled, thkScaled, dScaled, carcassColorClass);
    // Bottom Base Plate
    create3DBlock(0, (totalHeight - kickHeight - thk) * scale, 0, wScaled, thkScaled, dScaled, carcassColorClass);

    // Backing Board
    create3DBlock(thkScaled, internalY + thkScaled, 0, wScaled - (thkScaled * 2), (internalHeight - thk) * scale, backThkScaled, backColorClass);

    // 3. Partition and Unit Level Rendering Loop
    let currentX = thk;

    modules.forEach((mod, index) => {
        const modWScaled = mod.width * scale;
        const modLeftScaled = currentX * scale;
        const modInnerWScaled = (mod.width - thk) * scale;

        // Render Divider partitions between modules
        if (index < modules.length - 1) {
            const partitionX = (currentX + mod.width) * scale;
            create3DBlock(partitionX, (internalY + thkScaled), 0, thkScaled, (internalHeight - thk) * scale, dScaled, carcassColorClass);
        }

        // Handle Gola Profiles (Recessed Channels)
        let golaGapTop = 0;
        let golaGapDrawers = 0;
        if (handleStyle === "gola") {
            golaGapTop = 45; // mm standard Gola profile recess
            golaGapDrawers = 35; // mm standard Gola gap between drawer faces
            // Render visible Gola horizontal profile channel
            create3DBlock(modLeftScaled, internalY + thkScaled, (totalDepth - 30) * scale, modWScaled - thkScaled, 40 * scale, 20 * scale, "color-folkstone-grey");
        }

        // Render Internal/External Drawers
        if (mod.drawersCount > 0) {
            const drawerContainerHeight = 160 * mod.drawersCount;
            const drawerBottomY = totalHeight - kickHeight - thk;

            for (let i = 0; i < mod.drawersCount; i++) {
                const drawerHeight = 140;
                const drawerY = drawerBottomY - (i * (drawerHeight + 20)) - drawerHeight;
                
                // If External Drawers, render the external decorative faces
                if (mod.drawerType === "external") {
                    const dfHeight = drawerHeight + 10;
                    const dfY = (drawerY - 5) * scale;
                    const dfWidth = mod.width - 4; // Reveal gaps
                    
                    let contentHTML = '';
                    if (doorStyle === "shaker") {
                        contentHTML = `<div style="border: 4px solid rgba(0,0,0,0.15); width: 100%; height: 100%; box-sizing: border-box;"></div>`;
                    }

                    create3DBlock(
                        (currentX + 2) * scale, 
                        dfY, 
                        dScaled + 2, 
                        dfWidth * scale, 
                        dfHeight * scale, 
                        thkScaled, 
                        faceColorClass,
                        '#111111',
                        contentHTML
                    );
                } else {
                    // Internal Drawers (sit inside behind the door)
                    create3DBlock(
                        (currentX + thk + 10) * scale, 
                        (drawerY) * scale, 
                        (thk * 2) * scale, 
                        (mod.width - (thk * 2) - 20) * scale, 
                        100 * scale, 
                        (totalDepth - thk - 50) * scale, 
                        "color-folkstone-grey"
                    );
                }
            }
        }

        // Render Shelves
        if (mod.shelvesCount > 0) {
            const verticalWorkingSpace = internalHeight - thk - golaGapTop;
            const interval = verticalWorkingSpace / (mod.shelvesCount + 1);
            for (let s = 1; s <= mod.shelvesCount; s++) {
                const shelfY = (topTrack + thk + golaGapTop + (interval * s)) * scale;
                create3DBlock(
                    modLeftScaled + thkScaled, 
                    shelfY, 
                    thkScaled, 
                    modInnerWScaled - thkScaled, 
                    thkScaled, 
                    dScaled - thkScaled, 
                    carcassColorClass
                );
            }
        }

        // Render Door Fronts (Applying Shaker Styling & Hardware)
        if (mod.doorsCount > 0) {
            const doorGap = 2; // reveal gap
            const doorWidth = (mod.doorsCount === 2) 
                ? (mod.width / 2) - (doorGap * 1.5) 
                : mod.width - (doorGap * 2);

            const doorH = mod.doorHeight - golaGapTop;
            const doorYScaled = (topTrack + thk + golaGapTop) * scale;

            for (let d = 0; d < mod.doorsCount; d++) {
                const doorX = (mod.doorsCount === 2) 
                    ? currentX + (d * (doorWidth + doorGap)) + doorGap
                    : currentX + doorGap;

                // Shaker styling rendering
                let contentHTML = '';
                if (doorStyle === "shaker") {
                    contentHTML = `
                        <div style="
                            border: 20px solid rgba(0,0,0,0.06); 
                            width: 100%; 
                            height: 100%; 
                            box-sizing: border-box; 
                            background-color: inherit;
                            box-shadow: inset 0 2px 8px rgba(0,0,0,0.12);
                        "></div>`;
                }

                // Add Gola continuous profile visual spacing OR physical handles
                if (handleStyle.startsWith("bar-")) {
                    const handleColor = handleStyle.includes("black") ? "#111111" : "#d1d5db";
                    contentHTML += `
                        <div style="
                            position: absolute; 
                            left: 15px; 
                            bottom: 200px; 
                            width: 8px; 
                            height: 150px; 
                            background-color: ${handleColor}; 
                            border-radius: 2px;
                            box-shadow: 1px 1px 4px rgba(0,0,0,0.3);
                        "></div>`;
                }

                create3DBlock(
                    doorX * scale, 
                    doorYScaled, 
                    dScaled + 2, 
                    doorWidth * scale, 
                    doorH * scale, 
                    thkScaled, 
                    faceColorClass, 
                    '#111111', 
                    contentHTML
                );
            }
        }

        currentX += mod.width;
    });

    // 4. Fire Output Tables (MaxiCut Ready)
    generateCutlist(totalHeight, totalDepth, thk, kickHeight, backThk, carcassMat, faceMat, backMat);
}

// Generate Structural Panels for Fabrication Output Tables (MaxiCut Optimized)
function generateCutlist(H, D, T, K, BT, carcassMat, faceMat, backMat) {
    const listOutput = document.getElementById("lists-output");
    listOutput.innerHTML = "";

    // Math calculation logic
    let totalWidth = modules.reduce((sum, m) => sum + m.width, 0);
    const numDividers = modules.length - 1;
    const workingH = H - K - T;

    // Carcass Parts array
    const carcassParts = [
        { name: "End Gable (Left)", qty: 1, len: workingH, wid: D, mat: carcassMat },
        { name: "End Gable (Right)", qty: 1, len: workingH, wid: D, mat: carcassMat },
        { name: "Top Fascia / Deck", qty: 1, len: totalWidth - (T * 2), wid: D, mat: carcassMat },
        { name: "Bottom Base Plate", qty: 1, len: totalWidth - (T * 2), wid: D, mat: carcassMat },
        { name: "Kickplate", qty: 1, len: totalWidth, wid: K, mat: carcassMat }
    ];

    if (numDividers > 0) {
        carcassParts.push({ name: "Internal Divider", qty: numDividers, len: workingH - T, wid: D - T, mat: carcassMat });
    }

    // Process interior shelving and drawer fronts
    modules.forEach((mod, idx) => {
        const interiorW = mod.width - T;
        if (mod.shelvesCount > 0) {
            carcassParts.push({ name: `Unit ${idx + 1} Shelves`, qty: mod.shelvesCount, len: interiorW, wid: D - 20, mat: carcassMat });
        }
    });

    // Face Parts array (Melawood)
    const faceParts = [];
    modules.forEach((mod, idx) => {
        if (mod.doorsCount > 0) {
            const doorW = (mod.doorsCount === 2) ? (mod.width / 2) - 4 : mod.width - 4;
            faceParts.push({ name: `Unit ${idx + 1} Door Facings`, qty: mod.doorsCount, len: mod.doorHeight, wid: doorW, mat: faceMat });
        }
        if (mod.drawersCount > 0 && mod.drawerType === "external") {
            const dfW = mod.width - 4;
            faceParts.push({ name: `Unit ${idx + 1} Drawer Fronts`, qty: mod.drawersCount, len: 160, wid: dfW, mat: faceMat });
        }
    });

    // Backing Board (Melamine)
    const backParts = [
        { name: "Backing Board", qty: 1, len: workingH - 4, wid: totalWidth - 4, mat: backMat }
    ];

    function renderTable(title, parts) {
        let html = `
            <div class="material-group-title">
                <span>${title}</span>
                <span>Dimensions in mm</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Part Description</th>
                        <th>Qty</th>
                        <th>Length (mm)</th>
                        <th>Width (mm)</th>
                        <th>Material Specs</th>
                    </tr>
                </thead>
                <tbody>
        `;

        parts.forEach(p => {
            html += `
                <tr>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.qty}</td>
                    <td>${p.len}</td>
                    <td>${p.wid}</td>
                    <td>${p.mat}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        return html;
    }

    listOutput.innerHTML += renderTable("CARCASS COMPONENTS", carcassParts);
    if (faceParts.length > 0) {
        listOutput.innerHTML += renderTable("FACINGS & DOORS (MELAWOOD)", faceParts);
    }
    listOutput.innerHTML += renderTable("BACKING PANEL COMPONENTS", backParts);
}
