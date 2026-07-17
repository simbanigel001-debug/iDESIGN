// Robust State Management
let modules = [
    { id: 1, type: "wardrobe", width: 500, shelvesCount: 1, drawersCount: 3, drawerType: "external", drawerHandle: "bar-black", doorsCount: 1, doorHeight: 1400 }
];

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotation = { x: -15, y: -20 };

window.onload = function() {
    setup3DControls();
    calculateCabinetSetup();
};

function setup3DControls() {
    const viewport = document.getElementById("canvas-viewport");
    const stage = document.getElementById("stage");
    if (!viewport || !stage) return;

    const startDrag = (x, y) => {
        isDragging = true;
        previousMousePosition = { x, y };
    };

    const moveDrag = (x, y) => {
        if (!isDragging) return;
        const deltaMove = { x: x - previousMousePosition.x, y: y - previousMousePosition.y };
        rotation.y += deltaMove.x * 0.5;
        rotation.x -= deltaMove.y * 0.5;
        rotation.x = Math.max(-60, Math.min(60, rotation.x));
        stage.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
        previousMousePosition = { x, y };
    };

    viewport.addEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY));
    window.addEventListener("mouseup", () => isDragging = false);
    window.addEventListener("mousemove", (e) => moveDrag(e.clientX, e.clientY));

    viewport.addEventListener("touchstart", (e) => startDrag(e.touches[0].clientX, e.touches[0].clientY));
    window.addEventListener("touchend", () => isDragging = false);
    window.addEventListener("touchmove", (e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY));
}

function syncBackingThickness() {
    const backSelect = document.getElementById("backMaterial");
    const thicknessInput = document.getElementById("backThickness");
    if (backSelect && thicknessInput) {
        thicknessInput.value = backSelect.options[backSelect.selectedIndex].getAttribute("data-thick") || "16";
    }
    calculateCabinetSetup();
}

function addNewModule() {
    const id = modules.length > 0 ? Math.max(...modules.map(m => m.id)) + 1 : 1;
    modules.push({ id, type: "shelves", width: 500, shelvesCount: 3, drawersCount: 0, drawerType: "internal", drawerHandle: "none", doorsCount: 1, doorHeight: 2000 });
    calculateCabinetSetup();
}

function removeModule(id) {
    modules = modules.filter(m => m.id !== id);
    calculateCabinetSetup();
}

