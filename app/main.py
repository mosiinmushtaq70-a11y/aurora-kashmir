import sys
import os
import streamlit.components.v1 as components
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import time
import glob
import json

from space_weather import get_solar_wind, get_kp_index, get_solar_flares, get_solar_wind_history
from predictor import calculate_aurora_probability
import data_manager

# ── Auto refresh every 10 minutes ──
st.session_state.setdefault('last_refresh', time.time())
if time.time() - st.session_state.last_refresh > 600:
    st.session_state.last_refresh = time.time()
    st.rerun()

st.set_page_config(page_title="Aurora Kashmir", page_icon="🌌", layout="wide", initial_sidebar_state="collapsed")

# ── Inject WebGL Background ──
components.html("""
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
    const ex = window.parent.document.getElementById('aurora-bg'); if(ex) ex.remove();
    const c = window.parent.document.createElement('div');
    c.id = 'aurora-bg'; Object.assign(c.style, {position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:'-999',pointerEvents:'none',background:'#060010'});
    window.parent.document.body.appendChild(c);
    const s = new THREE.Scene(); const cam = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    const r = new THREE.WebGLRenderer({antialias:false,alpha:true,powerPreference:'high-performance'});
    r.setSize(window.parent.innerWidth, window.parent.innerHeight); r.setPixelRatio(Math.min(window.parent.devicePixelRatio,2));
    c.appendChild(r.domElement);
    const mat = new THREE.ShaderMaterial({
        uniforms: {uT:{value:0},uR:{value:new THREE.Vector2(window.parent.innerWidth,window.parent.innerHeight)}},
        vertexShader:`varying vec2 vU; void main(){vU=uv;gl_Position=vec4(position,1.0);}`,
        fragmentShader:`precision highp float; uniform float uT; uniform vec2 uR;
            void main(){
                vec2 uv=(gl_FragCoord.xy/uR.xy*2.0-1.0)*vec2(uR.x/uR.y,1.0);
                float a=0.43; vec2 rv=vec2(cos(a)*uv.x-sin(a)*uv.y,sin(a)*uv.x+cos(a)*uv.y);
                vec3 ro=vec3(0,0,-10),rd=normalize(vec3(rv,1));vec3 col=vec3(0);float t=0.1;
                for(int i=0;i<30;i++){
                    vec3 p=ro+rd*t;float c=cos(uT*0.3),s=sin(uT*0.3);p.xz=vec2(c*p.x-s*p.z,s*p.x+c*p.z);
                    vec3 q=p;q.y=p.y*0.5+uT;float f=1.0,am=1.0;
                    for(int j=0;j<2;j++){q.xz=vec2(cos(0.4)*q.x-sin(0.4)*q.z,sin(0.4)*q.x+cos(0.4)*q.z);q+=cos(q.zxy*f-uT*float(j)*2.0)*am;f*=2.0;am*=0.5;}
                    float d=abs(max(length(cos(q.xz))-0.2,length(p.xz)-2.4))*0.15+0.01;
                    col+=mix(vec3(0,0.86,0.51),vec3(0.32,0.15,1),clamp((15.0-p.y)/30.0,0.0,1.0))/d;
                    t+=d*1.5;if(t>40.0)break;
                }
                gl_FragColor=vec4((exp(2.0*col*0.0025)-1.0)/(exp(2.0*col*0.0025)+1.0),1.0);
            }`,transparent:true
    });
    s.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat));
    function an(){mat.uniforms.uT.value+=0.01;r.render(s,cam);requestAnimationFrame(an);}an();
    window.parent.addEventListener('resize',()=>{r.setSize(window.parent.innerWidth,window.parent.innerHeight);mat.uniforms.uR.value.set(window.parent.innerWidth,window.parent.innerHeight);});
</script>
""", height=0)

