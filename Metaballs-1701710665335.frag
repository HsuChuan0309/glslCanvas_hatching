#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;
uniform sampler2D u_tex1;
uniform sampler2D u_tex2;
uniform sampler2D u_tex3;
uniform sampler2D u_tex4;
uniform sampler2D u_tex5;
uniform sampler2D u_tex6;

vec2 random2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 vUv = fract(6.0 * uv);  // key
    float shading = texture2D(u_tex0, uv).g;  // 取MonaLisa綠色版作為明亮值
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st = (st - 0.5) * 2.0;  // Map to [-1, 1] range

    // Adjust aspect ratio
    st.x *= u_resolution.x / u_resolution.y;

    // Scale to ensure the entire window is filled
    st *= max(u_resolution.x, u_resolution.y) / min(u_resolution.x, u_resolution.y);

    vec3 color = vec3(.0);

    // Scale and center the picture
    vec2 pictureSt = st * 2.0 - vec2(1.0);  // Adjust scaling and centering

    // Add mouse interaction
    vec2 mouseDist = abs(u_mouse - pictureSt);
    float mouseEffect = smoothstep(0.1, 0.2, 0.5 - length(mouseDist));

    // Tile the space
    vec2 i_st = floor(pictureSt);
    vec2 f_st = fract(pictureSt + 0.1 * sin(u_time));

    float m_dist = 1.0;  // minimum distance

    // Metaballs computation
    for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            vec2 neighbor = vec2(float(i), float(j));
            vec2 offset = random2(i_st + neighbor);
            offset = 0.5 + 0.5 * sin(u_time + 6.2831 * offset);
            vec2 pos = neighbor + offset - f_st;
            float dist = length(pos);
            m_dist = min(m_dist, m_dist * dist);
        }
    }

    // Apply the texture
    vec4 texColor = texture2D(u_tex0, pictureSt * 0.5 + 0.5 + mouseEffect * 0.1);  // Adjust texture coordinates

    // Draw cells with texture
    color += step(0.060, m_dist) * texColor.rgb;

    // Additional effect code (you can replace this with your second effect)
    vec4 c;
    float step = 1. / 6.;
    if (shading <= step) {
        c = mix(texture2D(u_tex6, vUv), texture2D(u_tex5, vUv), 6. * shading);
    }
    if (shading > step && shading <= 2. * step) {
        c = mix(texture2D(u_tex5, vUv), texture2D(u_tex4, vUv), 6. * (shading - step));
    }
    if (shading > 2. * step && shading <= 3. * step) {
        c = mix(texture2D(u_tex4, vUv), texture2D(u_tex3, vUv), 6. * (shading - 2. * step));
    }
    if (shading > 3. * step && shading <= 4. * step) {
        c = mix(texture2D(u_tex3, vUv), texture2D(u_tex2, vUv), 6. * (shading - 3. * step));
    }
    if (shading > 4. * step && shading <= 5. * step) {
        c = mix(texture2D(u_tex2, vUv), texture2D(u_tex1, vUv), 6. * (shading - 4. * step));
    }
    if (shading > 5. * step) {
        c = mix(texture2D(u_tex1, vUv), vec4(1.), 6. * (shading - 5. * step));
    }

    vec4 inkColor = vec4(0.0, 0.0, 1.0, 1.0);
    vec4 src = mix(mix(inkColor, vec4(1.), c.r), c, .5);

    src.rgb += color;

    gl_FragColor = src;
}
