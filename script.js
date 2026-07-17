// Complete Isolated Parameter Architecture
let modules = [
    { 
        id: 1, 
        type: "wardrobe", 
        width: 500, 
        shelvesCount: 1, 
        drawersCount: 3, 
        drawerType: "external", 
        drawerHandle: "bar-black", 
        drawerHandleSize: 160,
        doorsCount: 1, 
        doorStyle: "shaker",
        doorHandle: "bar-black",
        doorHandleSize: 160,
        doorHeight: 1400,
        alumColor: "silver"
    }
];

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotation = { x: -15, y: -20 };

const handleCatalogOptions = `
    <option value="none">Tip-On / Push-to-Open</option>
    <option value="bar-black">Matte Black Pull Bar</option>
    <option value="bar-chrome">Polished Chrome Pull Bar</option>
    <option value="bar-brushed">Brushed Brass Pull Bar</option>
    <option value="cup-antique">Antique Bin Cup Pull</option>
`;

const handleSizeOptions = `
    <option value="96">96mm</option>
    <option value="128">128mm</option>
    <option value="160" selected>160mm</option>
    <option value="192">192mm</option>
    <option value="288">288mm</option>
`;

window.onload = function() {
    setup3DControls();
    const backSelect = document.getElementById("backMaterial");
    if (backSelect) {
        backSelect.innerHTML = `
            <option value="White Melamine Peen" data-thick="16" selected>White Melamine (16mm)</option>
            <option value="Iceberg White" data-thick="9">Iceberg White Melamine (9mm)</option>
            <option value="Standard Masonite" data-thick="3">Standard Masonite (3mm)</option>
            <option value="White Masonite" data-thick="3">White Masonite (3mm)</option>
        `;
    }
    calculateCabinetSetup();
};