# ── CSS ──
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;600&display=swap');
    .stApp,.main,[data-testid="stAppViewContainer"]{background:transparent!important;color:white;font-family:'Inter',sans-serif!important;}
    h1,h2,h3,.glow-title,.score-big,.level-text{font-family:'Orbitron',sans-serif!important;letter-spacing:1px;}
    .metric-card{background:rgba(10,5,25,0.45);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:25px;text-align:center;transition:0.4s;}
    .metric-card:hover{transform:translateY(-10px);border-color:#00dc82;box-shadow:0 10px 30px rgba(0,220,130,0.2);}
    .score-big{font-size:72px;font-weight:900;background:linear-gradient(90deg,#00d4ff,#00dc82);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
    .level-text{font-size:28px;font-weight:700;margin:15px 0;}
    .tip-box{background:rgba(0,220,130,0.1);border-left:4px solid #00dc82;padding:12px 18px;border-radius:6px;margin:8px 0;backdrop-filter:blur(5px);}
</style>
""", unsafe_allow_html=True)

# ── Header ──
st.markdown("<div style='text-align:center;padding:50px 0;'><h1 style='font-size:56px;margin:0;text-shadow:0 0 30px rgba(0,220,130,0.5);'>Aurora Kashmir</h1><p style='color:#a0aec0;font-size:22px;letter-spacing:2px;'>COSMIC WEATHER & AURORA FORECAST</p></div>", unsafe_allow_html=True)

# ── Data Fetch ──
with st.spinner("Synchronizing with Galactic Data Centers..."):
    n_sw=get_solar_wind(); n_kp=get_kp_index(); n_flares=get_solar_flares(); sw_h=get_solar_wind_history()
    if n_sw is not None: st.session_state['sw']=n_sw; data_manager.save_to_cache('solar_wind',n_sw)
    else: cached,_=data_manager.load_from_cache('solar_wind'); st.session_state['sw']=cached
    if n_kp is not None: st.session_state['kp']=n_kp; data_manager.save_to_cache('kp_index',n_kp)
    else: cached,_=data_manager.load_from_cache('kp_index'); st.session_state['kp']=cached
    if n_flares is not None: st.session_state['flares']=n_flares; data_manager.save_to_cache('flares',n_flares)
    else: cached,_=data_manager.load_from_cache('flares'); st.session_state['flares']=cached

if 'sw' not in st.session_state or 'kp' not in st.session_state: st.error("Telemetry Offline."); st.stop()
sw_df=st.session_state['sw']; kp_df=st.session_state['kp']; flares_df=st.session_state['flares']; lat=sw_df.iloc[-1]
bz,bt,kp=float(lat['bz_gsm']),float(lat['bt']),float(kp_df.iloc[-1]['kp'])
res=calculate_aurora_probability(kp=kp,bz=bz,bt=bt)

# ── Score Cards ──
st.markdown("---")
c1,c2,c3=st.columns(3)
with c1: st.markdown(f"<div class='metric-card'>Aurora Score<div class='score-big'>{res['score']}</div>out of 100</div>",unsafe_allow_html=True)
with c2: st.markdown(f"<div class='metric-card'>Visibility Level<div class='level-text' style='color:#00dc82'>{res['level']}</div>{res['description']}</div>",unsafe_allow_html=True)
with c3: st.markdown(f"<div class='metric-card'>Active Flares (7d)<div class='score-big' style='font-size:60px'>{len(flares_df)}</div>active events</div>",unsafe_allow_html=True)

# ── Globe ──
st.markdown("<div style='margin-top:30px'></div>",unsafe_allow_html=True)

kp_val = kp  # Pass live kp to JS

kS = json.dumps([
    {'n':'Gulmarg','d':'Baramulla','lat':34.05,'lon':74.38},
    {'n':'Sonamarg','d':'Ganderbal','lat':34.31,'lon':75.29},
    {'n':'Gurez','d':'Bandipora','lat':34.63,'lon':74.84},
    {'n':'Doodhpathri','d':'Budgam','lat':33.85,'lon':74.52},
    {'n':'Pangong Lake','d':'Ladakh','lat':33.78,'lon':78.65},
    {'n':'Leh','d':'Ladakh','lat':34.15,'lon':77.57},
    {'n':'Kargil','d':'Ladakh','lat':34.55,'lon':76.13},
    {'n':'Sinthan Top','d':'Kishtwar','lat':33.37,'lon':75.48},
    {'n':'Nubra Valley','d':'Ladakh','lat':34.68,'lon':77.56}
])
gS = json.dumps([
    {'n':'Tromsø','lat':69.65,'lon':18.96},{'n':'Reykjavík','lat':64.13,'lon':-21.82},
    {'n':'Fairbanks','lat':64.84,'lon':-147.72},{'n':'Yellowknife','lat':62.45,'lon':-114.37},
    {'n':'Murmansk','lat':68.96,'lon':33.08},{'n':'Abisko','lat':68.35,'lon':18.82},
    {'n':'Rovaniemi','lat':66.50,'lon':25.73},{'n':'Whitehorse','lat':60.72,'lon':-135.05},
    {'n':'Tasmania','lat':-42.88,'lon':147.32},{'n':'Dunedin','lat':-45.87,'lon':170.50},
    {'n':'Edinburgh','lat':55.95,'lon':-3.19},{'n':'Nuuk','lat':64.18,'lon':-51.72},
    {'n':'Punta Arenas','lat':-53.16,'lon':-70.91},{'n':'Ushuaia','lat':-54.80,'lon':-68.30},
    {'n':'Churchill','lat':58.76,'lon':-94.16},{'n':'Salekhard','lat':66.53,'lon':66.60},
    {'n':'Lerwick','lat':60.15,'lon':-1.15},{'n':'McMurdo','lat':-77.84,'lon':166.66},
    {'n':'Barrow, AK','lat':71.29,'lon':-156.78},{'n':'Torshavn','lat':62.01,'lon':-6.77}
])

components.html(f"""
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <style>
    *{{margin:0;padding:0;box-sizing:border-box;}}
    body{{background:transparent;overflow:hidden;font-family:'Inter',sans-serif;}}
    #wrap{{position:relative;width:100%;height:500px;}}
    #c{{width:100%;height:500px;display:block;cursor:grab;}}
    #svg-overlay{{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;}}
    .ov{{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:10px;z-index:10;}}
    .btn{{background:rgba(0,5,20,0.85);border:1px solid #00dc82;color:#00dc82;padding:9px 18px;border-radius:20px;cursor:pointer;font-size:12px;letter-spacing:1px;transition:0.2s;}}
    .btn:hover{{background:rgba(0,220,130,0.2);}}
    .btn.active{{background:#00dc82;color:#000;font-weight:700;}}
  </style>
</head>
<body>
  <div id="wrap">
    <canvas id="c"></canvas>
    <svg id="svg-overlay" xmlns="http://www.w3.org/2000/svg"></svg>
    <div class="ov">
      <button id="b0" class="btn active" onclick="setMode('global')">Global View</button>
      <button id="b1" class="btn" onclick="setMode('kashmir')">Kashmir Focus</button>
    </div>
  </div>
  <script>
    // ─── Scene Setup ───────────────────────────────────────────
    const canvas = document.getElementById('c');
    const svg = document.getElementById('svg-overlay');
    const W = () => canvas.clientWidth, H = () => 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W()/H(), 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({{canvas, antialias:true, alpha:true}});
    renderer.setSize(W(), H()); renderer.setPixelRatio(Math.min(devicePixelRatio,2));

    // ─── Controls ──────────────────────────────────────────────
    // We manually drive camera position so we do NOT use OrbitControls for zooming
    // Instead we use a custom spherical angle approach so we keep full control
    const ctrl = new THREE.OrbitControls(camera, renderer.domElement);
    ctrl.enableDamping = true;
    ctrl.enableZoom = false;
    ctrl.enablePan = false;
    ctrl.autoRotate = true;
    ctrl.autoRotateSpeed = 2.0;  // Faster global spin
    ctrl.target.set(0,0,0);

    let currentMode = 'global';
    let transitioning = false;

    // ─── Earth ─────────────────────────────────────────────────
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(5,64,64),
      new THREE.MeshPhongMaterial({{
        map: new THREE.TextureLoader().load('https://unpkg.com/three-globe/example/img/earth-night.jpg'),
        bumpMap: new THREE.TextureLoader().load('https://unpkg.com/three-globe/example/img/earth-topology.png'),
        bumpScale: 0.05
      }})
    );
    scene.add(earth);

    // ─── Aurora Oval ───────────────────────────────────────────
    const kpFraction = Math.min({kp_val}/9.0, 1.0);
    const aurMat = new THREE.ShaderMaterial({{
      uniforms: {{ uI: {{value: kpFraction}} }},
      vertexShader:`varying vec3 vP; void main(){{ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }}`,
      fragmentShader:`uniform float uI; varying vec3 vP;
        void main(){{
          float np=distance(normalize(vP),vec3(0,1,0));
          float sp=distance(normalize(vP),vec3(0,-1,0));
          float b=(smoothstep(0.7,0.3,np)*smoothstep(0.0,0.25,np))+(smoothstep(0.7,0.3,sp)*smoothstep(0.0,0.25,sp));
          gl_FragColor=vec4(0.0,1.0,0.5,b*max(uI,0.15)*0.6);
        }}`,
      transparent:true, blending:THREE.AdditiveBlending, side:THREE.DoubleSide
    }});
    const auroraOverlay = new THREE.Mesh(new THREE.SphereGeometry(5.12,64,64), aurMat);
    scene.add(auroraOverlay);

    // ─── Lighting ──────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 1); sun.position.set(5,5,5); scene.add(sun);

    // ─── Helpers ───────────────────────────────────────────────
    function latLonTo3D(lat, lon, r) {{
      const phi = (90-lat)*Math.PI/180, theta = (lon+180)*Math.PI/180;
      return new THREE.Vector3(-r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta));
    }}
    function project(v3) {{
      const v = v3.clone(); v.project(camera);
      return {{ x:(v.x*0.5+0.5)*W(), y:(-v.y*0.5+0.5)*H(), z:v.z }};
    }}

    // Kashmir-facing camera positions (defined after latLonTo3D)
    const KASHMIR_CAM = latLonTo3D(34, 75, 7.0);  // Distance 7, facing Kashmir
    const GLOBAL_CAM  = new THREE.Vector3(10, 5, 15);  // Home orbit

    // ─── Dots & Labels ─────────────────────────────────────────
    const dotGroup = new THREE.Group(); scene.add(dotGroup);
    let labelData = [];   // {{ pos3d, label, p2d }}

    const k = {kS};
    const g = {gS};

    function renderGlobal() {{
      dotGroup.clear(); labelData = []; clearSVG();
      g.forEach(h => {{
        const v = latLonTo3D(h.lat, h.lon, 5.05);
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.035,8,8), new THREE.MeshBasicMaterial({{color:0x00d4ff}}));
        m.position.copy(v); dotGroup.add(m);
      }});
      auroraOverlay.visible = true;
      ctrl.autoRotate = true;
    }}

    function renderKashmir() {{
      dotGroup.clear(); labelData = []; clearSVG();
      k.forEach(h => {{
        const v = latLonTo3D(h.lat, h.lon, 5.05);
        // Dot — visible, clear green sphere
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.025,10,10), new THREE.MeshBasicMaterial({{color:0x00ff88}}));
        m.position.copy(v); dotGroup.add(m);
        // Label entry
        labelData.push({{ pos3d: v, name: h.n, district: h.d }});
      }});
      auroraOverlay.visible = false;
      ctrl.autoRotate = false;
    }}

    // ─── SVG Diagram Labels ────────────────────────────────────
    const SVG_NS = 'http://www.w3.org/2000/svg';
    function clearSVG() {{ while(svg.firstChild) svg.removeChild(svg.firstChild); }}

    function drawDiagramLabels() {{
      clearSVG();
      const cx = W()/2, cy = H()/2;
      labelData.forEach(ld => {{
        const p = project(ld.pos3d);
        if (p.z >= 1) return; // Behind camera, skip

        // Direction from screen center → point (radial outward)
        const dx = p.x - cx, dy = p.y - cy;
        const len = Math.sqrt(dx*dx+dy*dy) || 1;
        const nx = dx/len, ny = dy/len;     // unit outward normal

        // Line from dot outward 52px (longer = labels further apart)
        const lx1=p.x, ly1=p.y, lx2=p.x+nx*52, ly2=p.y+ny*52;
        // Horizontal tick 22px right or left
        const tickDir = nx >= 0 ? 1 : -1;
        const tx2 = lx2+tickDir*22, ty2 = ly2;

        // Draw radial line
        const line1 = document.createElementNS(SVG_NS,'line');
        line1.setAttribute('x1',lx1); line1.setAttribute('y1',ly1);
        line1.setAttribute('x2',lx2); line1.setAttribute('y2',ly2);
        line1.setAttribute('stroke','rgba(0,255,136,0.55)'); line1.setAttribute('stroke-width','1');
        svg.appendChild(line1);

        // Draw tick line
        const line2 = document.createElementNS(SVG_NS,'line');
        line2.setAttribute('x1',lx2); line2.setAttribute('y1',ly2);
        line2.setAttribute('x2',tx2); line2.setAttribute('y2',ty2);
        line2.setAttribute('stroke','rgba(0,255,136,0.55)'); line2.setAttribute('stroke-width','1');
        svg.appendChild(line2);

        // Label text (name)
        const anchor = tickDir >= 0 ? 'start' : 'end';
        const textX = tx2 + tickDir*3;
        const tName = document.createElementNS(SVG_NS,'text');
        tName.setAttribute('x', textX); tName.setAttribute('y', ty2-2);
        tName.setAttribute('fill','#00ff88'); tName.setAttribute('font-size','10');
        tName.setAttribute('font-family','Inter,sans-serif'); tName.setAttribute('text-anchor',anchor);
        tName.setAttribute('font-weight','600');
        tName.textContent = ld.name;
        svg.appendChild(tName);

        // District sub-label
        const tDist = document.createElementNS(SVG_NS,'text');
        tDist.setAttribute('x', textX); tDist.setAttribute('y', ty2+10);
        tDist.setAttribute('fill','rgba(0,220,130,0.65)'); tDist.setAttribute('font-size','8.5');
        tDist.setAttribute('font-family','Inter,sans-serif'); tDist.setAttribute('text-anchor',anchor);
        tDist.textContent = ld.district;
        svg.appendChild(tDist);
      }});
    }}

    // ─── Mode State Machine ─────────────────────────────────────
    // FIX: Disable OrbitControls during GSAP so it can't overwrite camera.position,
    // then re-enable and sync with ctrl.update() once tween completes.
    window.setMode = function(mode) {{
      if (transitioning) return;
      if (mode === currentMode) return;
      transitioning = true;
      currentMode = mode;

      document.querySelectorAll('.btn').forEach(b=>b.classList.remove('active'));
      ctrl.enabled = false;   // Disable ctrl so it stops writing camera.position
      ctrl.autoRotate = false;

      if (mode === 'kashmir') {{
        document.getElementById('b1').classList.add('active');
        renderKashmir();
        gsap.to(camera.position, {{
          x: KASHMIR_CAM.x, y: KASHMIR_CAM.y, z: KASHMIR_CAM.z,
          duration: 2.4, ease: 'expo.inOut',
          onUpdate: () => {{ camera.lookAt(0,0,0); }},
          onComplete: () => {{
            ctrl.enabled = true;     // Re-enable after tween done
            ctrl.autoRotate = false; // Stay still on Kashmir
            ctrl.update();           // Sync ctrl's internal spherical state to new position
            transitioning = false;
          }}
        }});
      }} else {{
        document.getElementById('b0').classList.add('active');
        renderGlobal();
        gsap.to(camera.position, {{
          x: GLOBAL_CAM.x, y: GLOBAL_CAM.y, z: GLOBAL_CAM.z,
          duration: 2.4, ease: 'expo.inOut',
          onUpdate: () => {{ camera.lookAt(0,0,0); }},
          onComplete: () => {{
            ctrl.enabled = true;      // Re-enable after tween done
            ctrl.autoRotate = true;   // Resume Earth rotation
            ctrl.update();            // Sync ctrl's internal spherical state
            transitioning = false;
          }}
        }});
      }}
    }};

    // ─── Camera & Render Loop ───────────────────────────────────
    camera.position.set(10, 5, 15);
    camera.lookAt(0,0,0);
    ctrl.update();

    function animate() {{
      requestAnimationFrame(animate);
      ctrl.update();
      camera.lookAt(0,0,0);   // Keep looking at centre at all times

      if (currentMode === 'kashmir') {{
        drawDiagramLabels();
      }} else {{
        clearSVG();
      }}

      renderer.render(scene, camera);
    }}

    // ─── Init ──────────────────────────────────────────────────
    renderGlobal();
    animate();

    window.addEventListener('resize', () => {{
      renderer.setSize(W(), H());
      camera.aspect = W()/H();
      camera.updateProjectionMatrix();
      svg.setAttribute('viewBox', `0 0 ${{W()}} ${{H()}}`);
    }});
  </script>
</body>
</html>
""", height=530)

# ── Live Status ──
st.markdown("---")
st.markdown("### 📡 Live Space Weather Status")
m1,m2,m3=st.columns(3)
with m1: st.metric("Kp Index",f"{kp}",delta="Target: ≥5"); st.caption("Storm Strength (0-9). High values required for Kashmir.")
with m2: st.metric("Bz Component (GSM)",f"{bz} nT",delta="Target: Negative"); st.caption("Shield Status. Negative opens Earth's magnetic shield.")
with m3: st.metric("Bt Total Field",f"{bt} nT",delta="Higher = Stronger"); st.caption("Energy Potential of the solar wind flow.")

# ── Neon History Graphs ──
st.markdown("---")
st.markdown("### Cosmic History (Neon Pulse Rendering)")
t_r=st.select_slider("Select Temporal View:",options=["6 hours","12 hours","1 day","3 days","7 days"],value="1 day")
r_m={"6 hours":6,"12 hours":12,"1 day":24,"3 days":72,"7 days":168}
cut=pd.Timestamp.utcnow().tz_localize(None)-pd.Timedelta(hours=r_m[t_r])

def neon_chart(df, y, col, lab, threshold=None, threshold_lab="Threshold"):
    f = df[df['time_tag'] >= cut]; fig = go.Figure()
    fig.add_trace(go.Scatter(x=f['time_tag'], y=f[y], line=dict(color=col, width=12), opacity=0.1, hoverinfo='skip', showlegend=False))
    fig.add_trace(go.Scatter(x=f['time_tag'], y=f[y], line=dict(color=col, width=6), opacity=0.3, hoverinfo='skip', showlegend=False))
    fig.add_trace(go.Scatter(x=f['time_tag'], y=f[y], name=lab, line=dict(color='#ffffff', width=2), fill='tozeroy', fillcolor=f'rgba({int(col[1:3],16)},{int(col[3:5],16)},{int(col[5:7],16)},0.1)'))
    
    if threshold is not None:
        fig.add_hline(y=threshold, line_dash="dash", line_color="#00d4ff", 
                      annotation_text=f"  {threshold_lab}", 
                      annotation_position="top right",
                      annotation_font_color="#00d4ff")
        # Add a glow effect to the threshold line
        fig.add_hline(y=threshold, line_color="#00d4ff", opacity=0.2, line_width=4)

    fig.update_layout(height=350, template='plotly_dark', paper_bgcolor='rgba(0,0,0,0)', 
                      plot_bgcolor='rgba(0,0,0,0)', margin=dict(l=0,r=0,t=40,b=20))
    st.plotly_chart(fig, use_container_width=True)

st.markdown("#### I. Geomagnetic Activity (Storm Strength)")
neon_chart(kp_df, 'kp', '#00dc82', 'Kp Index', 5, "Kp 5: G1 Storm (Target)")

if sw_h is not None:
    st.markdown("<div style='margin-top:60px'></div>", unsafe_allow_html=True)
    st.markdown("#### II. Interplanetary Magnetic Field — Bz Shield Component")
    neon_chart(sw_h, 'bz_gsm', '#00d4ff', 'Bz Component (nT)', 0, "Bz 0: Neutral Shield")
    
    st.markdown("<div style='margin-top:60px'></div>", unsafe_allow_html=True)
    st.markdown("#### III. Total Magnetic Field Strength — Bt Energy Potential")
    neon_chart(sw_h, 'bt', '#ff8c00', 'Bt Total Field (nT)', 10, "Bt 10: High Potential")

# ── Solar Flares ──
if not flares_df.empty:
    st.markdown("---")
    st.markdown("### ☀️ Recent Solar Flare Events")
    f_cols=st.columns(min(4,len(flares_df)))
    for i,(_, flare) in enumerate(flares_df.head(4).iterrows()):
        with f_cols[i%4]:
            st.markdown(f"""<div class='metric-card' style='padding:15px'>
                <p style='color:#ff4444;font-size:24px;font-weight:900;margin:0;'>{flare['classType']}</p>
                <p style='color:#a0aec0;font-size:11px;margin:5px 0;'>{str(flare['beginTime'])[:16]}</p>
                <p style='font-size:12px;margin:0;'>{flare['sourceLocation']}</p>
            </div>""",unsafe_allow_html=True)

# ── Viewing Tips ──
st.markdown("---")
st.markdown("### 🌠 Viewing Strategy")
for tip in res['tips']: st.markdown(f"<div class='tip-box'>{tip}</div>",unsafe_allow_html=True)

# ── Gallery ──
st.markdown("---")
st.markdown("### 📸 Aurora Gallery")
i_d=os.path.join(os.path.dirname(os.path.dirname(__file__)),'images')
if os.path.exists(i_d):
    fs=glob.glob(os.path.join(i_d,"*.[jJ][pP][gG]"))[:8]
    if fs:
        gcols=st.columns(4)
        for i,f in enumerate(fs):
            with gcols[i%4]: st.image(f,use_container_width=True)

st.markdown("<div style='text-align:center;color:#4a5568;padding:50px;font-size:12px;'>Built with ❤️ for Kashmir — 2026</div>",unsafe_allow_html=True)