/**
 * Unified 3D Cabinet Configurator Script Engine
 * Added: Per-Unit Material Overrides
 */

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
        alumColor: "black",
        glassType: "clear",
        carcassOverride: "global",
        faceOverride: "global"
    }
];

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotation = { x: -15, y: -20 };
const scale = 0.18; 

// FULL RESTORED HARDWARE CATALOG
const handleCatalogOptions = `
    <option value="none">Tip-On / Push-to-Open</option>
    <option value="bar-black">Matte Black Pull Bar</option>
    <option value="bar-chrome">Polished Chrome Pull Bar</option>
    <option value="bar-brushed">Brushed Brass Pull Bar</option>
    <option value="cup-antique">Antique Bin Cup Pull</option>
    <option value="knob-modern">Modern Minimalist Knob</option>
    <option value="finger-pull">Integrated J-Pull / Finger Grip</option>
`;

const handleSizeOptions = `
    <option value="96">96mm</option>
    <option value="128">128mm</option>
    <option value="160">160mm</option>
    <option value="192">192mm</option>
    <option value="288">288mm</option>
`;

window.onload = function() {
    setup3DViewportEngine();
    setupEventHandlers();
    renderControlPanelUI();
    calculateCabinetSetup();
};

function setupEventHandlers() {
    document.getElementById("add-unit-btn").addEventListener("click", addNewModule);
    document.getElementById("generate-btn").addEventListener("click", calculateCabinetSetup);
    
    document.getElementById("backMaterial").addEventListener("change", function() {
        const selectedOpt = this.options[this.selectedIndex];
        const defaultThick = selectedOpt.getAttribute("data-thick");
        if(defaultThick) {
            document.getElementById("backThickness").value = defaultThick;
        }
    });
}

function setup3DViewportEngine() {
    const viewport = document.getElementById("canvas-viewport");
    const stage = document.getElementById("stage");
    if (!viewport || !stage) return;

    viewport.style.perspective = "1500px";

    const startRotation = (x, y) => { isDragging = true; previousMousePosition = { x, y }; };
    const processRotation = (x, y) => {
        if (!isDragging) return;
        const delta = { x: x - previousMousePosition.x, y: y - previousMousePosition.y };
        rotation.y += delta.x * 0.4;
        rotation.x -= delta.y * 0.4;
        rotation.x = Math.max(-60, Math.min(60, rotation.x));
        stage.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
        previousMousePosition = { x, y };
    };

    viewport.addEventListener("mousedown", (e) => startRotation(e.clientX, e.clientY));
    window.addEventListener("mouseup", () => isDragging = false);
    window.addEventListener("mousemove", (e) => processRotation(e.clientX, e.clientY));
    viewport.addEventListener("touchstart", (e) => startRotation(e.touches[0].clientX, e.touches[0].clientY));
    window.addEventListener("touchend", () => isDragging = false);
    window.addEventListener("touchmove", (e) => processRotation(e.touches[0].clientX, e.touches[0].clientY));
}

function addNewModule() {
    const id = modules.length > 0 ? Math.max(...modules.map(m => m.id)) + 1 : 1;
    modules.push({ 
        id, type: "shelves", width: 500, shelvesCount: 3, drawersCount: 0, 
        drawerType: "internal", drawerHandle: "none", drawerHandleSize: 160, doorsCount: 1, 
        doorStyle: "flat", doorHandle: "bar-black", doorHandleSize: 160, doorHeight: 1800, alumColor: "silver", glassType: "clear",
        carcassOverride: "global", faceOverride: "global"
    });
    renderControlPanelUI();
    calculateCabinetSetup();
}

function removeModule(id) {
    modules = modules.filter(m => m.id !== id);
    renderControlPanelUI();
    calculateCabinetSetup();
}

function trackParamInput(id, param, value) {
    const mod = modules.find(m => m.id === id);
    if (mod) {
        // Added carcassOverride and faceOverride to string tracking
        if (["type", "drawerType", "drawerHandle", "doorStyle", "doorHandle", "alumColor", "glassType", "carcassOverride", "faceOverride"].includes(param)) {
            mod[param] = value;
        } else {
            mod[param] = parseInt(value) || 0;
        }
    }
}

