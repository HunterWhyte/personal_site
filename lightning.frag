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

float hash21(vec2 x) {
    return fract(cos(mod(dot(x, vec2(13.9898, 8.141)), 3.14)) * 43758.5453);
}

vec2 hash22(vec2 uv) {
    uv = vec2(dot(uv, vec2(127.1,311.7)),
              dot(uv, vec2(269.5,183.3)));
    return 2.0 * fract(sin(uv) * 43758.5453123) - 1.0;
}

float perlinNoise(vec2 uv)
{
    vec2 iuv = floor(uv);
    vec2 fuv = fract(uv);
    vec2 blur = smoothstep(.0, 1., fuv);
    vec2 bl = vec2(.0, .0);
    vec2 br = vec2(1., .0);
    vec2 tl = vec2(.0, 1.);
    vec2 tr = vec2(1., 1.);
    vec2 bln = hash22(iuv + bl);
    vec2 brn = hash22(iuv + br);
    vec2 tln = hash22(iuv + tl);
    vec2 trn = hash22(iuv + tr);
    float b  = mix(dot(bln, fuv - bl), dot(brn, fuv - br), blur.x);
    float t  = mix(dot(tln, fuv - tl), dot(trn, fuv - tr), blur.x);
    float c = mix(b, t, blur.y);
    return c;
}

float fbm(vec2 uv)
{
    float value = .0;
    float ampitude  = .5;
    float freq = 2.;
    for(int i = 0; i < 20; i++)
    {
        value += perlinNoise(uv) * ampitude;
        uv *= freq;
        ampitude *= .5;
    }
    return value;
}


void main()
{
    vec2 uv = (fragCoord - 0.5 * iResolution.xy)/iResolution.y;
    uv.x += 0.35;
    vec3 col = vec3(.0);
    uv += fbm(uv + iTime * .5);
    float dist = abs(uv.x);
    col = vec3(1.2, .2, .3) * mix(.0, .05, hash21(vec2(iTime))) / dist;
    fragColor = vec4(col, 1.0);
}