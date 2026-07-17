// Robust State Management
let modules = [
    { id: 1, type: "shelves", width: 500, shelvesCount: 4, drawersCount: 2, drawerType: "external", doorsCount: 1, doorHeight: 2100 }
];

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotation = { x: -15, y: -20 };

// Safe Initialization
window.onload = function() {
    setup3DControls();
    calculateCabinetSetup();
};

function setup3DControls() {
    const viewport = document.getElementById("canvas-viewport");
    const stage = document.getElementById("stage");
    if (!viewport || !stage) return;

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
        rotation.x = Math.max(-60, Math.min(60, rotation.x));

        stage.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Mobile touch controls
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
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
}

function syncBackingThickness() {
    const backSelect = document.getElementById("backMaterial");
    const thicknessInput = document.getElementById("backThickness");
    if (backSelect && thicknessInput) {
        const selectedOption = backSelect.options[backSelect.selectedIndex];
        thicknessInput.value = selectedOption.getAttribute("data-thick") || "16";
    }
    calculateCabinetSetup();
}

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
        doorHeight: 2000
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
            // Keep a fallback of 1 instead of 0 or NaN to prevent dividing or breaking layouts
            mod[param] = parseInt(value) || 0;
        }
        calculateCabinetSetup();
    }
}

function renderModulesControlPanel() {
    const listContainer = document.getElementById("modules-list");
    if (!listContainer) return;
    
    listContainer.innerHTML = "";
    
    modules.forEach((mod, index) => {
        const card = document.createElement("div");
        card.className = "module-card";
        card.innerHTML = `
            <div class="module-card-header">
                <span class="module-title">Unit ${index + 1} (Width: ${mod.width || 0}mm)</span>
                <button class="btn-delete" onclick="removeModule(${mod.id})">Remove</button>
            </div>
            
            <div class="input-grid">
                <div class="input-group">
                    <label>Width (mm)</label>
                    <input type="number" value="${mod.width || ''}" placeholder="e.g. 500" oninput="updateModuleParam(${mod.id}, 'width', this.value)">
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
        listContainer.appendChild(card);
    });

    const badge = document.getElementById("viewport-badge");
    if (badge) {
        badge.innerText = `${modules.length} Unit(s) Loaded`;
    }

    const warning = document.getElementById("modular-warning");
    if (warning) {
        const hasOverlarge = modules.some(m => m.width > 1000);
        warning.style.display = hasOverlarge ? "block" : "none";
    }
}

// Fail-Safe Cabinet Construction Engine
function calculateCabinetSetup() {
    renderModulesControlPanel();

    const stage = document.getElementById("stage");
    if (!stage) return;
    stage.innerHTML = "";

    // Safe query fallbacks to prevent crash if an element is missing in the DOM
    const getVal = (id, fallback) => {
        const el = document.getElementById(id);
        return el ? (parseInt(el.value) || fallback) : fallback;
    };
    const getStr = (id, fallback) => {
        const el = document.getElementById(id);
        return el ? el.value : fallback;
    };

    const totalHeight = getVal("height", 2000);
    const totalDepth = getVal("depth", 600);
    const thk = getVal("thickness", 16);
    const kickHeight = getVal("kickHeight", 100);
    const topTrack = getVal("topTrack", 0);
    const backThk = getVal("backThickness", 16);
    const doorStyle = getStr("doorStyle", "shaker");
    const handleStyle = getStr("handleStyle", "bar-black");

    const carcassMat = getStr("carcassMaterial", "White Melamine Peen");
    const faceMat = getStr("faceMaterial", "Super Black");
    const backMat = getStr("backMaterial", "White Melamine Peen");

    // Clean zero-width items out of calculation to avoid scaling errors
    let activeModules = modules.map(m => ({...m, width: m.width || 500}));
    let totalWidth = activeModules.reduce((sum, m) => sum + m.width, 0);
    if (totalWidth === 0) return;

    const scale = 0.18;
    const wScaled = totalWidth * scale;
    const hScaled = totalHeight * scale;
    const dScaled = totalDepth * scale;
    const thkScaled = thk * scale;
    const kickScaled = kickHeight * scale;
    const backThkScaled = backThk * scale;

    stage.style.width = `${wScaled}px`;
    stage.style.height = `${hScaled}px`;
    stage.style.transformStyle = "preserve-3d";
    stage.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;

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
            side.style.position = "absolute";
            side.style.width = `${f.w}px`;
            side.style.height = `${f.h}px`;
            side.style.transform = f.t;
            if (f.o) side.style.transformOrigin = f.o;
            
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

    const carcassColorClass = `color-${carcassMat.toLowerCase().replace(/ /g, "-")}`;
    const faceColorClass = `color-${faceMat.toLowerCase().replace(/ /g, "-")}`;
    const backColorClass = `color-${backMat.toLowerCase().replace(/ /g, "-")}`;

    // 1. Render Plinth 
    create3DBlock(
        thkScaled, 
        (totalHeight - kickHeight) * scale, 
        (thk + 10) * scale, 
        wScaled - (thkScaled * 2), 
        kickScaled, 
        (totalDepth - thk - 10) * scale, 
        carcassColorClass
    );

    // 2. Structural Frame
    const internalHeight = totalHeight - kickHeight - topTrack - thk;
    const internalY = topTrack * scale;

    create3DBlock(0, internalY, 0, thkScaled, (internalHeight - thk) * scale, dScaled, carcassColorClass);
    create3DBlock(wScaled - thkScaled, internalY, 0, thkScaled, (internalHeight - thk) * scale, dScaled, carcassColorClass);
    create3DBlock(thkScaled, internalY, 0, wScaled - (thkScaled * 2), thkScaled, dScaled, carcassColorClass);
    create3DBlock(thkScaled, (totalHeight - kickHeight - thk) * scale, 0, wScaled - (thkScaled * 2), thkScaled, dScaled, carcassColorClass);

    // Backing Board
    create3DBlock(thkScaled + 1, (internalY + thkScaled + 1), 1, wScaled - (thkScaled * 2) - 2, (internalHeight - thk - 2) * scale, backThkScaled, backColorClass);

    // 3. Modules Loop
    let currentX = thk;

    activeModules.forEach((mod, index) => {
        const modWScaled = mod.width * scale;
        const modLeftScaled = currentX * scale;
        const modInnerWScaled = (mod.width - thk) * scale;

        if (index < activeModules.length - 1) {
            const partitionX = (currentX + mod.width - thk) * scale;
            create3DBlock(partitionX, (internalY + thkScaled), 0, thkScaled, (internalHeight - (thk * 2)) * scale, dScaled, carcassColorClass);
        }

        let golaGapTop = 0;
        if (handleStyle === "gola") {
            golaGapTop = 45; 
            create3DBlock(modLeftScaled, (internalY + thkScaled), (totalDepth - 30) * scale, modInnerWScaled, 40 * scale, 20 * scale, "color-folkstone-grey");
        }

        // Drawers
        if (mod.drawersCount > 0) {
            const drawerBottomY = totalHeight - kickHeight - thk;
            for (let i = 0; i < mod.drawersCount; i++) {
                const drawerHeight = 140;
                const drawerY = drawerBottomY - (i * (drawerHeight + 20)) - drawerHeight;
                
                if (mod.drawerType === "external") {
                    const dfHeight = drawerHeight + 10;
                    const dfY = (drawerY - 5) * scale;
                    const dfWidth = mod.width - thk - 4;
                    
                    let contentHTML = '';
                    if (doorStyle === "shaker") {
                        contentHTML = `<div style="border: 4px solid rgba(0,0,0,0.15); width: 100%; height: 100%; box-sizing: border-box;"></div>`;
                    }

                    create3DBlock(
                        (currentX + 2) * scale, 
                        dfY, 
                        dScaled + 1, 
                        dfWidth * scale, 
                        dfHeight * scale, 
                        thkScaled, 
                        faceColorClass,
                        '#111111',
                        contentHTML
                    );
                } else {
                    create3DBlock(
                        (currentX + 10) * scale, 
                        (drawerY) * scale, 
                        (thk * 2) * scale, 
                        (mod.width - thk - 20) * scale, 
                        100 * scale, 
                        (totalDepth - thk - 50) * scale, 
                        "color-folkstone-grey"
                    );
                }
            }
        }

        // Shelves
        if (mod.shelvesCount > 0) {
            const verticalWorkingSpace = internalHeight - (thk * 2) - golaGapTop;
            const interval = verticalWorkingSpace / (mod.shelvesCount + 1);
            for (let s = 1; s <= mod.shelvesCount; s++) {
                const shelfY = (topTrack + thk + golaGapTop + (interval * s)) * scale;
                create3DBlock(
                    modLeftScaled, 
                    shelfY, 
                    thkScaled, 
                    modInnerWScaled, 
                    thkScaled, 
                    dScaled - thkScaled, 
                    carcassColorClass
                );
            }
        }

        // Doors
        if (mod.doorsCount > 0) {
            const doorGap = 2;
            const doorWidth = (mod.doorsCount === 2) 
                ? ((mod.width - thk) / 2) - (doorGap * 1.5) 
                : (mod.width - thk) - (doorGap * 2);

            const doorH = mod.doorHeight - golaGapTop;
            const doorYScaled = (topTrack + thk + golaGapTop) * scale;

            for (let d = 0; d < mod.doorsCount; d++) {
                const doorX = (mod.doorsCount === 2) 
                    ? currentX + (d * (doorWidth + doorGap)) + doorGap
                    : currentX + doorGap;

                let contentHTML = '';
                if (doorStyle === "shaker") {
                    contentHTML = `
                        <div style="
                            border: 12px solid rgba(0,0,0,0.06); 
                            width: 100%; 
                            height: 100%; 
                            box-sizing: border-box; 
                            background-color: inherit;
                            box-shadow: inset 0 2px 8px rgba(0,0,0,0.12);
                        "></div>`;
                }

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
                    dScaled + 1, 
                    doorWidth * scale, 
                    doorH * scale, 
                    thkScaled, 
                    faceColorClass, 
                    '#111111', 
                    contentHTML
                );
            }
        }

        currentX += mod.width - thk;
    });

    generateCutlist(totalHeight, totalDepth, thk, kickHeight, backThk, carcassMat, faceMat, backMat, activeModules);
}

