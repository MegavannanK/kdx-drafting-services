(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,56794,e=>{"use strict";var r=e.i(43476),t=e.i(75056),s=e.i(95393),i=e.i(90874);function a(){return(a=Object.assign.bind()).apply(null,arguments)}var n=e.i(71645),o=e.i(90072);let l={uniforms:{tDiffuse:{value:null},h:{value:1/512}},vertexShader:`
      varying vec2 vUv;

      void main() {

        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

      }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float h;

    varying vec2 vUv;

    void main() {

    	vec4 sum = vec4( 0.0 );

    	sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;
    	sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;
    	sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;
    	sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;
    	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;

    	gl_FragColor = sum;

    }
  `},u={uniforms:{tDiffuse:{value:null},v:{value:1/512}},vertexShader:`
    varying vec2 vUv;

    void main() {

      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }
  `,fragmentShader:`

  uniform sampler2D tDiffuse;
  uniform float v;

  varying vec2 vUv;

  void main() {

    vec4 sum = vec4( 0.0 );

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;

    gl_FragColor = sum;

  }
  `},c=n.forwardRef(({scale:e=10,frames:r=1/0,opacity:t=1,width:c=1,height:v=1,blur:d=1,near:f=0,far:h=10,resolution:m=512,smooth:p=!0,color:x="#000000",depthWrite:g=!1,renderOrder:j,...y},b)=>{let w,D,U=n.useRef(null),M=(0,i.f)(e=>e.scene),S=(0,i.f)(e=>e.gl),R=n.useRef(null);c*=Array.isArray(e)?e[0]:e||1,v*=Array.isArray(e)?e[1]:e||1;let[E,C,P,B,T,k,A]=n.useMemo(()=>{let e=new o.qL(m,m),r=new o.qL(m,m);r.texture.generateMipmaps=e.texture.generateMipmaps=!1;let t=new o.CQ(c,v).rotateX(Math.PI/2),s=new o.kE(t),i=new o.QQ;i.depthTest=i.depthWrite=!1,i.onBeforeCompile=e=>{e.uniforms={...e.uniforms,ucolor:{value:new o.Es(x)}},e.fragmentShader=e.fragmentShader.replace("void main() {",`uniform vec3 ucolor;
           void main() {
          `),e.fragmentShader=e.fragmentShader.replace("vec4( vec3( 1.0 - fragCoordZ ), opacity );","vec4( ucolor * fragCoordZ * 2.0, ( 1.0 - fragCoordZ ) * 1.0 );")};let a=new o.Zg(l),n=new o.Zg(u);return n.depthTest=a.depthTest=!1,[e,t,i,s,a,n,r]},[m,c,v,e,x]),G=e=>{B.visible=!0,B.material=T,T.uniforms.tDiffuse.value=E.texture,T.uniforms.h.value=e/256,S.setRenderTarget(A),S.render(B,R.current),B.material=k,k.uniforms.tDiffuse.value=A.texture,k.uniforms.v.value=e/256,S.setRenderTarget(E),S.render(B,R.current),B.visible=!1},L=0;return(0,s.f)(()=>{R.current&&(1/0===r||L<r)&&(L++,w=M.background,D=M.overrideMaterial,U.current.visible=!1,M.background=null,M.overrideMaterial=P,S.setRenderTarget(E),S.render(M,R.current),G(d),p&&G(.4*d),S.setRenderTarget(null),U.current.visible=!0,M.overrideMaterial=D,M.background=w)}),n.useImperativeHandle(b,()=>U.current,[]),n.createElement("group",a({"rotation-x":Math.PI/2},y,{ref:U}),n.createElement("mesh",{renderOrder:j,geometry:C,scale:[1,-1,1],rotation:[-Math.PI/2,0,0]},n.createElement("meshBasicMaterial",{transparent:!0,map:E.texture,opacity:t,depthWrite:g})),n.createElement("orthographicCamera",{ref:R,args:[-c/2,c/2,v/2,-v/2,f,h]}))});var v=n,d=Object.defineProperty;Math.PI/180;function f({start:e,end:t,color:s="#bfc4c3",width:i=.17,depth:a=.28,wireframe:l}){let{position:u,quaternion:c,length:v}=(0,n.useMemo)(()=>{let r=new o.cE(...e),s=new o.cE(...t),i=s.clone().sub(r);return{position:r.add(s).multiplyScalar(.5),quaternion:new o.as().setFromUnitVectors(new o.cE(0,1,0),i.clone().normalize()),length:i.length()}},[e,t]);return(0,r.jsxs)("group",{position:u,quaternion:c,children:[[-1,1].map(e=>(0,r.jsxs)("mesh",{castShadow:!0,receiveShadow:!0,position:[0,0,e*(a/2-.025)],children:[(0,r.jsx)("boxGeometry",{args:[i,v,.045]}),(0,r.jsx)("meshStandardMaterial",{color:s,metalness:.48,roughness:.42,wireframe:l})]},e)),(0,r.jsxs)("mesh",{castShadow:!0,receiveShadow:!0,children:[(0,r.jsx)("boxGeometry",{args:[.045,v,a]}),(0,r.jsx)("meshStandardMaterial",{color:s,metalness:.48,roughness:.42,wireframe:l})]})]})}n.Component;let h=(e,r,t)=>o.rB.smoothstep(e,r,t);function m(e){return[{start:[-2.6,0,e],end:[-2.6,3.1,e],color:"#bbc7bd",width:.2,depth:.26},{start:[2.6,0,e],end:[2.6,3.1,e],color:"#bbc7bd",width:.2,depth:.26},{start:[-2.6,3.1,e],end:[0,4.15,e],color:"#e47941",width:.19,depth:.27},{start:[0,4.15,e],end:[2.6,3.1,e],color:"#e47941",width:.19,depth:.27}]}function p({progress:e,reduced:t}){let i=(0,v.useRef)(null),a=(0,v.useRef)(null);return(0,s.f)((r,s)=>{let n=1.2*(1-h(e.current,.54,.72));i.current&&(i.current.position.x=t?n:o.rB.damp(i.current.position.x,n,7,s)),a.current&&(a.current.position.x=t?1.5*n:o.rB.damp(a.current.position.x,1.5*n,7,s))}),(0,r.jsxs)("group",{rotation:[0,-.25,0],children:[(0,r.jsx)(f,{start:[-1.25,-2.2,0],end:[-1.25,2.4,0],width:1,depth:1.15,color:"#a9bbb1",wireframe:!1}),(0,r.jsxs)("group",{ref:i,children:[(0,r.jsx)(f,{start:[-.73,.05,0],end:[2.9,.05,0],width:.7,depth:1,color:"#e87538",wireframe:!1}),(0,r.jsxs)("mesh",{castShadow:!0,position:[-.71,.05,0],children:[(0,r.jsx)("boxGeometry",{args:[.15,1.5,1.2]}),(0,r.jsx)("meshStandardMaterial",{color:"#849d91",metalness:.7,roughness:.35})]})]}),(0,r.jsx)("group",{ref:a,children:[-.48,0,.48].flatMap(e=>[-.4,.4].map(t=>(0,r.jsxs)("group",{position:[-.55,e+.05,t],rotation:[0,0,Math.PI/2],children:[(0,r.jsxs)("mesh",{castShadow:!0,children:[(0,r.jsx)("cylinderGeometry",{args:[.07,.07,.5,12]}),(0,r.jsx)("meshStandardMaterial",{color:"#d0d6d1",metalness:.75,roughness:.28})]}),(0,r.jsxs)("mesh",{castShadow:!0,position:[0,-.3,0],children:[(0,r.jsx)("cylinderGeometry",{args:[.14,.14,.11,6]}),(0,r.jsx)("meshStandardMaterial",{color:"#dbe2d9",metalness:.65,roughness:.3})]}),(0,r.jsxs)("mesh",{position:[0,-.22,0],children:[(0,r.jsx)("cylinderGeometry",{args:[.16,.16,.035,24]}),(0,r.jsx)("meshStandardMaterial",{color:"#8b9f94",metalness:.7,roughness:.3})]})]},`${e}-${t}`)))})]})}function x({progress:e,reduced:t}){let a=(0,v.useRef)(null),n=(0,v.useRef)(null),l=(0,v.useRef)([]),u=(0,v.useRef)(null),d=(0,v.useRef)(null),{camera:g,size:j}=(0,i.f)(),y=(0,v.useRef)({p:0}),b=(0,v.useMemo)(()=>{let e=[-4,-2,0,2,4],r=e.map(m),t=[];for(let e of[-2.6,2.6])for(let r of[1,2.1,3.1])t.push({start:[e,r,-4],end:[e,r,4],color:"#6d8b7b",width:.08,depth:.12});for(let e of[-1.95,-1.3,-.65,0,.65,1.3,1.95]){let r=4.15-Math.abs(e)/2.6*1.05;t.push({start:[e,r,-4],end:[e,r,4],color:"#b9c5b8",width:.07,depth:.11})}for(let e of[-2.6,2.6])t.push({start:[e,0,-4],end:[e,3.1,-2],color:"#779a88",width:.06,depth:.06}),t.push({start:[e,3.1,-4],end:[e,0,-2],color:"#779a88",width:.06,depth:.06});let s=[...r.flat(),...t].flatMap(e=>[...e.start,...e.end]),i=new o.ld;return i.setAttribute("position",new o.ki(s,3)),{primary:r,extras:t,geometry:i,zs:e}},[]);return(0,v.useEffect)(()=>()=>b.geometry.dispose(),[b]),(0,s.f)((r,s)=>{y.current.p=t?e.current:o.rB.damp(y.current.p,e.current,7,s);let i=y.current.p,c=h(i,.45,.52)*(1-h(i,.74,.82));if(a.current&&(a.current.position.set(-(13*c),-2.15,0),a.current.scale.setScalar(1-.28*c),a.current.visible=c<.999),d.current&&(d.current.position.set((1-c)*13,0,0),d.current.visible=c>.001,d.current.scale.setScalar(.95+.08*c)),n.current&&(n.current.scale.y=.02+.98*h(i,.06,.23),n.current.visible=i<.47),l.current.forEach((e,r)=>{if(!e)return;let t=h(i,.16+.028*r,.29+.028*r);e.position.y=(1-t)*(3+.45*r),e.scale.y=Math.max(.001,t),e.visible=t>.005}),u.current){let e=h(i,.31,.44);u.current.scale.setScalar(Math.max(.001,e)),u.current.visible=e>.005}let v=.7+.48*i,f=1-h(i,0,.23);g.position.set(14*Math.sin(v),8+12*f,14*Math.cos(v)),g.lookAt(0,0,0),g instanceof o.Sc&&(g.zoom=Math.min(j.width/13.5,j.height/11.2,65)*(1+.26*c),g.updateProjectionMatrix())}),(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("group",{ref:a,position:[0,-2.15,0],children:[(0,r.jsx)("group",{ref:n,children:(0,r.jsx)("lineSegments",{geometry:b.geometry,children:(0,r.jsx)("lineBasicMaterial",{color:"#94c7b1",transparent:!0,opacity:.72})})}),b.primary.map((e,t)=>(0,r.jsxs)("group",{ref:e=>{l.current[t]=e},children:[e.map((e,t)=>(0,r.jsx)(f,{...e,wireframe:!1},t)),[-2.6,2.6].map(e=>(0,r.jsxs)("mesh",{position:[e,-.08,b.zs[t]],receiveShadow:!0,children:[(0,r.jsx)("boxGeometry",{args:[.5,.16,.5]}),(0,r.jsx)("meshStandardMaterial",{color:"#527465",roughness:.8})]},e))]},t)),(0,r.jsx)("group",{ref:u,children:b.extras.map((e,t)=>(0,r.jsx)(f,{...e,wireframe:!1},t))})]}),(0,r.jsx)("group",{ref:d,visible:!1,children:(0,r.jsx)(p,{progress:e,reduced:t})}),(0,r.jsx)("gridHelper",{args:[24,24,"#466253","#293f34"],position:[0,-2.3,0]}),(0,r.jsx)(c,{position:[0,-2.29,0],opacity:.4,scale:23,blur:2.4,far:10,color:"#020d08",resolution:256})]})}function g({chapter:e}){return(0,r.jsx)("div",{className:"journey-fallback",children:(0,r.jsx)("svg",{viewBox:"0 0 560 360",role:"img","aria-label":"Structural steel frame illustration",children:(0,r.jsxs)("g",{fill:"none",stroke:2===e?"#e87538":"#86b098",strokeWidth:"1.6",children:[[0,1,2,3,4].map(e=>(0,r.jsx)("path",{transform:`translate(${54*e},${-(18*e)})`,d:"M80 290V165L190 90l100 36v125M80 165l110-75 100 36M80 290l210-39M190 90v120"},e)),(0,r.jsx)("path",{d:"M80 290l216-72M80 165l216-72M190 90l216-72M290 126l216-72M290 251l216-72"})]})})})}class j extends v.Component{state={failed:!1};static getDerivedStateFromError(){return{failed:!0}}render(){return this.state.failed?(0,r.jsx)(g,{chapter:this.props.chapter}):this.props.children}}e.s(["default",0,function(e){let[s,i]=(0,v.useState)(null);return((0,v.useEffect)(()=>{let e=document.createElement("canvas").getContext("webgl2");i(!!e),e?.getExtension("WEBGL_lose_context")?.loseContext()},[]),!1===s)?(0,r.jsx)(g,{chapter:e.chapter}):null===s?(0,r.jsxs)("div",{className:"journey-loading",children:["Preparing the structure",(0,r.jsx)("span",{})]}):(0,r.jsx)(j,{chapter:e.chapter,children:(0,r.jsxs)(t.f,{orthographic:!0,shadows:!0,dpr:[1,1.5],camera:{position:[10,12,14],zoom:50,near:.1,far:100},gl:{alpha:!0,antialias:!0},frameloop:e.active?"always":"never",children:[(0,r.jsx)("ambientLight",{intensity:1.9}),(0,r.jsx)("directionalLight",{position:[2,10,7],intensity:3.5,castShadow:!0,"shadow-mapSize":[1024,1024]}),(0,r.jsx)("directionalLight",{position:[-6,3,-5],color:"#98cbb4",intensity:1.7}),(0,r.jsx)("pointLight",{position:[5,4,3],color:"#ffaa64",intensity:12}),(0,r.jsx)(x,{progress:e.progress,reduced:e.reduced})]})})}],56794)},42094,function(e){e.n(e.i(56794))}]);