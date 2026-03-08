import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import {
  Mic, MicOff, Volume2, VolumeX, Zap, Globe, X, Send,
  LogOut, Settings, Bell, Activity, Cpu, Languages,
  MessageSquare, History, Clock, Search, Download,
  CheckCircle, ChevronRight, Sparkles
} from "lucide-react";

/* ══════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cinzel+Decorative:wght@400;700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Exo+2:wght@200;300;400;500;600&display=swap');
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    :root {
      --void:#020309; --abyss:#060b18; --gold:#e8c97a; --gold2:#f5d98e;
      --ice:#a8d8ff; --ice2:#c4f0ff; --crimson:#ff3366; --ember:#ff6b35;
      --plasma:#7b4fff;
    }
    html, body, #root { height:100%; background:var(--void); }
    ::-webkit-scrollbar { width:3px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:rgba(232,201,122,0.4); border-radius:2px; }
    * { cursor: none !important; }
    @keyframes grain {
      0%,100%{transform:translate(0,0)}10%{transform:translate(-2%,-3%)}20%{transform:translate(-4%,2%)}
      30%{transform:translate(3%,-4%)}40%{transform:translate(-1%,5%)}50%{transform:translate(-5%,-1%)}
      60%{transform:translate(4%,3%)}70%{transform:translate(-3%,-2%)}80%{transform:translate(2%,4%)}90%{transform:translate(-4%,-3%)}
    }
    @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
    @keyframes chromaShift {
      0%,100%{text-shadow:2px 0 0 rgba(255,51,102,0.6),-2px 0 0 rgba(168,216,255,0.6)}
      25%{text-shadow:3px 0 0 rgba(255,51,102,0.8),-3px 0 0 rgba(168,216,255,0.8)}
      50%{text-shadow:-2px 0 0 rgba(255,51,102,0.6),2px 0 0 rgba(168,216,255,0.6)}
    }
    @keyframes holoPulse {
      0%,100%{box-shadow:0 0 20px rgba(232,201,122,0.06),inset 0 0 20px rgba(232,201,122,0.02)}
      50%{box-shadow:0 0 50px rgba(232,201,122,0.14),0 0 100px rgba(232,201,122,0.04),inset 0 0 40px rgba(232,201,122,0.05)}
    }
    @keyframes orbFloat {
      0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-10px) scale(1.02)}
    }
    @keyframes introFade {
      from{opacity:0;filter:blur(20px);transform:translateY(30px)}
      to{opacity:1;filter:blur(0);transform:translateY(0)}
    }
    @keyframes lineExpand { from{width:0} to{width:100%} }
    @keyframes rippleOut {
      0%{transform:scale(0.8);opacity:0.8}100%{transform:scale(2.5);opacity:0}
    }
    @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
    @keyframes spin { to{transform:rotate(360deg)} }
    @keyframes counterSpin { to{transform:rotate(-360deg)} }
    @keyframes slideInRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
    @keyframes slideInUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
    @keyframes holoSweep {
      0%{background-position:-200% center}100%{background-position:200% center}
    }
    @keyframes neonPulse {
      0%,100%{filter:drop-shadow(0 0 4px var(--gold))}
      50%{filter:drop-shadow(0 0 12px var(--gold)) drop-shadow(0 0 24px rgba(232,201,122,0.4))}
    }
    @keyframes waveBar {
      0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}
    }
    @keyframes magneticGlow {
      0%,100%{box-shadow:0 0 0 0 rgba(168,216,255,0)}
      50%{box-shadow:0 0 30px 8px rgba(168,216,255,0.1)}
    }
    .chroma-text { animation: chromaShift 4s ease-in-out infinite; }
    .orb-float { animation: orbFloat 6s ease-in-out infinite; }
  `}</style>
);

/* ══════════════════════════════════════════
   MAGNETIC CURSOR
══════════════════════════════════════════ */
function MagneticCursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const trail = useRef({ x:0, y:0 });
  const pos = useRef({ x:0, y:0 });
  const [big, setBig] = useState(false);

  useEffect(() => {
    const mv = e => { pos.current = { x:e.clientX, y:e.clientY }; };
    const ov = e => { if (e.target.closest("button,a,[data-hover]")) setBig(true); };
    const ou = () => setBig(false);
    window.addEventListener("mousemove", mv);
    window.addEventListener("mouseover", ov);
    window.addEventListener("mouseout", ou);
    let raf;
    const tick = () => {
      trail.current.x += (pos.current.x - trail.current.x) * 0.1;
      trail.current.y += (pos.current.y - trail.current.y) * 0.1;
      if (dot.current) dot.current.style.transform = `translate(${pos.current.x-6}px,${pos.current.y-6}px)`;
      if (ring.current) ring.current.style.transform = `translate(${trail.current.x-18}px,${trail.current.y-18}px)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { window.removeEventListener("mousemove",mv); window.removeEventListener("mouseover",ov); window.removeEventListener("mouseout",ou); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={ring} style={{ position:"fixed",top:0,left:0,width:36,height:36,borderRadius:"50%",border:`1px solid rgba(232,201,122,${big?0.8:0.4})`,pointerEvents:"none",zIndex:99999,transition:"width 0.3s,height 0.3s,border-color 0.3s",width:big?56:36,height:big?56:36,mixBlendMode:"difference" }}/>
      <div ref={dot} style={{ position:"fixed",top:0,left:0,width:12,height:12,borderRadius:"50%",background:"var(--gold)",pointerEvents:"none",zIndex:99999,boxShadow:"0 0 10px var(--gold),0 0 20px rgba(232,201,122,0.4)" }}/>
    </>
  );
}

/* ══════════════════════════════════════════
   CINEMATIC OVERLAY (grain + vignette + scanline + corners)
══════════════════════════════════════════ */
function CinematicOverlay() {
  return (
    <>
      <div style={{ position:"fixed",inset:"-50%",zIndex:9000,pointerEvents:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,backgroundSize:"128px 128px",opacity:0.025,animation:"grain 0.3s steps(1) infinite",mixBlendMode:"overlay" }}/>
      <div style={{ position:"fixed",inset:0,zIndex:9001,pointerEvents:"none",background:"radial-gradient(ellipse at center,transparent 45%,rgba(2,3,9,0.88) 100%)" }}/>
      <div style={{ position:"fixed",left:0,right:0,height:"2px",zIndex:9002,pointerEvents:"none",background:"linear-gradient(90deg,transparent,rgba(232,201,122,0.05),transparent)",animation:"scanline 10s linear infinite",top:0 }}/>
      {[[{top:14,left:14},{borderTop:"1px solid",borderLeft:"1px solid"}],[{top:14,right:14},{borderTop:"1px solid",borderRight:"1px solid"}],[{bottom:14,left:14},{borderBottom:"1px solid",borderLeft:"1px solid"}],[{bottom:14,right:14},{borderBottom:"1px solid",borderRight:"1px solid"}]].map(([pos,bord],i)=>(
        <div key={i} style={{ position:"fixed",width:22,height:22,zIndex:9003,pointerEvents:"none",borderColor:"rgba(232,201,122,0.2)",...pos,...bord }}/>
      ))}
    </>
  );
}

/* ══════════════════════════════════════════
   THREE.JS WORMHOLE GALAXY
══════════════════════════════════════════ */
function GalaxyScene({ dim = false }) {
  const mountRef = useRef(null);
  useEffect(() => {
    const el = mountRef.current; if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020309, 0.01);
    const camera = new THREE.PerspectiveCamera(70, W/H, 0.1, 1000);
    camera.position.z = 26;

    /* Wormhole rings */
    const rings = [];
    for (let i = 0; i < 55; i++) {
      const r = 7 + Math.sin(i*0.45)*3.5;
      const g = new THREE.TorusGeometry(r, 0.04, 8, 80);
      const t = i/55;
      const col = new THREE.Color().lerpColors(new THREE.Color(0xe8c97a), new THREE.Color(0xa8d8ff), t);
      const m = new THREE.MeshBasicMaterial({ color:col, transparent:true, opacity:0.22-t*0.12 });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.z = -i*2.8; mesh.rotation.x = Math.PI/2;
      scene.add(mesh); rings.push(mesh);
    }

    /* Stars */
    const sc = 4500, sp = new Float32Array(sc*3), sCol = new Float32Array(sc*3), ss = new Float32Array(sc);
    for (let i = 0; i < sc; i++) {
      const i3=i*3, ang=Math.random()*Math.PI*2, rad=Math.pow(Math.random(),0.45)*65;
      const arm=Math.floor(Math.random()*3)*(Math.PI*2/3), twist=rad*0.045;
      sp[i3]=Math.cos(ang+arm+twist)*rad; sp[i3+1]=(Math.random()-0.5)*9; sp[i3+2]=Math.sin(ang+arm+twist)*rad-90;
      const c=Math.random();
      if(c<0.4){sCol[i3]=0.91;sCol[i3+1]=0.79;sCol[i3+2]=0.48;}
      else if(c<0.7){sCol[i3]=0.66;sCol[i3+1]=0.85;sCol[i3+2]=1;}
      else{sCol[i3]=1;sCol[i3+1]=1;sCol[i3+2]=1;}
      ss[i]=Math.random()*2+0.3;
    }
    const sGeo=new THREE.BufferGeometry();
    sGeo.setAttribute("position",new THREE.BufferAttribute(sp,3));
    sGeo.setAttribute("color",new THREE.BufferAttribute(sCol,3));
    const sMat=new THREE.PointsMaterial({ size:0.32, vertexColors:true, transparent:true, opacity:0.85, sizeAttenuation:true, blending:THREE.AdditiveBlending });
    scene.add(new THREE.Points(sGeo, sMat));

    /* Wireframe orb */
    const orbGeo=new THREE.IcosahedronGeometry(2.5, 2);
    const orbMat=new THREE.MeshBasicMaterial({ color:0xe8c97a, wireframe:true, transparent:true, opacity:0.08 });
    const orb=new THREE.Mesh(orbGeo, orbMat); scene.add(orb);

    const mouse={x:0,y:0};
    const onMv = e => { mouse.x=(e.clientX/window.innerWidth-0.5)*2; mouse.y=(e.clientY/window.innerHeight-0.5)*2; };
    window.addEventListener("mousemove",onMv);

    const clock=new THREE.Clock(); let raf;
    const animate=()=>{
      raf=requestAnimationFrame(animate);
      const t=clock.getElapsedTime();
      rings.forEach((r,i)=>{
        r.rotation.z=t*(0.08+i*0.002);
        r.position.z=(-i*2.8+(t*3.5)%154)-154;
        r.material.opacity=Math.max(0,0.18-Math.abs(r.position.z)*0.0007);
      });
      orb.rotation.y=t*0.15; orb.rotation.x=t*0.08;
      camera.position.x+=(mouse.x*3-camera.position.x)*0.028;
      camera.position.y+=(-mouse.y*2-camera.position.y)*0.028;
      camera.lookAt(0,0,-60);
      renderer.render(scene,camera);
    };
    animate();

    const onResize=()=>{ const W2=el.clientWidth,H2=el.clientHeight; camera.aspect=W2/H2; camera.updateProjectionMatrix(); renderer.setSize(W2,H2); };
    window.addEventListener("resize",onResize);
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener("mousemove",onMv); window.removeEventListener("resize",onResize); renderer.dispose(); if(el.contains(renderer.domElement))el.removeChild(renderer.domElement); };
  }, []);
  return <div ref={mountRef} style={{ position:"absolute",inset:0,zIndex:0,opacity:dim?0.18:1 }}/>;
}

/* ══════════════════════════════════════════
   TYPEWRITER HOOK
══════════════════════════════════════════ */
function useTypewriter(text, speed=55, delay=0) {
  const [displayed, setDisplayed] = useState(""); 
  const [done, setDone]=useState(false);
  useEffect(()=>{ setDisplayed(""); 
    setDone(false); let i=0;
    const tid=setTimeout(()=>{
      const id=setInterval(()=>{ i++; setDisplayed(text.slice(0,i)); if(i>=text.length){clearInterval(id);setDone(true);} },speed);
      return ()=>clearInterval(id);
    },delay);
    return ()=>clearTimeout(tid);
  },[text,speed,delay]);
  return {displayed,done};
}

/* ══════════════════════════════════════════
   INTRO SEQUENCE
══════════════════════════════════════════ */
function IntroSequence({ onDone }) {
  const [phase, setPhase] = useState(0);
  const {displayed:l1}=useTypewriter("INITIALIZING NEXUS NEURAL CORE",32,300);
  const {displayed:l2}=useTypewriter("QUANTUM ENTANGLEMENT CONFIRMED",28,1900);
  const {displayed:l3}=useTypewriter("WELCOME.",75,3300);
  useEffect(()=>{
    const t1=setTimeout(()=>setPhase(1),600);
    const t2=setTimeout(()=>setPhase(2),2100);
    const t3=setTimeout(()=>setPhase(3),3600);
    const t4=setTimeout(()=>onDone(),5400);
    return ()=>[t1,t2,t3,t4].forEach(clearTimeout);
  },[onDone]);
  return (
    <div style={{ position:"fixed",inset:0,zIndex:8000,background:"var(--void)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",opacity:phase===3?0:1,transition:"opacity 1s ease" }}>
      <GalaxyScene />
      <div style={{ position:"relative",zIndex:10,textAlign:"center",padding:"0 40px" }}>
        {/* Spinning rings orb */}
        <div style={{ position:"relative",width:110,height:110,margin:"0 auto 44px",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <div style={{ position:"absolute",inset:0,border:"1px solid rgba(232,201,122,0.25)",borderRadius:"50%",animation:"spin 10s linear infinite" }}/>
          <div style={{ position:"absolute",inset:12,border:"1px solid rgba(168,216,255,0.15)",borderRadius:"50%",animation:"counterSpin 6s linear infinite" }}/>
          <div style={{ position:"absolute",inset:22,border:"1px solid rgba(232,201,122,0.1)",borderRadius:"50%",animation:"spin 4s linear infinite" }}/>
          <div style={{ width:36,height:36,borderRadius:"50%",background:"radial-gradient(circle,var(--gold) 0%,rgba(232,201,122,0) 70%)",boxShadow:"0 0 30px var(--gold),0 0 60px rgba(232,201,122,0.4)",animation:"orbFloat 3s ease-in-out infinite" }}/>
        </div>
        {/* Divider line */}
        {phase>=1 && <div style={{ width:"100%",maxWidth:380,margin:"0 auto 28px",overflow:"hidden" }}><div style={{ height:1,background:"linear-gradient(90deg,transparent,var(--gold),transparent)",animation:"lineExpand 0.7s ease forwards" }}/></div>}
        {/* Log lines */}
        <div style={{ fontFamily:"Space Mono,monospace",fontSize:10,letterSpacing:4,marginBottom:10,minHeight:18 }}>
          <span style={{ color:"rgba(232,201,122,0.4)" }}>&gt; </span>
          <span style={{ color:"var(--gold)" }}>{l1}</span>
          {phase>=1&&<span style={{ animation:"blink 0.7s step-end infinite",color:"var(--gold)" }}>_</span>}
        </div>
        <div style={{ fontFamily:"Space Mono,monospace",fontSize:10,letterSpacing:4,marginBottom:36,minHeight:18 }}>
          <span style={{ color:"rgba(168,216,255,0.3)" }}>&gt; </span>
          <span style={{ color:"var(--ice)" }}>{l2}</span>
        </div>
        {phase>=3 && (
          <div style={{ fontFamily:"Cinzel Decorative,serif",fontSize:"clamp(40px,7vw,80px)",fontWeight:900,color:"var(--gold)",letterSpacing:14,animation:"introFade 0.9s ease forwards",textShadow:"0 0 60px rgba(232,201,122,0.5),0 0 120px rgba(232,201,122,0.2)" }}>
            NEXUS
          </div>
        )}
        {phase>=1 && <div style={{ width:"100%",maxWidth:380,margin:"32px auto 0",overflow:"hidden" }}><div style={{ height:1,background:"linear-gradient(90deg,transparent,var(--gold),transparent)",animation:"lineExpand 0.9s ease 0.4s forwards",width:0 }}/></div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   HOLOGRAPHIC TILT CARD
══════════════════════════════════════════ */
function HoloCard({ children, style={}, gold=true }) {
  const ref=useRef(null); const [tilt,setTilt]=useState({x:0,y:0}); const [hov,setHov]=useState(false); const [gp,setGp]=useState({x:50,y:50});
  const onMv=e=>{ if(!ref.current)return; const r=ref.current.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height; setTilt({x:(y-0.5)*16,y:(x-0.5)*-16}); setGp({x:x*100,y:y*100}); };
  const gc=gold?"rgba(232,201,122":"rgba(168,216,255";
  return (
    <div ref={ref} onMouseMove={onMv} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>{setHov(false);setTilt({x:0,y:0});}}
      style={{ position:"relative",overflow:"hidden",borderRadius:16,background:"rgba(6,11,24,0.82)",border:`1px solid ${hov?`${gc},0.45)`:`${gc},0.08)`}`,backdropFilter:"blur(24px)",transform:hov?`perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(8px)`:"perspective(900px) rotateX(0) rotateY(0)",transition:hov?"transform 0.12s ease":"transform 0.55s cubic-bezier(.34,1.56,.64,1)",boxShadow:hov?`0 24px 70px rgba(0,0,0,0.65),0 0 50px ${gc},0.08)`:  "0 4px 30px rgba(0,0,0,0.45)",animation:"holoPulse 5s ease-in-out infinite",...style }}>
      {hov&&<div style={{ position:"absolute",inset:0,pointerEvents:"none",zIndex:1,borderRadius:"inherit",background:`radial-gradient(circle at ${gp.x}% ${gp.y}%,${gc},0.1) 0%,transparent 60%)`,mixBlendMode:"screen" }}/>}
      {hov&&<div style={{ position:"absolute",inset:0,pointerEvents:"none",zIndex:2,borderRadius:"inherit",background:"linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.04) 50%,transparent 70%)",backgroundSize:"200% 200%",animation:"holoSweep 2.5s ease infinite" }}/>}
      <div style={{ position:"relative",zIndex:3 }}>{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════ */
function Reveal({ children, delay=0, style={} }) {
  const ref=useRef(null); const [vis,setVis]=useState(false);
  useEffect(()=>{ const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)setVis(true);},{threshold:0.05}); if(ref.current)obs.observe(ref.current); return()=>obs.disconnect(); },[]);
  return <div ref={ref} style={{ opacity:vis?1:0,transform:vis?"none":"translateY(44px)",filter:vis?"blur(0)":"blur(5px)",transition:`opacity 0.85s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.85s cubic-bezier(.22,1,.36,1) ${delay}ms, filter 0.85s ease ${delay}ms`,...style }}>{children}</div>;
}

/* ══════════════════════════════════════════
   GLITCH TITLE
══════════════════════════════════════════ */
function GlitchTitle({ text, size="clamp(26px,3.5vw,44px)", gold=true }) {
  const [g,setG]=useState(false);
  useEffect(()=>{ const id=setInterval(()=>{setG(true);setTimeout(()=>setG(false),110+Math.random()*70);},3500+Math.random()*2000); return()=>clearInterval(id); },[]);
  return (
    <div style={{ position:"relative",display:"inline-block" }}>
      {g&&<div style={{ position:"absolute",inset:0,color:"var(--crimson)",fontFamily:"Cinzel,serif",fontSize:size,fontWeight:900,letterSpacing:4,clipPath:"inset(20% 0 55% 0)",transform:"translateX(3px)",opacity:0.7,pointerEvents:"none" }}>{text}</div>}
      {g&&<div style={{ position:"absolute",inset:0,color:"var(--ice)",fontFamily:"Cinzel,serif",fontSize:size,fontWeight:900,letterSpacing:4,clipPath:"inset(60% 0 10% 0)",transform:"translateX(-3px)",opacity:0.7,pointerEvents:"none" }}>{text}</div>}
      <span style={{ fontFamily:"Cinzel,serif",fontSize:size,fontWeight:900,color:gold?"var(--gold)":"#fff",letterSpacing:4,textShadow:gold?"0 0 30px rgba(232,201,122,0.35)":"0 0 20px rgba(168,216,255,0.2)",filter:g?"brightness(1.5)":"none",transition:"filter 0.05s" }}>{text}</span>
    </div>
  );
}

/* ══════════════════════════════════════════
   LOGIN SCREEN
══════════════════════════════════════════ */
function LoginScreen({ onLogin }) {
  const [mode,setMode]=useState("choose"); 
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [loading,setLoading]=useState(false); 
  const [focus,setFocus]=useState(null);
  const {displayed:sub}=useTypewriter("NEURAL WORKSPACE INTERFACE",42,900);
  const doLogin=u=>{setLoading(true);setTimeout(()=>onLogin(u),1700);};
  return (
    <div style={{ position:"relative",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",background:"var(--void)" }}>
      <GalaxyScene />
      <div style={{ position:"relative",zIndex:10,width:"100%",maxWidth:450,padding:"0 22px" }}>
        <div style={{ textAlign:"center",marginBottom:44 }}>
          <div className="orb-float" style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",width:68,height:68,borderRadius:18,background:"rgba(232,201,122,0.05)",border:"1px solid rgba(232,201,122,0.25)",marginBottom:18,boxShadow:"0 0 40px rgba(232,201,122,0.08)" }}>
            <Zap size={30} color="var(--gold)" style={{ filter:"drop-shadow(0 0 8px var(--gold))",animation:"neonPulse 3s ease-in-out infinite" }}/>
          </div>
          <div style={{ fontFamily:"Cinzel Decorative,serif",fontSize:"clamp(30px,6vw,52px)",fontWeight:900,color:"var(--gold)",letterSpacing:10,textShadow:"0 0 50px rgba(232,201,122,0.4)",marginBottom:10 }}>NEXUS AI </div>
          <div style={{ fontFamily:"Space Mono,monospace",fontSize:9,letterSpacing:5,color:"rgba(168,216,255,0.45)",minHeight:16 }}>{sub}<span style={{ animation:"blink 0.9s step-end infinite",color:"var(--ice)" }}>|</span></div>
        </div>
        <HoloCard style={{ padding:34 }}>
          {mode==="choose"?(
            <>
              <p style={{ fontFamily:"Cinzel,serif",fontSize:11,color:"rgba(255,255,255,0.35)",textAlign:"center",letterSpacing:4,marginBottom:26,textTransform:"uppercase" }}>Select Access Protocol</p>
              <button onClick={()=>doLogin({name:"Ayush Chaudhary",email:"[EMAIL_ADDRESS]",avatar:"AC",plan:"Quantum Pro"})} disabled={loading}
                style={{ width:"100%",padding:"15px 18px",borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"#fff",fontFamily:"Exo 2,sans-serif",fontSize:14,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center",gap:12,cursor:"pointer",marginBottom:12,transition:"all 0.3s",letterSpacing:1 }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.borderColor="rgba(232,201,122,0.3)";e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.transform="none";}}>
                {loading?<SpinnerG/>:<><svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>CONTINUE WITH GOOGLE</>}
              </button>
              <div style={{ display:"flex",alignItems:"center",gap:12,margin:"14px 0" }}>
                <div style={{ flex:1,height:1,background:"linear-gradient(90deg,transparent,rgba(232,201,122,0.12))" }}/><span style={{ fontFamily:"Space Mono,monospace",color:"rgba(255,255,255,0.15)",fontSize:9 }}>OR</span><div style={{ flex:1,height:1,background:"linear-gradient(90deg,rgba(232,201,122,0.12),transparent)" }}/>
              </div>
              <button onClick={()=>setMode("email")} style={{ width:"100%",padding:"15px",borderRadius:12,border:"1px solid rgba(232,201,122,0.2)",background:"rgba(232,201,122,0.04)",color:"var(--gold)",fontFamily:"Cinzel,serif",fontSize:11,fontWeight:600,cursor:"pointer",letterSpacing:3,transition:"all 0.3s" }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(232,201,122,0.09)";e.currentTarget.style.boxShadow="0 0 30px rgba(232,201,122,0.08)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(232,201,122,0.04)";e.currentTarget.style.boxShadow="none";}}>
                EMAIL ACCESS
              </button>
            </>
          ):(
            <>
              <p style={{ fontFamily:"Cinzel,serif",fontSize:11,color:"rgba(232,201,122,0.5)",letterSpacing:3,marginBottom:22,textTransform:"uppercase" }}>Email Protocol</p>
              {["email","password"].map(f=>(
                <div key={f} style={{ marginBottom:12 }}>
                  <input type={f} placeholder={f==="email"?"neural@address.io":"access key"} value={f==="email"?email:pass} onChange={e=>f==="email"?setEmail(e.target.value):setPass(e.target.value)} onFocus={()=>setFocus(f)} onBlur={()=>setFocus(null)}
                    style={{ width:"100%",padding:"13px 14px",borderRadius:10,border:`1px solid ${focus===f?"rgba(232,201,122,0.5)":"rgba(255,255,255,0.07)"}`,background:"rgba(0,0,0,0.35)",color:"#fff",fontFamily:"Space Mono,monospace",fontSize:12,outline:"none",transition:"all 0.25s",boxShadow:focus===f?"0 0 20px rgba(232,201,122,0.08)":"none",letterSpacing:1 }}/>
                </div>
              ))}
              <button onClick={()=>email&&pass&&doLogin({name:email.split("@")[0],email,avatar:email[0].toUpperCase(),plan:"Stellar"})} disabled={loading}
                style={{ width:"100%",padding:"14px",borderRadius:12,border:"none",background:"linear-gradient(135deg,rgba(232,201,122,0.75),rgba(245,217,142,0.55))",color:"var(--void)",fontFamily:"Cinzel,serif",fontSize:12,fontWeight:700,letterSpacing:4,cursor:"pointer",boxShadow:"0 0 30px rgba(232,201,122,0.15)",marginBottom:10 }}>
                {loading?<SpinnerG dark/>:"ENGAGE"}
              </button>
              <button onClick={()=>setMode("choose")} style={{ width:"100%",padding:"9px",border:"none",background:"transparent",color:"rgba(255,255,255,0.25)",fontFamily:"Exo 2,sans-serif",fontSize:11,cursor:"pointer",letterSpacing:1 }}>← BACK</button>
            </>
          )}
        </HoloCard>
        <p style={{ textAlign:"center",marginTop:16,fontFamily:"Space Mono,monospace",color:"rgba(255,255,255,0.1)",fontSize:8,letterSpacing:2 }}>SECURE · ENCRYPTED · NEURAL-GRADE</p>
      </div>
    </div>
  );
}
function SpinnerG({dark}){ return <div style={{ width:17,height:17,border:`2px solid ${dark?"rgba(2,3,9,0.25)":"rgba(232,201,122,0.25)"}`,borderTop:`2px solid ${dark?"#020309":"var(--gold)"}`,borderRadius:"50%",animation:"spin 0.7s linear infinite",margin:"0 auto" }}/>; }

/* ══════════════════════════════════════════
   NAV + SIDEBAR
══════════════════════════════════════════ */
const NAV=[
  {id:"dashboard", icon:Activity,  label:"DASHBOARD"},
  {id:"chathistory",icon:History,  label:"CHRONICLES"},
  {id:"language",  icon:Languages, label:"DIALECT"},
  {id:"deploy",    icon:Globe,     label:"DEPLOYMENT"},
  {id:"settings",  icon:Settings,  label:"CONFIG"},
];

function Sidebar({ active, onNav, user, onLogout, collapsed, setCollapsed }) {
  return (
    <div style={{ width:collapsed?58:208,flexShrink:0,background:"rgba(2,3,9,0.94)",borderRight:"1px solid rgba(232,201,122,0.08)",display:"flex",flexDirection:"column",transition:"width 0.4s cubic-bezier(.34,1.56,.64,1)",overflow:"hidden",backdropFilter:"blur(30px)",position:"relative" }}>
      <div style={{ position:"absolute",top:0,right:0,width:1,height:"100%",background:"linear-gradient(180deg,transparent,rgba(232,201,122,0.25),rgba(168,216,255,0.15),transparent)" }}/>
      {/* Logo */}
      <div style={{ padding:"16px 12px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid rgba(232,201,122,0.06)",flexShrink:0 }}>
        <div style={{ width:30,height:30,borderRadius:8,background:"rgba(232,201,122,0.06)",border:"1px solid rgba(232,201,122,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,animation:"neonPulse 4s ease-in-out infinite" }}>
          <Zap size={15} color="var(--gold)"/>
        </div>
        {!collapsed&&<span style={{ fontFamily:"Cinzel,serif",color:"var(--gold)",fontSize:13,fontWeight:700,letterSpacing:4,whiteSpace:"nowrap" }}>NEXUS</span>}
      </div>
      {/* Nav */}
      <nav style={{ flex:1,padding:"12px 7px",display:"flex",flexDirection:"column",gap:2 }}>
        {NAV.map(({id,icon:Icon,label})=>{
          const sel=active===id;
          return (
            <button key={id} onClick={()=>onNav(id)} data-hover="1"
              style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 11px",borderRadius:9,border:"none",background:sel?"rgba(232,201,122,0.07)":"transparent",color:sel?"var(--gold)":"rgba(255,255,255,0.3)",fontFamily:"Cinzel,serif",fontSize:9,fontWeight:600,cursor:"pointer",letterSpacing:2,transition:"all 0.22s",whiteSpace:"nowrap",textAlign:"left",borderLeft:sel?"2px solid var(--gold)":"2px solid transparent",boxShadow:sel?"inset 0 0 30px rgba(232,201,122,0.04)":"none" }}
              onMouseEnter={e=>{if(!sel){e.currentTarget.style.color="rgba(232,201,122,0.55)";e.currentTarget.style.background="rgba(232,201,122,0.03)";}}}
              onMouseLeave={e=>{if(!sel){e.currentTarget.style.color="rgba(255,255,255,0.3)";e.currentTarget.style.background="transparent";}}}>
              <Icon size={15} style={{ flexShrink:0,filter:sel?"drop-shadow(0 0 5px var(--gold))":"none" }}/>
              {!collapsed&&<span>{label}</span>}
              {sel&&!collapsed&&<div style={{ marginLeft:"auto",width:4,height:4,borderRadius:"50%",background:"var(--gold)",boxShadow:"0 0 8px var(--gold)" }}/>}
            </button>
          );
        })}
      </nav>
      {/* User */}
      <div style={{ padding:"8px 7px",borderTop:"1px solid rgba(232,201,122,0.06)",flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 11px",borderRadius:9,background:"rgba(255,255,255,0.02)",marginBottom:3 }}>
          <div style={{ width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,rgba(232,201,122,0.55),rgba(168,216,255,0.35))",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,fontWeight:700,color:"var(--void)",fontFamily:"Cinzel,serif" }}>{user?.avatar}</div>
          {!collapsed&&<div style={{ flex:1,overflow:"hidden" }}>
            <div style={{ fontFamily:"Exo 2,sans-serif",color:"rgba(255,255,255,0.75)",fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.name}</div>
            <div style={{ fontFamily:"Space Mono,monospace",color:"rgba(232,201,122,0.4)",fontSize:8,letterSpacing:1 }}>{user?.plan}</div>
          </div>}
        </div>
        <button onClick={onLogout} data-hover="1" style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:"8px 11px",borderRadius:9,border:"none",background:"transparent",color:"rgba(255,80,80,0.45)",fontFamily:"Cinzel,serif",fontSize:9,cursor:"pointer",whiteSpace:"nowrap",letterSpacing:2,transition:"color 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.color="rgba(255,80,80,0.85)"}
          onMouseLeave={e=>e.currentTarget.style.color="rgba(255,80,80,0.45)"}>
          <LogOut size={13} style={{ flexShrink:0 }}/>{!collapsed&&"DISCONNECT"}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ANIMATED STAT CARD
══════════════════════════════════════════ */
function StatCard({ icon:Icon, label, value, gold=true, delay=0 }) {
  const [cnt,setCnt]=useState(0); 
  const target=parseInt(value)||0;
  useEffect(()=>{ 
    if(!target)return; let s=0; const step=Math.ceil(target/40); 
    const id=setInterval(()=>{ s=Math.min(s+step,target); setCnt(s); 
      if(s>=target)clearInterval(id); },28); return()=>clearInterval(id); },[target]);
  const c=gold?"rgba(232,201,122":"rgba(168,216,255";
  return (
    <Reveal delay={delay}>
      <HoloCard gold={gold} style={{ padding:22 }}>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12 }}>
          <div style={{ width:40,height:40,borderRadius:11,background:`${c},0.07)`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${c},0.18)` }}>
            <Icon size={19} color={gold?"var(--gold)":"var(--ice)"} style={{ filter:`drop-shadow(0 0 5px ${gold?"var(--gold)":"var(--ice)"})` }}/>
          </div>
          <div style={{ width:5,height:5,borderRadius:"50%",background:gold?"var(--gold)":"var(--ice)",boxShadow:`0 0 10px ${gold?"var(--gold)":"var(--ice)"}` }}/>
        </div>
        <div style={{ fontFamily:"Cinzel,serif",color:"#fff",fontSize:30,fontWeight:700,letterSpacing:2,textShadow:`0 0 20px ${c},0.3)`,marginBottom:4 }}>{target?cnt:value}</div>
        <div style={{ fontFamily:"Space Mono,monospace",color:"rgba(255,255,255,0.25)",fontSize:8,letterSpacing:3,textTransform:"uppercase" }}>{label}</div>
        <div style={{ marginTop:12,height:1,background:`linear-gradient(90deg,${c},0.3),transparent)` }}/>
      </HoloCard>
    </Reveal>
  );
}

