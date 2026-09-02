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
    let buffer; let vertexCount = 0; let viewProj;
    const SPLAT_ROWLEN = 3*4+3*4+4+4; // 32 bytes — raw .splat binary format
    const PLY_ROWLEN = SPLAT_ROWLEN + 45*4; // 212 bytes — PLY with SH rest coefficients
    let rowLength = SPLAT_ROWLEN; let floatsPerRow = 8; let hasSH = false;
    let lastProj = []; let depthIndex = new Uint32Array(); let lastVertexCount = 0;
    var _floatView = new Float32Array(1); var _int32View = new Int32Array(_floatView.buffer);
    function floatToHalf(float) {
        _floatView[0] = float; var f = _int32View[0]; var sign = (f >> 31) & 0x0001; var exp = (f >> 23) & 0x00ff; var frac = f & 0x007fffff; var newExp;
        if (exp == 0) newExp = 0; else if (exp < 113) { newExp = 0; frac |= 0x00800000; frac = frac >> (113 - exp); if (frac & 0x01000000) { newExp = 1; frac = 0; } } else if (exp < 142) newExp = exp - 112; else { newExp = 31; frac = 0; }
        return (sign << 15) | (newExp << 10) | (frac >> 13);
    }
    function packHalf2x16(x, y) { return (floatToHalf(x) | (floatToHalf(y) << 16)) >>> 0; }

    function generateTexture() {
        if (!buffer) return;
        const f_buffer = new Float32Array(buffer); const u_buffer = new Uint8Array(buffer);
        var texwidth = 1024 * 2; var texheight = Math.ceil((2 * vertexCount) / texwidth); var texdata = new Uint32Array(texwidth * texheight * 4); var texdata_c = new Uint8Array(texdata.buffer); var texdata_f = new Float32Array(texdata.buffer);
        var shtexwidth = 0, shtexheight = 0; var shdata = null;
        if (hasSH) { shtexwidth = 1024 * 2; shtexheight = Math.ceil((6 * vertexCount) / shtexwidth) + 1; shdata = new Uint32Array(shtexwidth * shtexheight * 4); }
        for (let i = 0; i < vertexCount; i++) {
            const fi = floatsPerRow * i; const bi = rowLength * i;
            texdata_f[8*i+0] = f_buffer[fi+0]; texdata_f[8*i+1] = f_buffer[fi+1]; texdata_f[8*i+2] = f_buffer[fi+2];
            texdata_c[4*(8*i+7)+0] = u_buffer[bi+24]; texdata_c[4*(8*i+7)+1] = u_buffer[bi+25]; texdata_c[4*(8*i+7)+2] = u_buffer[bi+26]; texdata_c[4*(8*i+7)+3] = u_buffer[bi+27];
            let scale = [f_buffer[fi+3], f_buffer[fi+4], f_buffer[fi+5]]; let rot = [(u_buffer[bi+28]-128)/128, (u_buffer[bi+29]-128)/128, (u_buffer[bi+30]-128)/128, (u_buffer[bi+31]-128)/128];
            const M = [
                1.0-2.0*(rot[2]*rot[2]+rot[3]*rot[3]), 2.0*(rot[1]*rot[2]+rot[0]*rot[3]), 2.0*(rot[1]*rot[3]-rot[0]*rot[2]),
                2.0*(rot[1]*rot[2]-rot[0]*rot[3]), 1.0-2.0*(rot[1]*rot[1]+rot[3]*rot[3]), 2.0*(rot[2]*rot[3]+rot[0]*rot[1]),
                2.0*(rot[1]*rot[3]+rot[0]*rot[2]), 2.0*(rot[2]*rot[3]-rot[0]*rot[1]), 1.0-2.0*(rot[1]*rot[1]+rot[2]*rot[2]),
            ].map((k, mi) => k * scale[Math.floor(mi / 3)]);
            const sigma = [
                M[0]*M[0]+M[3]*M[3]+M[6]*M[6], M[0]*M[1]+M[3]*M[4]+M[6]*M[7], M[0]*M[2]+M[3]*M[5]+M[6]*M[8],
                M[1]*M[1]+M[4]*M[4]+M[7]*M[7], M[1]*M[2]+M[4]*M[5]+M[7]*M[8], M[2]*M[2]+M[5]*M[5]+M[8]*M[8],
            ];
            texdata[8*i+4] = packHalf2x16(4*sigma[0], 4*sigma[1]); texdata[8*i+5] = packHalf2x16(4*sigma[2], 4*sigma[3]); texdata[8*i+6] = packHalf2x16(4*sigma[4], 4*sigma[5]);
            if (hasSH) {
                const sh_fi = fi + 8; // f_rest_0 is at float index 8 (byte 32)
                for (let t = 0; t < 6; t++) {
                    const tl = i * 6 + t; const sc = tl % shtexwidth; const sr = (tl / shtexwidth) | 0;
                    const sf = (sr * shtexwidth + sc) * 4;
                    for (let c = 0; c < 4; c++) {
                        const k0 = t*8 + c*2; const k1 = k0+1;
                        shdata[sf+c] = packHalf2x16(k0<45 ? f_buffer[sh_fi+k0] : 0, k1<45 ? f_buffer[sh_fi+k1] : 0);
                    }
                }
            }
        }
        if (hasSH) { self.postMessage({ texdata, texwidth, texheight, shdata, shtexwidth, shtexheight, hasSH }, [texdata.buffer, shdata.buffer]); }
        else { self.postMessage({ texdata, texwidth, texheight, hasSH }, [texdata.buffer]); }
    }

    function runSort(viewProj) {
        if (!buffer) return; const f_buffer = new Float32Array(buffer);
        if (lastVertexCount == vertexCount) { let dot = lastProj[2]*viewProj[2] + lastProj[6]*viewProj[6] + lastProj[10]*viewProj[10]; if (Math.abs(dot - 1) < 0.01) return; } else { generateTexture(); lastVertexCount = vertexCount; }
        let maxDepth = -Infinity; let minDepth = Infinity; let sizeList = new Int32Array(vertexCount);
        for (let i = 0; i < vertexCount; i++) {
            let depth = ((viewProj[2]*f_buffer[floatsPerRow*i+0] + viewProj[6]*f_buffer[floatsPerRow*i+1] + viewProj[10]*f_buffer[floatsPerRow*i+2]) * 4096) | 0;
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
        const plyHasSH = !!types["f_rest_0"];
        const plyRowLen = PLY_ROWLEN; // always use full row for PLY files
        sizeIndex.sort((b, a) => sizeList[a] - sizeList[b]); const buffer = new ArrayBuffer(plyRowLen * vertexCount);
        for (let j = 0; j < vertexCount; j++) {
            row = sizeIndex[j];
            const position = new Float32Array(buffer, j * plyRowLen, 3); const scales = new Float32Array(buffer, j * plyRowLen + 12, 3); const rgba = new Uint8ClampedArray(buffer, j * plyRowLen + 24, 4); const rot = new Uint8ClampedArray(buffer, j * plyRowLen + 28, 4);
            if (types["scale_0"]) {
                const qlen = Math.sqrt(attrs.rot_0 ** 2 + attrs.rot_1 ** 2 + attrs.rot_2 ** 2 + attrs.rot_3 ** 2);
                rot[0] = (attrs.rot_0 / qlen) * 128 + 128; rot[1] = (attrs.rot_1 / qlen) * 128 + 128; rot[2] = (attrs.rot_2 / qlen) * 128 + 128; rot[3] = (attrs.rot_3 / qlen) * 128 + 128;
                scales[0] = Math.exp(attrs.scale_0); scales[1] = Math.exp(attrs.scale_1); scales[2] = Math.exp(attrs.scale_2);
            } else { scales[0] = 0.01; scales[1] = 0.01; scales[2] = 0.01; rot[0] = 255; rot[1] = 0; rot[2] = 0; rot[3] = 0; }
            position[0] = attrs.x; position[1] = attrs.y; position[2] = attrs.z;
            if (types["f_dc_0"]) { const SH_C0 = 0.28209479177387814; rgba[0] = (0.5 + SH_C0 * attrs.f_dc_0) * 255; rgba[1] = (0.5 + SH_C0 * attrs.f_dc_1) * 255; rgba[2] = (0.5 + SH_C0 * attrs.f_dc_2) * 255; } else { rgba[0] = attrs.red; rgba[1] = attrs.green; rgba[2] = attrs.blue; }
            if (types["opacity"]) rgba[3] = (1 / (1 + Math.exp(-attrs.opacity))) * 255; else rgba[3] = 255;
            if (plyHasSH) {
                const shView = new Float32Array(buffer, j * plyRowLen + 32, 45);
                for (let k = 0; k < 45; k++) { const key = "f_rest_" + k; shView[k] = types[key] ? attrs[key] : 0.0; }
            }
        }
        hasSH = plyHasSH; rowLength = plyRowLen; floatsPerRow = plyRowLen / 4;
        return buffer;
    }
    const throttledSort = () => { if (!sortRunning) { sortRunning = true; let lastView = viewProj; runSort(lastView); setTimeout(() => { sortRunning = false; if (lastView !== viewProj) throttledSort(); }, 0); } };
    let sortRunning;
    self.onmessage = (e) => {
        if (e.data.ply) { vertexCount = 0; runSort(viewProj); buffer = processPlyBuffer(e.data.ply); vertexCount = Math.floor(buffer.byteLength / rowLength); postMessage({ buffer: buffer, save: !!e.data.save }); }
        else if (e.data.buffer) { buffer = e.data.buffer; rowLength = SPLAT_ROWLEN; floatsPerRow = 8; hasSH = false; vertexCount = e.data.vertexCount; }
        else if (e.data.vertexCount) { vertexCount = e.data.vertexCount; } else if (e.data.view) { viewProj = e.data.view; throttledSort(); }
    };
}

