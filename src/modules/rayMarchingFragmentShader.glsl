varying vec2 vUv;
uniform vec2 uResolution;
uniform float uVelocityBox;
uniform float uTime;
uniform float uProgress;
uniform float uAngle;
uniform float uDistance;
uniform float uVelocitySphere;

const float PI=3.14159265359;

float movingSphere(vec3 p,float shape){
    float rad=uAngle*PI;
    vec3 pos=vec3(cos(rad),sin(rad),0.)*uDistance;
    vec3 displacement=pos*fract(uTime*uVelocitySphere);
    float gotoCenter=sdSphere(p-displacement,.1);
    return smin(shape,gotoCenter,.3);
}

float smin(float a,float b,float k)
{
    float h=clamp(.5+.5*(b-a)/k,0.,1.);
    return mix(b,a,h)-k*h*(1.-h);
}

vec2 centerUv(vec2 uv){
    uv=2.*uv-1.;
    float aspect=uResolution.x/uResolution.y;
    uv.x*=aspect;
    return uv;
}

vec3 background(vec2 uv) {
    float dist = length(uv - vec2(.5));
    vec3 bg = mix(vec3(.3), vec3(.0), dist);
    return bg;
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.);
}
float sdSphere(vec3 p, float r) {
    return length(p) -r;
}

mat4 rotationMatrix(vec3 axis,float angle){
    axis=normalize(axis);
    float s=sin(angle);
    float c=cos(angle);
    float oc=1.-c;
    
    return mat4(oc*axis.x*axis.x+c,oc*axis.x*axis.y-axis.z*s,oc*axis.z*axis.x+axis.y*s,0.,
        oc*axis.x*axis.y+axis.z*s,oc*axis.y*axis.y+c,oc*axis.y*axis.z-axis.x*s,0.,
        oc*axis.z*axis.x-axis.y*s,oc*axis.y*axis.z+axis.x*s,oc*axis.z*axis.z+c,0.,
    0.,0.,0.,1.);
}

vec3 rotate(vec3 v,vec3 axis,float angle){
    mat4 m=rotationMatrix(axis,angle);
    return(m*vec4(v,1.)).xyz;
}

float sdf(vec3 p){
    vec3 p1=rotate(p,vec3(1.),uTime*uVelocityBox);
    float box=sdBox(p1,vec3(.3));
    float sphere=sdSphere(p,.3);
    float sBox=smin(box,sphere,.3);
    float mixedBox=mix(sBox,box,uProgress);
    return mixedBox;
}



const float EPSILON = .0001;

float rayMarch(vec3 eye, vec3 ray, float end, int maxIter) {
    float depth = 0.;
    for(int i = 0; i < maxIter; i++) {
        vec3 pos = eye + depth * ray;
        float dist = sdf(pos);
        depth += dist;
        if(dist < EPSILON || dist >= end) {
            break;
        }
    }
    return depth;
}

vec3 calcNormal(in vec3 p)
{
    const vec2 h=vec2(EPSILON,0);
    return normalize(vec3(
    sdf(p+h.xyy)-sdf(p-h.xyy),
    sdf(p+h.yxy)-sdf(p-h.yxy),
    sdf(p+h.yyx)-sdf(p-h.yyx))
    );
}

void main() {
    vec3 bg = background(vUv);
    vec3 color = bg;

    vec3 eye = vec3(0., 0., 5);
    vec2 cUv=centerUv(vUv);
    vec3 ray=normalize(vec3(cUv,-eye.z));

    float end = 100.;
    int maxIter = 256;
    float depth = rayMarch(eye, ray, end, maxIter);
    if(depth < end) {
        vec3 pos=eye+depth*ray;
        vec3 normal=calcNormal(pos);
        color=normal;
    }

    gl_FragColor = vec4(color, 1.);
}