/* ══════════════════════════════════════════
   CHAT HISTORY DATA + PAGE
══════════════════════════════════════════ */
const CHATS=[
  {id:1,title:"Build REST API with FastAPI",   date:"Today, 14:22",   preview:"Scaffold production-ready FastAPI with async endpoints…",tags:["Python","API"],   msgs:14,hue:"var(--gold)"},
  {id:2,title:"Fix React useEffect memory leak",date:"Today, 10:08",  preview:"The async function runs after unmount causing the leak…",tags:["React","Debug"],  msgs:8, hue:"var(--ice)"},
  {id:3,title:"Explain transformer attention",  date:"Yesterday 19:45",preview:"Attention weights relevance of each token for context…",tags:["AI","Theory"],    msgs:22,hue:"var(--plasma)"},
  {id:4,title:"Write Dockerfile for Node.js",   date:"Yesterday 15:11",preview:"Multi-stage build optimises layer caching in production…",tags:["Docker","Node"],  msgs:6, hue:"var(--gold)"},
  {id:5,title:"Optimize SQL query performance", date:"Mar 5",         preview:"EXPLAIN ANALYZE reveals a missing index on join column…",tags:["SQL","Database"], msgs:17,hue:"var(--ember)"},
  {id:6,title:"CI/CD with GitHub Actions",      date:"Mar 4",         preview:"Trigger pipeline on push with matrix strategy for tests…",tags:["DevOps","CI"],    msgs:11,hue:"var(--ice)"},
  {id:7,title:"OAuth2 with JWT tokens",         date:"Mar 3",         preview:"Stateless auth where claims are embedded in the token…",tags:["Auth","Security"],msgs:19,hue:"var(--crimson)"},
  {id:8,title:"Microservices architecture",     date:"Mar 1",         preview:"Decompose by bounded contexts; each service owns its data…",tags:["System","Design"],msgs:31,hue:"var(--plasma)"},
];