function renderControlPanelUI() {
    const listContainer = document.getElementById("modules-list");
    if (!listContainer) return;
    listContainer.innerHTML = "";
    
    modules.forEach((mod, index) => {
        const card = document.createElement("div");
        card.className = "module-card";
        card.innerHTML = `
            <div class="module-card-header">
                <span>Unit Module #${index + 1}</span>
                <button class="btn-delete" onclick="removeModule(${mod.id})">Remove</button>
            </div>
            
            <div class="input-grid">
                <div class="input-group">
                    <label>Width (mm)</label>
                    <input type="number" value="${mod.width || ''}" placeholder="500" oninput="trackParamInput(${mod.id}, 'width', this.value)">
                </div>
                <div class="input-group">
                    <label>Layout Class</label>
                    <select onchange="trackParamInput(${mod.id}, 'type', this.value); renderControlPanelUI();">
                        <option value="shelves" ${mod.type === 'shelves' ? 'selected' : ''}>Shelving Unit</option>
                        <option value="wardrobe" ${mod.type === 'wardrobe' ? 'selected' : ''}>Hanging Wardrobe</option>
                    </select>
                </div>
            </div>

            <!-- UNIT SPECIFIC CARCASS/BOARD OVERRIDE -->
            <div class="input-grid">
                <div class="input-group">
                    <label>Specific Unit Board (Internals/Shelves)</label>
                    <select onchange="trackParamInput(${mod.id}, 'carcassOverride', this.value); renderControlPanelUI();">
                        <option value="global" ${mod.carcassOverride === 'global' ? 'selected' : ''}>-- Match Global Carcass --</option>
                        <option value="White Melamine Peen" ${mod.carcassOverride === 'White Melamine Peen' ? 'selected' : ''}>White Melamine Peen</option>
                        <option value="Folkstone Grey" ${mod.carcassOverride === 'Folkstone Grey' ? 'selected' : ''}>Folkstone Grey</option>
                        <option value="Super Black" ${mod.carcassOverride === 'Super Black' ? 'selected' : ''}>Melawood Super Black</option>
                        <option value="Iceberg White" ${mod.carcassOverride === 'Iceberg White' ? 'selected' : ''}>Melawood Iceberg White</option>
                    </select>
                </div>
            </div>

            <div class="input-grid">
                <div class="input-group">
                    <label>Shelves</label>
                    <input type="number" value="${mod.shelvesCount}" oninput="trackParamInput(${mod.id}, 'shelvesCount', this.value)">
                </div>
                <div class="input-group">
                    <label>Drawers</label>
                    <input type="number" value="${mod.drawersCount}" oninput="trackParamInput(${mod.id}, 'drawersCount', this.value); renderControlPanelUI();">
                </div>
            </div>

            <div class="input-grid" ${mod.drawersCount > 0 ? '' : 'style="display:none;"'}>
                <div class="input-group">
                    <label>Drawer Pull Hardware</label>
                    <select class="sel-drh" onchange="trackParamInput(${mod.id}, 'drawerHandle', this.value)">
                        ${handleCatalogOptions}
                    </select>
                </div>
                <div class="input-group">
                    <label>Size Range</label>
                    <select class="sel-drs" onchange="trackParamInput(${mod.id}, 'drawerHandleSize', this.value)">
                        ${handleSizeOptions}
                    </select>
                </div>
            </div>

            <div class="input-grid">
                <div class="input-group">
                    <label>Doors</label>
                    <select onchange="trackParamInput(${mod.id}, 'doorsCount', this.value); renderControlPanelUI();">
                        <option value="0" ${mod.doorsCount === 0 ? 'selected' : ''}>No Doors</option>
                        <option value="1" ${mod.doorsCount === 1 ? 'selected' : ''}>1 Door</option>
                        <option value="2" ${mod.doorsCount === 2 ? 'selected' : ''}>2 Doors</option>
                    </select>
                </div>
                <div class="input-group" ${mod.doorsCount > 0 ? '' : 'style="display:none;"'}>
                    <label>Door Height (mm)</label>
                    <input type="number" value="${mod.doorHeight}" oninput="trackParamInput(${mod.id}, 'doorHeight', this.value)">
                </div>
            </div>

            <div class="input-grid" ${mod.doorsCount > 0 ? '' : 'style="display:none;"'}>
                <div class="input-group">
                    <label>Profile Facing</label>
                    <select class="sel-ds" onchange="trackParamInput(${mod.id}, 'doorStyle', this.value); renderControlPanelUI();">
                        <option value="flat" ${mod.doorStyle === 'flat' ? 'selected' : ''}>Standard Flat Face</option>
                        <option value="shaker" ${mod.doorStyle === 'shaker' ? 'selected' : ''}>Shaker-Style Door</option>
                        <option value="aluminium-glass" ${mod.doorStyle === 'aluminium-glass' ? 'selected' : ''}>Aluminium Framed Glass</option>
                    </select>
                </div>
                <div class="input-group" ${mod.doorStyle === 'aluminium-glass' ? '' : 'style="display:none;"'}>
                    <label>Aluminium Finish</label>
                    <select class="sel-ac" onchange="trackParamInput(${mod.id}, 'alumColor', this.value)">
                        <option value="silver" ${mod.alumColor === 'silver' ? 'selected' : ''}>Anodized Silver</option>
                        <option value="black" ${mod.alumColor === 'black' ? 'selected' : ''}>Matt Black</option>
                        <option value="gold" ${mod.alumColor === 'gold' ? 'selected' : ''}>Brushed Gold</option>
                    </select>
                </div>
            </div>

            <!-- UNIT SPECIFIC DOOR/DRAWER OVERRIDE -->
            <div class="input-grid" ${(mod.doorsCount > 0 || mod.drawersCount > 0) && mod.doorStyle !== 'aluminium-glass' ? '' : 'style="display:none;"'}>
                <div class="input-group">
                    <label>Specific Door/Drawer Material</label>
                    <select onchange="trackParamInput(${mod.id}, 'faceOverride', this.value); renderControlPanelUI();">
                        <option value="global" ${mod.faceOverride === 'global' ? 'selected' : ''}>-- Match Global Facings --</option>
                        <option value="Super Black" ${mod.faceOverride === 'Super Black' ? 'selected' : ''}>Melawood Super Black</option>
                        <option value="Iceberg White" ${mod.faceOverride === 'Iceberg White' ? 'selected' : ''}>Melawood Iceberg White</option>
                        <option value="White Melamine Peen" ${mod.faceOverride === 'White Melamine Peen' ? 'selected' : ''}>White Melamine Peen</option>
                        <option value="Folkstone Grey" ${mod.faceOverride === 'Folkstone Grey' ? 'selected' : ''}>Folkstone Grey</option>
                    </select>
                </div>
            </div>

            <!-- GLASS SELECTION ENTRY VIEWPORT SYSTEM -->
            <div class="input-grid" ${mod.doorsCount > 0 && mod.doorStyle === 'aluminium-glass' ? '' : 'style="display:none;"'}>
                <div class="input-group" style="flex: 1;">
                    <label>Glass Surface Type</label>
                    <select class="sel-gt" onchange="trackParamInput(${mod.id}, 'glassType', this.value)">
                        <option value="clear">Clear Transparent Glass</option>
                        <option value="bronze">Tinted Bronze Glass</option>
                        <option value="black">Tinted Dark Black Glass</option>
                        <option value="frosted">Frosted Opaque Glass</option>
                    </select>
                </div>
            </div>

            <div class="input-grid" ${mod.doorsCount > 0 ? '' : 'style="display:none;"'}>
                <div class="input-group">
                    <label>Door Hardware Pull</label>
                    <select class="sel-dh" onchange="trackParamInput(${mod.id}, 'doorHandle', this.value)">
                        ${handleCatalogOptions}
                    </select>
                </div>
                <div class="input-group">
                    <label>Size Range</label>
                    <select class="sel-dsz" onchange="trackParamInput(${mod.id}, 'doorHandleSize', this.value)">
                        ${handleSizeOptions}
                    </select>
                </div>
            </div>
        `;
        listContainer.appendChild(card);

        if (mod.drawersCount > 0) {
            card.querySelector(".sel-drh").value = mod.drawerHandle;
            card.querySelector(".sel-drs").value = mod.drawerHandleSize;
        }
        if (mod.doorsCount > 0) {
            card.querySelector(".sel-dh").value = mod.doorHandle;
            card.querySelector(".sel-dsz").value = mod.doorHandleSize;
            if (mod.doorStyle === 'aluminium-glass') {
                card.querySelector(".sel-gt").value = mod.glassType || "clear";
            }
        }
    });

    document.getElementById("viewport-badge").innerText = `${modules.length} Unit(s) Active`;
}

