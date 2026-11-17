// The narrator: a glossy, liquid sphere that swells and ripples with the voice.
// WebGL fragment shader; falls back to a CSS blob when WebGL is unavailable.

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uT;
uniform float uAmp;

vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
    i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
    i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y) * 2.0;
  float ang = atan(p.y, p.x);
  vec2 c = vec2(cos(ang), sin(ang));

  // Silhouette: a circle whose edge breathes, more so when the voice is loud.
  float wob = snoise(vec3(c * 0.9, uT * 0.5)) * (0.022 + 0.060 * uAmp)
            + snoise(vec3(c * 1.9 + 4.0, uT * 0.8)) * (0.006 + 0.022 * uAmp);
  float R = 0.60 + 0.06 * uAmp + wob;
  float d = length(p) / R;
  float alpha = smoothstep(1.0, 0.975, d);
  if (alpha <= 0.0) { gl_FragColor = vec4(0.0); return; }

  float z = sqrt(max(0.0, 1.0 - d * d));
  vec3 n = normalize(vec3(p / R, z));

  // Slow marbled currents across the surface.
  vec3 q = n * 0.72 + vec3(0.0, uT * 0.07, uT * 0.16);
  float warp = snoise(q * 0.9 + vec3(uT * 0.12));
  float f = snoise(q + warp * 0.55);
  float bands = smoothstep(-0.25, 0.55, f);

  vec3 bump = vec3(snoise(q * 1.3 + 1.7), snoise(q * 1.3 + 9.2), 0.0);
  n = normalize(n + bump * (0.07 + 0.10 * uAmp));

  vec3 deep = vec3(0.000, 0.120, 0.470);
  vec3 mid = vec3(0.020, 0.340, 0.830);
  vec3 light = vec3(0.640, 0.810, 1.000);
  vec3 base = mix(deep, mid, bands);
  base = mix(base, light, smoothstep(0.42, 0.95, f) * 0.72);

  vec3 L = normalize(vec3(-0.45, 0.62, 0.72));
  float diff = clamp(dot(n, L), 0.0, 1.0);
  vec3 col = base * (0.52 + 0.80 * diff);

  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  col += vec3(1.0) * pow(max(dot(n, H), 0.0), 70.0) * 0.95;
  col += light * pow(max(dot(n, normalize(vec3(0.5, -0.6, 0.6))), 0.0), 14.0) * 0.16;

  float fres = pow(1.0 - z, 2.6);
  col = mix(col, vec3(0.80, 0.90, 1.0), fres * 0.50);
  col *= 1.0 - 0.28 * smoothstep(0.2, -0.9, p.y / R) * (1.0 - fres);

  gl_FragColor = vec4(col * alpha, alpha);
}`;

export function createOrb(canvas) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: true });
  let amp = 0;
  let target = 0;
  let running = false;
  let frame = 0;

  if (!gl) {
    canvas.classList.add("orb-fallback");
    return {
      setAmp(value) {
        canvas.style.setProperty("--amp", String(value));
      },
      start() {},
      stop() {},
    };
  }

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  };

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const location = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(program, "uRes");
  const uT = gl.getUniformLocation(program, "uT");
  const uAmp = gl.getUniformLocation(program, "uAmp");
  const started = performance.now();

  const draw = () => {
    if (!running) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = Math.round(canvas.clientWidth * dpr) || 2;
    if (canvas.width !== size) {
      canvas.width = size;
      canvas.height = size;
    }
    amp += (target - amp) * 0.18;
    gl.viewport(0, 0, size, size);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uRes, size, size);
    gl.uniform1f(uT, (performance.now() - started) / 1000);
    gl.uniform1f(uAmp, amp);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    frame = requestAnimationFrame(draw);
  };

  return {
    setAmp(value) {
      target = Math.max(0, Math.min(1, value));
    },
    start() {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(draw);
    },
    stop() {
      running = false;
      cancelAnimationFrame(frame);
    },
  };
}
