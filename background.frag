precision mediump float;

varying vec4 v_color;
varying vec2 v_texcoord;
uniform vec2 u_resolution;
#define fragCoord (v_texcoord)*u_resolution

uniform float u_time;

#define iTime u_time
#define fragCoord (v_texcoord)*u_resolution
#define iResolution u_resolution
#define fragColor gl_FragColor

#define TWO_PI 6.283185

vec3 hsb2rgb(vec3 c){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}


vec2 hash22(vec2 p)
{
    p = p*mat2(127.1,311.7,269.5,183.3);
	p = -1.0 + 2.0 * fract(sin(p)*43758.5453123);
	return sin(p*6.283 + iTime);
}

float perlin_noise(vec2 p)
{
	vec2 pi = floor(p);
    vec2 pf = p-pi;

    vec2 w = pf*pf*(3.-2.*pf);

    float f00 = dot(hash22(pi+vec2(.0,.0)),pf-vec2(.0,.0));
    float f01 = dot(hash22(pi+vec2(.0,1.)),pf-vec2(.0,1.));
    float f10 = dot(hash22(pi+vec2(1.0,0.)),pf-vec2(1.0,0.));
    float f11 = dot(hash22(pi+vec2(1.0,1.)),pf-vec2(1.0,1.));

    float xm1 = mix(f00,f10,w.x);
    float xm2 = mix(f01,f11,w.x);

    float ym = mix(xm1,xm2,w.y);
    return ym;

}

float noise_sum(vec2 p){
    p *= 4.;
	float a = 1., r = 0., s=0.;

    for (int i=0; i<5; i++) {
      r += a*perlin_noise(p); s+= a; p *= 2.; a*=.5;
    }

    return r/s;
}

float noise(vec2 p){
    return noise_sum(p);
}

float circle(vec2 uv, vec2 center, float size, float blur){
    float dist = distance(uv, center);
    float mask = smoothstep(size+blur, size-blur, dist);
    return mask;
}

mat2 rotate(float angle){
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void main()
{
    vec2 uv = fragCoord.xy / iResolution.xy; // 0 <> 1
    uv.y = 1. - uv.y;

    float level = 1.;
    float t = iTime*2.;
    uv.y -= 1.;
    uv.x *= -1.;
    uv.x *= iResolution.x/iResolution.y;
    // vec3 h = hsb2rgb(vec3(0.8+sin(t*0.1)*0.25,1.,1.));
    vec3 h = hsb2rgb(vec3(1.*0.2 + sin(u_time)*0.035,1.,1.));

    vec2 p = vec2(1., 0.35  - 1.); // pos of circle+ sin(t*0.1)*0.04
    float size = 0.2 + 0.025*level;// size of circle
    vec3 color = vec3(0);

    float f = noise(uv+vec2((0), (t*0.05))); // -1 <> 1
    f = f*0.5+0.5; // 0 <> 1

    // light from orb
    float l = 1. - 1./distance(uv, p)*distance(uv, p)*distance(uv, p);
    l = clamp(l, 0., 1.);
    l *= l*l*l*(1. + (sin(t*0.5)*0.25));
    color += vec3(l*0.5);

    float star = fract(f*50.) > 0.925 ? 0.2 : 0.;
    star *= 0.5 + (uv.y + 0.5)*(uv.y + 0.5)*0.5;
    star *= 0.75 + level*0.5;
    color += star;
    color = color*h;

    vec2 pos = vec2(p)-uv;
    float r = length(pos)*2.0;
    float angle = 1.5725 + cos(r*10. + t)*(sin(t*0.1)*0.05); // modulate angle by radius for wavy beams
    pos *= rotate(angle);
    float a = atan(pos.y, pos.x);// + TWO_PI/2.;
    // outer ring glow
    // map symmetrically onto circle
    float a2 = abs(a*1.3/TWO_PI);
    float fft =  1.;
    float or_g = sin(a*(sin(t*0.05)*0.5 + 1.)*50.)*0.5 + 0.5;
    or_g *= (fft)*0.4;
    float outer_ring_mask = circle(uv, p, or_g, 0.25);
    outer_ring_mask *= smoothstep(-0.2, 0.1, uv.y);

    vec3 or_g_col = mix(h, vec3(1.,0.,5.), or_g*0.05);

    color = mix(color, or_g_col, outer_ring_mask);

    // float t2 = (sin(t*0.1)*0.5 + 0.5);

    // vec3 fog_col = vec3(1. - 0.5*t2, 0.6 - 0.4*t2, 0.4 + 0.2*t2);
    // fog_col = mix(fog_col, vec3(0.6, 0.2, 0.2), 1.);
    // // draw beam
    // float beam_strength = 17.5;
    // float fog_width = 0.1 + 0.025*level;
    // float b = clamp(fog_width - abs(uv.y + 0.5)*abs(uv.x*10.), 0.0, 0.5);
    // b *= beam_strength;
    // b *= f;
    //float b_mask = clamp(b*15., 0., 1.);
    // color = mix(color, fog_col*b, b);

    float circle_mask = circle(uv, p, size, 0.004);
    color = mix(color, vec3(0.), circle_mask);
    // f *= (0.3 - uv.y)*(0.5 - uv.y)*(0.5 - uv.y);
    // f *= 0.4 + 0.5*level*(abs(uv.x*2.*uv.x*2.));
    // color += fog_col*f;

	fragColor = vec4(color,1.0-circle_mask);

}
