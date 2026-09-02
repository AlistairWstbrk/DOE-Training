let cameras = [
    { id: 0, img_name: "00001", width: 1959, height: 1090, position: [-3.0089893469241797, -0.11086489695181866, -3.7527640949141428], rotation: [[0.876134201218856, 0.06925962026449776, 0.47706599800804744], [-0.04747421839895102, 0.9972110940209488, -0.057586739349882114], [-0.4797239414934443, 0.027805376500959853, 0.8769787916452908]], fy: 1164.6601287484507, fx: 1159.5880733038064 }
];
let camera = cameras[0];

function getProjectionMatrix(fx, fy, width, height) {
    const znear = 0.2; const zfar = 200;
    return [[(2 * fx) / width, 0, 0, 0], [0, -(2 * fy) / height, 0, 0], [0, 0, zfar / (zfar - znear), 1], [0, 0, -(zfar * znear) / (zfar - znear), 0]].flat();
}

function getViewMatrix(camera) {
    const R = camera.rotation.flat(); const t = camera.position;
    return [[R[0], R[1], R[2], 0], [R[3], R[4], R[5], 0], [R[6], R[7], R[8], 0], [-t[0] * R[0] - t[1] * R[3] - t[2] * R[6], -t[0] * R[1] - t[1] * R[4] - t[2] * R[7], -t[0] * R[2] - t[1] * R[5] - t[2] * R[8], 1]].flat();
}

function multiply4(a, b) {
    return [
        b[0]*a[0]+b[1]*a[4]+b[2]*a[8]+b[3]*a[12], b[0]*a[1]+b[1]*a[5]+b[2]*a[9]+b[3]*a[13], b[0]*a[2]+b[1]*a[6]+b[2]*a[10]+b[3]*a[14], b[0]*a[3]+b[1]*a[7]+b[2]*a[11]+b[3]*a[15],
        b[4]*a[0]+b[5]*a[4]+b[6]*a[8]+b[7]*a[12], b[4]*a[1]+b[5]*a[5]+b[6]*a[9]+b[7]*a[13], b[4]*a[2]+b[5]*a[6]+b[6]*a[10]+b[7]*a[14], b[4]*a[3]+b[5]*a[7]+b[6]*a[11]+b[7]*a[15],
        b[8]*a[0]+b[9]*a[4]+b[10]*a[8]+b[11]*a[12], b[8]*a[1]+b[9]*a[5]+b[10]*a[9]+b[11]*a[13], b[8]*a[2]+b[9]*a[6]+b[10]*a[10]+b[11]*a[14], b[8]*a[3]+b[9]*a[7]+b[10]*a[11]+b[11]*a[15],
        b[12]*a[0]+b[13]*a[4]+b[14]*a[8]+b[15]*a[12], b[12]*a[1]+b[13]*a[5]+b[14]*a[9]+b[15]*a[13], b[12]*a[2]+b[13]*a[6]+b[14]*a[10]+b[15]*a[14], b[12]*a[3]+b[13]*a[7]+b[14]*a[11]+b[15]*a[15],
    ];
}

function invert4(a) {
    let b00=a[0]*a[5]-a[1]*a[4]; let b01=a[0]*a[6]-a[2]*a[4]; let b02=a[0]*a[7]-a[3]*a[4]; let b03=a[1]*a[6]-a[2]*a[5]; let b04=a[1]*a[7]-a[3]*a[5]; let b05=a[2]*a[7]-a[3]*a[6];
    let b06=a[8]*a[13]-a[9]*a[12]; let b07=a[8]*a[14]-a[10]*a[12]; let b08=a[8]*a[15]-a[11]*a[12]; let b09=a[9]*a[14]-a[10]*a[13]; let b10=a[9]*a[15]-a[11]*a[13]; let b11=a[10]*a[15]-a[11]*a[14];
    let det = b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06; if(!det) return null;
    return [
        (a[5]*b11-a[6]*b10+a[7]*b09)/det, (a[2]*b10-a[1]*b11-a[3]*b09)/det, (a[13]*b05-a[14]*b04+a[15]*b03)/det, (a[10]*b04-a[9]*b05-a[11]*b03)/det,
        (a[6]*b08-a[4]*b11-a[7]*b07)/det, (a[0]*b11-a[2]*b08+a[3]*b07)/det, (a[14]*b02-a[12]*b05-a[15]*b01)/det, (a[8]*b05-a[10]*b02+a[11]*b01)/det,
        (a[4]*b10-a[5]*b08+a[7]*b06)/det, (a[1]*b08-a[0]*b10-a[3]*b06)/det, (a[12]*b04-a[13]*b02+a[15]*b00)/det, (a[9]*b02-a[8]*b04-a[11]*b00)/det,
        (a[5]*b07-a[4]*b09-a[6]*b06)/det, (a[0]*b09-a[1]*b07+a[2]*b06)/det, (a[13]*b01-a[12]*b03-a[14]*b00)/det, (a[8]*b03-a[9]*b01+a[10]*b00)/det,
    ];
}

function rotate4(a, rad, x, y, z) {
    let len = Math.hypot(x,y,z); x/=len; y/=len; z/=len;
    let s=Math.sin(rad); let c=Math.cos(rad); let t=1-c;
    let b00=x*x*t+c; let b01=y*x*t+z*s; let b02=z*x*t-y*s; let b10=x*y*t-z*s; let b11=y*y*t+c; let b12=z*y*t+x*s; let b20=x*z*t+y*s; let b21=y*z*t-x*s; let b22=z*z*t+c;
    return [
        a[0]*b00+a[4]*b01+a[8]*b02, a[1]*b00+a[5]*b01+a[9]*b02, a[2]*b00+a[6]*b01+a[10]*b02, a[3]*b00+a[7]*b01+a[11]*b02,
        a[0]*b10+a[4]*b11+a[8]*b12, a[1]*b10+a[5]*b11+a[9]*b12, a[2]*b10+a[6]*b11+a[10]*b12, a[3]*b10+a[7]*b11+a[11]*b12,
        a[0]*b20+a[4]*b21+a[8]*b22, a[1]*b20+a[5]*b21+a[9]*b22, a[2]*b20+a[6]*b21+a[10]*b22, a[3]*b20+a[7]*b21+a[11]*b22,
        ...a.slice(12, 16)
    ];
}

function translate4(a, x, y, z) { return [...a.slice(0,12), a[0]*x+a[4]*y+a[8]*z+a[12], a[1]*x+a[5]*y+a[9]*z+a[13], a[2]*x+a[6]*y+a[10]*z+a[14], a[3]*x+a[7]*y+a[11]*z+a[15]]; }

function multiplyMatrixAndPoint(matrix, point) {
    let x = point[0], y = point[1], z = point[2], w = 1.0;
    return [(x*matrix[0])+(y*matrix[4])+(z*matrix[8])+(w*matrix[12]), (x*matrix[1])+(y*matrix[5])+(z*matrix[9])+(w*matrix[13]), (x*matrix[2])+(y*matrix[6])+(z*matrix[10])+(w*matrix[14]), (x*matrix[3])+(y*matrix[7])+(z*matrix[11])+(w*matrix[15])];
}