function updateModuleParam(id, param, value) {
    const mod = modules.find(m => m.id === id);
    if (mod) {
        if (["type", "drawerType", "drawerHandle"].includes(param)) {
            mod[param] = value;
        } else {
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
                    <label>Shelves Count</label>
                    <input type="number" value="${mod.shelvesCount}" oninput="updateModuleParam(${mod.id}, 'shelvesCount', this.value)">
                </div>
                <div class="input-group">
                    <label>Drawers Count</label>
                    <input type="number" value="${mod.drawersCount}" oninput="updateModuleParam(${mod.id}, 'drawersCount', this.value)">
                </div>
            </div>

            <div class="input-grid" ${mod.drawersCount > 0 ? '' : 'style="display:none;"'}>
                <div class="input-group">
                    <label>Drawer Setup</label>
                    <select onchange="updateModuleParam(${mod.id}, 'drawerType', this.value)">
                        <option value="internal" ${mod.drawerType === 'internal' ? 'selected' : ''}>Internal (Hidden)</option>
                        <option value="external" ${mod.drawerType === 'external' ? 'selected' : ''}>External (Exposed Fronts)</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Drawer Handle / Profile</label>
                    <select onchange="updateModuleParam(${mod.id}, 'drawerHandle', this.value)">
                        <option value="gola" ${mod.drawerHandle === 'gola' ? 'selected' : ''}>Continuous Gola Channel</option>
                        <option value="bar-chrome" ${mod.drawerHandle === 'bar-chrome' ? 'selected' : ''}>Modern Chrome Bar</option>
                        <option value="bar-black" ${mod.drawerHandle === 'bar-black' ? 'selected' : ''}>Matte Black Bar</option>
                        <option value="none" ${mod.drawerHandle === 'none' ? 'selected' : ''}>Tip-On / Push-to-Open</option>
                    </select>
                </div>
            </div>

            <div class="input-grid">
                <div class="input-group">
                    <label>No. of Doors</label>
                    <select onchange="updateModuleParam(${mod.id}, 'doorsCount', this.value)">
                        <option value="0" ${mod.doorsCount === 0 ? 'selected' : ''}>No Doors (Open)</option>
                        <option value="1" ${mod.doorsCount === 1 ? 'selected' : ''}>Single Door</option>
                        <option value="2" ${mod.doorsCount === 2 ? 'selected' : ''}>Double Doors</option>
                    </select>
                </div>
                <div class="input-group" ${mod.doorsCount > 0 ? '' : 'style="display:none;"'}>
                    <label>Custom Door Height (mm)</label>
                    <input type="number" value="${mod.doorHeight}" oninput="updateModuleParam(${mod.id}, 'doorHeight', this.value)">
                </div>
            </div>
        `;
        listContainer.appendChild(card);
    });

    document.getElementById("viewport-badge").innerText = `${modules.length} Unit(s) Loaded`;
    document.getElementById("modular-warning").style.display = modules.some(m => m.width > 1000) ? "block" : "none";
}

function calculateCabinetSetup() {
    renderModulesControlPanel();
    const stage = document.getElementById("stage");
    if (!stage) return;
    stage.innerHTML = "";

    const getVal = (id, fallback) => { const el = document.getElementById(id); return el ? (parseInt(el.value) || fallback) : fallback; };
    const getStr = (id, fallback) => { const el = document.getElementById(id); return el ? el.value : fallback; };

    const totalHeight = getVal("height", 2000), totalDepth = getVal("depth", 600), thk = getVal("thickness", 16);
    const kickHeight = getVal("kickHeight", 100), backThk = getVal("backThickness", 16);
    const doorStyle = getStr("doorStyle", "shaker"), handleStyle = getStr("handleStyle", "bar-black");
    const carcassMat = getStr("carcassMaterial", "White Melamine Peen"), faceMat = getStr("faceMaterial", "Super Black"), backMat = getStr("backMaterial", "White Melamine Peen");

    let activeModules = modules.map(m => ({...m, width: m.width || 500}));
    let totalWidth = activeModules.reduce((sum, m) => sum + m.width, 0);
    if (totalWidth === 0) return;

    const scale = 0.18;
    const wScaled = totalWidth * scale, hScaled = totalHeight * scale, dScaled = totalDepth * scale, thkScaled = thk * scale, kickScaled = kickHeight * scale, backThkScaled = backThk * scale;

    stage.style.width = `${wScaled}px`;
    stage.style.height = `${hScaled}px`;
    stage.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;

    function create3DBlock(x, y, z, w, h, d, colorClass, borderHex = '#cbd5e1', contentHTML = '') {
        const block = document.createElement("div");
        block.className = `panel-3d ${colorClass}`;
        block.style.width = `${w}px`; block.style.height = `${h}px`; block.style.position = "absolute";
        block.style.left = `${x}px`; block.style.top = `${y}px`; block.style.transform = `translate3d(0, 0, ${z}px)`;
        block.style.transformStyle = "preserve-3d";

        const faces = [
            { t: `translate3d(0,0,${d}px)`, w, h }, { t: `rotateY(180deg)`, w, h },
            { t: `rotateY(-90deg)`, w: d, h, o: 'left' }, { t: `rotateY(90deg) translate3d(0,0,${w}px)`, w: d, h, o: 'left' },
            { t: `rotateX(90deg)`, w, h: d, o: 'top' }, { t: `rotateX(-90deg) translate3d(0,0,${h}px)`, w, h: d, o: 'top' }
        ];

        faces.forEach((f, idx) => {
            const side = document.createElement("div");
            side.style.position = "absolute"; side.style.width = `${f.w}px`; side.style.height = `${f.h}px`; side.style.transform = f.t;
            if (f.o) side.style.transformOrigin = f.o;
            side.style.border = `1px solid ${borderHex}`; side.style.boxSizing = "border-box"; side.style.backgroundColor = "inherit";
            if (idx === 0 && contentHTML) side.innerHTML = contentHTML;
            block.appendChild(side);
        });
        stage.appendChild(block);
    }

    const carcassColorClass = `color-${carcassMat.toLowerCase().replace(/ /g, "-")}`;
    const faceColorClass = `color-${faceMat.toLowerCase().replace(/ /g, "-")}`;
    const backColorClass = `color-${backMat.toLowerCase().replace(/ /g, "-")}`;

    // Render Outer Box
    const internalHeight = totalHeight - kickHeight - thk;
    create3DBlock(thkScaled, (totalHeight - kickHeight) * scale, (thk + 10) * scale, wScaled - (thkScaled * 2), kickScaled, (totalDepth - thk - 10) * scale, carcassColorClass);
    create3DBlock(0, 0, 0, thkScaled, (internalHeight) * scale, dScaled, carcassColorClass);
    create3DBlock(wScaled - thkScaled, 0, 0, thkScaled, (internalHeight) * scale, dScaled, carcassColorClass);
    create3DBlock(thkScaled, 0, 0, wScaled - (thkScaled * 2), thkScaled, dScaled, carcassColorClass);
    create3DBlock(thkScaled, (totalHeight - kickHeight - thk) * scale, 0, wScaled - (thkScaled * 2), thkScaled, dScaled, carcassColorClass);
    create3DBlock(thkScaled + 1, thkScaled + 1, 1, wScaled - (thkScaled * 2) - 2, (internalHeight - thk - 2) * scale, backThkScaled, backColorClass);

    let currentX = thk;
    activeModules.forEach((mod, index) => {
        const modWScaled = mod.width * scale, modLeftScaled = currentX * scale, modInnerWScaled = (mod.width - thk) * scale;

        if (index < activeModules.length - 1) {
            create3DBlock((currentX + mod.width - thk) * scale, thkScaled, 0, thkScaled, (internalHeight - (thk * 2)) * scale, dScaled, carcassColorClass);
        }

        // Hanging Rail for Wardrobes
        if (mod.type === "wardrobe") {
            create3DBlock((currentX + 4) * scale, (thk + 60) * scale, (totalDepth / 2) * scale, (mod.width - thk - 8) * scale, 15 * scale, 15 * scale, "color-folkstone-grey", "#666");
        }

        // Drawers Rendering Logic
        let structuralFloorY = totalHeight - kickHeight - thk;
        if (mod.drawersCount > 0) {
            const drawerUnitHeight = 160;
            for (let i = 0; i < mod.drawersCount; i++) {
                const curDrawerY = structuralFloorY - ((i + 1) * drawerUnitHeight);
                
                if (mod.drawerType === "external") {
                    let frontHTML = '';
                    if (doorStyle === "shaker") {
                        frontHTML = `<div style="border: 4px solid rgba(0,0,0,0.15); width: 100%; height: 100%; box-sizing: border-box;"></div>`;
                    }
                    if (mod.drawerHandle.startsWith("bar-")) {
                        const hColor = mod.drawerHandle.includes("black") ? "#111" : "#d1d5db";
                        frontHTML += `<div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 100px; height: 8px; background: ${hColor}; border-radius: 2px;"></div>`;
                    } else if (mod.drawerHandle === "gola") {
                        create3DBlock(modLeftScaled, (curDrawerY - 20) * scale, (totalDepth - 25) * scale, modInnerWScaled, 20 * scale, 20 * scale, "color-folkstone-grey");
                    }

                    create3DBlock((currentX + 2) * scale, curDrawerY * scale, dScaled + 1, (mod.width - thk - 4) * scale, (drawerUnitHeight - 4) * scale, thkScaled, faceColorClass, '#111', frontHTML);
                } else {
                    create3DBlock((currentX + 15) * scale, (curDrawerY + 20) * scale, (thk * 2) * scale, (mod.width - thk - 30) * scale, 100 * scale, (totalDepth - thk - 50) * scale, "color-folkstone-grey");
                }
            }
        }

        // Shelves Layout Logic
        if (mod.shelvesCount > 0) {
            let spaceTop = thk + (mod.type === "wardrobe" ? 300 : 40);
            let spaceBottom = mod.drawersCount > 0 ? (totalHeight - kickHeight - thk - (mod.drawersCount * 160)) : (totalHeight - kickHeight - thk);
            let availableH = spaceBottom - spaceTop;
            let interval = availableH / (mod.shelvesCount + 1);

            for (let s = 1; s <= mod.shelvesCount; s++) {
                create3DBlock(modLeftScaled, (spaceTop + (interval * s)) * scale, thkScaled, modInnerWScaled, thkScaled, dScaled - thkScaled, carcassColorClass);
            }
        }

        // Doors Layout Logic
        if (mod.doorsCount > 0) {
            const doorGap = 2;
            const doorWidth = (mod.doorsCount === 2) ? ((mod.width - thk) / 2) - (doorGap * 1.5) : (mod.width - thk) - (doorGap * 2);
            let spaceTop = thk + (handleStyle === "gola" ? 45 : 0);
            if (handleStyle === "gola" && spaceTop > thk) {
                create3DBlock(modLeftScaled, thkScaled, (totalDepth - 30) * scale, modInnerWScaled, 40 * scale, 20 * scale, "color-folkstone-grey");
            }

            for (let d = 0; d < mod.doorsCount; d++) {
                const doorX = (mod.doorsCount === 2) ? currentX + (d * (doorWidth + doorGap)) + doorGap : currentX + doorGap;
                let frontHTML = doorStyle === "shaker" ? `<div style="border: 12px solid rgba(0,0,0,0.06); width: 100%; height: 100%; box-sizing: border-box; box-shadow: inset 0 2px 8px rgba(0,0,0,0.12);"></div>` : '';

                if (handleStyle.startsWith("bar-")) {
                    const hColor = handleStyle.includes("black") ? "#111" : "#d1d5db";
                    frontHTML += `<div style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%); width: 8px; height: 160px; background: ${hColor}; border-radius: 2px;"></div>`;
                }

                create3DBlock(doorX * scale, spaceTop * scale, dScaled + 1, doorWidth * scale, (mod.doorHeight) * scale, thkScaled, faceColorClass, '#111', frontHTML);
            }
        }

        currentX += mod.width - thk;
    });

    generateCutlist(totalHeight, totalDepth, thk, kickHeight, backThk, carcassMat, faceMat, backMat, activeModules);
}

