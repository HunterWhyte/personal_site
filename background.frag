precision highp float;

varying vec4 v_color;
varying vec2 v_texcoord;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
#define fragCoord (v_texcoord)*u_resolution

uniform float u_time;

#define iTime u_time
#define fragCoord (v_texcoord)*u_resolution
#define iResolution u_resolution
#define iMouse u_mouse
#define fragColor gl_FragColor

void main()
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    uv.x *= iResolution.x/iResolution.y;
    uv.y -= iMouse.y/iResolution.y*0.1;
    uv.x -= iMouse.x/iResolution.x*0.1;
    vec2 screenuv = uv;
    float mousey = iMouse.y/iResolution.y;
    uv.x += 0.5;
    uv *= 30.;// + 40.*mousey;
    uv.y *= sin(uv.x/20. + iTime*0.35)*0.2 + 0.5;

    // Time varying pixel color
    //vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    vec2 fuv = fract(uv);
    vec2 ssuv = floor(uv + 0.5);
    ssuv.y /= sin(ssuv.x/20. + iTime*0.35)*0.2 + 0.5;
    ssuv /= 30.;// + 40.*mousey;
    ssuv.x -= 0.5;

    float size = 0.0015;
    
    // to get desired center point of the dot we just floor the warped dot and then
    // find the screenspace location of that by undoing our previous calculations
    float f = smoothstep(size + 0.0005, size, distance(screenuv, ssuv));
    vec3 col = vec3(fract(ssuv.x), fract(ssuv.y), 1.);
    col = vec3(f);

    // Output to screen
    fragColor = vec4(col,1.0);
}