precision mediump float;

varying vec4 v_color;
varying vec2 v_texcoord;
uniform vec2 u_resolution;
#define fragCoord (v_texcoord)*u_resolution

uniform float u_time;

void main( ){
    vec3 c;
    float l,z=u_time;
    for(int i=0;i<3;i++) {
        vec2 uv, p=(v_texcoord + 0.0);
        uv=p;
        p.x*=u_resolution.x/u_resolution.y;
        z+=.07;
        l=length(p);
        uv+=p/l*(sin(z)+1.)*abs(sin(l*9.-z-z));
        c[i]=.01/length(mod(uv, 1.)-.5);
    }
    vec4 color = vec4(c/l,u_time);
    gl_FragColor= clamp(color, vec4(0.0), vec4(0.9));
}