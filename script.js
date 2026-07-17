let rotX = -15, rotY = -20, isDragging = false, startX, startY;

// Default starter cabinets when page loads
let cabinetModules = [
    { width: 1000, type: "hanging", shelves: 1, drawers: 2, doors: "2-door" },
    { width: 800, type: "shelving", shelves: 4, drawers: 0, doors: "open" },
    { width: 300, type: "shelving", shelves: 5, drawers: 0, doors: "1-door" }
];

// Linking Wood Names to Visual Colors
const colorClassMap = {
    "White Melamine Peen": "color-iceberg-white",
    "Iceberg White": "color-iceberg-white",
    "Folkstone Grey": "color-folkstone-grey",
    "Storm Grey": "color-storm-grey",
    "Super Black": "color-super-black",
    "Kara Blu": "color-kara-blu",
    "Petrol Blue": "color-petrol-blue",
    "Congo": "color-congo",
    "Cappuccino": "color-cappuccino",
    "Storm Grey Face": "color-storm-grey",
    "Super Black Face": "color-super-black",
    "White Melamine Back": "color-iceberg-white",
    "Solid Board Back": "color-iceberg-white",
    "Masonite Back": "color-masonite"
};

// Generates the control inputs for each unit card
function renderModuleInputs() {
    const listContainer = document.getElementById("modules-list");
    listContainer.innerHTML = "";

    cabinetModules.forEach((mod, idx) => {
        const card = document.createElement("div");
        card.className = "module-card";
        card.innerHTML = `
            <div class="module-card-header">
                <span class="module-title">Cabinet Unit #${idx + 1} (${mod.width}mm Width)</span>
                <button class="btn-delete" onclick="deleteModule(${idx})">Delete Unit</button>
            </div>
            <div class="input-grid">
                <div class="input-group">
                    <label>Width (Max 1000mm)</label>
                    <input type="number" value="${mod.width}" max="1000" oninput="updateModuleProperty(${idx}, 'width', this.value)">
                </div>
                <div class="input-grid-sub" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; grid-column: span 2;">
                    <div class="input-group">
                        <label>Internal Layout</label>
                        <select onchange="updateModuleProperty(${idx}, 'type', this.value)">
                            <option value="shelving" ${mod.type === 'shelving' ? 'selected' : ''}>Shelving Unit</option>
                            <option value="hanging" ${mod.type === 'hanging' ? 'selected' : ''}>Hanging Unit</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Shelves Qty</label>
                        <input type="number" min="0" value="${mod.shelves}" oninput="updateModuleProperty(${idx}, 'shelves', this.value)">
                    </div>
                </div>
            </div>
            <div class="input-grid" style="margin-top: 10px;">
                <div class="input-group">
                    <label>Drawers Qty</label>
                    <input type="number" min="0" value="${mod.drawers}" oninput="updateModuleProperty(${idx}, 'drawers', this.value)">
                </div>
                <div class="input-group" style="grid-column: span 2;">
                    <label>Door Layout</label>
                    <select onchange="updateModuleProperty(${idx}, 'doors', this.value)">
                        <option value="open" ${mod.doors === 'open' ? 'selected' : ''}>Open style (No doors)</option>
                        <option value="1-door" ${mod.doors === '1-door' ? 'selected' : ''}>1 Door</option>
                        <option value="2-door" ${mod.doors === '2-door' ? 'selected' : ''}>2 Doors</option>
                    </select>
                </div>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function addNewModule() {
    cabinetModules.push({ width: 600, type: "shelving", shelves: 3, drawers: 0, doors: "open" });
    renderModuleInputs();
    calculateCabinetSetup();
}

function deleteModule(idx) {
    cabinetModules.splice(idx, 1);
    renderModuleInputs();
    calculateCabinetSetup();
}

function updateModuleProperty(idx, prop, value) {
    if (prop === 'width') {
        let w = parseFloat(value);
        if (w > 1000) {
            w = 1000;
            document.getElementById("modular-warning").style.display = "block";
        } else {
            document.getElementById("modular-warning").style.display = "none";
        }
        cabinetModules[idx].width = w || 0;
    } else if (prop === 'shelves' || prop === 'drawers') {
        cabinetModules[idx][prop] = parseInt(value) || 0;
    } else {
        cabinetModules[idx][prop] = value;
    }
    calculateCabinetSetup();
}

// Automatically locks or changes backing board thickness box based on selection
function syncBackingThickness() {
    const selector = document.getElementById("backMaterial");
    const selectedOption = selector.options[selector.selectedIndex];
    const thickness = selectedOption.getAttribute("data-thick");
    const backThickInput = document.getElementById("backThickness");
    
    if (thickness === "custom") {
        backThickInput.removeAttribute("readonly");
        backThickInput.style.backgroundColor = "#fff";
        backThickInput.style.color = "#111";
        backThickInput.focus();
    } else {
        backThickInput.setAttribute("readonly", "true");
        backThickInput.style.backgroundColor = "#f1f5f9";
        backThickInput.style.color = "#64748b";
        backThickInput.value = thickness;
    }
    calculateCabinetSetup();
}

// Main logic that computes sizes for each panel
function calculateCabinetSetup() {
    const H = parseFloat(document.getElementById("height").value) || 2200;
    const D = parseFloat(document.getElementById("depth").value) || 600;
    const t = parseFloat(document.getElementById("thickness").value) || 16;
    const kickH = parseFloat(document.getElementById("kickHeight").value) || 100;
    const topFascia = parseFloat(document.getElementById("topTrack").value) || 0;
    const backT = parseFloat(document.getElementById("backThickness").value) || 16;
    
    const carcassMat = document.getElementById("carcassMaterial").value;
    const faceMat = document.getElementById("faceMaterial").value;
    const backMat = document.getElementById("backMaterial").value;
    const exposedSides = document.getElementById("exposedSides").value;

    const totalW = cabinetModules.reduce((sum, mod) => sum + (mod.width || 0), 0);
    document.getElementById("viewport-badge").innerText = `${cabinetModules.length} Units | Total Width: ${totalW.toFixed(0)}mm`;

    const numModules = cabinetModules.length;
    
    // Internal Height: Space between Top Deck and Bottom Floor
    const internalH = H - kickH - topFascia - (2 * t);
    const parts = [];

    // Left and Right outer side panels
    parts.push({ name: "Outer Side Panels (Visible Ends)", qty: (exposedSides === "both" ? 2 : (exposedSides === "none" ? 0 : 1)), length: H - topFascia, width: D, type: "internal" });
    // Inside dividers between units
    parts.push({ name: "Inside Cabinet Division Panels", qty: Math.max(0, (numModules * 2) - (exposedSides === "both" ? 2 : (exposedSides === "none" ? 0 : 1))), length: H - topFascia, width: D, type: "internal" });

    // Loop through and calculate every unit's separate panels
    cabinetModules.forEach((mod, idx) => {
        const modId = `[Unit ${idx + 1}: ${mod.width.toFixed(0)}mm]`;
        const modW = mod.width;
        const internalW = modW - (2 * t); // Width of shelves and inner pieces
        
        // Horizontal Decks
        parts.push({ name: `${modId} Top Deck Board`, qty: 1, length: internalW, width: D - backT, type: "internal" });
        parts.push({ name: `${modId} Bottom Floor Board`, qty: 1, length: internalW, width: D - backT, type: "internal" });
        parts.push({ name: `${modId} Kickboard Support Rails`, qty: 2, length: internalW, width: kickH, type: "internal" });
        
        // BACKING BOARD (The Big Board) - Calculated exactly matching internal shelf width!
        parts.push({ name: `${modId} Inset Backing Board (Fits Inside)`, qty: 1, length: internalH, width: internalW, type: "backing" });

        // Internal Shelving / Hanging layouts
        if (mod.type === "shelving" && mod.shelves > 0) {
            parts.push({ name: `${modId} Internal Shelves`, qty: mod.shelves, length: internalW, width: D - backT - 30, type: "internal" });
        } else if (mod.type === "hanging") {
            parts.push({ name: `${modId} Top Storage Shelf`, qty: 1, length: internalW, width: D - backT - 30, type: "internal" });
            parts.push({ name: `${modId} Hanging Metal Rail`, qty: 1, length: internalW, width: 25, type: "accessory" });
            
            if (mod.shelves > 0) {
                parts.push({ name: `${modId} Bottom Shelves`, qty: mod.shelves, length: internalW, width: D - backT - 30, type: "internal" });
            }
        }

        // Drawer parts
        if (mod.drawers > 0) {
            const drawerH = 200; 
            parts.push({ name: `${modId} Drawer Front Face Panel`, qty: mod.drawers, length: internalW - 4, width: drawerH - 2, type: "external" });
            parts.push({ name: `${modId} Drawer Box Left/Right Sides`, qty: mod.drawers * 2, length: D - 50, width: drawerH - 50, type: "internal" });
            parts.push({ name: `${modId} Drawer Box Front/Back Rails`, qty: mod.drawers * 2, length: internalW - (2 * t) - 30, width: drawerH - 50, type: "internal" });
        }

        // Doors
        if (mod.doors !== "open") {
            let doorsPerMod = parseInt(mod.doors.split("-")[0]);
            let doorW = (modW / doorsPerMod) - 4;
            parts.push({ name: `${modId} Front Door Panel`, qty: doorsPerMod, length: H - kickH - topFascia - 4, width: doorW, type: "external" });
        }
    });

    const listContainer = document.getElementById("lists-output");
    listContainer.innerHTML = "";

    const mergedParts = mergeDuplicateParts(parts);

    listContainer.innerHTML += createTableHtml("Cabinet Box Pieces (Carcass)", carcassMat, mergedParts.filter(p => p.type === "internal"));
    listContainer.innerHTML += createTableHtml("Visible Doors & Drawer Fronts", faceMat, mergedParts.filter(p => p.type === "external"));
    listContainer.innerHTML += createTableHtml("Inset Backing Boards (The Big Boards)", backMat, mergedParts.filter(p => p.type === "backing"));
    listContainer.innerHTML += createTableHtml("Hanging Rails & Accessories", "Metal Pieces", mergedParts.filter(p => p.type === "accessory"));

    renderThreeDView(totalW, H, D, t, kickH, topFascia, carcassMat, faceMat, backMat, backT);
}

function mergeDuplicateParts(partsArray) {
    const registry = {};
    partsArray.forEach(p => {
        const key = `${p.name}_${p.length.toFixed(1)}_${p.width.toFixed(1)}_${p.type}`;
        if (registry[key]) {
            registry[key].qty += p.qty;
        } else {
            registry[key] = { ...p };
        }
    });
    return Object.values(registry);
}

// Clean rendering fix for 3D Viewport panels - Perfectly Aligned!
function renderThreeDView(W, H, D, t, kickH, topFascia, carcassMat, faceMat, backMat, backT) {
    const stage = document.getElementById("stage");
    stage.innerHTML = "";
    
    if (W <= 0) return;

    const viewportSize = 450;
    const scale = Math.min(viewportSize / H, viewportSize / W);

    stage.style.width = (W * scale) + "px";
    stage.style.height = (H * scale) + "px";

    const sH = H * scale, sD = D * scale, st = t * scale;
    const sKick = kickH * scale, sFascia = topFascia * scale;
    const sBackT = backT * scale;

    let currentX = 0;

    cabinetModules.forEach((mod) => {
        let sModW = mod.width * scale;
        let xPos = currentX;

        // 1. LEFT SIDE PANEL: Starts flush at back (Z = 0) and runs all the way to front (Z = Depth)
        buildBox(stage, xPos, sFascia, 0, st, sH - sFascia, sD, "internal", carcassMat, faceMat);
        
        // 2. RIGHT SIDE PANEL: Starts flush at back (Z = 0) and runs to front (Z = Depth)
        buildBox(stage, xPos + sModW - st, sFascia, 0, st, sH - sFascia, sD, "internal", carcassMat, faceMat);
        
        // 3. BACKING BOARD (The Big Board): Sits tight flush at the back (Z = 0) and is exactly its thickness deep (Z = Backing Thickness)
        buildBox(stage, xPos + st, sFascia + st, 0, sModW - (2 * st), sH - sKick - sFascia - (2 * st), sBackT, "backing", carcassMat, faceMat, backMat);
        
        // 4. TOP DECK: Starts in front of backing board (Z = Backing Thickness) and runs to front (Z = Depth)
        buildBox(stage, xPos + st, sFascia, sBackT, sModW - (2 * st), st, sD - sBackT, "internal", carcassMat, faceMat);
        
        // 5. BOTTOM FLOOR: Starts in front of backing board (Z = Backing Thickness) and runs to front (Z = Depth)
        buildBox(stage, xPos + st, sH - sKick - st, sBackT, sModW - (2 * st), st, sD - sBackT, "internal", carcassMat, faceMat);
        
        // 6. KICKBOARD (Plinth cover panel): Sits flush near the front edge of the cabinet
        buildBox(stage, xPos + st, sH - sKick, sD - (20 * scale), sModW - (2 * st), sKick, 4 * scale, "internal", carcassMat, faceMat);

        const sInnerW = sModW - (2 * st);
        const carcassInnerH = sH - sKick - sFascia - (2 * st);

        // 7. INTERNAL SHELVES: Sits in front of backing board, leaves 25px room at front so door clears cleanly
        if (mod.type === "shelving" && mod.shelves > 0) {
            const shelfGap = carcassInnerH / (mod.shelves + 1);
            for (let s = 1; s <= mod.shelves; s++) {
                let shelfY = sFascia + st + (s * shelfGap) - (st / 2);
                buildBox(stage, xPos + st, shelfY, sBackT, sInnerW, st, sD - sBackT - (25 * scale), "internal", carcassMat, faceMat);
            }
        } else if (mod.type === "hanging") {
            let topShelfY = sFascia + st + (carcassInnerH * 0.15);
            buildBox(stage, xPos + st, topShelfY, sBackT, sInnerW, st, sD - sBackT - (25 * scale), "internal", carcassMat, faceMat);
            buildRail(stage, xPos + st, topShelfY + st + (15 * scale), sD / 2, sInnerW);

            if (mod.shelves > 0) {
                const remainingH = carcassInnerH - (carcassInnerH * 0.18);
                const shelfGap = remainingH / (mod.shelves + 1);
                for (let s = 1; s <= mod.shelves; s++) {
                    let shelfY = topShelfY + st + (s * shelfGap);
                    buildBox(stage, xPos + st, shelfY, sBackT, sInnerW, st, sD - sBackT - (25 * scale), "internal", carcassMat, faceMat);
                }
            }
        }

        // 8. DRAWER FRONTS: Sit right flush on the front of the cabinet (Z = Depth)
        if (mod.drawers > 0) {
            const dH = 200 * scale;
            for (let d = 0; d < mod.drawers; d++) {
                let dY = (sH - sKick - st) - ((d + 1) * dH);
                if (dY > sFascia + st) {
                    buildBox(stage, xPos + st + 2, dY + 2, sD, sInnerW - 4, dH - 4, 16 * scale, "external", carcassMat, faceMat);
                }
            }
        }

        // 9. DOORS: Sit right flush on front face of side panels (Z = Depth)
        if (mod.doors !== "open") {
            let doorsCount = parseInt(mod.doors.split("-")[0]);
            let sDoorW = (sModW / doorsCount) - 2;
            let sDoorH = sH - sKick - sFascia - 4;
            for (let j = 0; j < doorsCount; j++) {
                buildBox(stage, xPos + (j * (sDoorW + 2)) + 1, sFascia + 2, sD, sDoorW, sDoorH, 16 * scale, "door", carcassMat, faceMat);
            }
        }

        currentX += sModW;
    });
}

// Precise 3D Panel Builder
function buildBox(target, x, y, z, w, h, d, matType, carcassMat, faceMat, backMat) {
    const box = document.createElement("div");
    box.className = "panel-3d";
    box.style.left = x + "px";
    box.style.top = y + "px";

    let faceStyle = "mesh-carcass";
    let activeColorClass = colorClassMap[carcassMat] || "color-iceberg-white";

    if (matType === "external" || matType === "door") {
        faceStyle = "mesh-premium";
        activeColorClass = colorClassMap[faceMat] || "color-kara-blu";
    } else if (matType === "backing") {
        faceStyle = "mesh-carcass";
        activeColorClass = colorClassMap[backMat] || "color-masonite";
    }

    const sidesData = [
        { t: `translate3d(0, 0, ${d}px)`, width: w, height: h },
        { t: `rotateY(180deg)`, width: w, height: h },
        { t: `rotateY(-90deg)`, width: d, height: h, o: "0 0" },
        { t: `rotateY(90deg) translate3d(0, 0, ${-w}px)`, width: d, height: h, o: "100% 0" },
        { t: `rotateX(90deg)`, width: w, height: d, o: "0 0" },
        { t: `rotateX(-90deg) translate3d(0, 0, ${-h}px)`, width: w, height: d, o: "0 100%" }
    ];

    sidesData.forEach(p => {
        const side = document.createElement("div");
        side.className = `${faceStyle} ${activeColorClass}`;
        side.style.position = "absolute";
        side.style.width = p.width + "px";
        side.style.height = p.height + "px";
        side.style.transform = p.t;
        if (p.o) side.style.transformOrigin = p.o;
        box.appendChild(side);
    });

    box.style.transform = `translate3d(0, 0, ${z}px)`;
    target.appendChild(box);
}

function buildRail(target, x, y, z, length) {
    const rail = document.createElement("div");
    rail.className = "panel-3d";
    rail.style.left = x + "px";
    rail.style.top = y + "px";

    const paths = [
        { t: `translate3d(0, 0, ${8}px)`, width: length, height: 8 },
        { t: `rotateX(90deg)`, width: length, height: 8, o: "0 0" }
    ];

    paths.forEach(p => {
        const side = document.createElement("div");
        side.className = "mesh-rail";
        side.style.position = "absolute";
        side.style.width = p.width + "px";
        side.style.height = p.height + "px";
        side.style.transform = p.t;
        if (p.o) side.style.transformOrigin = p.o;
        rail.appendChild(side);
    });

    rail.style.transform = `translate3d(0, 0, ${z}px)`;
    target.appendChild(rail);
}

// Helper function to draw table HTML cleanly
function createTableHtml(title, material, array) {
    if (array.length === 0) return "";
    let html = `<div class="material-group-title"><span>${title}</span><span>${material}</span></div>`;
    html += `<table><thead><tr><th>Part Details</th><th>Qty</th><th>Length (mm)</th><th>Width (mm)</th></tr></thead><tbody>`;
    array.forEach(p => {
        html += `<tr><td><strong>${p.name}</strong></td><td>${p.qty}</td><td>${p.length.toFixed(0)}</td><td>${p.width.toFixed(0)}</td></tr>`;
    });
    html += `</tbody></table>`;
    return html;
}

// Drag & Rotate Viewport Operations
const vp = document.getElementById("canvas-viewport");
const stg = document.getElementById("stage");

vp.addEventListener("mousedown", (e) => { isDragging = true; startX = e.clientX; startY = e.clientY; });
window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX; const dy = e.clientY - startY;
    rotY += dx * 0.4; rotX -= dy * 0.4;
    rotX = Math.max(-45, Math.min(45, rotX));
    stg.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    startX = e.clientX; startY = e.clientY;
});
window.addEventListener("mouseup", () => { isDragging = false; });

// Startup UI commands
renderModuleInputs();
calculateCabinetSetup();