function createWorker(self) {
    let buffer; let vertexCount = 0; let viewProj; const rowLength = 3*4+3*4+4+4; let lastProj = []; let depthIndex = new Uint32Array(); let lastVertexCount = 0;
    var _floatView = new Float32Array(1); var _int32View = new Int32Array(_floatView.buffer);
    function floatToHalf(float) {
        _floatView[0] = float; var f = _int32View[0]; var sign = (f >> 31) & 0x0001; var exp = (f >> 23) & 0x00ff; var frac = f & 0x007fffff; var newExp;
        if (exp == 0) newExp = 0; else if (exp < 113) { newExp = 0; frac |= 0x00800000; frac = frac >> (113 - exp); if (frac & 0x01000000) { newExp = 1; frac = 0; } } else if (exp < 142) newExp = exp - 112; else { newExp = 31; frac = 0; }
        return (sign << 15) | (newExp << 10) | (frac >> 13);
    }
    function packHalf2x16(x, y) { return (floatToHalf(x) | (floatToHalf(y) << 16)) >>> 0; }

    function generateTexture() {
        if (!buffer) return; const f_buffer = new Float32Array(buffer); const u_buffer = new Uint8Array(buffer);
        var texwidth = 1024 * 2; var texheight = Math.ceil((2 * vertexCount) / texwidth); var texdata = new Uint32Array(texwidth * texheight * 4); var texdata_c = new Uint8Array(texdata.buffer); var texdata_f = new Float32Array(texdata.buffer);
        for (let i = 0; i < vertexCount; i++) {
            texdata_f[8*i+0] = f_buffer[8*i+0]; texdata_f[8*i+1] = f_buffer[8*i+1]; texdata_f[8*i+2] = f_buffer[8*i+2];
            texdata_c[4*(8*i+7)+0] = u_buffer[32*i+24+0]; texdata_c[4*(8*i+7)+1] = u_buffer[32*i+24+1]; texdata_c[4*(8*i+7)+2] = u_buffer[32*i+24+2]; texdata_c[4*(8*i+7)+3] = u_buffer[32*i+24+3];
            let scale = [f_buffer[8*i+3+0], f_buffer[8*i+3+1], f_buffer[8*i+3+2]]; let rot = [(u_buffer[32*i+28+0]-128)/128, (u_buffer[32*i+28+1]-128)/128, (u_buffer[32*i+28+2]-128)/128, (u_buffer[32*i+28+3]-128)/128];
            const M = [
                1.0-2.0*(rot[2]*rot[2]+rot[3]*rot[3]), 2.0*(rot[1]*rot[2]+rot[0]*rot[3]), 2.0*(rot[1]*rot[3]-rot[0]*rot[2]),
                2.0*(rot[1]*rot[2]-rot[0]*rot[3]), 1.0-2.0*(rot[1]*rot[1]+rot[3]*rot[3]), 2.0*(rot[2]*rot[3]+rot[0]*rot[1]),
                2.0*(rot[1]*rot[3]+rot[0]*rot[2]), 2.0*(rot[2]*rot[3]-rot[0]*rot[1]), 1.0-2.0*(rot[1]*rot[1]+rot[2]*rot[2]),
            ].map((k, i) => k * scale[Math.floor(i / 3)]);
            const sigma = [
                M[0]*M[0]+M[3]*M[3]+M[6]*M[6], M[0]*M[1]+M[3]*M[4]+M[6]*M[7], M[0]*M[2]+M[3]*M[5]+M[6]*M[8],
                M[1]*M[1]+M[4]*M[4]+M[7]*M[7], M[1]*M[2]+M[4]*M[5]+M[7]*M[8], M[2]*M[2]+M[5]*M[5]+M[8]*M[8],
            ];
            texdata[8*i+4] = packHalf2x16(4*sigma[0], 4*sigma[1]); texdata[8*i+5] = packHalf2x16(4*sigma[2], 4*sigma[3]); texdata[8*i+6] = packHalf2x16(4*sigma[4], 4*sigma[5]);
        }
        self.postMessage({ texdata, texwidth, texheight }, [texdata.buffer]);
    }

    function runSort(viewProj) {
        if (!buffer) return; const f_buffer = new Float32Array(buffer);
        if (lastVertexCount == vertexCount) { let dot = lastProj[2]*viewProj[2] + lastProj[6]*viewProj[6] + lastProj[10]*viewProj[10]; if (Math.abs(dot - 1) < 0.01) return; } else { generateTexture(); lastVertexCount = vertexCount; }
        let maxDepth = -Infinity; let minDepth = Infinity; let sizeList = new Int32Array(vertexCount);
        for (let i = 0; i < vertexCount; i++) {
            let depth = ((viewProj[2]*f_buffer[8*i+0] + viewProj[6]*f_buffer[8*i+1] + viewProj[10]*f_buffer[8*i+2]) * 4096) | 0;
            sizeList[i] = depth; if (depth > maxDepth) maxDepth = depth; if (depth < minDepth) minDepth = depth;
        }
        let depthInv = (256 * 256 - 1) / (maxDepth - minDepth); let counts0 = new Uint32Array(256 * 256);
        for (let i = 0; i < vertexCount; i++) { sizeList[i] = ((sizeList[i] - minDepth) * depthInv) | 0; counts0[sizeList[i]]++; }
        let starts0 = new Uint32Array(256 * 256); for (let i = 1; i < 256 * 256; i++) starts0[i] = starts0[i - 1] + counts0[i - 1];
        depthIndex = new Uint32Array(vertexCount); for (let i = 0; i < vertexCount; i++) depthIndex[starts0[sizeList[i]]++] = i;
        lastProj = viewProj; self.postMessage({ depthIndex, viewProj, vertexCount }, [depthIndex.buffer]);
    }

    function processPlyBuffer(inputBuffer) {
        const ubuf = new Uint8Array(inputBuffer); const header = new TextDecoder().decode(ubuf.slice(0, 1024 * 10)); const header_end = "end_header\n"; const header_end_index = header.indexOf(header_end);
        if (header_end_index < 0) throw new Error("Unable to read .ply file header");
        const vertexCount = parseInt(/element vertex (\d+)\n/.exec(header)[1]); let row_offset = 0, offsets = {}, types = {}; const TYPE_MAP = { double: "getFloat64", int: "getInt32", uint: "getUint32", float: "getFloat32", short: "getInt16", ushort: "getUint16", uchar: "getUint8" };
        for (let prop of header.slice(0, header_end_index).split("\n").filter((k) => k.startsWith("property "))) { const [p, type, name] = prop.split(" "); const arrayType = TYPE_MAP[type] || "getInt8"; types[name] = arrayType; offsets[name] = row_offset; row_offset += parseInt(arrayType.replace(/[^\d]/g, "")) / 8; }
        let dataView = new DataView(inputBuffer, header_end_index + header_end.length); let row = 0; const attrs = new Proxy({}, { get(target, prop) { if (!types[prop]) throw new Error(prop + " not found"); return dataView[types[prop]](row * row_offset + offsets[prop], true); } });
        let sizeList = new Float32Array(vertexCount); let sizeIndex = new Uint32Array(vertexCount);
        for (row = 0; row < vertexCount; row++) {
            sizeIndex[row] = row; if (!types["scale_0"]) continue;
            const size = Math.exp(attrs.scale_0) * Math.exp(attrs.scale_1) * Math.exp(attrs.scale_2); const opacity = 1 / (1 + Math.exp(-attrs.opacity)); sizeList[row] = size * opacity;
        }
        sizeIndex.sort((b, a) => sizeList[a] - sizeList[b]); const rowLength = 3 * 4 + 3 * 4 + 4 + 4; const buffer = new ArrayBuffer(rowLength * vertexCount);
        for (let j = 0; j < vertexCount; j++) {
            row = sizeIndex[j];
            const position = new Float32Array(buffer, j * rowLength, 3); const scales = new Float32Array(buffer, j * rowLength + 4 * 3, 3); const rgba = new Uint8ClampedArray(buffer, j * rowLength + 4 * 3 + 4 * 3, 4); const rot = new Uint8ClampedArray(buffer, j * rowLength + 4 * 3 + 4 * 3 + 4, 4);
            if (types["scale_0"]) {
                const qlen = Math.sqrt(attrs.rot_0 ** 2 + attrs.rot_1 ** 2 + attrs.rot_2 ** 2 + attrs.rot_3 ** 2);
                rot[0] = (attrs.rot_0 / qlen) * 128 + 128; rot[1] = (attrs.rot_1 / qlen) * 128 + 128; rot[2] = (attrs.rot_2 / qlen) * 128 + 128; rot[3] = (attrs.rot_3 / qlen) * 128 + 128;
                scales[0] = Math.exp(attrs.scale_0); scales[1] = Math.exp(attrs.scale_1); scales[2] = Math.exp(attrs.scale_2);
            } else { scales[0] = 0.01; scales[1] = 0.01; scales[2] = 0.01; rot[0] = 255; rot[1] = 0; rot[2] = 0; rot[3] = 0; }
            position[0] = attrs.x; position[1] = attrs.y; position[2] = attrs.z;
            if (types["f_dc_0"]) { const SH_C0 = 0.28209479177387814; rgba[0] = (0.5 + SH_C0 * attrs.f_dc_0) * 255; rgba[1] = (0.5 + SH_C0 * attrs.f_dc_1) * 255; rgba[2] = (0.5 + SH_C0 * attrs.f_dc_2) * 255; } else { rgba[0] = attrs.red; rgba[1] = attrs.green; rgba[2] = attrs.blue; }
            if (types["opacity"]) rgba[3] = (1 / (1 + Math.exp(-attrs.opacity))) * 255; else rgba[3] = 255;
        }
        return buffer;
    }
    const throttledSort = () => { if (!sortRunning) { sortRunning = true; let lastView = viewProj; runSort(lastView); setTimeout(() => { sortRunning = false; if (lastView !== viewProj) throttledSort(); }, 0); } };
    let sortRunning;
    self.onmessage = (e) => {
        if (e.data.ply) { vertexCount = 0; runSort(viewProj); buffer = processPlyBuffer(e.data.ply); vertexCount = Math.floor(buffer.byteLength / rowLength); postMessage({ buffer: buffer, save: !!e.data.save }); } 
        else if (e.data.buffer) { buffer = e.data.buffer; vertexCount = e.data.vertexCount; } else if (e.data.vertexCount) { vertexCount = e.data.vertexCount; } else if (e.data.view) { viewProj = e.data.view; throttledSort(); }
    };
}