function setup3DControls() {
    const viewport = document.getElementById("canvas-viewport");
    const stage = document.getElementById("stage");
    if (!viewport || !stage) return;

    viewport.style.perspective = "1200px";

    const startDrag = (x, y) => { isDragging = true; previousMousePosition = { x, y }; };
    const moveDrag = (x, y) => {
        if (!isDragging) return;
        const deltaMove = { x: x - previousMousePosition.x, y: y - previousMousePosition.y };
        rotation.y += deltaMove.x * 0.4;
        rotation.x -= deltaMove.y * 0.4;
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
    calculateCabinetSetup();
}

function addNewModule() {
    const id = modules.length > 0 ? Math.max(...modules.map(m => m.id)) + 1 : 1;
    modules.push({ 
        id, type: "shelves", width: 500, shelvesCount: 3, drawersCount: 0, 
        drawerType: "internal", drawerHandle: "none", drawerHandleSize: 160, doorsCount: 1, 
        doorStyle: "shaker", doorHandle: "bar-black", doorHandleSize: 160, doorHeight: 2000, alumColor: "silver"
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
        if (["type", "drawerType", "drawerHandle", "doorStyle", "doorHandle", "alumColor"].includes(param)) {
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
                    <label>Drawer Handle Style</label>
                    <select onchange="updateModuleParam(${mod.id}, 'drawerHandle', this.value)">
                        ${handleCatalogOptions}
                    </select>
                </div>
                <div class="input-group">
                    <label>Drawer Handle Size</label>
                    <select onchange="updateModuleParam(${mod.id}, 'drawerHandleSize', this.value)">
                        ${handleSizeOptions}
                    </select>
                </div>
            </div>

            <div class="input-grid">
                <div class="input-group">
                    <label>No. of Doors</label>
                    <select onchange="updateModuleParam(${mod.id}, 'doorsCount', this.value)">
                        <option value="0" ${mod.doorsCount === 0 ? 'selected' : ''}>No Doors</option>
                        <option value="1" ${mod.doorsCount === 1 ? 'selected' : ''}>Single Door</option>
                        <option value="2" ${mod.doorsCount === 2 ? 'selected' : ''}>Double Doors</option>
                    </select>
                </div>
                <div class="input-group" ${mod.doorsCount > 0 ? '' : 'style="display:none;"'}>
                    <label>Custom Door Height (mm)</label>
                    <input type="number" value="${mod.doorHeight}" oninput="updateModuleParam(${mod.id}, 'doorHeight', this.value)">
                </div>
            </div>

            <div class="input-grid" ${mod.doorsCount > 0 ? '' : 'style="display:none;"'}>
                <div class="input-group">
                    <label>Door Facing Profile</label>
                    <select onchange="updateModuleParam(${mod.id}, 'doorStyle', this.value)">
                        <option value="shaker" ${mod.doorStyle === 'shaker' ? 'selected' : ''}>Shaker-Style Door</option>
                        <option value="flat" ${mod.doorStyle === 'flat' ? 'selected' : ''}>Standard Flat Face</option>
                        <option value="aluminium-glass" ${mod.doorStyle === 'aluminium-glass' ? 'selected' : ''}>Aluminium Glass Door</option>
                    </select>
                </div>
                <div class="input-group" ${mod.doorStyle === 'aluminium-glass' ? '' : 'style="display:none;"'}>
                    <label>Aluminium Frame Color</label>
                    <select onchange="updateModuleParam(${mod.id}, 'alumColor', this.value)">
                        <option value="silver" ${mod.alumColor === 'silver' ? 'selected' : ''}>Natural Anodized Silver</option>
                        <option value="black" ${mod.alumColor === 'black' ? 'selected' : ''}>Matt Black</option>
                        <option value="gold" ${mod.alumColor === 'gold' ? 'selected' : ''}>Brushed Gold</option>
                        <option value="champagne" ${mod.alumColor === 'champagne' ? 'selected' : ''}>Champagne / Bronze</option>
                    </select>
                </div>
            </div>

            <div class="input-grid" ${mod.doorsCount > 0 ? '' : 'style="display:none;"'}>
                <div class="input-group">
                    <label>Door Handle Hardware</label>
                    <select onchange="updateModuleParam(${mod.id}, 'doorHandle', this.value)">
                        ${handleCatalogOptions}
                    </select>
                </div>
                <div class="input-group">
                    <label>Door Handle Size</label>
                    <select onchange="updateModuleParam(${mod.id}, 'doorHandleSize', this.value)">
                        ${handleSizeOptions}
                    </select>
                </div>
            </div>
        `;
        listContainer.appendChild(card);

        if (mod.drawersCount > 0) {
            card.querySelector(`[onchange*="drawerHandle"]`).value = mod.drawerHandle;
            card.querySelector(`[onchange*="drawerHandleSize"]`).value = mod.drawerHandleSize;
        }
        if (mod.doorsCount > 0) {
            card.querySelector(`[onchange*="doorHandle"]`).value = mod.doorHandle;
            card.querySelector(`[onchange*="doorHandleSize"]`).value = mod.doorHandleSize;
        }
    });

    document.getElementById("viewport-badge").innerText = `${modules.length} Unit(s) Loaded`;
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
    const carcassMat = getStr("carcassMaterial", "White Melamine Peen"), faceMat = getStr("faceMaterial", "Super Black"), backMat = getStr("backMaterial", "White Melamine Peen");

    let activeModules = modules.map(m => ({...m, width: m.width || 500}));
    let totalWidth = activeModules.reduce((sum, m) => sum + m.width, 0);
    if (totalWidth === 0) return;

    const scale = 0.18;
    const wScaled = totalWidth * scale, hScaled = totalHeight * scale, dScaled = totalDepth * scale, thkScaled = thk * scale, kickScaled = kickHeight * scale;

    stage.style.width = `${wScaled}px`;
    stage.style.height = `${hScaled}px`;
    stage.style.transformStyle = "preserve-3d";

    // REALISTIC 3D HARDWARE GENERATION ENGINE
    function renderHardwareAsset(parentHTML, styleVal, sizeMm, isVertical = false) {
        if (styleVal === "none") return parentHTML;
        let hardwareHTML = parentHTML;
        let hexColor = "#111111"; 
        if (styleVal.includes("chrome") || styleVal.includes("silver")) hexColor = "#e2e8f0";
        if (styleVal.includes("gold") || styleVal.includes("brushed")) hexColor = "#d4af37";

        const sizeScaled = sizeMm * scale;

        if (styleVal.startsWith("bar-")) {
            if (isVertical) {
                hardwareHTML += `
                    <div style="position: absolute; right: 25px; top: calc(50% - ${sizeScaled/2}px); width: 8px; height: ${sizeScaled}px; transform-style: preserve-3d; transform: translateZ(1px);">
                        <!-- Left Standoff Post -->
                        <div style="position: absolute; top: 10px; left: 2px; width: 4px; height: 4px; background: ${hexColor}; transform: translateZ(10px) rotateX(90deg); transform-origin: top;"></div>
                        <!-- Right Standoff Post -->
                        <div style="position: absolute; bottom: 10px; left: 2px; width: 4px; height: 4px; background: ${hexColor}; transform: translateZ(10px) rotateX(90deg); transform-origin: top;"></div>
                        <!-- Main Front Pull Bar Face -->
                        <div style="position: absolute; top: 0; left: 0; width: 8px; height: 100%; background: ${hexColor}; transform: translateZ(10px); box-shadow: 2px 2px 5px rgba(0,0,0,0.4); border-radius: 2px;"></div>
                    </div>`;
            } else {
                hardwareHTML += `
                    <div style="position: absolute; left: calc(50% - ${sizeScaled/2}px); top: calc(50% - 4px); width: ${sizeScaled}px; height: 8px; transform-style: preserve-3d; transform: translateZ(1px);">
                        <!-- Top Standoff Post -->
                        <div style="position: absolute; left: 10px; top: 2px; width: 4px; height: 4px; background: ${hexColor}; transform: translateZ(10px) rotateY(90deg); transform-origin: left;"></div>
                        <!-- Bottom Standoff Post -->
                        <div style="position: absolute; right: 10px; top: 2px; width: 4px; height: 4px; background: ${hexColor}; transform: translateZ(10px) rotateY(90deg); transform-origin: left;"></div>
                        <!-- Main Front Pull Bar Face -->
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 8px; background: ${hexColor}; transform: translateZ(10px); box-shadow: 2px 2px 5px rgba(0,0,0,0.4); border-radius: 2px;"></div>
                    </div>`;
            }
        } else if (styleVal === "cup-antique") {
            hardwareHTML += `<div style="position: absolute; left: calc(50% - 22px); top: calc(50% - 11px); width: 44px; height: 22px; background: #332211; border-radius: 22px 22px 0 0; transform: translateZ(6px); box-shadow: 1px 2px 4px rgba(0,0,0,0.5); border: 1px solid #1a0c02;"></div>`;
        }
        return hardwareHTML;
    }

    function create3DBlock(x, y, z, w, h, d, colorClass, borderHex = '#cbd5e1', contentHTML = '', isBackPanel = false) {
        const block = document.createElement("div");
        block.className = `panel-3d ${colorClass}`;
        block.style.width = `${w}px`; block.style.height = `${h}px`; block.style.position = "absolute";
        block.style.left = `${x}px`; block.style.top = `${y}px`; block.style.transform = `translate3d(0, 0, ${z}px)`;
        block.style.transformStyle = "preserve-3d";

        // CRITICAL DEPTH SORTING REPAIR: Back panel uses localized flat geometry to prevent rear duplication illusions
        const faces = isBackPanel ? [{ t: `translate3d(0,0,1px)`, w, h }] : [
            { t: `translate3d(0,0,${d}px)`, w, h }, { t: `rotateY(180deg)`, w, h },
            { t: `rotateY(-90deg)`, w: d, h, o: 'left' }, { t: `rotateY(90deg) translate3d(0,0,${w}px)`, w: d, h, o: 'left' },
            { t: `rotateX(90deg)`, w, h: d, o: 'top' }, { t: `rotateX(-90deg) translate3d(0,0,${h}px)`, w, h: d, o: 'top' }
        ];

        faces.forEach((f, idx) => {
            const side = document.createElement("div");
            side.style.position = "absolute"; side.style.width = `${f.w}px`; side.style.height = `${f.h}px`; side.style.transform = f.t;
            if (f.o) side.style.transformOrigin = f.o;
            side.style.border = `1px solid ${borderHex}`; side.style.boxSizing = "border-box"; side.style.backgroundColor = "inherit";
            if (idx === 0 && contentHTML) {
                side.innerHTML = contentHTML;
                side.style.transformStyle = "preserve-3d"; 
            }
            block.appendChild(side);
        });
        stage.appendChild(block);
    }

    const carcassColorClass = `color-${carcassMat.toLowerCase().replace(/ /g, "-")}`;
    const faceColorClass = `color-${faceMat.toLowerCase().replace(/ /g, "-")}`;
    const backColorClass = backMat.toLowerCase().includes("masonite") ? 'color-natural-oak' : `color-${backMat.toLowerCase().replace(/ /g, "-")}`;

    const internalHeight = totalHeight - kickHeight - thk;
    
    // Core Outer Box Layout
    create3DBlock(thkScaled, (totalHeight - kickHeight - thk) * scale, 0, wScaled - (thkScaled * 2), thkScaled, dScaled, carcassColorClass);
    create3DBlock(thkScaled, (totalHeight - kickHeight) * scale, thkScaled, wScaled - (thkScaled * 2), kickScaled, thkScaled, carcassColorClass);
    create3DBlock(0, 0, 0, thkScaled, internalHeight * scale, dScaled, carcassColorClass);
    create3DBlock(wScaled - thkScaled, 0, 0, thkScaled, internalHeight * scale, dScaled, carcassColorClass);
    create3DBlock(thkScaled, 0, 0, wScaled - (thkScaled * 2), thkScaled, dScaled, carcassColorClass);
    
    // LOCKED REAR BOUNDARY MAPPING (Stops all ghosting overlaps out the back profile)
    create3DBlock(thkScaled, thkScaled, 2, wScaled - (thkScaled * 2), (internalHeight - thk) * scale, 1, backColorClass, '#a3a3a3', '', true);

    let currentX = thk;
    activeModules.forEach((mod, index) => {
        const modInnerWScaled = (mod.width - thk) * scale;
        const modLeftScaled = currentX * scale;

        if (index < activeModules.length - 1) {
            create3DBlock((currentX + mod.width - thk) * scale, thkScaled, 0, thkScaled, (internalHeight - thk) * scale, dScaled, carcassColorClass);
        }

        if (mod.type === "wardrobe") {
            create3DBlock((currentX + 4) * scale, (thk + 60) * scale, (totalDepth / 2) * scale, (mod.width - thk - 8) * scale, 15 * scale, 15 * scale, "color-folkstone-grey", "#666");
        }

        // Drawers Box Block Implementation
        let structuralFloorY = totalHeight - kickHeight - thk;
        if (mod.drawersCount > 0) {
            const drawerUnitHeight = 160;
            for (let i = 0; i < mod.drawersCount; i++) {
                const curDrawerY = structuralFloorY - ((i + 1) * drawerUnitHeight);
                
                if (mod.drawerType === "external") {
                    let frontHTML = `<div style="width: 100%; height: 100%; ${mod.doorStyle === 'shaker' ? 'border: 4px solid rgba(0,0,0,0.12);' : 'border: 1px solid rgba(0,0,0,0.05);'} box-sizing: border-box; transform-style: preserve-3d;"></div>`;
                    frontHTML = renderHardwareAsset(frontHTML, mod.drawerHandle, mod.drawerHandleSize, false);
                    create3DBlock((currentX + 2) * scale, curDrawerY * scale, dScaled, (mod.width - thk - 4) * scale, (drawerUnitHeight - 4) * scale, thkScaled, faceColorClass, '#111', frontHTML);
                } else {
                    create3DBlock((currentX + 15) * scale, (curDrawerY + 20) * scale, (thk * 2) * scale, (mod.width - thk - 30) * scale, 100 * scale, (totalDepth - thk - 50) * scale, "color-folkstone-grey");
                }
            }
        }

        // Internal Shelving
        if (mod.shelvesCount > 0) {
            let spaceTop = thk + (mod.type === "wardrobe" ? 300 : 40);
            let spaceBottom = mod.drawersCount > 0 ? (totalHeight - kickHeight - thk - (mod.drawersCount * 160)) : (totalHeight - kickHeight - thk);
            let availableH = spaceBottom - spaceTop;
            let interval = availableH / (mod.shelvesCount + 1);

            for (let s = 1; s <= mod.shelvesCount; s++) {
                create3DBlock(modLeftScaled, (spaceTop + (interval * s)) * scale, thkScaled, modInnerWScaled, thkScaled, dScaled - thkScaled, carcassColorClass);
            }
        }

        // Doors Loop with Colors Selection Integration
        if (mod.doorsCount > 0) {
            const doorGap = 2;
            const doorWidth = (mod.doorsCount === 2) ? ((mod.width - thk) / 2) - (doorGap * 1.5) : (mod.width - thk) - (doorGap * 2);
            let spaceTop = thk;

            for (let d = 0; d < mod.doorsCount; d++) {
                const doorX = (mod.doorsCount === 2) ? currentX + (d * (doorWidth + doorGap)) + doorGap : currentX + doorGap;
                let frontHTML = '';

                if (mod.doorStyle === "shaker") {
                    frontHTML = `<div style="border: 12px solid rgba(0,0,0,0.06); width: 100%; height: 100%; box-sizing: border-box; box-shadow: inset 0 2px 8px rgba(0,0,0,0.12); transform-style: preserve-3d;"></div>`;
                } else if (mod.doorStyle === "aluminium-glass") {
                    let frameHex = "#4a5568"; // Default Natural Silver Anodized
                    if (mod.alumColor === "black") frameHex = "#1a1a1a";
                    if (mod.alumColor === "gold") frameHex = "#c5a059";
                    if (mod.alumColor === "champagne") frameHex = "#8c7662";

                    frontHTML = `<div style="border: 14px solid ${frameHex}; width: 100%; height: 100%; box-sizing: border-box; background: rgba(160, 210, 230, 0.22); backdrop-filter: blur(0.5px); box-shadow: inset 0 0 12px rgba(0,0,0,0.25); transform-style: preserve-3d;"></div>`;
                } else {
                    frontHTML = `<div style="width: 100%; height: 100%; transform-style: preserve-3d;"></div>`;
                }

                frontHTML = renderHardwareAsset(frontHTML, mod.doorHandle, mod.doorHandleSize, true);
                create3DBlock(doorX * scale, spaceTop * scale, dScaled + 1, doorWidth * scale, mod.doorHeight * scale, thkScaled, (mod.doorStyle === "aluminium-glass" ? "color-iceberg-white" : faceColorClass), '#111', frontHTML);
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
            const styleLabel = mod.doorStyle === "aluminium-glass" ? `Aluminium Frame (${mod.alumColor.toUpperCase()})` : "Standard Face";
            faceParts.push({ name: `Unit ${idx + 1} Door Facings`, qty: mod.doorsCount, len: mod.doorHeight, wid: doorW, mat: mod.doorStyle === "aluminium-glass" ? "Aluminium Profile Extrusions" : faceMat });
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
    if (faceParts.length > 0) listOutput.innerHTML += renderTable("FACINGS & DOORS", faceParts);
    listOutput.innerHTML += renderTable("BACKING PANEL COMPONENTS", backParts);
}