function generateCutlist(H, D, T, K, BT, carcassMat, faceMat, backMat, activeModules) {
    const listOutput = document.getElementById("lists-output");
    if (!listOutput) return;
    listOutput.innerHTML = "";

    let totalWidth = activeModules.reduce((sum, m) => sum + m.width, 0);
    const numDividers = activeModules.length - 1;
    const workingH = H - K;

    const carcassParts = [
        { name: "End Gable (Left)", qty: 1, len: workingH - T, wid: D, mat: carcassMat },
        { name: "End Gable (Right)", qty: 1, len: workingH - T, wid: D, mat: carcassMat },
        { name: "Top Deck Plate", qty: 1, len: totalWidth - (T * 2), wid: D, mat: carcassMat },
        { name: "Bottom Base Plate", qty: 1, len: totalWidth - (T * 2), wid: D, mat: carcassMat },
        { name: "Kickplate", qty: 1, len: totalWidth - (T * 2), wid: K, mat: carcassMat }
    ];

    if (numDividers > 0) {
        carcassParts.push({ name: "Internal Divider", qty: numDividers, len: workingH - (T * 2), wid: D, mat: carcassMat });
    }

    activeModules.forEach((mod, idx) => {
        const interiorW = mod.width - T;
        if (mod.shelvesCount > 0) {
            carcassParts.push({ name: `Unit ${idx + 1} Shelves`, qty: mod.shelvesCount, len: interiorW, wid: D - 20, mat: carcassMat });
        }
    });

    const faceParts = [];
    activeModules.forEach((mod, idx) => {
        if (mod.doorsCount > 0) {
            const doorW = (mod.doorsCount === 2) ? ((mod.width - T) / 2) - 4 : (mod.width - T) - 4;
            faceParts.push({ name: `Unit ${idx + 1} Door Facings`, qty: mod.doorsCount, len: mod.doorHeight, wid: doorW, mat: faceMat });
        }
        if (mod.drawersCount > 0 && mod.drawerType === "external") {
            const dfW = mod.width - T - 4;
            faceParts.push({ name: `Unit ${idx + 1} Drawer Fronts`, qty: mod.drawersCount, len: 160, wid: dfW, mat: faceMat });
        }
    });

    const backParts = [
        { name: "Backing Board", qty: 1, len: workingH - T - 4, wid: totalWidth - (T * 2) - 4, mat: backMat }
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