function ChatHistoryPage() {
  const [search,setSearch]=useState(""); const [filter,setFilter]=useState("All"); const [sel,setSel]=useState(null);
  const tags=["All",...new Set(CHATS.flatMap(c=>c.tags))];
  const filtered=CHATS.filter(c=>(filter==="All"||c.tags.includes(filter))&&(c.title.toLowerCase().includes(search.toLowerCase())||c.preview.toLowerCase().includes(search.toLowerCase())));
  return (
    <div style={{ display:"flex",height:"100%",overflow:"hidden" }}>
      {/* List */}
      <div style={{ width:sel?"38%":"100%",transition:"width 0.45s cubic-bezier(.34,1.56,.64,1)",display:"flex",flexDirection:"column",borderRight:sel?"1px solid rgba(232,201,122,0.07)":"none",overflow:"hidden" }}>
        <div style={{ padding:"26px 22px 16px",flexShrink:0,borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
          <Reveal>
            <GlitchTitle text="CHRONICLES" size="26px"/>
            <p style={{ fontFamily:"Space Mono,monospace",color:"rgba(255,255,255,0.2)",fontSize:9,letterSpacing:3,marginTop:6,marginBottom:18 }}>{CHATS.length} NEURAL SESSIONS ARCHIVED</p>
          </Reveal>
          <div style={{ position:"relative",marginBottom:12 }}>
            <Search size={12} color="rgba(232,201,122,0.35)" style={{ position:"absolute",left:11,top:"50%",transform:"translateY(-50%)" }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="SEARCH ARCHIVES…"
              style={{ width:"100%",padding:"9px 10px 9px 32px",borderRadius:10,border:"1px solid rgba(232,201,122,0.12)",background:"rgba(232,201,122,0.025)",color:"rgba(255,255,255,0.75)",fontFamily:"Space Mono,monospace",fontSize:10,letterSpacing:1,outline:"none" }}/>
          </div>
          <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
            {tags.map(t=><button key={t} onClick={()=>setFilter(t)} style={{ padding:"3px 10px",borderRadius:20,border:`1px solid ${filter===t?"rgba(232,201,122,0.45)":"rgba(255,255,255,0.06)"}`,background:filter===t?"rgba(232,201,122,0.09)":"transparent",color:filter===t?"var(--gold)":"rgba(255,255,255,0.25)",fontFamily:"Space Mono,monospace",fontSize:8,letterSpacing:2,cursor:"pointer",transition:"all 0.2s" }}>{t.toUpperCase()}</button>)}
          </div>
        </div>
        <div style={{ flex:1,overflowY:"auto",padding:"10px 14px 20px" }}>
          {filtered.map((c,i)=>{
            const isSel=sel?.id===c.id;
            return (
              <Reveal key={c.id} delay={i*45}>
                <div onClick={()=>setSel(isSel?null:c)} data-hover="1"
                  style={{ padding:"14px",borderRadius:13,marginBottom:7,border:`1px solid ${isSel?"rgba(232,201,122,0.28)":"rgba(255,255,255,0.04)"}`,background:isSel?"rgba(232,201,122,0.04)":"rgba(255,255,255,0.01)",cursor:"pointer",transition:"all 0.28s",position:"relative",overflow:"hidden" }}
                  onMouseEnter={e=>{if(!isSel){e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.borderColor="rgba(232,201,122,0.14)";e.currentTarget.style.transform="translateX(4px)";}}}
                  onMouseLeave={e=>{if(!isSel){e.currentTarget.style.background="rgba(255,255,255,0.01)";e.currentTarget.style.borderColor="rgba(255,255,255,0.04)";e.currentTarget.style.transform="none";}}}>
                  {isSel&&<div style={{ position:"absolute",left:0,top:0,bottom:0,width:2,background:"linear-gradient(180deg,transparent,var(--gold),transparent)" }}/>}
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:7,flex:1,overflow:"hidden" }}>
                      <div style={{ width:5,height:5,borderRadius:"50%",background:c.hue,flexShrink:0,boxShadow:`0 0 8px ${c.hue}` }}/>
                      <span style={{ fontFamily:"Exo 2,sans-serif",color:"rgba(255,255,255,0.82)",fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.title}</span>
                    </div>
                    <span style={{ fontFamily:"Space Mono,monospace",color:"rgba(255,255,255,0.18)",fontSize:8,flexShrink:0,marginLeft:8,letterSpacing:1 }}>{c.msgs}m</span>
                  </div>
                  <p style={{ fontFamily:"Exo 2,sans-serif",color:"rgba(255,255,255,0.28)",fontSize:11,paddingLeft:12,marginBottom:7,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.preview}</p>
                  <div style={{ display:"flex",justifyContent:"space-between",paddingLeft:12 }}>
                    <div style={{ display:"flex",gap:4 }}>{c.tags.map(t=><span key={t} style={{ padding:"2px 7px",borderRadius:9,background:"rgba(232,201,122,0.05)",color:"rgba(232,201,122,0.5)",fontFamily:"Space Mono,monospace",fontSize:7,letterSpacing:1 }}>{t}</span>)}</div>
                    <span style={{ fontFamily:"Space Mono,monospace",color:"rgba(255,255,255,0.14)",fontSize:8 }}>{c.date}</span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
      {/* Detail panel */}
      {sel&&(
        <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden",animation:"slideInRight 0.4s cubic-bezier(.34,1.56,.64,1)" }}>
          <div style={{ padding:"18px 22px",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
            <div>
              <div style={{ fontFamily:"Cinzel,serif",color:"var(--gold)",fontSize:13,fontWeight:700,letterSpacing:2,marginBottom:4 }}>{sel.title}</div>
              <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                <Clock size={10} color="rgba(255,255,255,0.18)"/>
                <span style={{ fontFamily:"Space Mono,monospace",color:"rgba(255,255,255,0.22)",fontSize:8,letterSpacing:1 }}>{sel.date} · {sel.msgs} MESSAGES</span>
              </div>
            </div>
            <div style={{ display:"flex",gap:7 }}>
              <button style={{ width:30,height:30,borderRadius:8,border:"1px solid rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.02)",color:"rgba(255,255,255,0.35)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><Download size={12}/></button>
              <button onClick={()=>setSel(null)} style={{ width:30,height:30,borderRadius:8,border:"1px solid rgba(255,80,80,0.18)",background:"rgba(255,80,80,0.04)",color:"rgba(255,80,80,0.55)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><X size={12}/></button>
            </div>
          </div>
          <div style={{ flex:1,overflowY:"auto",padding:"18px 22px",display:"flex",flexDirection:"column",gap:12 }}>
            {[{role:"user",text:`How do I ${sel.title.toLowerCase()}?`},{role:"ai",text:sel.preview+" This is your full archived conversation. Every exchange preserved in the neural memory for replay or continuation."},{role:"user",text:"Can you give me a more concrete example?"},{role:"ai",text:"Here's a step-by-step breakdown with annotated code. You can resume this session directly from here."}].map((m,i)=>(
              <div key={i} style={{ display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",animation:`slideInUp 0.4s ease ${i*90}ms both` }}>
                <div style={{ maxWidth:"80%",padding:"11px 15px",borderRadius:m.role==="user"?"15px 15px 4px 15px":"4px 15px 15px 15px",background:m.role==="user"?"linear-gradient(135deg,rgba(232,201,122,0.13),rgba(168,216,255,0.08))":"rgba(255,255,255,0.03)",border:`1px solid ${m.role==="user"?"rgba(232,201,122,0.18)":"rgba(255,255,255,0.05)"}`,fontFamily:"Exo 2,sans-serif",color:"rgba(255,255,255,0.78)",fontSize:12,lineHeight:1.7 }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding:"12px 22px",borderTop:"1px solid rgba(255,255,255,0.04)",display:"flex",gap:9 }}>
            <div style={{ flex:1,padding:"10px 14px",borderRadius:10,border:"1px solid rgba(232,201,122,0.08)",background:"rgba(232,201,122,0.02)",fontFamily:"Exo 2,sans-serif",color:"rgba(255,255,255,0.18)",fontSize:12 }}>Continue this session…</div>
            <button style={{ padding:"10px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,rgba(232,201,122,0.65),rgba(245,217,142,0.45))",color:"var(--void)",fontFamily:"Cinzel,serif",fontSize:10,fontWeight:700,letterSpacing:2,cursor:"pointer" }}>RESUME</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   LANGUAGE PAGE
══════════════════════════════════════════ */
const LANGS=[
  {code:"en-US",name:"English (US)",flag:"🇺🇸",accent:"American"},
  {code:"en-GB",name:"English (UK)",flag:"🇬🇧",accent:"British"},
  {code:"hi-IN",name:"Hindi",       flag:"🇮🇳",accent:"Standard"},
  {code:"es-ES",name:"Spanish",     flag:"🇪🇸",accent:"Castilian"},
  {code:"fr-FR",name:"French",      flag:"🇫🇷",accent:"Parisian"},
  {code:"de-DE",name:"German",      flag:"🇩🇪",accent:"Standard"},
  {code:"ja-JP",name:"Japanese",    flag:"🇯🇵",accent:"Tokyo"},
  {code:"zh-CN",name:"Mandarin",    flag:"🇨🇳",accent:"Putonghua"},
  {code:"ko-KR",name:"Korean",      flag:"🇰🇷",accent:"Seoul"},
  {code:"pt-BR",name:"Portuguese",  flag:"🇧🇷",accent:"Brazilian"},
  {code:"ar-SA",name:"Arabic",      flag:"🇸🇦",accent:"Gulf"},
  {code:"ru-RU",name:"Russian",     flag:"🇷🇺",accent:"Moscow"},
];

function LanguagePage() {
  const [sel,setSel]=useState("en-US"); const [speed,setSpeed]=useState(1.0); const [pitch,setPitch]=useState(1.0);
  const [testText,setTestText]=useState("Greetings. The neural core is online and awaiting your command."); const [playing,setPlaying]=useState(false);
  const [listening,setListening]=useState(false); const [transcript,setTranscript]=useState(""); const [search,setSearch]=useState("");
  const recRef=useRef(null); const selLang=LANGS.find(l=>l.code===sel);
  const filtered=LANGS.filter(l=>l.name.toLowerCase().includes(search.toLowerCase()));
  const testTTS=()=>{ if(!window.speechSynthesis)return; window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(testText); u.lang=sel;u.rate=speed;u.pitch=pitch; const v=window.speechSynthesis.getVoices().find(x=>x.lang.startsWith(sel.split("-")[0])); if(v)u.voice=v; u.onstart=()=>setPlaying(true);u.onend=()=>setPlaying(false); window.speechSynthesis.speak(u); };
  const testSTT=()=>{ const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR)return; const r=new SR();r.lang=sel;r.continuous=false;r.interimResults=true; r.onstart=()=>{setListening(true);setTranscript("");}; r.onresult=e=>setTranscript(Array.from(e.results).map(x=>x[0].transcript).join("")); r.onend=()=>setListening(false); r.start();recRef.current=r; };
  return (
    <div style={{ overflowY:"auto",flex:1,padding:"26px 22px" }}>
      <Reveal style={{ marginBottom:26 }}>
        <GlitchTitle text="DIALECT ENGINE" size="26px"/>
        <p style={{ fontFamily:"Space Mono,monospace",color:"rgba(255,255,255,0.18)",fontSize:9,letterSpacing:3,marginTop:7 }}>CONFIGURE VOICE SYNTHESIS · NEURAL RECOGNITION</p>
      </Reveal>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1.1fr",gap:18,maxWidth:900,marginBottom:18 }}>
        {/* Picker */}
        <Reveal delay={80}>
          <HoloCard style={{ overflow:"hidden" }}>
            <div style={{ padding:"14px 16px",borderBottom:"1px solid rgba(232,201,122,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <span style={{ fontFamily:"Cinzel,serif",color:"var(--gold)",fontSize:10,letterSpacing:3 }}>SELECT DIALECT</span>
              <span style={{ fontFamily:"Space Mono,monospace",color:"rgba(168,216,255,0.5)",fontSize:8,letterSpacing:2 }}>{sel}</span>
            </div>
            <div style={{ padding:"10px 12px" }}>
              <div style={{ position:"relative",marginBottom:8 }}>
                <Search size={11} color="rgba(232,201,122,0.3)" style={{ position:"absolute",left:9,top:"50%",transform:"translateY(-50%)" }}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="FILTER…" style={{ width:"100%",padding:"7px 9px 7px 27px",borderRadius:8,border:"1px solid rgba(232,201,122,0.09)",background:"rgba(232,201,122,0.02)",color:"rgba(255,255,255,0.65)",fontFamily:"Space Mono,monospace",fontSize:9,letterSpacing:1,outline:"none" }}/>
              </div>
              <div style={{ maxHeight:270,overflowY:"auto",display:"flex",flexDirection:"column",gap:2 }}>
                {filtered.map(lang=>{
                  const isSel=sel===lang.code;
                  return <button key={lang.code} onClick={()=>setSel(lang.code)} data-hover="1"
                    style={{ display:"flex",alignItems:"center",gap:9,padding:"8px 9px",borderRadius:9,border:`1px solid ${isSel?"rgba(232,201,122,0.28)":"transparent"}`,background:isSel?"rgba(232,201,122,0.06)":"transparent",cursor:"pointer",transition:"all 0.18s",textAlign:"left" }}
                    onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background="rgba(255,255,255,0.025)";}}
                    onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background="transparent";}}>
                    <span style={{ fontSize:17 }}>{lang.flag}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"Exo 2,sans-serif",color:isSel?"var(--gold)":"rgba(255,255,255,0.65)",fontSize:11,fontWeight:600 }}>{lang.name}</div>
                      <div style={{ fontFamily:"Space Mono,monospace",color:"rgba(255,255,255,0.22)",fontSize:8,letterSpacing:1 }}>{lang.accent}</div>
                    </div>
                    {isSel&&<CheckCircle size={12} color="var(--gold)" style={{ filter:"drop-shadow(0 0 4px var(--gold))" }}/>}
                  </button>;
                })}
              </div>
            </div>
          </HoloCard>
        </Reveal>
        {/* Controls */}
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <Reveal delay={130}>
            <HoloCard style={{ padding:18 }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ fontSize:32,filter:"drop-shadow(0 0 10px rgba(232,201,122,0.3))" }}>{selLang?.flag}</div>
                <div>
                  <div style={{ fontFamily:"Cinzel,serif",color:"var(--gold)",fontSize:14,fontWeight:700,letterSpacing:2 }}>{selLang?.name}</div>
                  <div style={{ fontFamily:"Space Mono,monospace",color:"rgba(255,255,255,0.27)",fontSize:8,letterSpacing:2 }}>{selLang?.accent?.toUpperCase()} · {sel}</div>
                </div>
                {/* Mini bars */}
                <div style={{ marginLeft:"auto",display:"flex",alignItems:"flex-end",gap:2,height:18 }}>
                  {Array.from({length:7}).map((_,i)=><div key={i} style={{ width:3,borderRadius:2,background:`hsl(${42+i*5},70%,${55+i*4}%)`,height:4+i*2,opacity:0.7 }}/>)}
                </div>
              </div>
            </HoloCard>
          </Reveal>
          <Reveal delay={175}>
            <HoloCard style={{ padding:16 }}>
              <div style={{ fontFamily:"Space Mono,monospace",color:"rgba(232,201,122,0.45)",fontSize:8,letterSpacing:3,marginBottom:10 }}>SYNTHESIS SPEED</div>
              <div style={{ display:"flex",gap:5 }}>
                {[{l:"0.5×",v:0.5},{l:"0.75×",v:0.75},{l:"1.0×",v:1.0},{l:"1.25×",v:1.25},{l:"1.5×",v:1.5}].map(s=>(
                  <button key={s.v} onClick={()=>setSpeed(s.v)} style={{ flex:1,padding:"7px 0",borderRadius:7,border:`1px solid ${speed===s.v?"rgba(232,201,122,0.38)":"rgba(255,255,255,0.05)"}`,background:speed===s.v?"rgba(232,201,122,0.09)":"transparent",color:speed===s.v?"var(--gold)":"rgba(255,255,255,0.28)",fontFamily:"Space Mono,monospace",fontSize:8,cursor:"pointer",transition:"all 0.18s",letterSpacing:0.5 }}>{s.l}</button>
                ))}
              </div>
            </HoloCard>
          </Reveal>
          <Reveal delay={215}>
            <HoloCard style={{ padding:16 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}>
                <span style={{ fontFamily:"Space Mono,monospace",color:"rgba(232,201,122,0.45)",fontSize:8,letterSpacing:3 }}>PITCH MODULATION</span>
                <span style={{ fontFamily:"Space Mono,monospace",color:"var(--gold)",fontSize:9 }}>{pitch.toFixed(1)}×</span>
              </div>
              <input type="range" min="0.5" max="2" step="0.05" value={pitch} onChange={e=>setPitch(parseFloat(e.target.value))} style={{ width:"100%",accentColor:"var(--gold)",cursor:"pointer" }}/>
              <div style={{ display:"flex",justifyContent:"space-between",marginTop:5 }}>
                <span style={{ fontFamily:"Space Mono,monospace",color:"rgba(255,255,255,0.14)",fontSize:8 }}>LOW</span>
                <span style={{ fontFamily:"Space Mono,monospace",color:"rgba(255,255,255,0.14)",fontSize:8 }}>HIGH</span>
              </div>
            </HoloCard>
          </Reveal>
        </div>
      </div>
      {/* TTS */}
      <Reveal delay={280} style={{ maxWidth:900,marginBottom:14 }}>
        <HoloCard style={{ padding:20 }}>
          <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:12 }}>
            <Volume2 size={13} color="var(--gold)"/>
            <span style={{ fontFamily:"Cinzel,serif",color:"var(--gold)",fontSize:10,letterSpacing:3 }}>TEXT-TO-SPEECH SYNTHESIZER</span>
          </div>
          <textarea value={testText} onChange={e=>setTestText(e.target.value)} rows={2} style={{ width:"100%",padding:"11px 13px",borderRadius:9,border:"1px solid rgba(232,201,122,0.09)",background:"rgba(0,0,0,0.3)",color:"rgba(255,255,255,0.75)",fontFamily:"Exo 2,sans-serif",fontSize:12,resize:"none",outline:"none",marginBottom:12,lineHeight:1.6 }}/>
          <button onClick={testTTS} data-hover="1" style={{ display:"flex",alignItems:"center",gap:7,padding:"11px 22px",borderRadius:9,border:`1px solid rgba(232,201,122,${playing?0.55:0.22})`,background:playing?"rgba(232,201,122,0.09)":"transparent",color:"var(--gold)",fontFamily:"Cinzel,serif",fontSize:10,fontWeight:600,letterSpacing:3,cursor:"pointer",transition:"all 0.28s",boxShadow:playing?"0 0 20px rgba(232,201,122,0.15)":"none" }}>
            <Volume2 size={14}/> {playing?"TRANSMITTING…":"SYNTHESIZE SPEECH"}
          </button>
        </HoloCard>
      </Reveal>
      {/* STT */}
      <Reveal delay={350} style={{ maxWidth:900 }}>
        <HoloCard gold={false} style={{ padding:20 }}>
          <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:12 }}>
            <Mic size={13} color="var(--ice)"/>
            <span style={{ fontFamily:"Cinzel,serif",color:"var(--ice)",fontSize:10,letterSpacing:3 }}>NEURAL SPEECH RECOGNITION</span>
          </div>
          <div style={{ minHeight:50,padding:"11px 13px",borderRadius:9,border:`1px solid ${listening?"rgba(168,216,255,0.28)":"rgba(255,255,255,0.05)"}`,background:"rgba(0,0,0,0.28)",fontFamily:"Exo 2,sans-serif",color:transcript?"rgba(255,255,255,0.78)":"rgba(255,255,255,0.18)",fontSize:12,lineHeight:1.6,marginBottom:12,transition:"border 0.28s",boxShadow:listening?"inset 0 0 20px rgba(168,216,255,0.03)":"none" }}>
            {transcript||(listening?"🎙 RECEIVING NEURAL SIGNAL…":"Activate below and speak in the selected dialect")}
          </div>
          <div style={{ display:"flex",gap:9 }}>
            <button onClick={listening?(()=>{recRef.current?.stop();setListening(false);}):testSTT} data-hover="1"
              style={{ display:"flex",alignItems:"center",gap:7,padding:"11px 22px",borderRadius:9,border:`1px solid rgba(168,216,255,${listening?0.45:0.18})`,background:listening?"rgba(168,216,255,0.07)":"transparent",color:"var(--ice)",fontFamily:"Cinzel,serif",fontSize:10,letterSpacing:3,cursor:"pointer",transition:"all 0.28s",animation:listening?"magneticGlow 2s ease-in-out infinite":"none" }}>
              {listening?<MicOff size={14}/>:<Mic size={14}/>} {listening?"STOP":"ACTIVATE"}
            </button>
            {transcript&&<button onClick={()=>setTranscript("")} style={{ padding:"11px 14px",borderRadius:9,border:"1px solid rgba(255,255,255,0.06)",background:"transparent",color:"rgba(255,255,255,0.25)",fontFamily:"Space Mono,monospace",fontSize:9,cursor:"pointer",letterSpacing:1 }}>CLEAR</button>}
          </div>
        </HoloCard>
      </Reveal>
    </div>
  );
}

/* ══════════════════════════════════════════
   DASHBOARD PAGE
══════════════════════════════════════════ */
function DashboardPage({ user }) {
  return (
    <div style={{ overflowY:"auto",flex:1,padding:"30px 26px" }}>
      <div style={{ marginBottom:38 }}>
        <Reveal>
          <div style={{ fontFamily:"Space Mono,monospace",fontSize:9,letterSpacing:4,color:"rgba(168,216,255,0.35)",marginBottom:8 }}>
            NEURAL SESSION · {new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"}).toUpperCase()}
          </div>
          <div style={{ fontFamily:"Cinzel Decorative,serif",fontSize:"clamp(20px,2.8vw,36px)",fontWeight:900,letterSpacing:3,lineHeight:1.2 }}>
            <span style={{ color:"rgba(255,255,255,0.38)" }}>WELCOME, </span>
            <span className="chroma-text" style={{ color:"var(--gold)",textShadow:"0 0 30px rgba(232,201,122,0.4)" }}>{user?.name?.toUpperCase()}</span>
          </div>
          <div style={{ marginTop:10,width:70,height:1,background:"linear-gradient(90deg,var(--gold),transparent)" }}/>
        </Reveal>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(195px,1fr))",gap:14,marginBottom:36 }}>
        <StatCard icon={History}   label="Archived Sessions"  value="8"   gold={true}  delay={0}/>
        <StatCard icon={Activity}  label="Neural Deployments" value="24"  gold={false} delay={70}/>
        <StatCard icon={Languages} label="Dialect Protocols"  value="12"  gold={true}  delay={140}/>
        <StatCard icon={Cpu}       label="Core Load"          value="37%" gold={false} delay={210}/>
      </div>
      <Reveal delay={200}>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:18 }}>
          <div style={{ width:14,height:1,background:"var(--gold)" }}/>
          <span style={{ fontFamily:"Cinzel,serif",color:"var(--gold)",fontSize:10,letterSpacing:4 }}>RECENT CHRONICLES</span>
          <div style={{ flex:1,height:1,background:"linear-gradient(90deg,rgba(232,201,122,0.25),transparent)" }}/>
        </div>
      </Reveal>
      <div style={{ display:"flex",flexDirection:"column",gap:7,maxWidth:700 }}>
        {CHATS.slice(0,5).map((c,i)=>(
          <Reveal key={c.id} delay={250+i*55}>
            <div style={{ display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderRadius:11,border:"1px solid rgba(255,255,255,0.04)",background:"rgba(255,255,255,0.01)",cursor:"pointer",transition:"all 0.28s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(232,201,122,0.025)";e.currentTarget.style.borderColor="rgba(232,201,122,0.13)";e.currentTarget.style.transform="translateX(7px)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.01)";e.currentTarget.style.borderColor="rgba(255,255,255,0.04)";e.currentTarget.style.transform="none";}}>
              <div style={{ width:5,height:5,borderRadius:"50%",background:c.hue,flexShrink:0,boxShadow:`0 0 9px ${c.hue}` }}/>
              <div style={{ flex:1,overflow:"hidden" }}>
                <div style={{ fontFamily:"Exo 2,sans-serif",color:"rgba(255,255,255,0.78)",fontSize:12,fontWeight:600,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.title}</div>
                <div style={{ fontFamily:"Exo 2,sans-serif",color:"rgba(255,255,255,0.22)",fontSize:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.preview}</div>
              </div>
              <div style={{ textAlign:"right",flexShrink:0 }}>
                <div style={{ fontFamily:"Space Mono,monospace",color:"rgba(255,255,255,0.18)",fontSize:8,letterSpacing:1,marginBottom:2 }}>{c.date}</div>
                <div style={{ fontFamily:"Space Mono,monospace",color:"rgba(232,201,122,0.38)",fontSize:8 }}>{c.msgs} msg</div>
              </div>
              <ChevronRight size={13} color="rgba(232,201,122,0.28)"/>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SIRI-STYLE VOICE ASSISTANT
   • Wake word: "nexus" (always-on STT loop)
   • Auto-sleep after 30 s of inactivity
   • Male / Female voice toggle
   • STT → Anthropic API → TTS pipeline
══════════════════════════════════════════ */
function VoiceAssistant() {
  /* ── state ── */
  const [awake,   setAwake]   = useState(false);   // nexus is active
  const [open,    setOpen]    = useState(false);   // panel visible
  const [phase,   setPhase]   = useState("idle");  // idle|wake|listening|thinking|speaking
  const [msgs,    setMsgs]    = useState([]);
  const [input,   setInput]   = useState("");
  const [muted,   setMuted]   = useState(false);
  const [voiceGender, setVoiceGender] = useState("female"); // "male"|"female"
  const [bars,    setBars]    = useState(Array(18).fill(3));
  const [wakeHint,setWakeHint]= useState(true);    // show "say nexus" tip briefly

  /* ── refs ── */
  const scrollRef    = useRef(null);
  const wakeRecRef   = useRef(null);   // continuous wake-word recognition
  const cmdRecRef    = useRef(null);   // single-shot command recognition
  const sleepTimer   = useRef(null);
  const phaseRef     = useRef(phase);
  useEffect(()=>{ phaseRef.current=phase; },[phase]);

  /* ── auto-scroll ── */
  useEffect(()=>{ if(scrollRef.current) scrollRef.current.scrollTop=scrollRef.current.scrollHeight; },[msgs]);

  /* ── waveform bars ── */
  useEffect(()=>{
    const active = phase==="listening"||phase==="speaking"||phase==="wake";
    if(!active){ setBars(Array(18).fill(3)); return; }
    const id = setInterval(()=>setBars(Array(18).fill(0).map(()=>2+Math.random()*24)),70);
    return()=>clearInterval(id);
  },[phase]);

  /* ── hide hint after 5 s ── */
  useEffect(()=>{ const t=setTimeout(()=>setWakeHint(false),5000); return()=>clearTimeout(t); },[]);

  /* ── reset sleep timer ── */
  const resetSleep = useCallback(()=>{
    clearTimeout(sleepTimer.current);
    sleepTimer.current = setTimeout(()=>{
      setAwake(false); setOpen(false); setPhase("idle");
      window.speechSynthesis?.cancel();
      cmdRecRef.current?.abort();
    }, 30000);
  },[]);

  /* ── pick TTS voice ── */
  const pickVoice = useCallback((gender)=>{
    const voices = window.speechSynthesis?.getVoices() || [];
    if(gender==="male"){
      return voices.find(v=>/(male|daniel|david|james|mark|alex|google uk english male|microsoft david)/i.test(v.name))
          || voices.find(v=>v.lang.startsWith("en") && /(male)/i.test(v.name))
          || voices.find(v=>v.lang.startsWith("en"));
    } else {
      return voices.find(v=>/(female|samantha|victoria|karen|moira|google us english|google uk english female|microsoft zira|tessa)/i.test(v.name))
          || voices.find(v=>v.lang.startsWith("en") && /(female)/i.test(v.name))
          || voices.find(v=>v.lang.startsWith("en"));
    }
  },[]);

  /* ── speak TTS ── */
  const speak = useCallback((text, gender=voiceGender)=>{
    if(muted||!window.speechSynthesis) return Promise.resolve();
    window.speechSynthesis.cancel();
    return new Promise(resolve=>{
      const u = new SpeechSynthesisUtterance(text);
      u.rate  = gender==="male" ? 0.91 : 0.95;
      u.pitch = gender==="male" ? 0.75 : 1.15;
      const doSpeak=()=>{
        const v = pickVoice(gender);
        if(v) u.voice = v;
        u.onstart = ()=>setPhase("speaking");
        u.onend   = ()=>{ setPhase("idle"); resolve(); };
        u.onerror = ()=>{ setPhase("idle"); resolve(); };
        window.speechSynthesis.speak(u);
      };
      // voices may not be loaded yet
      if(window.speechSynthesis.getVoices().length) doSpeak();
      else { window.speechSynthesis.onvoiceschanged=doSpeak; }
    });
  },[muted, voiceGender, pickVoice]);

  /* ── send to Anthropic API ── */
  const sendToAPI = useCallback(async(userText)=>{
    setPhase("thinking");
    setMsgs(m=>[...m,{role:"user",text:userText}]);
    let reply = "";
    try {
      const history = msgs.slice(-8).map(m=>({ role: m.role==="ai"?"assistant":"user", content: m.text }));
      history.push({ role:"user", content: userText });
    
    // Backend integration
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:"You are NEXUS, a cinematic sci-fi AI assistant. Be concise, helpful, and slightly futuristic in tone. Keep spoken responses under 3 sentences when possible.",
          messages: history
        })
      });
      const data = await res.json();
      reply = data?.content?.[0]?.text || "Neural pathways momentarily disrupted. Please repeat your query.";
    } catch(e) {
      reply = "Connection to neural core failed. Check your access credentials.";
    }
    setMsgs(m=>[...m,{role:"ai",text:reply}]);
    resetSleep();
    await speak(reply);
  },[msgs, speak, resetSleep]);

  /* ── start command listening ── */
  const startListening = useCallback(()=>{
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return;
    cmdRecRef.current?.abort();
    const r = new SR();
    r.lang = "en-US"; r.continuous = false; r.interimResults = false;
    r.onstart  = ()=>{ setPhase("listening"); resetSleep(); };
    r.onresult = e=>{ const t=e.results[0][0].transcript.trim(); if(t) sendToAPI(t); };
    r.onerror  = ()=>setPhase("idle");
    r.onend    = ()=>{ if(phaseRef.current==="listening") setPhase("idle"); };
    r.start();
    cmdRecRef.current = r;
  },[sendToAPI, resetSleep]);

  /* ── wake-word loop ── */
  const startWakeLoop = useCallback(()=>{
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return;
    const loop=()=>{
      if(phaseRef.current!=="idle") return; // don't double-start
      const r = new SR();
      r.lang="en-US"; r.continuous=false; r.interimResults=false;
      r.onresult=e=>{
        const t=e.results[0][0].transcript.toLowerCase();
        if(t.includes("nexus")){
          setAwake(true); setOpen(true); setPhase("wake"); setWakeHint(false);
          // greet
          setTimeout(()=>{
            speak("Yes? I'm listening.").then(()=>{
              setPhase("idle");
              startListening();
            });
            resetSleep();
          },200);
        }
      };
      r.onend=()=>{ setTimeout(loop, 400); }; // restart after end
      r.onerror=()=>{ setTimeout(loop, 1000); };
      r.start();
      wakeRecRef.current=r;
    };
    loop();
  },[speak, startListening, resetSleep]);

  /* ── boot wake loop on mount ── */
  useEffect(()=>{
    // small delay so voices can load
    const t = setTimeout(startWakeLoop, 1200);
    return()=>{
      clearTimeout(t);
      clearTimeout(sleepTimer.current);
      wakeRecRef.current?.abort();
      cmdRecRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  },[startWakeLoop]);

  /* ── manual mic tap (when panel open) ── */
  const handleMicTap = ()=>{
    if(phase==="listening"){ cmdRecRef.current?.abort(); setPhase("idle"); }
    else if(phase==="idle"||phase==="wake"){ resetSleep(); startListening(); }
  };

  /* ── manual text send ── */
  const handleSend = ()=>{ if(input.trim()){ sendToAPI(input.trim()); setInput(""); }};

  /* ── colors ── */
  const sc = phase==="listening"?"var(--crimson)":phase==="speaking"?"var(--ice)":phase==="thinking"?"var(--plasma)":phase==="wake"?"var(--gold)":"var(--gold)";

  /* ── voice label ── */
  const voiceLabel = voiceGender==="female"?"♀ FEMALE":"♂ MALE";

  return (
    <>
      {/* ── WAKE HINT pill ── */}
      {wakeHint&&(
        <div style={{ position:"fixed",bottom:96,right:26,zIndex:1001,background:"rgba(2,3,9,0.88)",border:"1px solid rgba(232,201,122,0.18)",borderRadius:20,padding:"6px 14px",backdropFilter:"blur(20px)",animation:"slideInUp 0.4s ease",pointerEvents:"none" }}>
          <span style={{ fontFamily:"Space Mono,monospace",color:"rgba(232,201,122,0.55)",fontSize:9,letterSpacing:2 }}>SAY "NEXUS" TO WAKE</span>
        </div>
      )}

      {/* ── FAB ── */}
      <button onClick={()=>{ if(awake){ setOpen(o=>!o); } else { setWakeHint(true); setTimeout(()=>setWakeHint(false),3000); }}} data-hover="1"
        style={{ position:"fixed",bottom:26,right:26,width:56,height:56,borderRadius:"50%",border:`1px solid ${awake?(open?"rgba(255,51,102,0.4)":"rgba(232,201,122,0.38)"):"rgba(232,201,122,0.18)"}`,background:awake?(open?"rgba(255,51,102,0.07)":"rgba(232,201,122,0.05)"):"rgba(232,201,122,0.02)",boxShadow:awake?"0 0 30px rgba(232,201,122,0.18),0 0 60px rgba(232,201,122,0.06)":"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,transition:"all 0.4s cubic-bezier(.34,1.56,.64,1)",transform:open&&awake?"scale(0.9) rotate(45deg)":"scale(1)",animation:awake&&!open?"neonPulse 3.5s ease-in-out infinite":"none",backdropFilter:"blur(20px)" }}>
        {open&&awake?<X size={20} color="rgba(255,51,102,0.75)"/>:<Mic size={20} color={awake?"var(--gold)":"rgba(232,201,122,0.3)"} style={{ filter:awake?"drop-shadow(0 0 5px var(--gold))":"none" }}/>}
        {/* sleeping dot */}
        {!awake&&<div style={{ position:"absolute",bottom:10,right:10,width:6,height:6,borderRadius:"50%",background:"rgba(232,201,122,0.25)" }}/>}
        {/* awake dot */}
        {awake&&!open&&<div style={{ position:"absolute",bottom:10,right:10,width:6,height:6,borderRadius:"50%",background:"var(--gold)",boxShadow:"0 0 8px var(--gold)",animation:"neonPulse 1.5s ease-in-out infinite" }}/>}
      </button>

      {/* ── PANEL ── */}
      {open&&awake&&(
        <div style={{ position:"fixed",bottom:94,right:26,width:380,maxWidth:"calc(100vw - 52px)",background:"rgba(2,3,9,0.97)",border:"1px solid rgba(232,201,122,0.13)",borderRadius:20,zIndex:999,backdropFilter:"blur(40px)",boxShadow:"0 0 80px rgba(232,201,122,0.06),0 30px 80px rgba(0,0,0,0.88)",display:"flex",flexDirection:"column",overflow:"hidden",animation:"slideInUp 0.4s cubic-bezier(.34,1.56,.64,1)",maxHeight:"70vh" }}>

          {/* Header */}
          <div style={{ padding:"12px 16px",borderBottom:"1px solid rgba(232,201,122,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(232,201,122,0.012)",flexShrink:0 }}>
            <div style={{ display:"flex",alignItems:"center",gap:9 }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:sc,boxShadow:`0 0 10px ${sc}`,animation:"neonPulse 2s ease-in-out infinite" }}/>
              <span style={{ fontFamily:"Cinzel,serif",color:"var(--gold)",fontSize:11,letterSpacing:3 }}>NEXUS</span>
              <span style={{ fontFamily:"Space Mono,monospace",color:"rgba(255,255,255,0.22)",fontSize:8,letterSpacing:2 }}>
                {phase==="listening"?"RECEIVING":phase==="speaking"?"TRANSMITTING":phase==="thinking"?"PROCESSING":phase==="wake"?"AWAKENING":"STANDBY"}
              </span>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              {/* Voice gender toggle */}
              <button onClick={()=>setVoiceGender(g=>g==="female"?"male":"female")} data-hover="1"
                style={{ padding:"3px 9px",borderRadius:10,border:"1px solid rgba(232,201,122,0.2)",background:"rgba(232,201,122,0.04)",color:"rgba(232,201,122,0.65)",fontFamily:"Space Mono,monospace",fontSize:8,letterSpacing:1,cursor:"pointer",transition:"all 0.2s" }}
                title="Toggle voice gender">
                {voiceLabel}
              </button>
              <button onClick={()=>setMuted(m=>!m)} style={{ background:"none",border:"none",color:muted?"rgba(255,80,80,0.65)":"rgba(255,255,255,0.28)",cursor:"pointer" }}>
                {muted?<VolumeX size={14}/>:<Volume2 size={14}/>}
              </button>
            </div>
          </div>

          {/* SIRI ORB + waveform */}
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 0 10px",gap:14,flexShrink:0 }}>
            {/* Siri-style orb */}
            <div style={{ position:"relative",width:72,height:72 }} onClick={handleMicTap} data-hover="1">
              {/* Ripple rings when active */}
              {(phase==="listening"||phase==="speaking"||phase==="wake")&&<>
                <div style={{ position:"absolute",inset:-14,borderRadius:"50%",border:`1px solid ${sc}`,opacity:0.45,animation:"rippleOut 2s ease-out infinite" }}/>
                <div style={{ position:"absolute",inset:-26,borderRadius:"50%",border:`1px solid ${sc}`,opacity:0.22,animation:"rippleOut 2s ease-out infinite 0.6s" }}/>
                <div style={{ position:"absolute",inset:-40,borderRadius:"50%",border:`1px solid ${sc}`,opacity:0.1,animation:"rippleOut 2s ease-out infinite 1.2s" }}/>
              </>}
              {/* Siri gradient orb */}
              <div style={{
                width:"100%",height:"100%",borderRadius:"50%",cursor:"pointer",
                background:
                  phase==="listening"  ? "radial-gradient(circle at 38% 38%,#ff6090,#ff3366 45%,#7b4fff 80%,#a8d8ff)" :
                  phase==="speaking"   ? "radial-gradient(circle at 38% 38%,#c4f0ff,#a8d8ff 45%,#7b4fff 80%,#e8c97a)" :
                  phase==="thinking"   ? "radial-gradient(circle at 38% 38%,#b88fff,#7b4fff 45%,#3a1fff 80%,#ff3366)" :
                  phase==="wake"       ? "radial-gradient(circle at 38% 38%,#ffe28a,#e8c97a 45%,#ff6b35 80%,#7b4fff)" :
                                         "radial-gradient(circle at 38% 38%,rgba(232,201,122,0.6),rgba(232,201,122,0.2) 60%,rgba(123,79,255,0.15))",
                boxShadow:`0 0 40px ${sc}66,0 0 80px ${sc}22`,
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"background 0.5s ease, box-shadow 0.4s ease",
                animation:"orbFloat 4s ease-in-out infinite",
                border:`1px solid ${sc}44`
              }}>
                {phase==="thinking"
                  ? <div style={{ width:22,height:22,border:"2px solid rgba(255,255,255,0.5)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.7s linear infinite" }}/>
                  : <Mic size={22} color="rgba(255,255,255,0.9)" style={{ filter:"drop-shadow(0 0 8px rgba(255,255,255,0.8))" }}/>
                }
              </div>
            </div>
            {/* tap hint */}
            <div style={{ fontFamily:"Space Mono,monospace",color:"rgba(255,255,255,0.2)",fontSize:8,letterSpacing:2 }}>
              {phase==="idle"?"TAP ORB OR SPEAK":phase==="listening"?"LISTENING…":phase==="thinking"?"PROCESSING…":phase==="speaking"?"SPEAKING…":"NEXUS AWAKE"}
            </div>
            {/* Siri waveform bars */}
            <div style={{ display:"flex",alignItems:"center",gap:2,height:32 }}>
              {bars.map((h,i)=>(
                <div key={i} style={{
                  width:3,borderRadius:3,
                  background: phase==="listening" ? `hsl(${340+i*2},90%,${55+i}%)` :
                              phase==="speaking"  ? `hsl(${195+i*3},80%,${65+i}%)` :
                              phase==="thinking"  ? `hsl(${265+i*2},80%,${60+i}%)` :
                                                    "rgba(232,201,122,0.22)",
                  height:h,
                  transition:"height 0.07s ease",
                  boxShadow:(phase!=="idle")?"0 0 6px currentColor":"none"
                }}/>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex:1,overflowY:"auto",padding:"6px 14px",display:"flex",flexDirection:"column",gap:9,minHeight:60 }}>
            {msgs.length===0&&(
              <div style={{ textAlign:"center",padding:"14px 0",fontFamily:"Space Mono,monospace",color:"rgba(255,255,255,0.14)",fontSize:9,letterSpacing:2 }}>
                SAY "NEXUS" THEN SPEAK YOUR QUERY
              </div>
            )}
            {msgs.map((m,i)=>(
              <div key={i} style={{ display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
                <div style={{ maxWidth:"86%",padding:"9px 13px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"4px 14px 14px 14px",background:m.role==="user"?"linear-gradient(135deg,rgba(232,201,122,0.12),rgba(168,216,255,0.08))":"rgba(255,255,255,0.03)",border:`1px solid ${m.role==="user"?"rgba(232,201,122,0.18)":"rgba(255,255,255,0.05)"}`,fontFamily:"Exo 2,sans-serif",color:"rgba(255,255,255,0.78)",fontSize:12,lineHeight:1.65 }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Text input row */}
          <div style={{ padding:"10px 12px",borderTop:"1px solid rgba(232,201,122,0.05)",display:"flex",gap:7,alignItems:"center",flexShrink:0 }}>
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&input.trim()&&handleSend()}
              placeholder="Type a query…"
              style={{ flex:1,padding:"8px 12px",borderRadius:9,border:"1px solid rgba(232,201,122,0.09)",background:"rgba(232,201,122,0.02)",color:"rgba(255,255,255,0.78)",fontFamily:"Exo 2,sans-serif",fontSize:12,outline:"none",letterSpacing:0.3 }}/>
            <button onClick={handleSend}
              style={{ width:34,height:34,borderRadius:8,border:"1px solid rgba(232,201,122,0.18)",background:"rgba(232,201,122,0.05)",color:"var(--gold)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(232,201,122,0.13)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(232,201,122,0.05)"}><Send size={13}/></button>
            <button onClick={handleMicTap}
              style={{ width:34,height:34,borderRadius:8,border:`1px solid ${phase==="listening"?"rgba(255,51,102,0.4)":"rgba(168,216,255,0.18)"}`,background:phase==="listening"?"rgba(255,51,102,0.09)":"rgba(168,216,255,0.04)",color:phase==="listening"?"var(--crimson)":"var(--ice)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",animation:phase==="listening"?"neonPulse 1s ease-in-out infinite":"none" }}>
              {phase==="listening"?<MicOff size={13}/>:<Mic size={13}/>}
            </button>
          </div>

          {/* Sleep / 30s countdown hint */}
          <div style={{ padding:"5px 14px 9px",display:"flex",justifyContent:"center",flexShrink:0 }}>
            <span style={{ fontFamily:"Space Mono,monospace",color:"rgba(255,255,255,0.1)",fontSize:7,letterSpacing:2 }}>AUTO-SLEEP AFTER 30S INACTIVITY · SAY "NEXUS" TO REWAKE</span>
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════ */
export default function App() {
  const [intro,setIntro]=useState(false); const [user,setUser]=useState(null); const [nav,setNav]=useState("dashboard"); const [collapsed,setCollapsed]=useState(false); const [transitioning,setTransitioning]=useState(false);
  const goNav=id=>{ if(id===nav)return; setTransitioning(true); setTimeout(()=>{setNav(id);setTransitioning(false);},280); };
  const renderPage=()=>{
    switch(nav){
      case "chathistory": return <ChatHistoryPage/>;
      case "language":    return <LanguagePage/>;
      case "dashboard":   return <DashboardPage user={user}/>;
      default: return <div style={{ padding:32,flex:1 }}><Reveal><GlitchTitle text={nav.toUpperCase()} size="22px"/></Reveal><Reveal delay={100}><p style={{ fontFamily:"Exo 2,sans-serif",color:"rgba(255,255,255,0.25)",fontSize:13,marginTop:14 }}>Module loading…</p></Reveal></div>;
    }
  };
  return (
    <>
      <GlobalStyles/>
      <MagneticCursor/>
      <CinematicOverlay/>
      {!intro&&<IntroSequence onDone={()=>setIntro(true)}/>}
      {intro&&!user&&<LoginScreen onLogin={setUser}/>}
      {intro&&user&&(
        <div style={{ display:"flex",height:"100vh",background:"var(--void)",overflow:"hidden",position:"relative" }}>
          <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none" }}><GalaxyScene dim/></div>
          <div style={{ position:"relative",zIndex:1,display:"flex",width:"100%",height:"100%" }}>
            <Sidebar active={nav} onNav={goNav} user={user} onLogout={()=>setUser(null)} collapsed={collapsed} setCollapsed={setCollapsed}/>
            <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
              {/* Topbar */}
              <div style={{ height:52,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 22px",borderBottom:"1px solid rgba(232,201,122,0.06)",background:"rgba(2,3,9,0.72)",backdropFilter:"blur(30px)",flexShrink:0 }}>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <button onClick={()=>setCollapsed(c=>!c)} data-hover="1" style={{ background:"none",border:"none",color:"rgba(232,201,122,0.35)",cursor:"pointer",fontSize:16,lineHeight:1,transition:"color 0.2s" }}
                    onMouseEnter={e=>e.currentTarget.style.color="var(--gold)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(232,201,122,0.35)"}>☰</button>
                  <div style={{ width:1,height:18,background:"rgba(232,201,122,0.08)" }}/>
                  <div style={{ fontFamily:"Space Mono,monospace",fontSize:8,letterSpacing:3,color:"rgba(232,201,122,0.35)" }}>NEXUS · {NAV.find(n=>n.id===nav)?.label}</div>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:5,padding:"4px 11px",borderRadius:20,border:"1px solid rgba(168,216,255,0.12)",background:"rgba(168,216,255,0.025)" }}>
                    <div style={{ width:4,height:4,borderRadius:"50%",background:"var(--ice)",boxShadow:"0 0 6px var(--ice)",animation:"neonPulse 2.5s ease-in-out infinite" }}/>
                    <span style={{ fontFamily:"Space Mono,monospace",color:"rgba(168,216,255,0.38)",fontSize:8,letterSpacing:2 }}>LIVE</span>
                  </div>
                  <button data-hover="1" style={{ background:"none",border:"none",color:"rgba(255,255,255,0.28)",cursor:"pointer",position:"relative" }}>
                    <Bell size={15}/>
                    <div style={{ position:"absolute",top:-2,right:-2,width:6,height:6,borderRadius:"50%",background:"var(--crimson)",border:"1px solid var(--void)",boxShadow:"0 0 7px var(--crimson)" }}/>
                  </button>
                </div>
              </div>
              {/* Page with transition */}
              <div style={{ flex:1,overflow:"hidden",display:"flex",flexDirection:"column",opacity:transitioning?0:1,transform:transitioning?"translateY(12px)":"none",transition:"opacity 0.28s ease,transform 0.28s ease" }}>
                {renderPage()}
              </div>
            </div>
          </div>
          <VoiceAssistant/>
        </div>
      )}
    </>
  );
}