function calculateCabinetSetup() {
    const stage = document.getElementById("stage");
    if (!stage) return;
    stage.innerHTML = "";

    const getVal = (id, fallback) => { const el = document.getElementById(id); return el ? (parseInt(el.value) || fallback) : fallback; };
    const getStr = (id, fallback) => { const el = document.getElementById(id); return el ? el.value : fallback; };

    const totalHeight = getVal("height", 2000), totalDepth = getVal("depth", 600), thk = getVal("thickness", 16);
    const kickHeight = getVal("kickHeight", 100), backThk = getVal("backThickness", 16);
    const carcassMat = getStr("carcassMaterial", "White Melamine Peen"), faceMat = getStr("faceMaterial", "Super Black"), backMat = getStr("backMaterial", "White Melamine Peen");
    const exposedSides = getStr("exposedPanels", "none");
    const exposedSidesMat = getStr("exposedSidesMaterial", "Super Black");
    const plinthMaterialType = getStr("plinthMaterial", "matching");

    let activeModules = modules.map(m => ({...m, width: m.width || 500}));
    let totalWidth = activeModules.reduce((sum, m) => sum + m.width, 0);
    if (totalWidth === 0) return;

    const wScaled = totalWidth * scale, hScaled = totalHeight * scale, dScaled = totalDepth * scale, thkScaled = thk * scale, kickScaled = kickHeight * scale;
    const backThkScaled = backThk * scale;

    stage.style.width = `${wScaled}px`;
    stage.style.height = `${hScaled}px`;

    function create3DBlock(x, y, z, w, h, d, colorClass, borderHex = '#475569', contentHTML = '') {
        const block = document.createElement("div");
        block.className = `panel-3d color-${colorClass.toLowerCase().replace(/ /g, "-")}`;
        block.style.width = `${w}px`; block.style.height = `${h}px`;
        block.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;

        const faces = [
            { t: `translate3d(0,0,${d}px)`, w, h }, 
            { t: `rotateY(180deg)`, w, h }, 
            { t: `rotateY(-90deg)`, w: d, h, o: 'left' }, 
            { t: `rotateY(90deg) translate3d(0,0,${w}px)`, w: d, h, o: 'left' }, 
            { t: `rotateX(90deg)`, w, h: d, o: 'top' }, 
            { t: `rotateX(-90deg) translate3d(0,0,${h}px)`, w, h: d, o: 'top' } 
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

    function renderHardwareAsset(parentHTML, styleVal, sizeMm, isVertical = false) {
        if (styleVal === "none") return parentHTML;
        let hardwareHTML = parentHTML;
        let hexColor = "#111111"; 
        if (styleVal.includes("chrome")) hexColor = "#e2e8f0";
        if (styleVal.includes("brushed")) hexColor = "#d4af37";

        const sizeScaled = sizeMm * scale;

        if (styleVal.startsWith("bar-")) {
            if (isVertical) {
                hardwareHTML += `
                    <div style="position: absolute; right: 20px; top: calc(50% - ${sizeScaled/2}px); width: 6px; height: ${sizeScaled}px; transform-style: preserve-3d; transform: translateZ(1px);">
                        <div style="position: absolute; top: 6px; left: 1px; width: 4px; height: 10px; background: ${hexColor}; transform: translateZ(10px) rotateX(90deg);"></div>
                        <div style="position: absolute; bottom: 6px; left: 1px; width: 4px; height: 10px; background: ${hexColor}; transform: translateZ(10px) rotateX(90deg);"></div>
                        <div style="position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: ${hexColor}; transform: translateZ(10px); box-shadow: 2px 2px 4px rgba(0,0,0,0.4); border-radius: 2px;"></div>
                    </div>`;
            } else {
                hardwareHTML += `
                    <div style="position: absolute; left: calc(50% - ${sizeScaled/2}px); top: calc(50% - 3px); width: ${sizeScaled}px; height: 6px; transform-style: preserve-3d; transform: translateZ(1px);">
                        <div style="position: absolute; left: 6px; top: 1px; width: 10px; height: 4px; background: ${hexColor}; transform: translateZ(10px) rotateY(90deg);"></div>
                        <div style="position: absolute; right: 6px; top: 1px; width: 10px; height: 4px; background: ${hexColor}; transform: translateZ(10px) rotateY(90deg);"></div>
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 6px; background: ${hexColor}; transform: translateZ(10px); box-shadow: 2px 2px 4px rgba(0,0,0,0.4); border-radius: 2px;"></div>
                    </div>`;
            }
        } else if (styleVal === "cup-antique") {
            hardwareHTML += `<div style="position: absolute; left: calc(50% - 20px); top: calc(50% - 10px); width: 40px; height: 20px; background: #332211; border-radius: 20px 20px 0 0; transform: translateZ(6px); box-shadow: 1px 2px 4px rgba(0,0,0,0.5);"></div>`;
        } else if (styleVal === "knob-modern") {
            hardwareHTML += `<div style="position: absolute; right: 22px; top: 50%; width: 10px; height: 10px; background: ${hexColor}; border-radius: 50%; transform: translateZ(12px); box-shadow: 1px 1px 3px rgba(0,0,0,0.4);"></div>`;
        }
        return hardwareHTML;
    }

    const internalHeight = totalHeight - kickHeight - thk;

    create3DBlock(thkScaled, 0, 1, wScaled - (thkScaled * 2), internalHeight * scale, backThkScaled, backMat, '#94a3b8');

    // Main Structural Outer Carcass Frame
    create3DBlock(thkScaled, internalHeight * scale, backThkScaled, wScaled - (thkScaled * 2), thkScaled, dScaled - backThkScaled, carcassMat); 
    create3DBlock(thkScaled, 0, backThkScaled, wScaled - (thkScaled * 2), thkScaled, dScaled - backThkScaled, carcassMat); 
    create3DBlock(0, 0, 0, thkScaled, internalHeight * scale, dScaled, carcassMat); 
    create3DBlock(wScaled - thkScaled, 0, 0, thkScaled, internalHeight * scale, dScaled, carcassMat); 

    if (exposedSides === "left" || exposedSides === "both") {
        create3DBlock(-thkScaled, 0, 0, thkScaled, (internalHeight + thk) * scale, dScaled + 1, exposedSidesMat, '#111');
    }
    if (exposedSides === "right" || exposedSides === "both") {
        create3DBlock(wScaled, 0, 0, thkScaled, (internalHeight + thk) * scale, dScaled + 1, exposedSidesMat, '#111');
    }

    let plinthColor = carcassMat; 
    if (plinthMaterialType === "matching") plinthColor = faceMat; 
    if (plinthMaterialType === "silver-alum") plinthColor = "Folkstone Grey";
    if (plinthMaterialType === "black-alum") plinthColor = "Super Black";
    create3DBlock(0, (totalHeight - kickHeight) * scale, dScaled - thkScaled, wScaled, kickScaled, thkScaled, plinthColor, '#334155');

    let currentX = thk;
    activeModules.forEach((mod, index) => {
        // Resolve Module Specific Overrides Here
        const unitCarcass = (mod.carcassOverride && mod.carcassOverride !== "global") ? mod.carcassOverride : carcassMat;
        const unitFace = (mod.faceOverride && mod.faceOverride !== "global") ? mod.faceOverride : faceMat;

        const modInnerWScaled = (mod.width - thk) * scale;
        const modLeftScaled = currentX * scale;

        if (index < activeModules.length - 1) {
            create3DBlock((currentX + mod.width - thk) * scale, thkScaled, backThkScaled, thkScaled, (internalHeight - thk) * scale, dScaled - backThkScaled, carcassMat);
        }

        if (mod.type === "wardrobe") {
            create3DBlock((currentX + 4) * scale, (thk + 60) * scale, (totalDepth / 2) * scale, (mod.width - thk - 8) * scale, 12 * scale, 12 * scale, "Folkstone Grey", "#64748b");
        }

        let structuralFloorY = totalHeight - kickHeight - thk;
        if (mod.drawersCount > 0) {
            const drawerUnitHeight = 160;
            for (let i = 0; i < mod.drawersCount; i++) {
                const curDrawerY = structuralFloorY - ((i + 1) * drawerUnitHeight);
                if (mod.drawerType === "external") {
                    let frontHTML = `<div style="width: 100%; height: 100%; ${mod.doorStyle === 'shaker' ? 'border: 4px solid rgba(0,0,0,0.1);' : 'border: 1px solid rgba(0,0,0,0.05);'} box-sizing: border-box; transform-style: preserve-3d;"></div>`;
                    frontHTML = renderHardwareAsset(frontHTML, mod.drawerHandle, mod.drawerHandleSize, false);
                    // Renders drawer using specific unitFace
                    create3DBlock((currentX + 2) * scale, curDrawerY * scale, dScaled, (mod.width - thk - 4) * scale, (drawerUnitHeight - 4) * scale, thkScaled, unitFace, '#111', frontHTML);
                }
            }
        }

        if (mod.shelvesCount > 0) {
            let spaceTop = thk + (mod.type === "wardrobe" ? 300 : 40);
            let spaceBottom = mod.drawersCount > 0 ? (totalHeight - kickHeight - thk - (mod.drawersCount * 160)) : (totalHeight - kickHeight - thk);
            let availableH = spaceBottom - spaceTop;
            let interval = availableH / (mod.shelvesCount + 1);

            for (let s = 1; s <= mod.shelvesCount; s++) {
                // Renders shelf using specific unitCarcass
                create3DBlock(modLeftScaled, (spaceTop + (interval * s)) * scale, backThkScaled + thkScaled, modInnerWScaled, thkScaled, dScaled - backThkScaled - thkScaled, unitCarcass);
            }
        }

        if (mod.doorsCount > 0) {
            const doorGap = 2;
            const doorWidth = (mod.doorsCount === 2) ? ((mod.width - thk) / 2) - (doorGap * 1.5) : (mod.width - thk) - (doorGap * 2);
            
            for (let d = 0; d < mod.doorsCount; d++) {
                const doorX = (mod.doorsCount === 2) ? currentX + (d * (doorWidth + doorGap)) + doorGap : currentX + doorGap;
                let frontHTML = '';

                if (mod.doorStyle === "shaker") {
                    frontHTML = `<div style="border: 12px solid rgba(0,0,0,0.05); width: 100%; height: 100%; box-sizing: border-box; transform-style: preserve-3d;"></div>`;
                } else if (mod.doorStyle === "aluminium-glass") {
                    let frameHex = "#64748b"; 
                    if (mod.alumColor === "black") frameHex = "#1e293b";
                    if (mod.alumColor === "gold") frameHex = "#d97706";
                    
                    const glassStyleClass = `glass-${mod.glassType || 'clear'}`;
                    frontHTML = `<div class="${glassStyleClass}" style="border: 12px solid ${frameHex}; width: 100%; height: 100%; box-sizing: border-box; transform-style: preserve-3d;"></div>`;
                } else {
                    frontHTML = `<div style="width: 100%; height: 100%; transform-style: preserve-3d;"></div>`;
                }

                frontHTML = renderHardwareAsset(frontHTML, mod.doorHandle, mod.doorHandleSize, true);
                // Renders door using specific unitFace
                create3DBlock(doorX * scale, thk * scale, dScaled + 0.5, doorWidth * scale, mod.doorHeight * scale, thkScaled, (mod.doorStyle === "aluminium-glass" ? "" : unitFace), '#111', frontHTML);
            }
        }

        currentX += mod.width - thk;
    });

    generateProductionCutlist(totalHeight, totalDepth, thk, kickHeight, backThk, carcassMat, faceMat, backMat, activeModules, exposedSides, plinthMaterialType, exposedSidesMat);
}

function generateProductionCutlist(H, D, T, K, BT, carcassMat, faceMat, backMat, activeModules, exposedSides, plinthMaterialType, exposedSidesMat) {
    const listOutput = document.getElementById("lists-output");
    if (!listOutput) return; listOutput.innerHTML = "";
    let totalWidth = activeModules.reduce((sum, m) => sum + m.width, 0);

    const carcassParts = [
        { name: "End Gable (Left)", qty: 1, len: H - K - T, wid: D, mat: carcassMat },
        { name: "End Gable (Right)", qty: 1, len: H - K - T, wid: D, mat: carcassMat },
        { name: "Top Deck Plate Panel", qty: 1, len: totalWidth - (T * 2), wid: D, mat: carcassMat },
        { name: "Bottom Base Plate Panel", qty: 1, len: totalWidth - (T * 2), wid: D, mat: carcassMat }
    ];

    if (activeModules.length > 1) {
        carcassParts.push({ name: "Internal Multi-Unit Divider", qty: activeModules.length - 1, len: H - K - (T * 2), wid: D, mat: carcassMat });
    }

    activeModules.forEach((mod, idx) => {
        if (mod.shelvesCount > 0) {
            const unitCarcass = (mod.carcassOverride && mod.carcassOverride !== "global") ? mod.carcassOverride : carcassMat;
            carcassParts.push({ name: `Unit ${idx + 1} Shelf Inlays`, qty: mod.shelvesCount, len: mod.width - T, wid: D - 20, mat: unitCarcass });
        }
    });

    if (exposedSides === "left" || exposedSides === "both") {
        carcassParts.push({ name: "Exposed Decorative Side Skin (Left)", qty: 1, len: H - K, wid: D + 2, mat: exposedSidesMat });
    }
    if (exposedSides === "right" || exposedSides === "both") {
        carcassParts.push({ name: "Exposed Decorative Side Skin (Right)", qty: 1, len: H - K, wid: D + 2, mat: exposedSidesMat });
    }

    const faceParts = [];
    activeModules.forEach((mod, idx) => {
        const unitFace = (mod.faceOverride && mod.faceOverride !== "global") ? mod.faceOverride : faceMat;

        if (mod.doorsCount > 0) {
            const doorW = (mod.doorsCount === 2) ? ((mod.width - T) / 2) - 4 : (mod.width - T) - 4;
            const subMatStr = mod.doorStyle === "aluminium-glass" ? `Aluminium Frame (${mod.alumColor.toUpperCase()}) + ${mod.glassType.toUpperCase()} Glass` : unitFace;
            faceParts.push({ name: `Unit ${idx + 1} Front Door Facing`, qty: mod.doorsCount, len: mod.doorHeight, wid: doorW, mat: subMatStr });
        }
        if (mod.drawersCount > 0 && mod.drawerType === "external") {
            faceParts.push({ name: `Unit ${idx + 1} Ext. Drawer Front Face`, qty: mod.drawersCount, len: 156, wid: mod.width - T - 4, mat: unitFace });
        }
    });

    let plinthSpecString = carcassMat;
    if (plinthMaterialType === "matching") plinthSpecString = faceMat;
    if (plinthMaterialType === "silver-alum") plinthSpecString = "Brushed Silver Aluminium Kickplate Extrusion";
    if (plinthMaterialType === "black-alum") plinthSpecString = "Matt Black Aluminium Kickplate Extrusion";
    faceParts.push({ name: "Decorative Continuous Front Base Plinth", qty: 1, len: totalWidth, wid: K, mat: plinthSpecString });

    const backParts = [{ name: "Rear Backing Sheet Panel", qty: 1, len: H - K - T - 4, wid: totalWidth - (T * 2) - 4, mat: backMat }];

    function renderTable(title, parts) {
        let html = `<div class="material-group-title"><span>${title}</span><span>All Metrics in Millimeters</span></div><table><thead><tr><th>Part Description Name</th><th>Qty</th><th>Length (mm)</th><th>Width (mm)</th><th>Material Specification Target</th></tr></thead><tbody>`;
        parts.forEach(p => { html += `<tr><td><strong>${p.name}</strong></td><td>${p.qty}</td><td>${p.len}</td><td>${p.wid}</td><td>${p.mat}</td></tr>`; });
        return html + `</tbody></table>`;
    }

    listOutput.innerHTML += renderTable("CARCASS SHELL PROFILE PIECES", carcassParts);
    if (faceParts.length > 0) listOutput.innerHTML += renderTable("FACINGS, FRONT DOORS & PLINTH COMPONENTS", faceParts);
    listOutput.innerHTML += renderTable("BACKING PANEL BOUNDARY ELEMENTS", backParts);
}
