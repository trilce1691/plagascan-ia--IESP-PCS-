const $=id=>document.getElementById(id);
let stream=null, imageBlob=null;
const demoDB={
 "Papa":[
  {name:"Gorgojo de los Andes",scientific:"Premnotrypes spp.",why:"Modo demostración: el cultivo seleccionado es papa. El daño de gorgojo suele observarse principalmente en tubérculos y larvas dentro del tubérculo.",natural:"Manejo integrado: aporque adecuado, eliminación de residuos y tubérculos infestados, cosecha oportuna, selección de semilla sana y monitoreo de adultos.",chemical:"No se fija una dosis ni marca. Verificar en SENASA el producto vigente registrado para papa y el organismo objetivo y seguir estrictamente la etiqueta."},
  {name:"Pulgulla de la papa",scientific:"Epitrix spp.",why:"Modo demostración: insecto asociado al cultivo de papa que puede producir pequeños daños en hojas.",natural:"Monitoreo frecuente, eliminación de malezas hospederas y manejo cultural del cultivo.",chemical:"Consultar en SENASA los productos actualmente registrados para papa y el organismo objetivo."}
 ],
 "Quinua":[{name:"Complejo de polillas de la quinua",scientific:"Eurysacca spp. y otros",why:"Modo demostración: en quinua se deben revisar hojas, panojas y presencia de larvas.",natural:"Monitoreo, eliminación de restos y malezas hospederas, conservación de enemigos naturales y cosecha oportuna.",chemical:"Priorizar MIP y verificar en SENASA cualquier producto registrado para quinua y organismo objetivo."}],
 "default":[
  {name:"Pulgones",scientific:"Aphididae",why:"Modo demostración: plaga frecuente en hortalizas; suele encontrarse en brotes y envés de hojas.",natural:"Eliminar brotes muy infestados, controlar malezas hospederas, usar trampas amarillas y conservar enemigos naturales.",chemical:"Verificar producto registrado por SENASA para el cultivo y plaga; seguir etiqueta y medidas de seguridad."},
  {name:"Mosca blanca",scientific:"Aleyrodidae",why:"Modo demostración: revisar envés de hojas, presencia de adultos pequeños, ninfas y melaza.",natural:"Trampas cromáticas, manejo de malezas, ventilación y conservación de enemigos naturales.",chemical:"Verificar registro vigente en SENASA para el cultivo y plaga; respetar etiqueta, EPP y periodo de carencia."},
  {name:"Minador de hojas",scientific:"Agromyzidae",why:"Modo demostración: las galerías serpenteantes dentro de la hoja son un signo orientativo.",natural:"Retirar hojas muy afectadas, manejo de malezas y conservación de parasitoides.",chemical:"Verificar en SENASA el producto vigente registrado para el cultivo y organismo objetivo."}
 ]};

function getDemo(crop){
 let arr=demoDB[crop]||demoDB.default;
 return arr[Math.floor(Math.random()*arr.length)];
}
async function startCamera(){
 try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});$("camera").srcObject=stream}
 catch(e){alert("No se pudo activar la cámara. Puedes usar el selector de fotografía. En producción, abre la app mediante HTTPS.")}
}
$("start").onclick=startCamera;
$("capture").onclick=()=>{
 const v=$("camera"); if(!v.videoWidth){alert("Activa primero la cámara.");return}
 const c=document.createElement("canvas"); c.width=v.videoWidth;c.height=v.videoHeight;c.getContext("2d").drawImage(v,0,0);
 c.toBlob(b=>{imageBlob=b;$("preview").src=URL.createObjectURL(b);$("preview").classList.remove("hidden")},"image/jpeg",.88);
};
$("file").onchange=e=>{const f=e.target.files[0];if(f){imageBlob=f;$("preview").src=URL.createObjectURL(f);$("preview").classList.remove("hidden")}};
async function analyze(){
 const crop=$("crop").value, api=localStorage.getItem("plaga_api");
 if(!imageBlob){alert("Primero toma o selecciona una fotografía.");return}
 $("result").classList.remove("hidden"); $("result").innerHTML="<b>Analizando…</b><p class='muted'>Procesando la imagen.</p>";
 if(api){
  try{
   const fd=new FormData();fd.append("image",imageBlob,"plant.jpg");fd.append("crop",crop);
   const r=await fetch(api,{method:"POST",body:fd}); if(!r.ok) throw new Error("API "+r.status);
   const x=await r.json(); return showResult({...x,confidence:x.confidence??null},true);
  }catch(e){console.warn(e)}
 }
 showResult({...getDemo(crop),confidence:null},false);
}
function showResult(x,real){
 const conf=x.confidence!=null ? `<span class="badge">Confianza: ${Math.round(Number(x.confidence)*100)}%</span>` : `<span class="badge">Modo demostración · IA no conectada</span>`;
 $("result").innerHTML=`<h2>🌱 ${x.name||"Resultado"}</h2><div class="muted">${x.scientific||""}</div><p>${conf}</p><h3>¿Por qué?</h3><p>${x.why||"Sin explicación disponible."}</p><h3>🌿 Manejo natural / MIP</h3><p>${x.natural||"Sin recomendación disponible."}</p><h3>🧪 Tratamiento químico</h3><p>${x.chemical||"Verificar registro y etiqueta vigente."}</p><div class="warn">⚠️ Resultado orientativo. Antes de aplicar un plaguicida, verificar el registro vigente en SENASA y la etiqueta del producto autorizado para el cultivo y organismo objetivo.</div>`;
 saveHist({date:new Date().toLocaleString(),crop,name:x.name||"Resultado",scientific:x.scientific||""});
}
function saveHist(x){let h=JSON.parse(localStorage.getItem("plaga_hist")||"[]");h.unshift(x);localStorage.setItem("plaga_hist",JSON.stringify(h.slice(0,30)));renderHist()}
function renderHist(){let h=JSON.parse(localStorage.getItem("plaga_hist")||"[]");$("hist").innerHTML=h.length?h.map(x=>`<div class="card"><b>${x.name}</b><br><small>${x.crop} · ${x.date}</small></div>`).join(""):"<p class='muted'>Aún no hay análisis.</p>"}
$("clearHist").onclick=()=>{localStorage.removeItem("plaga_hist");renderHist()};
$("saveApi").onclick=()=>{localStorage.setItem("plaga_api",$("api").value.trim());alert("Configuración guardada.")};
$("api").value=localStorage.getItem("plaga_api")||"";

// Instalación/PWA: la app funciona mejor publicada con HTTPS.
if(location.protocol==="http:" && location.hostname!=="localhost" && location.hostname!=="127.0.0.1"){
 console.warn("Para cámara e instalación PWA se recomienda HTTPS.");
}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();window.deferredInstallPrompt=e;});
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));$(b.dataset.page).classList.remove("hidden");document.querySelectorAll("nav button").forEach(n=>n.classList.remove("active"));b.classList.add("active");if(b.dataset.page==="history")renderHist()});
$("analyze").onclick=analyze; renderHist();
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(console.warn));