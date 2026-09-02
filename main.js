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

let defaultViewMatrix = [0.87,0.11,-0.47,0,0.03,0.96,0.29,0,0.48,-0.27,0.83,0,0.75,0.83,5.19,1];
let viewMatrix = defaultViewMatrix;

function posToMatrix(x, y, z) { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -x, -y, -z, 1]; }

const tourDatabase = {
    "EQUINOXREFINE_FINAL": [
        {
            title: "🔍 Vehicle Overview",
            section: "Stop 1 of 4 — Full Exterior",
            description: "Full exterior view of the Chevrolet Equinox EV. This battery-electric vehicle operates on high-voltage DC power (400V+). Before any inspection, confirm the vehicle is in PARK, key fob removed, and 12V auxiliary battery disconnected. Orange-jacketed cables indicate HV circuits — never cut or touch them.",
            highlight: "⚠️ The vehicle can be SILENT and still fully energized. Always assume HV systems are live until formally isolated.",
            warning: null,
            matrix: [0.87,0.11,-0.47,0,0.03,0.96,0.29,0,0.48,-0.27,0.83,0,0.75,0.83,5.19,1]
        },
        {
            title: "⚡ Front Bumper",
            section: "Stop 2 of 4 — Front Fascia",
            description: "The front fascia is a critical area for first responders. The HV battery warning label is located under the center front compartment sight shield on the center of the air inlet grill panel. The 12V auxiliary battery is located in the engine bay — cutting the 12V cable disables both the airbag system and the HV contactors.\n\nHood release: pull the handle on the lower left side of the instrument panel.",
            highlight: "Orange HV cables visible in the engine bay are energized even with the vehicle OFF. Do NOT cut them.",
            warning: "DO NOT CUT ANY ORANGE COLORED HIGH VOLTAGE CABLES.",
            matrix: [0.99,-0.02,-0.12,0,0.02,1,0.01,0,0.12,-0.01,0.99,0,0.49,1.09,4.1,1]
        },
        {
            title: "🔧 Engine Bay",
            section: "Stop 3 of 4 — Under the Hood",
            description: "The engine bay of the Equinox EV houses the electric drive unit, power electronics, and the 12V auxiliary battery. The HV battery warning label is visible on the underside of the hood.\n\nKey hazards in this area:\n• Orange HV cables routed through the bay — never cut or modify\n• The 12V auxiliary battery (yellow tape marking) — double-cut both sides of tape to disable HV contactors\n• High-voltage inverter and onboard charger modules",
            highlight: "The 12V cable marked with yellow tape is your primary disconnect. Double-cut both sides of the tape — wait 10 sec (airbags) then 60 sec (HV discharge) before touching HV components.",
            warning: "DO NOT CUT ANY ORANGE COLORED HIGH VOLTAGE CABLES.",
            matrix: [1,0,-0.08,0,0.03,0.93,0.37,0,0.08,-0.37,0.93,0,0.24,0.42,2.59,1]
        },
        {
            title: "🔌 Charging Port (CCS1)",
            section: "Stop 4 of 4 — Charging System",
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
            image: "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",
            title: "🟡 HV Battery Warning Label",
            description: "This label marks the location of the high voltage battery system. The HV battery is a Class B Li-Ion pack mounted under the vehicle as a structural floor component.\n\nThe HV system operates at 400V+ and may remain energized even when the vehicle is OFF, in PARK, or appears otherwise inactive.\n\nDo not touch, cut, or modify any orange high voltage cables or components. Do not lift the vehicle from any HV battery location — the pack is structural and damage can create a serious hazard.",
            warning: "HV system may be energized even with vehicle OFF. Do NOT cut orange cables.",
            targetUrlSnippet: "EQUINOXREFINE_FINAL"
        },
        {
            id: "RF_12V",
            position: [0.17, -0.93, -0.97],
            image: "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",
            title: "🔋 12V Auxiliary Battery",
            description: "The 12V lead-acid auxiliary battery powers conventional vehicle systems and — critically — controls the HV contactors that connect the high voltage battery to the drivetrain.\n\nEmergency procedure:\n1. Double-cut the LV cable on BOTH sides of the yellow tape\n2. Remove the cut section entirely (no loose ends)\n3. Wait 10 seconds — airbag capacitor discharge\n4. Wait 60 seconds — HV system capacitor discharge\n\nThis single cut simultaneously disables the airbag system AND the HV contactors.",
            warning: "NEVER cut the 12V cable during an active 'Battery Danger Detected' thermal runaway event — unless occupant extrication requires airbag disablement.",
            targetUrlSnippet: "EQUINOXREFINE_FINAL"
        },
        {
            id: "RF_ChargePort",
            position: [0.76, -0.82, -0.64],
            image: "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",
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
                    ${annoData.image ? '<img class="anno-image" alt="">' : ''}
                    <div class="anno-body">
                        <div class="anno-title">${annoData.title}</div>
                        <div class="anno-details">${annoData.description}</div>
                        ${annoData.warning ? `<div class="anno-warning">⚠️ ${annoData.warning}</div>` : ''}
                    </div>
                </div>
            `;
            if (annoData.image) {
                el.querySelector('.anno-image').src = 'data:image/jpeg;base64,' + annoData.image;
            }

            let dot = el.querySelector('.anchor-point');
            let box = el.querySelector('.splat-annotation');
            let closeBtn = el.querySelector('.close-btn');

            let isDragging = false;
            let startMouseX = 0, startMouseY = 0;
            const defaultOffsetX = 18; const defaultOffsetY = -270;
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

    canvas.addEventListener('contextmenu', (e) => { e.preventDefault(); });

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
    window.addEventListener("keyup", (e) => { activeKeys = activeKeys.filter((k) => k !== e.code); });
    window.addEventListener("blur", () => { activeKeys = []; });

    window.addEventListener("wheel", (e) => {
        e.preventDefault();
        if (!isDevMode || isTourActive) return;
        carousel = false;
        const scale = e.deltaMode == 1 ? 10 : e.deltaMode == 2 ? innerHeight : 1;
        let inv = invert4(viewMatrix);
        if (e.shiftKey) { inv = translate4(inv, (e.deltaX * scale) / innerWidth, (e.deltaY * scale) / innerHeight, 0); }
        else if (e.ctrlKey || e.metaKey) { inv = translate4(inv, 0, 0, (-10 * (e.deltaY * scale)) / innerHeight); }
        else { let d = 4; inv = translate4(inv, 0, 0, d); inv = rotate4(inv, -(e.deltaX * scale) / innerWidth, 0, 1, 0); inv = rotate4(inv, (e.deltaY * scale) / innerHeight, 1, 0, 0); inv = translate4(inv, 0, 0, -d); }
        viewMatrix = invert4(inv);
    }, { passive: false });

    let startX, startY, down;
    canvas.addEventListener("mousedown", (e) => {
        e.preventDefault();
        if (!isDevMode || isTourActive) return;
        carousel = false; startX = e.clientX; startY = e.clientY;
        down = e.ctrlKey || e.metaKey ? 2 : 1;
    });
    canvas.addEventListener("mousemove", (e) => {
        e.preventDefault();
        if (!isDevMode || isTourActive || !down) return;
        if (down == 1) { let inv = invert4(viewMatrix); let dx = (5 * (e.clientX - startX)) / innerWidth; let dy = (5 * (e.clientY - startY)) / innerHeight; let d = 4; inv = translate4(inv, 0, 0, d); inv = rotate4(inv, dx, 0, 1, 0); inv = rotate4(inv, -dy, 1, 0, 0); inv = translate4(inv, 0, 0, -d); viewMatrix = invert4(inv); startX = e.clientX; startY = e.clientY; }
        else if (down == 2) { let inv = invert4(viewMatrix); inv = translate4(inv, (-10 * (e.clientX - startX)) / innerWidth, 0, (10 * (e.clientY - startY)) / innerHeight); viewMatrix = invert4(inv); startX = e.clientX; startY = e.clientY; }
    });
    canvas.addEventListener("mouseup", (e) => { e.preventDefault(); down = false; startX = 0; startY = 0; });

    let altX = 0, altY = 0;
    canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        if (!isDevMode || isTourActive) return;
        carousel = false;
        if (e.touches.length === 1) { startX = e.touches[0].clientX; startY = e.touches[0].clientY; down = 1; }
        else if (e.touches.length === 2) { startX = e.touches[0].clientX; altX = e.touches[1].clientX; startY = e.touches[0].clientY; altY = e.touches[1].clientY; down = 1; }
    }, { passive: false });
    canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        if (!isDevMode || isTourActive) return;
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

    document.getElementById('startTourBtn').addEventListener('click', () => {
        document.getElementById('tour-container').style.display = 'block';
        isTourActive = true;
        updateTourUI();
        goToTourFrame(0);
        // collapse sidebar while tour is active
        if (typeof sidebarOpen !== 'undefined' && sidebarOpen) toggleSidebar();
    });
    document.getElementById('closeTourBtn').addEventListener('click', () => {
        document.getElementById('tour-container').style.display = 'none';
        isTourActive = false;
        // reopen sidebar when tour is dismissed
        if (typeof sidebarOpen !== 'undefined' && !sidebarOpen) toggleSidebar();
    });
    document.getElementById('tour-prev').addEventListener('click', () => { isTransitioning = false; goToTourFrame(currentTourIndex - 1); });
    document.getElementById('tour-next').addEventListener('click', () => {
        const isLast = currentTourIndex >= activeTourFrames.length - 1;
        if (isLast) {
            document.getElementById('tour-container').style.display = 'none';
            isTourActive = false;
            if (typeof sidebarOpen !== 'undefined' && !sidebarOpen) toggleSidebar();
        } else {
            isTransitioning = false;
            goToTourFrame(currentTourIndex + 1);
        }
    });

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