const vertexShaderSource = `
#version 300 es
precision highp float; precision highp int;
uniform highp usampler2D u_texture; uniform mat4 projection, view; uniform vec2 focal; uniform vec2 viewport;
in vec2 position; in int index; out vec4 vColor; out vec2 vPosition;
void main () {
    uvec4 cen = texelFetch(u_texture, ivec2((uint(index) & 0x3ffu) << 1, uint(index) >> 10), 0);
    vec4 cam = view * vec4(uintBitsToFloat(cen.xyz), 1); vec4 pos2d = projection * cam; float clip = 1.2 * pos2d.w;
    if (pos2d.z < -clip || pos2d.x < -clip || pos2d.x > clip || pos2d.y < -clip || pos2d.y > clip) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }
    uvec4 cov = texelFetch(u_texture, ivec2(((uint(index) & 0x3ffu) << 1) | 1u, uint(index) >> 10), 0);
    vec2 u1 = unpackHalf2x16(cov.x), u2 = unpackHalf2x16(cov.y), u3 = unpackHalf2x16(cov.z); mat3 Vrk = mat3(u1.x, u1.y, u2.x, u1.y, u2.y, u3.x, u2.x, u3.x, u3.y);
    mat3 J = mat3(focal.x / cam.z, 0., -(focal.x * cam.x) / (cam.z * cam.z), 0., -focal.y / cam.z, (focal.y * cam.y) / (cam.z * cam.z), 0., 0., 0.);
    mat3 T = transpose(mat3(view)) * J; mat3 cov2d = transpose(T) * Vrk * T;
    float mid = (cov2d[0][0] + cov2d[1][1]) / 2.0; float radius = length(vec2((cov2d[0][0] - cov2d[1][1]) / 2.0, cov2d[0][1]));
    float lambda1 = mid + radius, lambda2 = mid - radius; if(lambda2 < 0.0) return;
    vec2 diagonalVector = normalize(vec2(cov2d[0][1], lambda1 - cov2d[0][0])); vec2 majorAxis = min(sqrt(2.0 * lambda1), 1024.0) * diagonalVector; vec2 minorAxis = min(sqrt(2.0 * lambda2), 1024.0) * vec2(diagonalVector.y, -diagonalVector.x);
    vColor = clamp(pos2d.z/pos2d.w+1.0, 0.0, 1.0) * vec4((cov.w) & 0xffu, (cov.w >> 8) & 0xffu, (cov.w >> 16) & 0xffu, (cov.w >> 24) & 0xffu) / 255.0; vPosition = position;
    vec2 vCenter = vec2(pos2d) / pos2d.w; gl_Position = vec4(vCenter + position.x * majorAxis / viewport + position.y * minorAxis / viewport, 0.0, 1.0);
}`.trim();
const fragmentShaderSource = `#version 300 es\nprecision highp float; in vec4 vColor; in vec2 vPosition; out vec4 fragColor;\nvoid main () { float A = -dot(vPosition, vPosition); if (A < -4.0) discard; float B = exp(A) * vColor.a; fragColor = vec4(B * vColor.rgb, B); }`.trim();

let defaultViewMatrix = [0.73, 0.13, -0.67, 0, 0.1, 0.95, 0.29, 0, 0.67, -0.28, 0.68, 0, -0.02, 0.29, 2.22, 1];
let viewMatrix = defaultViewMatrix;

function posToMatrix(x, y, z) { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -x, -y, -z, 1]; }

