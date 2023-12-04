#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0; // picture

vec2 random2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

void main() {
    // Center the metaballs effect
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st = (st - 0.5) * 2.0;  // Map to [-1, 1] range

    // Adjust aspect ratio
    st.x *= u_resolution.x / u_resolution.y;

    // Scale to ensure the entire window is filled
    st *= max(u_resolution.x, u_resolution.y) / min(u_resolution.x, u_resolution.y);

    vec3 color = vec3(.0);

    st = (st - 0.5) * 0.1 + 0.5;
    vec2 pictureSt = st;  // Use 'st' directly without additional adjustments

    // Tile the space
    vec2 i_st = floor(pictureSt);
    vec2 f_st = fract(pictureSt);

    float m_dist = 1.0;  // minimum distance

    // Metaballs computation
    for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            // Neighbor place in the grid
            vec2 neighbor = vec2(float(i), float(j));

            // Random position from current + neighbor place in the grid
            vec2 offset = random2(i_st + neighbor);

            // Animate the offset
            offset = 0.5 + 0.5 * sin(u_time + 6.2831 * offset);

            // Position of the cell
            vec2 pos = neighbor + offset - f_st;

            // Cell distance
            float dist = length(pos);

            // Metaball it!
            m_dist = min(m_dist, m_dist * dist);
        }
    }

    // Scale the texture coordinates before applying
    vec4 texColor = texture2D(u_tex0, pictureSt * vec2(2.0));

    // Draw cells with texture
    color += step(0.060, m_dist) * texColor.rgb;

    gl_FragColor = vec4(color, 1.0);
}
