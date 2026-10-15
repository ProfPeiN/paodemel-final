/* Modelo 3D por malha de revolução. Sem bibliotecas ou recursos externos. */
(() => {
  'use strict';
  const canvas = document.getElementById('chocolate-model');
  const ctx = canvas && canvas.getContext('2d');
  if (!ctx) return;
  const stage = canvas.parentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mesh = [];
  const TAU = Math.PI * 2;
  function tri(a,b,c,color) { mesh.push({v:[a,b,c],color}); }
  function quad(a,b,c,d,color) { tri(a,b,c,color);tri(a,c,d,color); }
  // Profil arrondi : base, flancs, épaule et dessus de la couverture.
  const profile = [[0,-.49],[.80,-.49],[.94,-.46],[1,-.37],[1.01,-.23],[1.005,.12],[.98,.30],[.94,.39],[.86,.45],[.65,.48],[.35,.49],[0,.495]];
  const segments = 100;
  const point = (r,y,t) => {
    const ripple = 1 + .005*Math.sin(5*t)+.003*Math.cos(9*t);
    return [r*Math.cos(t)*ripple,y,r*Math.sin(t)*ripple];
  };
  for(let j=0;j<profile.length-1;j++) {
    for(let i=0;i<segments;i++) {
      const a=i/segments*TAU,b=(i+1)/segments*TAU;
      const [r,y]=profile[j], [r2,y2]=profile[j+1];
      quad(point(r,y,a),point(r2,y2,a),point(r2,y2,b),point(r,y,b),[91,47,29]);
    }
  }
  // Véritables fils en relief, posés sur la face supérieure.
  function tube(points,radius,color) {
    const rings=points.map(p=>Array.from({length:8},(_,k)=>{
      const t=k/8*TAU;return [p[0],p[1]+Math.cos(t)*radius,p[2]+Math.sin(t)*radius];
    }));
    for(let i=0;i<rings.length-1;i++)for(let k=0;k<8;k++)quad(rings[i][k],rings[i+1][k],rings[i+1][(k+1)%8],rings[i][(k+1)%8],color);
  }
  for(const z of [-.54,-.25,.05,.35,.61]) {
    const length=Math.sqrt(.77*.77-z*z);
    const pts=Array.from({length:48},(_,i)=>{
      const x=-length+2*length*i/47;
      return [x,.505-.018*(x*x+z*z),z+.035*Math.sin(x*4)];
    });
    tube(pts,.018,[204,153,94]);
  }
  let yaw=.55, drag=false, lastX=0, lastTime=0, width=0, height=0, visible=true;
  const light=[-.42,.79,.45];
  function rotate(p) {
    const c=Math.cos(yaw),s=Math.sin(yaw),x=p[0]*c+p[2]*s,z=-p[0]*s+p[2]*c;
    const tilt=.38;
    return [x,p[1]*Math.cos(tilt)-z*Math.sin(tilt),z*Math.cos(tilt)+p[1]*Math.sin(tilt)];
  }
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);
  function normal(a,b,c) {
    const u=sub(b,a),v=sub(c,a);
    const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    const l=Math.hypot(...n)||1;return n.map(v=>v/l);
  }
  function ellipse(x,y,rx,ry,fill) {
    ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fillStyle=fill;ctx.fill();
  }
  function draw() {
    if(!width||!height)return;
    ctx.clearRect(0,0,width,height);
    const scale=width*.355,cx=width/2,cy=height*.45;
    const shadow=ctx.createRadialGradient(cx,height*.76,1,cx,height*.76,width*.4);
    shadow.addColorStop(0,'rgba(67,35,20,.28)');shadow.addColorStop(1,'rgba(67,35,20,0)');
    ellipse(cx,height*.76,width*.44,height*.11,shadow);
    // Socle avec tranche, reflet et ombre de contact.
    ellipse(cx,height*.735,width*.41,height*.095,'#ae854d');
    const base=ctx.createLinearGradient(0,height*.64,0,height*.77);
    base.addColorStop(0,'#fff0d1');base.addColorStop(1,'#d6b47e');
    ellipse(cx,height*.713,width*.41,height*.095,base);
    ellipse(cx,height*.70,width*.30,height*.053,'rgba(66,31,15,.22)');
    const faces=mesh.map(face=>{
      const v=face.v.map(rotate);return {...face,v,z:(v[0][2]+v[1][2]+v[2][2])/3};
    }).sort((a,b)=>a.z-b.z);
    for(const face of faces) {
      const n=normal(...face.v);
      // Éclairage à deux faces pour les raccords et les fils décoratifs.
      const diffuse=Math.max(0,n[0]*light[0]+n[1]*light[1]+n[2]*light[2]);
      const spec=Math.pow(Math.max(0,n[0]*-.23+n[1]*.48+n[2]*.85),22)*.36;
      const intensity=.48+diffuse*.72;
      ctx.fillStyle='rgb('+face.color.map(c=>Math.min(255,Math.round(c*intensity+spec*190))).join(',')+')';
      ctx.beginPath();face.v.forEach((v,i)=>{
        const perspective=4.8/(4.8-v[2]);
        const x=cx+v[0]*scale*perspective,y=cy-v[1]*scale*perspective;
        i?ctx.lineTo(x,y):ctx.moveTo(x,y);
      });ctx.closePath();ctx.fill();
      // Un trait de même couleur évite les jointures de sous-pixels.
      ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.45;ctx.stroke();
    }
  }
  function resize() {
    const box=stage.getBoundingClientRect();width=box.width;height=box.height;
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);draw();
  }
  canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(drag){yaw+=(e.clientX-lastX)*.012;lastX=e.clientX;draw();}});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{drag=false;});
  stage.classList.add('model-ready');
  new ResizeObserver(resize).observe(stage);resize();
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}).observe(stage);
  function frame(time) {
    const dt=Math.min((time-lastTime)/1000,.05);lastTime=time;
    if(visible&&!document.hidden&&!drag&&!reduced.matches&&!document.body.classList.contains('motion-paused')) {
      yaw+=dt*.32;draw();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