const vertexShaderSource = `
#version 300 es
precision highp float; precision highp int;
uniform highp usampler2D u_texture; uniform highp usampler2D u_sh_texture;
uniform mat4 projection, view; uniform vec2 focal; uniform vec2 viewport;
uniform vec3 u_campos; uniform bool u_has_sh;
in vec2 position; in int index; out vec4 vColor; out vec2 vPosition;

const float SH_C1   = 0.4886025119029199;
const float SH_C2_0 = 1.0925484305920792;  const float SH_C2_1 = -1.0925484305920792;
const float SH_C2_2 = 0.31539156525252005; const float SH_C2_3 = -1.0925484305920792; const float SH_C2_4 = 0.5462742152960396;
const float SH_C3_0 = -0.5900435899266435; const float SH_C3_1 = 2.890611442640554;
const float SH_C3_2 = -0.4570457994644658; const float SH_C3_3 = 0.3731763325901154;
const float SH_C3_4 = -0.4570457994644658; const float SH_C3_5 = 1.445305721320277; const float SH_C3_6 = -0.5900435899266435;

// 6 SH texels per gaussian; each texel is RGBA32UI, each uint32 packs 2 half-floats.
// Texels addressed linearly: index*6+t, row-major with width 2048.
vec3 evalSHColor(vec3 dcRGB, vec3 dir) {
    int base = index * 6;
    uvec4 t0 = texelFetch(u_sh_texture, ivec2((base  )%2048,(base  )/2048), 0);
    uvec4 t1 = texelFetch(u_sh_texture, ivec2((base+1)%2048,(base+1)/2048), 0);
    uvec4 t2 = texelFetch(u_sh_texture, ivec2((base+2)%2048,(base+2)/2048), 0);
    uvec4 t3 = texelFetch(u_sh_texture, ivec2((base+3)%2048,(base+3)/2048), 0);
    uvec4 t4 = texelFetch(u_sh_texture, ivec2((base+4)%2048,(base+4)/2048), 0);
    uvec4 t5 = texelFetch(u_sh_texture, ivec2((base+5)%2048,(base+5)/2048), 0);
    // f_rest layout: [t*8+c*2] = c-pair low, [t*8+c*2+1] = c-pair high
    // c00.x=f_rest_0, c00.y=f_rest_1, c01.x=f_rest_2 ... c07.x=f_rest_14(R end)
    // c07.y=f_rest_15(G start) ... c14.y=f_rest_29(G end)
    // c15.x=f_rest_30(B start) ... c22.x=f_rest_44(B end)
    vec2 c00=unpackHalf2x16(t0.x),c01=unpackHalf2x16(t0.y),c02=unpackHalf2x16(t0.z),c03=unpackHalf2x16(t0.w);
    vec2 c04=unpackHalf2x16(t1.x),c05=unpackHalf2x16(t1.y),c06=unpackHalf2x16(t1.z),c07=unpackHalf2x16(t1.w);
    vec2 c08=unpackHalf2x16(t2.x),c09=unpackHalf2x16(t2.y),c10=unpackHalf2x16(t2.z),c11=unpackHalf2x16(t2.w);
    vec2 c12=unpackHalf2x16(t3.x),c13=unpackHalf2x16(t3.y),c14=unpackHalf2x16(t3.z),c15=unpackHalf2x16(t3.w);
    vec2 c16=unpackHalf2x16(t4.x),c17=unpackHalf2x16(t4.y),c18=unpackHalf2x16(t4.z),c19=unpackHalf2x16(t4.w);
    vec2 c20=unpackHalf2x16(t5.x),c21=unpackHalf2x16(t5.y),c22=unpackHalf2x16(t5.z);
    float x=dir.x,y=dir.y,z=dir.z,xx=x*x,yy=y*y,zz=z*z,xy=x*y,xz=x*z,yz=y*z;
    // R channel: f_rest_0..14
    float r=dcRGB.r;
    r += -SH_C1*y*c00.x + SH_C1*z*c00.y - SH_C1*x*c01.x;
    r += SH_C2_0*xy*c01.y + SH_C2_1*yz*c02.x + SH_C2_2*(2.0*zz-xx-yy)*c02.y + SH_C2_3*xz*c03.x + SH_C2_4*(xx-yy)*c03.y;
    r += SH_C3_0*y*(3.0*xx-yy)*c04.x + SH_C3_1*xy*z*c04.y + SH_C3_2*y*(4.0*zz-xx-yy)*c05.x + SH_C3_3*z*(2.0*zz-3.0*xx-3.0*yy)*c05.y + SH_C3_4*x*(4.0*zz-xx-yy)*c06.x + SH_C3_5*z*(xx-yy)*c06.y + SH_C3_6*x*(xx-3.0*yy)*c07.x;
    // G channel: f_rest_15..29
    float g=dcRGB.g;
    g += -SH_C1*y*c07.y + SH_C1*z*c08.x - SH_C1*x*c08.y;
    g += SH_C2_0*xy*c09.x + SH_C2_1*yz*c09.y + SH_C2_2*(2.0*zz-xx-yy)*c10.x + SH_C2_3*xz*c10.y + SH_C2_4*(xx-yy)*c11.x;
    g += SH_C3_0*y*(3.0*xx-yy)*c11.y + SH_C3_1*xy*z*c12.x + SH_C3_2*y*(4.0*zz-xx-yy)*c12.y + SH_C3_3*z*(2.0*zz-3.0*xx-3.0*yy)*c13.x + SH_C3_4*x*(4.0*zz-xx-yy)*c13.y + SH_C3_5*z*(xx-yy)*c14.x + SH_C3_6*x*(xx-3.0*yy)*c14.y;
    // B channel: f_rest_30..44
    float b=dcRGB.b;
    b += -SH_C1*y*c15.x + SH_C1*z*c15.y - SH_C1*x*c16.x;
    b += SH_C2_0*xy*c16.y + SH_C2_1*yz*c17.x + SH_C2_2*(2.0*zz-xx-yy)*c17.y + SH_C2_3*xz*c18.x + SH_C2_4*(xx-yy)*c18.y;
    b += SH_C3_0*y*(3.0*xx-yy)*c19.x + SH_C3_1*xy*z*c19.y + SH_C3_2*y*(4.0*zz-xx-yy)*c20.x + SH_C3_3*z*(2.0*zz-3.0*xx-3.0*yy)*c20.y + SH_C3_4*x*(4.0*zz-xx-yy)*c21.x + SH_C3_5*z*(xx-yy)*c21.y + SH_C3_6*x*(xx-3.0*yy)*c22.x;
    return vec3(r, g, b);
}

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
    vec3 dcRGB = vec3(float((cov.w) & 0xffu), float((cov.w >> 8u) & 0xffu), float((cov.w >> 16u) & 0xffu)) / 255.0;
    float alpha = float((cov.w >> 24u) & 0xffu) / 255.0;
    if (u_has_sh) { vec3 wpos = uintBitsToFloat(cen.xyz); vec3 dir = normalize(wpos - u_campos); dcRGB = clamp(evalSHColor(dcRGB, dir), 0.0, 1.0); }
    vColor = clamp(pos2d.z/pos2d.w+1.0, 0.0, 1.0) * vec4(dcRGB, alpha); vPosition = position;
    vec2 vCenter = vec2(pos2d) / pos2d.w; gl_Position = vec4(vCenter + position.x * majorAxis / viewport + position.y * minorAxis / viewport, 0.0, 1.0);
}`.trim();
const fragmentShaderSource = `#version 300 es\nprecision highp float; in vec4 vColor; in vec2 vPosition; out vec4 fragColor;\nvoid main () { float A = -dot(vPosition, vPosition); if (A < -4.0) discard; float B = exp(A) * vColor.a; fragColor = vec4(B * vColor.rgb, B); }`.trim();