const tourDatabase = {
    "enginebay": [
        {
            title: "🔍 Engine Bay — Safety Overview",
            section: "Step 1 of 8 — Entry Assessment",
            description: "Before approaching the open engine bay of the Equinox EV, confirm the vehicle is in PARK and the EPB is engaged. The hood release is a handle on the lower left of the instrument panel.\n\nNote: This is an ALL-ELECTRIC vehicle — there is no combustion engine. The bay holds the drive unit, HV wiring, thermal management system, and the 12V auxiliary battery.",
            highlight: "⚠️ The vehicle can be SILENT and still have live HV systems. Always assume orange cables are energized. Wear full PPE.",
            warning: null,
            matrix: defaultViewMatrix
        },
        {
            title: "⚡ Drive Unit & Inverter",
            section: "Step 2 of 8 — Main Powerplant",
            description: "The drive unit (electric motor + inverter) dominates the front of the engine bay. It is the primary propulsion component and contains high-voltage windings.\n\nThe inverter converts DC battery power to 3-phase AC for the motor. High-voltage orange cables connect the inverter to the HV battery running through the floor.",
            highlight: "The drive unit enclosure is sealed — do NOT puncture or cut it. Treat the entire assembly as energized until the HV system is confirmed isolated.",
            warning: "DO NOT CUT ANY ORANGE COLORED HIGH VOLTAGE CABLES.",
            matrix: posToMatrix(0.0, 0.15, 0.2)
        },
        {
            title: "🔋 12V Auxiliary Battery",
            section: "Step 3 of 8 — Low Voltage System",
            description: "The 12V lead-acid auxiliary battery is located in the front engine bay, typically on the right side (passenger side). It powers conventional low-voltage systems: lights, infotainment, power windows, and critically — the HV contactors.\n\nCutting the 12V system: double-cut the LV cable on BOTH sides of the yellow tape. Remove the cut section entirely.",
            highlight: "Cutting 12V disables: airbag system + HV contactors simultaneously. Wait 10 sec (airbags) then 1 min (HV discharge) before working near those systems.",
            warning: "NEVER cut 12V during active thermal runaway ('Battery Danger Detected') — it will disable the battery cooling system.",
            matrix: posToMatrix(0.9, 0.18, 0.3)
        },
        {
            title: "🟠 HV Junction Box / PDU",
            section: "Step 4 of 8 — High Voltage Wiring",
            description: "The High Voltage Junction Box (Power Distribution Unit) routes orange HV cables between the battery pack, drive unit, and onboard charger. Multiple orange cables converge here.\n\nHV battery warning label is under the center front compartment sight shield on the air inlet grill panel.",
            highlight: "All orange cables in this zone are 400V+ DC. The HV system remains energized when the vehicle is OFF — it only de-energizes after a full LV disable procedure.",
            warning: "DO NOT CUT ANY ORANGE COLORED HIGH VOLTAGE CABLES.",
            matrix: posToMatrix(-0.3, 0.12, 0.5)
        },
        {
            title: "🔴 Manual Service Disconnect (MSD)",
            section: "Step 5 of 8 — Emergency Isolation",
            description: "The Manual Service Disconnect isolates the HV battery mid-pack, creating a physical break in the high-voltage circuit. On the Equinox EV, it is accessible from the front compartment area.\n\nTo use: lift the MSD cover and pull upward on the plug. This mechanically opens the HV circuit. After removal, wait 1 minute for capacitors to discharge.",
            highlight: "MSD removal alone does NOT disable airbags — also perform the LV cable cut and wait 10 seconds before working near deployment zones.",
            warning: "After MSD removal: assume residual HV charge for at least 60 seconds.",
            matrix: posToMatrix(-0.6, 0.10, 0.0)
        },
        {
            title: "🌡️ Thermal Management / Coolant",
            section: "Step 6 of 8 — Cooling System",
            description: "The Equinox EV has a liquid cooling system for the HV battery and drive unit. The coolant reservoir is visible in the engine bay. During thermal runaway, this system activates automatically if low voltage power is present.\n\nBright-colored (typically orange or pink) HV-safe coolant is used — do NOT confuse coolant hoses with HV cables.",
            highlight: "Do NOT cut coolant lines. A rupture during a thermal event releases hot, pressurized liquid near energized HV components.",
            warning: null,
            matrix: posToMatrix(-1.0, 0.15, 0.5)
        },
        {
            title: "📡 Airbag Sensor & DERM Module",
            section: "Step 7 of 8 — Restraint System",
            description: "Front impact sensors and the Diagnostic Energy Reserve Module (DERM) are located in the engine bay. The DERM stores reserve energy for airbag deployment even if the 12V battery is cut.\n\nThe Equinox EV has 8 airbags total. After LV cut, the DERM reserve allows deployment for approximately 10 seconds — do NOT work in front airbag zones during this window.",
            highlight: "After cutting LV cables: DO NOT position yourself in front of the steering wheel or instrument panel for at least 10 seconds.",
            warning: null,
            matrix: posToMatrix(0.0, 0.05, -0.5)
        },
        {
            title: "✅ Engine Bay Safety Checklist",
            section: "Step 8 of 8 — Pre-Work Verification",
            description: "Before any extrication or cutting operations:\n\n1️⃣ Vehicle in PARK, EPB engaged, wheels blocked\n2️⃣ Charging cable removed (if connected)\n3️⃣ MSD pulled (if accessible)\n4️⃣ LV cable double-cut both sides of yellow tape — section removed\n5️⃣ Waited 10 seconds (airbag reserve) ✓\n6️⃣ Waited 60 seconds (HV capacitor discharge) ✓\n7️⃣ Confirmed NO orange cable was cut ✓\n8️⃣ SCBA on if any smoke or odor is present",
            highlight: "If 'Battery Danger Detected' is active: skip Step 4 unless extrication absolutely requires airbag disablement.",
            warning: "Always wear Self-Contained Breathing Apparatus (SCBA) if battery fumes or smoke are present.",
            matrix: defaultViewMatrix
        }
    ],
    "EQUINOXREFINE_FINAL": [
        {
            title: "🔍 Vehicle Overview",
            section: "Stop 1 of 8 — Full Exterior",
            description: "Full exterior view of the Chevrolet Equinox EV. This battery-electric vehicle operates on high-voltage DC power (400V+). Before any inspection, confirm the vehicle is in PARK, key fob removed, and 12V auxiliary battery disconnected. Orange-jacketed cables indicate HV circuits — never cut or touch them.",
            highlight: "⚠️ The vehicle can be SILENT and still fully energized. Always assume HV systems are live until formally isolated.",
            warning: null,
            matrix: [-0.936, -0.091, -0.339, 0, 0.0, 0.966, -0.259, 0, 0.351, -0.243, -0.904, 0, -0.105, 0.765, 3.624, 1]
        },
        {
            title: "⚡ Front Bumper & Radar Sensor",
            section: "Stop 2 of 8 — Front Fascia",
            description: "The front fascia houses the forward-facing millimeter-wave radar (center grille) and front-facing camera behind the windshield. Both feed the Super Cruise ADAS system. Do not apply paint, adhesives, or decals to these zones — even minor obstructions degrade sensor accuracy and may require dealer recalibration.",
            highlight: "Stone chips or fascia deformation in the radar zone require a full ADAS recalibration before the vehicle is returned to service.",
            warning: null,
            matrix: [-1.0, -0.004, -0.016, 0, 0.0, 0.973, -0.23, 0, 0.016, -0.23, -0.973, 0, -0.061, 1.167, 3.628, 1]
        },
        {
            title: "🚗 Driver Side — Diagnostic & HV Routing",
            section: "Stop 3 of 8 — Driver Side",
            description: "The OBD-II diagnostic port is located beneath the driver-side instrument panel. The driver door sill carries the VIN label and tire pressure specs. Inspect door seal integrity — water ingress into the HV battery tray triggers a safety fault. The orange HV cable conduit runs along the rocker panel floor.",
            highlight: "Door seal failure is a safety-critical fault — report any ingress immediately.",
            warning: "DO NOT CUT ANY ORANGE COLORED HIGH VOLTAGE CABLES.",
            matrix: [0.0, 0.225, 0.974, 0, 0.0, 0.974, -0.225, 0, -1.0, 0.0, 0.0, 0, 0.22, 0.728, 2.706, 1]
        },
        {
            title: "🔌 DC Fast Charging Port (CCS1)",
            section: "Stop 4 of 8 — Charging System",
            description: "The Combined Charging System (CCS1) port is in the driver-side rear quarter panel. It supports AC Level 1/2 (via J1772 adapter) and DC Fast Charge up to 150 kW. Inspect the charge door actuator, port pins for corrosion or bend damage, and the proximity/pilot contacts. The port locks automatically when charging — never force it open.",
            highlight: "If the vehicle is connected to a charger at a crash scene — remove the charge handle FIRST before any other action.",
            warning: null,
            matrix: [-0.254, 0.345, 0.903, 0, 0.0, 0.934, -0.357, 0, -0.967, -0.091, -0.238, 0, -0.926, 0.648, 2.259, 1]
        },
        {
            title: "🔴 Rear End — HV Labels & Battery Pan",
            section: "Stop 5 of 8 — Rear",
            description: "Rear lamps use full LED arrays. The liftgate backup camera feeds the Surround Vision system. High-voltage warning stickers on the rear valance are required by FMVSS. The rear underbody panel seals the Ultium battery pack — any crash deformation here warrants a battery inspection before driving.",
            highlight: "Check HV warning labels are intact and legible. Missing or damaged labels must be replaced before releasing the vehicle.",
            warning: null,
            matrix: [1.0, -0.003, -0.013, 0, -0.0, 0.963, -0.268, 0, 0.013, 0.268, 0.963, 0, 0.05, 1.115, 3.634, 1]
        },
        {
            title: "🔋 Passenger Side — Ultium Pack Venting",
            section: "Stop 6 of 8 — Passenger Side",
            description: "The Ultium HV battery pack vent path runs along the passenger-side rocker panel. Inspect for body damage that may compromise the side-curtain airbag deployment channel in the B-pillar. The side-facing Surround Vision camera is housed in the passenger mirror cap.",
            highlight: "Rocker panel damage directly above the battery vent path must be assessed before returning to service.",
            warning: null,
            matrix: [0.0, -0.221, -0.975, 0, -0.0, 0.975, -0.221, 0, 1.0, 0.0, 0.0, 0, -0.22, 0.715, 2.709, 1]
        },
        {
            title: "📡 Roof — Cameras & GNSS Antenna",
            section: "Stop 7 of 8 — Roof",
            description: "The forward camera module sits at the top of the windshield (black housing). It provides lane-centering, auto-emergency braking, and Super Cruise LiDAR map matching. The roof antenna array handles GNSS, cellular, and V2X (Vehicle-to-Everything) communications. Any roof replacement requires full ADAS recalibration.",
            highlight: "Roof damage or panel replacement always triggers a mandatory ADAS recalibration before the vehicle can be operated in Super Cruise mode.",
            warning: null,
            matrix: [-1.0, -0.012, -0.012, 0, 0.0, 0.727, -0.686, 0, 0.017, -0.686, -0.727, 0, -0.034, 0.282, 2.484, 1]
        },
        {
            title: "🔧 ADAS Cluster — Front Left",
            section: "Stop 8 of 8 — Sensor Calibration",
            description: "The front-left corner hosts a 360° ultrasonic parking sensor and the left forward-looking camera (Blind Zone Alert / Lane Change Alert). Per SAE J3212, all sensors in this zone require static calibration to certified targets before vehicle release after any front-left body repair. Recheck alignment any time a front-left panel is replaced.",
            highlight: "Release checklist: radar calibrated ✓ | front camera calibrated ✓ | ultrasonic sensors functional ✓ | road-test lane-keeping verified ✓",
            warning: null,
            matrix: [-0.954, 0.061, 0.292, 0, 0.0, 0.979, -0.204, 0, -0.298, -0.195, -0.934, 0, 0.28, 0.927, 3.463, 1]
        }
    ],
    "Equinox": [
        {
            title: "🔍 EV Identification & PPE",
            section: "Section 1 — Identification",
            description: "Always advise Dispatch and all responders that an electric vehicle is involved. The Chevrolet Equinox EV wears the Chevy logo on the hood and rear liftgate, and an 'Equinox EV' emblem on the front doors and left side of the liftgate.",
            highlight: "⚠️ Lack of engine noise does NOT mean the vehicle is off — movement capability exists until the vehicle is fully shut down. Always wear appropriate PPE.",
            warning: null,
            matrix: defaultViewMatrix
        },
        {
            title: "🔋 High Voltage Battery",
            section: "Section 1 — HV Battery",
            description: "The HV battery is a Class B Lithium-Ion pack mounted under the vehicle. It is a structural component integrated into the floor pan. A battery warning label is located under the center front compartment sight shield, on the center of the air inlet grill panel.",
            highlight: "The HV system can remain energized even when the vehicle is in the OFF state. Treat all orange-cabled components as live.",
            warning: "DO NOT CUT ANY ORANGE COLORED HIGH VOLTAGE CABLES.",
            matrix: posToMatrix(1.0, -1.0, -1.8)
        },
        {
            title: "🅿️ Immobilization & Lifting Points",
            section: "Section 2 — Stabilization",
            description: "Block the wheels. To apply the Electric Parking Brake (EPB), press the EPB switch momentarily — the red status light flashes then stays on. To shift to Park, press the button at the end of the shift lever. This vehicle has NO power button; it powers off in Park when a driver exit is detected.",
            highlight: "Lifting points are features on the body of the vehicle only. Do NOT lift from any location on the high voltage battery.",
            warning: null,
            matrix: posToMatrix(2.10, -1.61, -2.55)
        },
        {
            title: "🔌 Charging — Disconnect First",
            section: "Section 3 — Direct Hazards",
            description: "If the vehicle is at a charge station, terminate charging by removing the charge handle from the vehicle first. The common charge handle disconnects normally; the DC Fast Charge handle is larger and may require additional effort. It may also be appropriate to terminate charging at the station.",
            highlight: "If enabled, the vehicle's anti-theft alarm may activate when the charge handle is removed.",
            warning: null,
            matrix: posToMatrix(-0.6, -1.5, -2.6)
        },
        {
            title: "🔒 Hood Release & Low Voltage Cut",
            section: "Section 3 — Direct Hazards",
            description: "Hood release: Pull the handle on the lower left side of the instrument panel. Low Voltage Cut: Double cut the LV cables on both sides of the yellow tape and remove the cut section. This disables the airbags and high voltage system. Wait 10 seconds for airbag reserve energy to dissipate, then 1 minute for HV to discharge.",
            highlight: "Cutting low voltage power disables the airbags AND the HV contactor system.",
            warning: "NEVER cut the low voltage system during an active 'Battery Danger Detected' thermal runaway cycle — unless you must disable airbags for occupant extrication.",
            matrix: posToMatrix(1.23, -1.88, -1.49)
        },
        {
            title: "🌡️ Thermal Runaway Mitigation",
            section: "Section 3 — Thermal Runaway",
            description: "The vehicle has an internal battery management system with fault detection. When a 'Battery Danger Detected' notification appears, automatic safeguards activate — including an internal cooling system that activates when low voltage power is available. OnStar Advisors will contact first responders.",
            highlight: "The vehicle activates its horn and hazard lights automatically when thermal runaway mitigation begins. Watch for this signal.",
            warning: "Do NOT disable the 12V/low voltage system during thermal runaway mitigation unless occupant extrication requires airbag disablement.",
            matrix: posToMatrix(1.13, -1.44, -0.74)
        },
        {
            title: "🚪 Vehicle Access — Doors & Glass",
            section: "Section 4 — Occupant Access",
            description: "Windshield: Laminated glass. Door windows, rear quarter, liftgate window, and sunroof: Tempered glass. Door handles are power-operated — they require the key to approach, doors to be unlocked, the deploy switch to be pressed, or a door to open/close. If locked from inside, pull twice on the inside door handle at each seating location.",
            highlight: "Rear passenger access may require an alternative method if rear door child safety locks are engaged.",
            warning: null,
            matrix: posToMatrix(0.4, -1.7, -2.5)
        },
        {
            title: "💥 Airbag & Restraint Locations",
            section: "Section 4 — Restraints",
            description: "The Equinox EV is equipped with 8 airbags: Driver (steering wheel), Front Passenger (instrument panel), 2× Front Knee Bolster, 2× Front Seat Outboard, 2× Roof Rail. Seat belts for 5 occupants. Front seats have 2 pretensioners each (retractor-mounted + seat anchor). Rear outboard: 1 pretensioner each.",
            highlight: "After cutting low voltage: wait at least 10 seconds before working near airbag deployment zones to allow reserve energy to dissipate.",
            warning: null,
            matrix: posToMatrix(0.7, -1.85, -1.3)
        },
        {
            title: "🔥 Fire & Submersion Response",
            section: "Sections 6–7 — Fire / Submersion",
            description: "FIRE: A battery on fire will NOT explode, but cells vent flammable electrolyte at high temperature. Gases are toxic; use SCBA at all times. Use copious amounts of water to cool and extinguish. Do NOT use ABC dry chemical — it will not extinguish a battery fire. Watch for re-ignition.\n\nSUBMERSION: The HV battery is isolated from the chassis — no electrocution risk from touching the vehicle in water. After removal: let dry, then perform the HV disabling procedure (Section 3).",
            highlight: "Potential for battery re-ignition even after apparent extinguishment. Monitor and maintain water application.",
            warning: "Always wear Self-Contained Breathing Apparatus (SCBA) near a burning EV battery.",
            matrix: defaultViewMatrix
        },
        {
            title: "🚛 Towing, Storage & OnStar",
            section: "Sections 8–9 — Recovery",
            description: "Use a flatbed carrier or tow dollies. Moving with drive wheels on the ground generates unwanted electrical energy — minimize any rolling distance. Tow hook: open the fascia cover using the small notch, install the tow eye and tighten. Store the damaged vehicle at least 15 meters (50 feet) from other vehicles.\n\nThis vehicle is supported by OnStar. After a 'Battery Danger Detected' event, wait up to 1 hour before towing, even if no smoke or odor is visible.",
            highlight: "Post-crash battery hazards (rekindling, re-gassing) can persist during towing and storage. Handle with care.",
            warning: null,
            matrix: posToMatrix(-0.5, -1.4, -2.8)
        }
    ],
    "Blazer": [
        {
            title: "🔍 EV Identification — Blazer EV PPV",
            section: "Section 1 — Identification",
            description: "Identify the Blazer EV by its Chevy bowtie logo and 'Blazer EV' badging. As with all EVs, the vehicle may be silent but still have movement capability until fully shut down. Always advise dispatch and wear appropriate PPE.",
            highlight: "Lack of engine noise does NOT mean the vehicle is off. Always assume the vehicle can move until confirmed in Park.",
            warning: null,
            matrix: defaultViewMatrix
        },
        {
            title: "🔋 High Voltage System",
            section: "Section 1 — HV Battery",
            description: "The Blazer EV uses a High Voltage Lithium-Ion battery pack. Treat all orange high-voltage cables as energized at all times. The HV system can remain energized even with the vehicle off.",
            highlight: "DO NOT CUT orange high-voltage cables.",
            warning: "DO NOT CUT ANY ORANGE COLORED HIGH VOLTAGE CABLES.",
            matrix: posToMatrix(2.10, -1.61, -2.55)
        },
        {
            title: "🔒 Low Voltage Cut & Hazard Disable",
            section: "Section 3 — Direct Hazards",
            description: "Double cut the low voltage cables on both sides of the yellow tape and remove the cut section. This disables the airbags and HV contactors. Wait 10 seconds for airbag reserve energy and 1 minute for HV discharge before working near these systems.",
            highlight: "Always verify the low voltage system is disabled before cutting or moving near high voltage components.",
            warning: null,
            matrix: posToMatrix(1.23, -1.88, -1.49)
        }
    ],
    "ETransit": [
        {
            title: "🔍 EV Identification — Ford E-Transit",
            section: "Section 1 — Identification",
            description: "Identify the Ford E-Transit by its Ford oval logo and EV badging. Advise dispatch that an electric vehicle is involved. The vehicle may be silent but can still move. Always wear appropriate PPE.",
            highlight: "Lack of engine noise does NOT mean the vehicle is off.",
            warning: null,
            matrix: defaultViewMatrix
        },
        {
            title: "🔒 Low Voltage Cut & HV Safety",
            section: "Section 3 — Direct Hazards",
            description: "Follow the manufacturer's low voltage disable procedure. Double cut LV cables on both sides of the yellow tape, remove the cut section, then wait 10 seconds before working near airbags and 1 minute before approaching HV components. Treat all orange HV cables as energized.",
            highlight: "DO NOT CUT orange high-voltage cables.",
            warning: "DO NOT CUT ANY ORANGE COLORED HIGH VOLTAGE CABLES.",
            matrix: posToMatrix(1.23, -1.88, -1.49)
        }
    ]
};