function generateCutlist(H, D, T, K, BT, carcassMat, faceMat, backMat, activeModules) {
    const listOutput = document.getElementById("lists-output");
    if (!listOutput) return; listOutput.innerHTML = "";
    let totalWidth = activeModules.reduce((sum, m) => sum + m.width, 0);

    const carcassParts = [
        { name: "End Gable (Left)", qty: 1, len: H - K - T, wid: D, mat: carcassMat },
        { name: "End Gable (Right)", qty: 1, len: H - K - T, wid: D, mat: carcassMat },
        { name: "Top Deck Plate", qty: 1, len: totalWidth - (T * 2), wid: D, mat: carcassMat },
        { name: "Bottom Base Plate", qty: 1, len: totalWidth - (T * 2), wid: D, mat: carcassMat },
        { name: "Kickplate", qty: 1, len: totalWidth - (T * 2), wid: K, mat: carcassMat }
    ];

    if (activeModules.length > 1) {
        carcassParts.push({ name: "Internal Divider", qty: activeModules.length - 1, len: H - K - (T * 2), wid: D, mat: carcassMat });
    }

    activeModules.forEach((mod, idx) => {
        if (mod.shelvesCount > 0) {
            carcassParts.push({ name: `Unit ${idx + 1} Shelves`, qty: mod.shelvesCount, len: mod.width - T, wid: D - 20, mat: carcassMat });
        }
    });

    const faceParts = [];
    activeModules.forEach((mod, idx) => {
        if (mod.doorsCount > 0) {
            const doorW = (mod.doorsCount === 2) ? ((mod.width - T) / 2) - 4 : (mod.width - T) - 4;
            faceParts.push({ name: `Unit ${idx + 1} Door Facings`, qty: mod.doorsCount, len: mod.doorHeight, wid: doorW, mat: faceMat });
        }
        if (mod.drawersCount > 0 && mod.drawerType === "external") {
            faceParts.push({ name: `Unit ${idx + 1} Drawer Fronts`, qty: mod.drawersCount, len: 156, wid: mod.width - T - 4, mat: faceMat });
        }
    });

    const backParts = [{ name: "Backing Board", qty: 1, len: H - K - T - 4, wid: totalWidth - (T * 2) - 4, mat: backMat }];

    function renderTable(title, parts) {
        let html = `<div class="material-group-title"><span>${title}</span><span>Dimensions in mm</span></div><table><thead><tr><th>Part Description</th><th>Qty</th><th>Length (mm)</th><th>Width (mm)</th><th>Material Specs</th></tr></thead><tbody>`;
        parts.forEach(p => { html += `<tr><td><strong>${p.name}</strong></td><td>${p.qty}</td><td>${p.len}</td><td>${p.wid}</td><td>${p.mat}</td></tr>`; });
        return html + `</tbody></table>`;
    }

    listOutput.innerHTML += renderTable("CARCASS COMPONENTS", carcassParts);
    if (faceParts.length > 0) listOutput.innerHTML += renderTable("FACINGS & DOORS (MELAWOOD)", faceParts);
    listOutput.innerHTML += renderTable("BACKING PANEL COMPONENTS", backParts);
}