let defaultViewMatrix = [0.73, 0.13, -0.67, 0, 0.1, 0.95, 0.29, 0, 0.67, -0.28, 0.68, 0, -0.02, 0.29, 2.22, 1];
let viewMatrix = defaultViewMatrix;

function posToMatrix(x, y, z) { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -x, -y, -z, 1]; }

const tourDatabase = {
    "EQUINOXREFINE_FINAL": [
        {
            title: "🔍 Vehicle Overview",
            section: "Stop 1 of 3 — Full Exterior",
            description: "Full exterior view of the Chevrolet Equinox EV. This battery-electric vehicle operates on high-voltage DC power (400V+). Before any inspection, confirm the vehicle is in PARK, key fob removed, and 12V auxiliary battery disconnected. Orange-jacketed cables indicate HV circuits — never cut or touch them.",
            highlight: "⚠️ The vehicle can be SILENT and still fully energized. Always assume HV systems are live until formally isolated.",
            warning: null,
            matrix: [0.87,0.11,-0.47,0,0.03,0.96,0.29,0,0.48,-0.27,0.83,0,0.75,0.83,5.19,1]
        },
        {
            title: "⚡ Front Bumper",
            section: "Stop 2 of 3 — Front Fascia",
            description: "The front fascia is a critical area for first responders. The HV battery warning label is located under the center front compartment sight shield on the center of the air inlet grill panel. The 12V auxiliary battery is located in the engine bay — cutting the 12V cable disables both the airbag system and the HV contactors.\n\nHood release: pull the handle on the lower left side of the instrument panel.",
            highlight: "Orange HV cables visible in the engine bay are energized even with the vehicle OFF. Do NOT cut them.",
            warning: "DO NOT CUT ANY ORANGE COLORED HIGH VOLTAGE CABLES.",
            matrix: [0.99,-0.02,-0.12,0,0.02,1,0.01,0,0.12,-0.01,0.99,0,0.49,1.09,4.1,1]
        },
        {
            title: "🔌 Charging Port (CCS1)",
            section: "Stop 3 of 3 — Charging System",
            description: "The Combined Charging System (CCS1) port is located on the driver-side rear quarter panel. It supports AC Level 1/2 and DC Fast Charge up to 150 kW.\n\nAt a crash scene: if the vehicle is connected to a charger, remove the charge handle from the vehicle FIRST before any other action. The common handle disconnects normally; the DC Fast Charge handle is larger and may require additional effort. The vehicle's anti-theft alarm may activate when the charge handle is removed.",
            highlight: "Remove the charge handle FIRST — before cutting any cables or beginning extrication.",
            warning: null,
            matrix: [0.62,0.02,-0.79,0,0.08,0.99,0.09,0,0.78,-0.11,0.61,0,0.63,1.03,3.17,1]
        }
    ]
};