let activeTourFrames = [];
let isTourActive = false; let currentTourIndex = 0; let isTransitioning = false; let transitionProgress = 0;
let startTourMatrix = defaultViewMatrix; let targetTourMatrix = defaultViewMatrix;

async function main() {
    let carousel = true; const params = new URLSearchParams(location.search);
    try { viewMatrix = JSON.parse(decodeURIComponent(location.hash.slice(1))); carousel = false; } catch (err) {}
    
    const urlParam = params.get("url");
    if (!urlParam) {
        document.getElementById("spinner").style.display = "none";
        const msg = document.getElementById("message"); msg.innerText = "Please select a vehicle scan from the menu."; msg.style.color = "white"; msg.style.background = "rgba(0,0,0,0.5)"; msg.style.padding = "20px"; msg.style.borderRadius = "10px"; return; 
    }

    const decodedUrlParam = decodeURIComponent(urlParam);
    const decodedUrlLower = decodedUrlParam.toLowerCase();
    for (let key in tourDatabase) {
        if (decodedUrlLower.includes(key.toLowerCase())) { activeTourFrames = tourDatabase[key]; break; }
    }

    // --- INTEGRATED 3D ANNOTATIONS SYSTEM ---
    const vehicleAnnotations = [
        {
            id: "12V Battery",
            position: [3.14, -3.11, -2.86],
            title: "⚡ 12V Lead Acid Battery",
            description: "Cutting the 12V low voltage system disables the HV contactors and airbags. Double-cut both sides of the yellow tape and remove the cut section.\n\nWait: 10 sec (airbag reserve) → 1 min (HV discharge).",
            warning: "Do NOT cut during active 'Battery Danger Detected' thermal runaway cycle unless airbag disable is required for extrication.",
            targetUrlSnippet: "Chevrolet Equinox EV (Hood Open)"
        },
        {
            id: "LV Cut Location",
            position: [2.85, -3.25, -2.65],
            title: "✂️ Low Voltage Cut Location",
            description: "Double cut the LV cable on BOTH sides of the yellow tape and remove the cut section entirely. Ensure cuts are clean with no loose wires that could reconnect.\n\nThis cut simultaneously disables: Airbag system & HV contactors.",
            warning: "DO NOT CUT ANY ORANGE COLORED HIGH VOLTAGE CABLES.",
            targetUrlSnippet: "Chevrolet Equinox EV (Hood Open)"
        },
        {
            id: "HV Battery Label",
            position: [1.9, -3.05, -2.4],
            title: "🔋 HV Battery Warning Label",
            description: "The battery warning label is located under the center front compartment sight shield on the center of the air inlet grill panel.\n\nThe HV battery is a Class B Li-Ion pack mounted under the vehicle as a structural floor component. The HV system may remain energized even when the vehicle is OFF.",
            warning: null,
            targetUrlSnippet: "Chevrolet Equinox EV (Hood Open)"
        },
        {
            id: "Thermal Runaway",
            position: [2.5, -3.4, -2.2],
            title: "🌡️ Thermal Runaway Mitigation System",
            description: "When 'Battery Danger Detected' appears, an internal cooling system activates automatically (when low voltage power is present). OnStar contacts first responders. The vehicle activates its horn and hazard lights as a warning signal.\n\nKeep low voltage power connected during thermal runaway mitigation.",
            warning: "Do NOT disable 12V system during thermal runaway — unless occupant extrication requires airbag disablement.",
            targetUrlSnippet: "Chevrolet Equinox EV (Hood Open)"
        },
        {
            id: "Airbags",
            position: [1.5, -3.6, -1.8],
            title: "💥 8 Airbag Locations",
            description: "The Equinox EV has 8 airbags:\n• Driver — steering wheel\n• Front Passenger — instrument panel\n• 2× Front Knee Bolster\n• 2× Front Seat Outboard\n• 2× Roof Rail\n\nAfter LV cut: wait 10 seconds before working near deployment zones.",
            warning: null,
            targetUrlSnippet: "Equinox EV (Hood Open)"
        },
        {
            id: "Lifting Points",
            position: [0.8, -3.5, -2.8],
            title: "🔧 Lifting Points",
            description: "Use body-feature lifting points ONLY. Do NOT lift the vehicle from any location on the high voltage battery.\n\nThe HV battery is a structural part of the floor pan — improper lifting can damage it and create a hazard.",
            warning: "Never lift from HV battery locations. Body features only.",
            targetUrlSnippet: "Equinox EV (Hood Closed)"
        },
        {
            id: "Charge Port",
            position: [-0.5, -3.2, -2.5],
            title: "🔌 Charge Port",
            description: "If the vehicle is connected to a charge station: remove the charge handle from the vehicle first. Consider also terminating power at the charging station.\n\nCommon handle disconnects normally. DC Fast Charge handle is larger and may require additional effort to disconnect.",
            warning: "Disconnecting may trigger the vehicle's anti-theft alarm.",
            targetUrlSnippet: "Equinox EV (Hood Closed)"
        },
        // --- Engine Bay Merged Scan Annotations ---
        {
            id: "EB_DriveUnit",
            position: [0.0, 0.1, 0.2],
            title: "⚡ Drive Unit (Motor + Inverter)",
            description: "The electric drive unit occupies most of the engine bay. Contains the 3-phase AC motor and inverter module. Orange HV cables connect to the HV battery pack beneath the vehicle floor.",
            warning: "DO NOT CUT ANY ORANGE COLORED HIGH VOLTAGE CABLES.",
            targetUrlSnippet: "enginebay_merged"
        },
        {
            id: "EB_12VBattery",
            position: [0.9, 0.15, 0.3],
            title: "🔋 12V Auxiliary Battery",
            description: "Lead-acid 12V battery powering conventional systems and — critically — the HV contactors. Double-cut LV cable on BOTH sides of yellow tape to disable HV contactors and airbags.\n\nWait 10 sec (airbags) then 60 sec (HV discharge).",
            warning: "NEVER cut 12V during active thermal runaway mitigation.",
            targetUrlSnippet: "enginebay_merged"
        },
        {
            id: "EB_HVJunction",
            position: [-0.3, 0.12, 0.5],
            title: "🟠 HV Junction Box",
            description: "Routes 400V+ DC power between battery, drive unit, and onboard charger. All orange cables in this zone are energized even with the vehicle off.\n\nHV warning label is on the air inlet grill center panel.",
            warning: "DO NOT CUT ANY ORANGE COLORED HIGH VOLTAGE CABLES.",
            targetUrlSnippet: "enginebay_merged"
        },
        {
            id: "EB_MSD",
            position: [-0.6, 0.08, 0.0],
            title: "🔴 Manual Service Disconnect",
            description: "Physically isolates HV battery mid-pack. Lift the MSD cover and pull upward to remove the plug — this mechanically breaks the HV circuit.\n\nAfter MSD removal: wait 60 seconds for capacitor discharge before any work near HV components.",
            warning: "MSD alone does NOT disable airbags. Also perform LV cable cut.",
            targetUrlSnippet: "enginebay_merged"
        },
        {
            id: "EB_Coolant",
            position: [-1.0, 0.15, 0.5],
            title: "🌡️ Thermal Management Coolant",
            description: "Liquid cooling system for HV battery and drive unit. Activates automatically during thermal runaway if 12V power is present.\n\nDo NOT cut coolant hoses — do not confuse them with HV cables.",
            warning: null,
            targetUrlSnippet: "enginebay_merged"
        }
    ];

    let activeAnnotations = [];
    document.querySelectorAll('.splat-marker').forEach(el => el.remove());

    vehicleAnnotations.forEach(annoData => {
        let decodedUrl = decodeURIComponent(urlParam || "");
        if (decodedUrl.includes(annoData.targetUrlSnippet)) {
            let el = document.createElement('div');
            el.className = 'splat-marker';
            el.innerHTML = `
                <div class="anchor-point"></div>
                <div class="connecting-line"></div>
                <div class="splat-annotation">
                    <div class="close-btn">✖</div>
                    <div class="anno-title">${annoData.title}</div>
                    <div class="anno-details">${annoData.description}</div>
                    ${annoData.warning ? `<div class="anno-warning">⚠️ ${annoData.warning}</div>` : ''}
                </div>
            `;
            
            let dot = el.querySelector('.anchor-point');
            let box = el.querySelector('.splat-annotation');
            let line = el.querySelector('.connecting-line');
            let closeBtn = el.querySelector('.close-btn');

            let isDragging = false;
            let startMouseX = 0, startMouseY = 0;
            const defaultOffsetX = 60; const defaultOffsetY = -90;
            let offsetX = defaultOffsetX; let offsetY = defaultOffsetY;

            function updateLine() {
                let length = Math.hypot(offsetX, offsetY); 
                let angle = Math.atan2(offsetY, offsetX);  
                line.style.width = length + 'px';
                line.style.transform = `rotate(${angle}rad)`;
            }

            dot.onclick = (e) => {
                document.querySelectorAll('.splat-marker').forEach(m => m.classList.remove('active'));
                offsetX = defaultOffsetX; offsetY = defaultOffsetY;
                box.style.left = offsetX + 'px'; box.style.top = offsetY + 'px';
                updateLine();
                el.classList.add('active');
                e.stopPropagation(); 
            };

            closeBtn.onclick = (e) => { el.classList.remove('active'); e.stopPropagation(); };

            box.onmousedown = (e) => {
                if(e.target.classList.contains('close-btn')) return; 
                isDragging = true; startMouseX = e.clientX; startMouseY = e.clientY; e.preventDefault(); 
            };

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                offsetX += e.clientX - startMouseX; offsetY += e.clientY - startMouseY;
                startMouseX = e.clientX; startMouseY = e.clientY;
                box.style.left = offsetX + 'px'; box.style.top = offsetY + 'px';
                updateLine();
            });

            window.addEventListener('mouseup', () => { isDragging = false; });

            box.style.left = offsetX + 'px'; box.style.top = offsetY + 'px'; updateLine();
            document.body.appendChild(el);
            activeAnnotations.push({ element: el, position: annoData.position });
        }
    });

    const url = new URL(urlParam); const req = await fetch(url, { mode: "cors", credentials: "omit" });
    if (req.status != 200) throw new Error(req.status + " Unable to load " + req.url);
    const rowLength = 3 * 4 + 3 * 4 + 4 + 4; const reader = req.body.getReader(); let splatData = new Uint8Array(req.headers.get("content-length"));
    const downsample = splatData.length / rowLength > 500000 ? 1 : 1 / devicePixelRatio;
    const worker = new Worker(URL.createObjectURL(new Blob(["(", createWorker.toString(), ")(self)"], { type: "application/javascript" })));

    const canvas = document.getElementById("canvas"); const camid = document.getElementById("camid"); let projectionMatrix;
    const gl = canvas.getContext("webgl2", { antialias: false });
    const vertexShader = gl.createShader(gl.VERTEX_SHADER); gl.shaderSource(vertexShader, vertexShaderSource); gl.compileShader(vertexShader);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); gl.shaderSource(fragmentShader, fragmentShaderSource); gl.compileShader(fragmentShader);
    const program = gl.createProgram(); gl.attachShader(program, vertexShader); gl.attachShader(program, fragmentShader); gl.linkProgram(program); gl.useProgram(program);
    gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.ONE_MINUS_DST_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE); gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);

    const u_projection = gl.getUniformLocation(program, "projection"); const u_viewport = gl.getUniformLocation(program, "viewport"); const u_focal = gl.getUniformLocation(program, "focal"); const u_view = gl.getUniformLocation(program, "view");
    const triangleVertices = new Float32Array([-2, -2, 2, -2, 2, 2, -2, 2]); const vertexBuffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);
    const a_position = gl.getAttribLocation(program, "position"); gl.enableVertexAttribArray(a_position); gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
    var texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture); var u_textureLocation = gl.getUniformLocation(program, "u_texture"); gl.uniform1i(u_textureLocation, 0);
    const indexBuffer = gl.createBuffer(); const a_index = gl.getAttribLocation(program, "index"); gl.enableVertexAttribArray(a_index); gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer); gl.vertexAttribIPointer(a_index, 1, gl.INT, false, 0, 0); gl.vertexAttribDivisor(a_index, 1);

    const resize = () => {
        const fxScaled = camera.fx * innerWidth / camera.width;
        const fyScaled = camera.fy * innerHeight / camera.height;
        gl.uniform2fv(u_focal, new Float32Array([fxScaled, fyScaled]));
        projectionMatrix = getProjectionMatrix(fxScaled, fyScaled, innerWidth, innerHeight);
        gl.uniform2fv(u_viewport, new Float32Array([innerWidth, innerHeight]));
        gl.canvas.width = Math.round(innerWidth / downsample); gl.canvas.height = Math.round(innerHeight / downsample); gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.uniformMatrix4fv(u_projection, false, projectionMatrix);
    };
    window.addEventListener("resize", resize); resize();

    worker.onmessage = (e) => {
        if (e.data.buffer) {
            splatData = new Uint8Array(e.data.buffer);
            if (e.data.save) { const blob = new Blob([splatData.buffer], { type: "application/octet-stream" }); const link = document.createElement("a"); link.download = "model.splat"; link.href = URL.createObjectURL(blob); document.body.appendChild(link); link.click(); }
        } else if (e.data.texdata) {
            const { texdata, texwidth, texheight } = e.data;
            gl.bindTexture(gl.TEXTURE_2D, texture); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32UI, texwidth, texheight, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT, texdata); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
        } else if (e.data.depthIndex) {
            gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer); gl.bufferData(gl.ARRAY_BUFFER, e.data.depthIndex, gl.DYNAMIC_DRAW); vertexCount = e.data.vertexCount;
        }
    };

    let activeKeys = []; let currentCameraIndex = 0;
    window.addEventListener("keydown", (e) => {
        if(isTourActive) return; 
        carousel = false;
        if (!activeKeys.includes(e.code)) activeKeys.push(e.code);
        if (/\d/.test(e.key)) { currentCameraIndex = parseInt(e.key); camera = cameras[currentCameraIndex] || cameras[0]; viewMatrix = getViewMatrix(camera); }
        if (["-", "_"].includes(e.key)) { currentCameraIndex = (currentCameraIndex + cameras.length - 1) % cameras.length; viewMatrix = getViewMatrix(cameras[currentCameraIndex]); }
        if (["+", "="].includes(e.key)) { currentCameraIndex = (currentCameraIndex + 1) % cameras.length; viewMatrix = getViewMatrix(cameras[currentCameraIndex]); }
        camid.innerText = "cam  " + currentCameraIndex;
        if (e.code == "KeyV") { location.hash = "#" + JSON.stringify(viewMatrix.map((k) => Math.round(k * 100) / 100)); camid.innerText = ""; } 
        else if (e.code === "KeyP") { carousel = true; camid.innerText = ""; }
        else if (e.code === "KeyC") { let camWorld = invert4(viewMatrix); console.log(`Current Camera Pos: [${camWorld[12].toFixed(2)}, ${camWorld[13].toFixed(2)}, ${camWorld[14].toFixed(2)}]`); }
    });
    window.addEventListener("keyup", (e) => { activeKeys = activeKeys.filter((k) => k !== e.code); });
    window.addEventListener("blur", () => { activeKeys = []; });

    window.addEventListener("wheel", (e) => {
        if(isTourActive) return;
        carousel = false; e.preventDefault();
        const scale = e.deltaMode == 1 ? 10 : e.deltaMode == 2 ? innerHeight : 1; let inv = invert4(viewMatrix);
        if (e.shiftKey) { inv = translate4(inv, (e.deltaX * scale) / innerWidth, (e.deltaY * scale) / innerHeight, 0); } 
        else if (e.ctrlKey || e.metaKey) { inv = translate4(inv, 0, 0, (-10 * (e.deltaY * scale)) / innerHeight); } 
        else { let d = 4; inv = translate4(inv, 0, 0, d); inv = rotate4(inv, -(e.deltaX * scale) / innerWidth, 0, 1, 0); inv = rotate4(inv, (e.deltaY * scale) / innerHeight, 1, 0, 0); inv = translate4(inv, 0, 0, -d); }
        viewMatrix = invert4(inv);
    }, { passive: false });

    let startX, startY, down;
    canvas.addEventListener("mousedown", (e) => { if(isTourActive) return; carousel = false; e.preventDefault(); startX = e.clientX; startY = e.clientY; down = e.ctrlKey || e.metaKey ? 2 : 1; });
    canvas.addEventListener("contextmenu", (e) => { if(isTourActive) return; carousel = false; e.preventDefault(); startX = e.clientX; startY = e.clientY; down = 2; });
    canvas.addEventListener("mousemove", (e) => {
        if(isTourActive) return;
        e.preventDefault();
        if (down == 1) { let inv = invert4(viewMatrix); let dx = (5 * (e.clientX - startX)) / innerWidth; let dy = (5 * (e.clientY - startY)) / innerHeight; let d = 4; inv = translate4(inv, 0, 0, d); inv = rotate4(inv, dx, 0, 1, 0); inv = rotate4(inv, -dy, 1, 0, 0); inv = translate4(inv, 0, 0, -d); viewMatrix = invert4(inv); startX = e.clientX; startY = e.clientY; } 
        else if (down == 2) { let inv = invert4(viewMatrix); inv = translate4(inv, (-10 * (e.clientX - startX)) / innerWidth, 0, (10 * (e.clientY - startY)) / innerHeight); viewMatrix = invert4(inv); startX = e.clientX; startY = e.clientY; }
    });
    canvas.addEventListener("mouseup", (e) => { e.preventDefault(); down = false; startX = 0; startY = 0; });

    let altX = 0, altY = 0;
    canvas.addEventListener("touchstart", (e) => { if(isTourActive) return; e.preventDefault(); if (e.touches.length === 1) { carousel = false; startX = e.touches[0].clientX; startY = e.touches[0].clientY; down = 1; } else if (e.touches.length === 2) { carousel = false; startX = e.touches[0].clientX; altX = e.touches[1].clientX; startY = e.touches[0].clientY; altY = e.touches[1].clientY; down = 1; } }, { passive: false });
    canvas.addEventListener("touchmove", (e) => {
        if(isTourActive) return;
        e.preventDefault();
        if (e.touches.length === 1 && down) { let inv = invert4(viewMatrix); let dx = (4 * (e.touches[0].clientX - startX)) / innerWidth; let dy = (4 * (e.touches[0].clientY - startY)) / innerHeight; let d = 4; inv = translate4(inv, 0, 0, d); inv = rotate4(inv, dx, 0, 1, 0); inv = rotate4(inv, -dy, 1, 0, 0); inv = translate4(inv, 0, 0, -d); viewMatrix = invert4(inv); startX = e.touches[0].clientX; startY = e.touches[0].clientY; } 
        else if (e.touches.length === 2) { const dtheta = Math.atan2(startY - altY, startX - altX) - Math.atan2(e.touches[0].clientY - e.touches[1].clientY, e.touches[0].clientX - e.touches[1].clientX); const dscale = Math.hypot(startX - altX, startY - altY) / Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); const dx = (e.touches[0].clientX + e.touches[1].clientX - (startX + altX)) / 2; const dy = (e.touches[0].clientY + e.touches[1].clientY - (startY + altY)) / 2; let inv = invert4(viewMatrix); inv = rotate4(inv, dtheta, 0, 0, 1); inv = translate4(inv, -dx / innerWidth, -dy / innerHeight, 0); inv = translate4(inv, 0, 0, 3 * (1 - dscale)); viewMatrix = invert4(inv); startX = e.touches[0].clientX; altX = e.touches[1].clientX; startY = e.touches[0].clientY; altY = e.touches[1].clientY; }
    }, { passive: false });
    canvas.addEventListener("touchend", (e) => { e.preventDefault(); down = false; startX = 0; startY = 0; }, { passive: false });

    window.addEventListener("gamepadconnected", (e) => { console.log(`Gamepad connected at index ${e.gamepad.index}: ${e.gamepad.id}.`); });
    let leftGamepadTrigger, rightGamepadTrigger;

    function updateTourUI() {
        if (activeTourFrames.length === 0) {
            document.getElementById('tour-title').innerText = "No Tour Available";
            document.getElementById('tour-description').innerText = "A training walkthrough has not been mapped for this scan yet.";
            document.getElementById('tour-section-tag').innerText = "";
            document.getElementById('tour-counter').innerText = "0 / 0";
            document.getElementById('tour-highlight').style.display = 'none';
            document.getElementById('tour-warning-box').style.display = 'none';
            document.getElementById('tour-prev').disabled = true;
            document.getElementById('tour-next').innerText = "Next ▶";
            document.getElementById('tour-next').disabled = true;
            return;
        }

        const frame = activeTourFrames[currentTourIndex];
        const total = activeTourFrames.length;

        document.getElementById('tour-title').innerText = frame.title || "";
        document.getElementById('tour-section-tag').innerText = frame.section || "";
        document.getElementById('tour-description').innerText = frame.description || "";

        const highlightEl = document.getElementById('tour-highlight');
        if (frame.highlight) {
            highlightEl.innerText = frame.highlight;
            highlightEl.style.display = 'block';
        } else {
            highlightEl.style.display = 'none';
        }

        const warningEl = document.getElementById('tour-warning-box');
        if (frame.warning) {
            warningEl.innerText = "⚠️ " + frame.warning;
            warningEl.style.display = 'block';
        } else {
            warningEl.style.display = 'none';
        }

        document.getElementById('tour-counter').innerText = `${currentTourIndex + 1} / ${total}`;
        document.getElementById('tour-progress-fill').style.width = `${((currentTourIndex + 1) / total) * 100}%`;

        document.getElementById('tour-prev').disabled = currentTourIndex === 0;
        const isLast = currentTourIndex === total - 1;
        document.getElementById('tour-next').disabled = isLast;
        document.getElementById('tour-next').innerText = isLast ? "✓ Finish" : "Next ▶";
    }

    function goToTourFrame(index) {
        if (activeTourFrames.length === 0 || index < 0 || index >= activeTourFrames.length) return;
        currentTourIndex = index; updateTourUI();
        startTourMatrix = viewMatrix; targetTourMatrix = activeTourFrames[currentTourIndex].matrix;
        transitionProgress = 0; isTransitioning = true; carousel = false;
    }

    document.getElementById('startTourBtn').addEventListener('click', () => { document.getElementById('tour-container').style.display = 'block'; isTourActive = true; updateTourUI(); goToTourFrame(0); });
    document.getElementById('closeTourBtn').addEventListener('click', () => { document.getElementById('tour-container').style.display = 'none'; isTourActive = false; });
    document.getElementById('tour-prev').addEventListener('click', () => { isTransitioning = false; goToTourFrame(currentTourIndex - 1); });
    document.getElementById('tour-next').addEventListener('click', () => { isTransitioning = false; goToTourFrame(currentTourIndex + 1); });

    let jumpDelta = 0; let vertexCount = 0; let lastFrame = 0; let avgFps = 0; let start = 0;

    const frame = (now) => {
        let inv = invert4(viewMatrix);
        
        if (isTransitioning) {
            transitionProgress += 0.05;
            if (transitionProgress >= 1.0) { transitionProgress = 1.0; isTransitioning = false; }
            let t = transitionProgress * transitionProgress * (3 - 2 * transitionProgress);
            let startCam = invert4(startTourMatrix); let targetCam = invert4(targetTourMatrix); let currentCam = new Array(16);
            for (let i = 0; i < 16; i++) { currentCam[i] = startCam[i] + (targetCam[i] - startCam[i]) * t; }
            let x = [currentCam[0], currentCam[1], currentCam[2]]; let y = [currentCam[4], currentCam[5], currentCam[6]];
            let lenX = Math.hypot(x[0], x[1], x[2]); x = [x[0]/lenX, x[1]/lenX, x[2]/lenX];
            let dotYX = y[0]*x[0] + y[1]*x[1] + y[2]*x[2]; y = [y[0] - dotYX*x[0], y[1] - dotYX*x[1], y[2] - dotYX*x[2]];
            let lenY = Math.hypot(y[0], y[1], y[2]); y = [y[0]/lenY, y[1]/lenY, y[2]/lenY];
            let z = [x[1]*y[2] - x[2]*y[1], x[2]*y[0] - x[0]*y[2], x[0]*y[1] - x[1]*y[0]];
            currentCam[0] = x[0]; currentCam[1] = x[1]; currentCam[2] = x[2]; currentCam[4] = y[0]; currentCam[5] = y[1]; currentCam[6] = y[2]; currentCam[8] = z[0]; currentCam[9] = z[1]; currentCam[10] = z[2];
            inv = currentCam; 
        } 
        else if (!isTourActive) {
            let shiftKey = activeKeys.includes("Shift") || activeKeys.includes("ShiftLeft") || activeKeys.includes("ShiftRight");
            if (activeKeys.includes("ArrowUp")) { if (shiftKey) inv = translate4(inv, 0, -0.03, 0); else inv = translate4(inv, 0, 0, 0.1); }
            if (activeKeys.includes("ArrowDown")) { if (shiftKey) inv = translate4(inv, 0, 0.03, 0); else inv = translate4(inv, 0, 0, -0.1); }
            if (activeKeys.includes("ArrowLeft")) inv = translate4(inv, -0.03, 0, 0);
            if (activeKeys.includes("ArrowRight")) inv = translate4(inv, 0.03, 0, 0);
            if (activeKeys.includes("KeyA")) inv = rotate4(inv, -0.01, 0, 1, 0); if (activeKeys.includes("KeyD")) inv = rotate4(inv, 0.01, 0, 1, 0);
            if (activeKeys.includes("KeyQ")) inv = rotate4(inv, 0.01, 0, 0, 1); if (activeKeys.includes("KeyE")) inv = rotate4(inv, -0.01, 0, 0, 1);
            if (activeKeys.includes("KeyW")) inv = rotate4(inv, 0.005, 1, 0, 0); if (activeKeys.includes("KeyS")) inv = rotate4(inv, -0.005, 1, 0, 0);
            const gamepads = navigator.getGamepads ? navigator.getGamepads() : []; let isJumping = activeKeys.includes("Space");
            for (let gamepad of gamepads) {
                if (!gamepad) continue;
                const axisThreshold = 0.1; const moveSpeed = 0.06; const rotateSpeed = 0.02;
                if (Math.abs(gamepad.axes[0]) > axisThreshold) { inv = translate4(inv, moveSpeed * gamepad.axes[0], 0, 0); carousel = false; }
                if (Math.abs(gamepad.axes[1]) > axisThreshold) { inv = translate4(inv, 0, 0, -moveSpeed * gamepad.axes[1]); carousel = false; }
                if (gamepad.buttons[12].pressed || gamepad.buttons[13].pressed) { inv = translate4(inv, 0, -moveSpeed * (gamepad.buttons[12].pressed - gamepad.buttons[13].pressed), 0); carousel = false; }
                if (gamepad.buttons[14].pressed || gamepad.buttons[15].pressed) { inv = translate4(inv, -moveSpeed * (gamepad.buttons[14].pressed - gamepad.buttons[15].pressed), 0, 0); carousel = false; }
                if (Math.abs(gamepad.axes[2]) > axisThreshold) { inv = rotate4(inv, rotateSpeed * gamepad.axes[2], 0, 1, 0); carousel = false; }
                if (Math.abs(gamepad.axes[3]) > axisThreshold) { inv = rotate4(inv, -rotateSpeed * gamepad.axes[3], 1, 0, 0); carousel = false; }
                let tiltAxis = gamepad.buttons[6].value - gamepad.buttons[7].value;
                if (Math.abs(tiltAxis) > axisThreshold) { inv = rotate4(inv, rotateSpeed * tiltAxis, 0, 0, 1); carousel = false; }
                if (gamepad.buttons[4].pressed && !leftGamepadTrigger) { camera = cameras[(cameras.indexOf(camera) + 1) % cameras.length] || cameras[0]; inv = invert4(getViewMatrix(camera)); carousel = false; }
                if (gamepad.buttons[5].pressed && !rightGamepadTrigger) { camera = cameras[(cameras.indexOf(camera) + cameras.length - 1) % cameras.length] || cameras[0]; inv = invert4(getViewMatrix(camera)); carousel = false; }
                leftGamepadTrigger = gamepad.buttons[4].pressed; rightGamepadTrigger = gamepad.buttons[5].pressed;
                if (gamepad.buttons[0].pressed) { isJumping = true; carousel = false; }
                if (gamepad.buttons[3].pressed) carousel = true;
            }
            if (["KeyJ", "KeyK", "KeyL", "KeyI"].some((k) => activeKeys.includes(k))) {
                let d = 4; inv = translate4(inv, 0, 0, d);
                inv = rotate4(inv, activeKeys.includes("KeyJ") ? -0.05 : activeKeys.includes("KeyL") ? 0.05 : 0, 0, 1, 0);
                inv = rotate4(inv, activeKeys.includes("KeyI") ? 0.05 : activeKeys.includes("KeyK") ? -0.05 : 0, 1, 0, 0);
                inv = translate4(inv, 0, 0, -d);
            }
            if (isJumping) jumpDelta = Math.min(1, jumpDelta + 0.05); else jumpDelta = Math.max(0, jumpDelta - 0.05);
            inv = translate4(inv, 0, -jumpDelta, 0);
            inv = rotate4(inv, -0.1 * jumpDelta, 1, 0, 0);
        }

        viewMatrix = invert4(inv);

        if (carousel && !isTourActive) {
            let inv = invert4(defaultViewMatrix); const t = Math.sin((Date.now() - start) / 5000);
            inv = translate4(inv, 2.5 * t, 0, 6 * (1 - Math.cos(t))); inv = rotate4(inv, -0.6 * t, 0, 1, 0);
            viewMatrix = invert4(inv);
        }

        let actualViewMatrix = viewMatrix;
        const viewProj = multiply4(projectionMatrix, actualViewMatrix);
        worker.postMessage({ view: viewProj });

        // --- UPDATE ANNOTATION PIN POSITIONS ---
        activeAnnotations.forEach(anno => {
            let clipSpace = multiplyMatrixAndPoint(viewProj, anno.position);
            let w = clipSpace[3];

            if (w <= 0.1) {
                anno.element.style.display = 'none';
            } else {
                let ndcX = clipSpace[0] / w;
                let ndcY = clipSpace[1] / w;

                if (ndcX < -1.2 || ndcX > 1.2 || ndcY < -1.2 || ndcY > 1.2) {
                    anno.element.style.display = 'none';
                } else {
                    let screenX = (ndcX * 0.5 + 0.5) * innerWidth;
                    let screenY = -(ndcY * 0.5 - 0.5) * innerHeight; 
                    anno.element.style.display = 'block';
                    anno.element.style.left = screenX + 'px';
                    anno.element.style.top = screenY + 'px';
                }
            }
        });

        const currentFps = 1000 / (now - lastFrame) || 0; avgFps = avgFps * 0.9 + currentFps * 0.1;

        if (vertexCount > 0) {
            document.getElementById("spinner").style.display = "none";
            gl.uniformMatrix4fv(u_view, false, actualViewMatrix); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, vertexCount);
        } else {
            gl.clear(gl.COLOR_BUFFER_BIT); document.getElementById("spinner").style.display = ""; start = Date.now() + 2000;
        }
        
        const progress = (100 * vertexCount) / (splatData.length / rowLength);
        if (progress < 100) document.getElementById("progress").style.width = progress + "%";
        else document.getElementById("progress").style.display = "none";

        if (isNaN(currentCameraIndex)) camid.innerText = "";
        lastFrame = now; requestAnimationFrame(frame);
    };

    frame();

    const isPly = (splatData) => splatData[0] == 112 && splatData[1] == 108 && splatData[2] == 121 && splatData[3] == 10;
    
    let bytesRead = 0; let lastVertexCount = -1; let stopLoading = false;
    while (true) {
        const { done, value } = await reader.read();
        if (done || stopLoading) break;
        splatData.set(value, bytesRead); bytesRead += value.length;
        if (vertexCount > lastVertexCount) {
            if (!isPly(splatData)) worker.postMessage({ buffer: splatData.buffer, vertexCount: Math.floor(bytesRead / rowLength) });
            lastVertexCount = vertexCount;
        }
    }
    if (!stopLoading) {
        if (isPly(splatData)) worker.postMessage({ ply: splatData.buffer, save: false });
        else worker.postMessage({ buffer: splatData.buffer, vertexCount: Math.floor(bytesRead / rowLength) });
    }
}

main().catch((err) => {
    document.getElementById("spinner").style.display = "none";
    document.getElementById("message").innerText = err.toString();
});