let activeTourFrames = [];
let isTourActive = false; let currentTourIndex = 0; let isTransitioning = false; let transitionProgress = 0;
let startTourMatrix = defaultViewMatrix; let targetTourMatrix = defaultViewMatrix;

async function main() {
    let carousel = true; const params = new URLSearchParams(location.search);
    try { viewMatrix = JSON.parse(decodeURIComponent(location.hash.slice(1))); carousel = false; } catch (err) {}
    
    const EQUINOX_URL = "https://huggingface.co/datasets/AlistairWstbrk/splats/resolve/main/Refined%20vehicle%20scans/EQUINOXREFINE_FINAL.ply";
    const urlParam = params.get("url") || EQUINOX_URL;

    const decodedUrlParam = decodeURIComponent(urlParam);
    const decodedUrlLower = decodedUrlParam.toLowerCase();
    for (let key in tourDatabase) {
        if (decodedUrlLower.includes(key.toLowerCase())) { activeTourFrames = tourDatabase[key]; break; }
    }

    // --- INTEGRATED 3D ANNOTATIONS SYSTEM ---
    const vehicleAnnotations = [
        {
            id: "RF_BatteryWarningLabel",
            position: [0.43, -0.96, -0.86],
            title: "🟡 HV Battery Warning Label",
            description: "This label marks the location of the high voltage battery system. The HV battery is a Class B Li-Ion pack mounted under the vehicle as a structural floor component.\n\nThe HV system operates at 400V+ and may remain energized even when the vehicle is OFF, in PARK, or appears otherwise inactive.\n\nDo not touch, cut, or modify any orange high voltage cables or components. Do not lift the vehicle from any HV battery location — the pack is structural and damage can create a serious hazard.",
            warning: "HV system may be energized even with vehicle OFF. Do NOT cut orange cables.",
            targetUrlSnippet: "EQUINOXREFINE_FINAL"
        },
        {
            id: "RF_12V",
            position: [0.17, -0.93, -0.97],
            title: "🔋 12V Auxiliary Battery",
            description: "The 12V lead-acid auxiliary battery powers conventional vehicle systems and — critically — controls the HV contactors that connect the high voltage battery to the drivetrain.\n\nEmergency procedure:\n1. Double-cut the LV cable on BOTH sides of the yellow tape\n2. Remove the cut section entirely (no loose ends)\n3. Wait 10 seconds — airbag capacitor discharge\n4. Wait 60 seconds — HV system capacitor discharge\n\nThis single cut simultaneously disables the airbag system AND the HV contactors.",
            warning: "NEVER cut the 12V cable during an active 'Battery Danger Detected' thermal runaway event — unless occupant extrication requires airbag disablement.",
            targetUrlSnippet: "EQUINOXREFINE_FINAL"
        },
        {
            id: "RF_ChargePort",
            position: [0.76, -0.82, -0.64],
            title: "🔌 Charging Port (CCS1)",
            description: "The Combined Charging System (CCS1) port is located on the driver-side rear quarter panel. It supports AC Level 1 (120V), Level 2 (240V), and DC Fast Charge up to 150 kW.\n\nAt a crash scene: if the vehicle is connected to a charger, remove the charge handle from the vehicle FIRST before any other action.\n\nThe common J1772 handle disconnects normally. The DC Fast Charge handle is larger and may require additional effort to disconnect. The port locks automatically while charging — never force it.",
            warning: "Disconnecting the charge handle may trigger the vehicle's anti-theft alarm.",
            targetUrlSnippet: "EQUINOXREFINE_FINAL"
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
                <div class="splat-annotation">
                    <div class="close-btn">✖</div>
                    <div class="anno-title">${annoData.title}</div>
                    <div class="anno-details">${annoData.description}</div>
                    ${annoData.warning ? `<div class="anno-warning">⚠️ ${annoData.warning}</div>` : ''}
                </div>
            `;

            let dot = el.querySelector('.anchor-point');
            let box = el.querySelector('.splat-annotation');
            let closeBtn = el.querySelector('.close-btn');

            let isDragging = false;
            let startMouseX = 0, startMouseY = 0;
            const defaultOffsetX = 60; const defaultOffsetY = -90;
            let offsetX = defaultOffsetX; let offsetY = defaultOffsetY;

            dot.onclick = (e) => {
                document.querySelectorAll('.splat-marker').forEach(m => m.classList.remove('active'));
                offsetX = defaultOffsetX; offsetY = defaultOffsetY;
                box.style.left = offsetX + 'px'; box.style.top = offsetY + 'px';
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
            });

            window.addEventListener('mouseup', () => { isDragging = false; });

            box.style.left = offsetX + 'px'; box.style.top = offsetY + 'px';
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
    const u_campos = gl.getUniformLocation(program, "u_campos"); const u_has_sh = gl.getUniformLocation(program, "u_has_sh");
    const triangleVertices = new Float32Array([-2, -2, 2, -2, 2, 2, -2, 2]); const vertexBuffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);
    const a_position = gl.getAttribLocation(program, "position"); gl.enableVertexAttribArray(a_position); gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
    var texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture); var u_textureLocation = gl.getUniformLocation(program, "u_texture"); gl.uniform1i(u_textureLocation, 0);
    // SH texture (unit 1) — initialize with a 1×1 dummy so the sampler is always valid
    var shTexture = gl.createTexture(); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, shTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32UI, 1, 1, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT, new Uint32Array(4));
    gl.uniform1i(gl.getUniformLocation(program, "u_sh_texture"), 1); gl.uniform1i(u_has_sh, 0);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
    const indexBuffer = gl.createBuffer(); const a_index = gl.getAttribLocation(program, "index"); gl.enableVertexAttribArray(a_index); gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer); gl.vertexAttribIPointer(a_index, 1, gl.INT, false, 0, 0); gl.vertexAttribDivisor(a_index, 1);

    // ── Background gradient program ────────────────────────────────────────────
    const bgVS = `#version 300 es\nin vec2 a;\nout vec2 vP;\nvoid main(){vP=a;gl_Position=vec4(a,0.9999,1.);}`.trim();
    const bgFS = `#version 300 es\nprecision highp float;\nin vec2 vP;out vec4 o;\nvoid main(){o=vec4(0.,0.,0.,0.);}`.trim();
    const bgProg = gl.createProgram();
    { const v=gl.createShader(gl.VERTEX_SHADER); gl.shaderSource(v,bgVS); gl.compileShader(v); const f=gl.createShader(gl.FRAGMENT_SHADER); gl.shaderSource(f,bgFS); gl.compileShader(f); gl.attachShader(bgProg,v); gl.attachShader(bgProg,f); gl.linkProgram(bgProg); }
    const bgBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bgBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,1,1,-1,1]), gl.STATIC_DRAW);
    const bg_a = gl.getAttribLocation(bgProg, "a");

    const resize = () => {
        gl.uniform2fv(u_focal, new Float32Array([camera.fx, camera.fy]));
        projectionMatrix = getProjectionMatrix(camera.fx, camera.fy, innerWidth, innerHeight);
        gl.uniform2fv(u_viewport, new Float32Array([innerWidth, innerHeight]));
        gl.canvas.width = Math.round(innerWidth / downsample); gl.canvas.height = Math.round(innerHeight / downsample); gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.uniformMatrix4fv(u_projection, false, projectionMatrix);
    };
    window.addEventListener("resize", resize); resize();

    // --- COORDINATE PICKER (right-click on canvas) ---
    const coordOverlay = document.createElement('div');
    coordOverlay.id = 'coord-overlay';
    coordOverlay.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(10,14,22,0.95);border:1px solid rgba(75,144,255,0.5);border-radius:8px;padding:10px 16px;font-size:0.78rem;color:#C8D8F0;z-index:3000;display:none;font-family:monospace;text-align:center;max-width:420px;';
    document.body.appendChild(coordOverlay);

    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const m = viewMatrix;
        const cx = -(m[0]*m[12]+m[1]*m[13]+m[2]*m[14]);
        const cy = -(m[4]*m[12]+m[5]*m[13]+m[6]*m[14]);
        const cz = -(m[8]*m[12]+m[9]*m[13]+m[10]*m[14]);
        const fmt = v => v.toFixed(3);
        coordOverlay.innerHTML = `📍 Camera position (use as annotation position):<br><strong>[${fmt(cx)}, ${fmt(cy)}, ${fmt(cz)}]</strong><br><span style="color:#8899aa;font-size:0.72rem">Navigate close to component, then right-click to capture coordinates. Click to dismiss.</span>`;
        coordOverlay.style.display = 'block';
    });
    coordOverlay.onclick = () => { coordOverlay.style.display = 'none'; };

    worker.onmessage = (e) => {
        if (e.data.buffer) {
            splatData = new Uint8Array(e.data.buffer);
            if (e.data.save) { const blob = new Blob([splatData.buffer], { type: "application/octet-stream" }); const link = document.createElement("a"); link.download = "model.splat"; link.href = URL.createObjectURL(blob); document.body.appendChild(link); link.click(); }
        } else if (e.data.texdata) {
            const { texdata, texwidth, texheight, shdata, shtexwidth, shtexheight, hasSH: msgHasSH } = e.data;
            gl.bindTexture(gl.TEXTURE_2D, texture); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32UI, texwidth, texheight, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT, texdata); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
            if (msgHasSH && shdata) {
                gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, shTexture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32UI, shtexwidth, shtexheight, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT, shdata);
                gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.uniform1i(u_has_sh, 0); // SH disabled — use DC color only
            } else { gl.uniform1i(u_has_sh, 0); }
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

        gl.clear(gl.COLOR_BUFFER_BIT);

        if (vertexCount > 0) {
            document.getElementById("spinner").style.display = "none";
            // 1. Gaussian splats (composites on black)
            gl.useProgram(program);
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer); gl.vertexAttribIPointer(a_index, 1, gl.INT, false, 0, 0);
            gl.blendFuncSeparate(gl.ONE_MINUS_DST_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE);
            gl.uniformMatrix4fv(u_view, false, actualViewMatrix);
            { const m = actualViewMatrix; gl.uniform3fv(u_campos, new Float32Array([-(m[0]*m[12]+m[1]*m[13]+m[2]*m[14]), -(m[4]*m[12]+m[5]*m[13]+m[6]*m[14]), -(m[8]*m[12]+m[9]*m[13]+m[10]*m[14])])); }
            gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, vertexCount);
        } else {
            document.getElementById("spinner").style.display = ""; start = Date.now() + 2000;
        }

        // 2. Background gradient — drawn last so it only fills transparent/sparse areas
        gl.useProgram(bgProg);
        gl.bindBuffer(gl.ARRAY_BUFFER, bgBuf); gl.enableVertexAttribArray(bg_a); gl.vertexAttribPointer(bg_a, 2, gl.FLOAT, false, 0, 0);
        gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        
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
