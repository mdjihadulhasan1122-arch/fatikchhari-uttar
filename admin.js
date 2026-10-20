/* ==========================================================
   admin.js — অ্যাডমিন লগইন ও যেকোনো তথ্য/ছবি যোগ-এডিট-ডিলিট
   এই ফাইলটি index.html এর পাশে GitHub-এ রাখতে হবে।
   ========================================================== */
(function(){
if(typeof SB_OK==='undefined'||!SB_OK)return;
const BUCKET='photos';
const PUB=SB_URL+'/storage/v1/object/public/'+BUCKET+'/';
const $=id=>document.getElementById(id);
const STATIC={
  slides:(SD.slides||[]).slice(),notices:(SD.notices||[]).slice(),schools:(SD.schools||[]).slice(),
  hospitals:(SD.hospitals||[]).slice(),doctors:(SD.doctors||[]).slice(),
  history:(window.HISTORY_DATA||[]).slice(),tourism:(window.TOURISM_DATA||[]).slice(),
  transport:(SD.transport||[]).slice(),market:(SD.market||[]).slice(),
  thana:JSON.parse(JSON.stringify(window.THANA_DATA||{facts:[]}))
};
const ABOUT_DEFAULT={bn:'মোঃ জিহাদুল হাসান',en:'Md. Jihadul Hasan',roleBn:'ওয়েবসাইট নির্মাতা ও পরিচালক',roleEn:'Website creator & admin',
  bioBn:'এই ওয়েবসাইটের নির্মাতা। আমাদের এলাকার সব তথ্য এক জায়গায় আনার ইচ্ছা থেকেই এই উদ্যোগের শুরু।',
  bioEn:'Creator of this website. This initiative began with the wish to bring all information about our area into one place.'};
let ROWS=[],SES=null;
try{SES=JSON.parse(localStorage.getItem('adm')||'null')}catch(e){}
const loggedIn=()=>!!(SES&&SES.at);
const isAdmin=()=>!!(SES&&SES.at&&SES.admin===true);
let PROFILE=null;
const safeUrl=u=>/^(https?:\/\/|images\/)/i.test(String(u||''))?u:'';

/* ---------- ডাটাবেস সংযোগ ---------- */
async function token(){
  if(!SES)return null;
  if(SES.exp&&Date.now()>SES.exp-60000&&SES.rt){
    try{const r=await fetch(SB_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:CFG.supabaseKey,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:SES.rt})});
      if(r.ok){const j=await r.json();saveSes(j,SES.email)}else{logout(true);return null}}catch(e){}
  }
  return SES.at;
}
function jwtSub(t){try{return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub||''}catch(e){return ''}}
function persist(){try{localStorage.setItem('adm',JSON.stringify(SES))}catch(e){}}
function saveSes(j,email){const k=SES||{};SES={at:j.access_token,rt:j.refresh_token,exp:Date.now()+(j.expires_in||3600)*1000,email:email||(j.user&&j.user.email)||k.email||'',uid:(j.user&&j.user.id)||k.uid||jwtSub(j.access_token),admin:k.admin,meta:(j.user&&j.user.user_metadata)||k.meta||{}};persist()}
async function checkAdmin(){if(!loggedIn())return false;try{const r=await api('/rest/v1/rpc/is_admin',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(r.ok){const v=await r.json();SES.admin=(v===true);persist()}}catch(e){}return isAdmin()}
async function createProfile(){const m=SES.meta||{};let nm=String(m.name||(SES.email||'').split('@')[0]||'সদস্য').trim().slice(0,80);if(nm.length<2)nm='সদস্য';const ph=/^01[3-9]\d{8}$/.test(m.phone||'')?m.phone:null;
  try{const r=await api('/rest/v1/profiles',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({id:SES.uid,name:nm,phone:ph})});if(r.ok){const j=await r.json();return j[0]||null}}catch(e){}return null}
async function loadProfile(){if(!loggedIn()){PROFILE=null;return null}
  try{const r=await api('/rest/v1/profiles?id=eq.'+encodeURIComponent(SES.uid)+'&select=*');if(r.ok){const j=await r.json();PROFILE=j[0]||null}}catch(e){}
  if(!PROFILE)PROFILE=await createProfile();return PROFILE}
async function api(path,opt){
  opt=opt||{};const t=await token();
  const h=Object.assign({apikey:CFG.supabaseKey},opt.headers||{});
  if(t)h.Authorization='Bearer '+t;
  const r=await fetch(SB_URL+path,Object.assign({},opt,{headers:h}));
  if(r.status===401||r.status===403){if(opt.method&&opt.method!=='GET'){throw new Error('অনুমতি নেই। আবার লগইন করুন (অ্যাডমিন হিসেবে)।')}}
  return r;
}
async function loadContent(){
  try{
    const r=await fetch(SB_URL+'/rest/v1/site_items?select=id,collection,data,sort,created_at&order=sort.asc,created_at.asc&limit=3000',{headers:sbH()});
    if(!r.ok)return;ROWS=await r.json();
  }catch(e){return}
  applyAll();
}
function rowsOf(c){return ROWS.filter(r=>r.collection===c)}
function imported(){return new Set(rowsOf('_imported').map(r=>r.data&&r.data.col))}
function eff(col,st,imp){const db=rowsOf(col).map(r=>Object.assign({},r.data,{_id:r.id}));return imp.has(col)?db:(st||[]).concat(db)}
function applyAll(){
  const imp=imported();
  SD.slides=eff('slides',STATIC.slides,imp);SD.notices=eff('notices',STATIC.notices,imp);
  SD.schools=eff('schools',STATIC.schools,imp);SD.hospitals=eff('hospitals',STATIC.hospitals,imp);SD.doctors=eff('doctors',STATIC.doctors,imp);
  SD.transport=eff('transport',STATIC.transport,imp);SD.market=eff('market',STATIC.market,imp);
  SD.videos=eff('videos',[],imp);window.HISTORY_DATA=eff('history',STATIC.history,imp);window.TOURISM_DATA=eff('tourism',STATIC.tourism,imp);
  const T=JSON.parse(JSON.stringify(STATIC.thana)),tr=rowsOf('thana')[0];
  if(tr&&tr.data){if(tr.data.photo)T.photo=tr.data.photo;if(tr.data.phone){const f=(T.facts||[]).find(x=>'phone' in x);if(f)f.phone=tr.data.phone}}
  window.THANA_DATA=T;
  {const g=rowsOf('gate')[0];try{if(g&&g.data)localStorage.setItem('gateCfg',JSON.stringify(g.data));else localStorage.removeItem('gateCfg')}catch(e){}}
  renderSlider();renderNotices();renderDir();renderHistory();renderTourism();renderThana();renderVideos();renderAbout();
  if(window.refreshDynamic)refreshDynamic();
  refreshCounts();showView(viewFromHash(),false,true);
  if(english)applyLanguage();
  paintAdminUI();
}

/* ---------- আমার পরিচয় ও বিজ্ঞাপন (যোগাযোগ পাতায়) ---------- */
function renderAds(box,d){
  const today=new Date().toISOString().slice(0,10);
  const L=rowsOf('ads').map(r=>r.data).filter(a=>a&&(!a.until||a.until>=today));
  box.appendChild(el('h3','ad-h','📢 স্থানীয় বিজ্ঞাপন','📢 Local advertisements'));
  box.appendChild(el('p','ad-sub','আমাদের এলাকার ব্যবসা ও সেবা','Businesses and services of our area'));
  L.forEach(a=>{
    const c=el('div','ad-card');
    if(photoList(a).length){c.appendChild(el('span','ad-tag','বিজ্ঞাপন','Ad'));c.appendChild(galleryBox(a,'📢','ad-img'))}
    const b=el('div','ad-body');c.appendChild(b);
    b.appendChild(el('h4',null,a.bn||''));
    if(a.textBn)b.appendChild(el('p',null,a.textBn));
    const bt=el('div','ad-btns');
    if(a.phone){const x=el('a',null,'📞 '+a.phone);x.href='tel:'+String(a.phone).replace(/[^\d+]/g,'');bt.appendChild(x)}
    const u=safeUrl(a.link);if(u){const x=el('a','alt','🔗 দেখুন','🔗 Visit');x.href=u;x.target='_blank';x.rel='noopener';bt.appendChild(x)}
    if(bt.children.length)b.appendChild(bt);
    box.appendChild(c)});
  const cta=el('div','ad-cta');cta.appendChild(el('div',null,'আপনার ব্যবসা বা সেবার বিজ্ঞাপন এখানে দিতে চান?','Want to advertise your business or service here?'));
  const ph=d&&d.phone;if(ph){const x=el('a',null,'📞 যোগাযোগ করুন','📞 Contact us');x.href='tel:'+String(ph).replace(/[^\d+]/g,'');cta.appendChild(x)}
  box.appendChild(cta);
}
function paintCtAdm(){
  const c=$('ctAdm');if(!c)return;c.textContent='';
  const add=(t,fn)=>{const b=el('button',null,t);b.type='button';b.onclick=fn;c.appendChild(b)};
  if(isAdmin()){add('⚙️ অ্যাডমিন প্যানেল',home);add('লগআউট',()=>logout())}
  else if(loggedIn()){c.appendChild(el('span',null,'লগইন: '+(SES.email||'')));add('লগআউট',()=>logout())}
  else add('🔐 অ্যাডমিন লগইন',()=>authBox('login',home,true));
}
function renderAbout(){
  const old=$('aboutMe');if(old)old.remove();
  const sec=$('contact');if(!sec)return;
  const row=rowsOf('about')[0];const d=Object.assign({},ABOUT_DEFAULT,(row&&row.data)||{});
  const box=document.createElement('div');box.id='aboutMe';
  const hero=el('div','ct-hero');hero.appendChild(el('h2',null,'📞 যোগাযোগ','📞 Contact'));hero.appendChild(el('p',null,'আমাদের সাথে থাকুন, তথ্য ও পরামর্শ জানান','Stay with us — share information and suggestions'));box.appendChild(hero);
  const card=el('div','ct-card');
  const L=photoList(d);
  const ph=el('div','ct-photo');
  if(L[0]){const i=document.createElement('img');i.src=L[0];i.alt='';i.onerror=()=>{i.remove();ph.textContent='👤'};ph.appendChild(i);ph.addEventListener('click',()=>lightbox(L[0]))}else ph.textContent='👤';
  card.appendChild(ph);
  card.appendChild(el('div','ct-tag','👤 কে বানিয়েছেন','👤 Who made this'));
  card.appendChild(el('h3','ct-name',d.bn,d.en||d.bn));
  if(d.roleBn)card.appendChild(el('div','ct-role',d.roleBn,d.roleEn||d.roleBn));
  if(d.bioBn)card.appendChild(el('p','ct-bio',d.bioBn,d.bioEn||d.bioBn));
  const bt=el('div','ct-btns');
  const link=(href,cls,bn,en,ext)=>{const a=el('a',cls,bn,en);a.href=href;if(ext){a.target='_blank';a.rel='noopener'}bt.appendChild(a)};
  if(d.phone)link('tel:'+String(d.phone).replace(/[^\d+]/g,''),'ct-call','📞 কল করুন','📞 Call');
  if(d.whatsapp){const n=String(d.whatsapp).replace(/\D/g,'');if(n)link('https://wa.me/'+(n.length===11&&n[0]==='0'?'88'+n:n),'ct-wa','💬 হোয়াটসঅ্যাপ','💬 WhatsApp',1)}
  if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email||''))link('mailto:'+d.email,'ct-call','✉ ইমেইল','✉ Email');
  if(bt.children.length)card.appendChild(bt);
  const soc=el('div','ct-soc');
  [['website','🌐','web','Website'],['facebook','f','fb','Facebook'],['linkedin','in','li','LinkedIn'],['instagram','◎','ig','Instagram']].forEach(s=>{
    const u=safeUrl(d[s[0]]);if(!u)return;const x=document.createElement('a');x.href=u;x.target='_blank';x.rel='noopener';x.className=s[2];x.textContent=s[1];x.setAttribute('aria-label',s[3]);soc.appendChild(x)});
  if(soc.children.length)card.appendChild(soc);
  if(L.length>1){card.appendChild(el('div','ct-gal-h','📸 আরো ছবি','📸 More photos'));const g=el('div','ct-gal');
    L.slice(1).forEach(u=>{const i=document.createElement('img');i.src=u;i.alt='';i.loading='lazy';i.addEventListener('click',()=>lightbox(u));g.appendChild(i)});card.appendChild(g)}
  const adm=el('div','ct-adm');adm.id='ctAdm';card.appendChild(adm);
  box.appendChild(card);
  renderAds(box,d);
  sec.insertBefore(box,sec.firstChild);
  paintCtAdm();
}

/* ---------- ফিল্ড-তালিকা (কোন তথ্যের কোন ঘর) ---------- */
const bi=(k,k2,l,t,req)=>({k:k,k2:k2,l:l,t:t||'text',req:req});
const one=(k,l,t)=>({k:k,l:l,t:t||'text'});
const photo=(k,l)=>({k:k||'photo',l:l||'ছবি',t:'photo'});
const photos=l=>({k:'photos',l:l||'ছবি (একাধিক দেওয়া যাবে — প্রথমটি প্রচ্ছদ)',t:'photos'});
const sel=(k,l,opts)=>({k:k,l:l,t:'sel',opts:opts});
const unionOpts=()=>(SD.unions||[]).map(u=>[u.bn,u.en||u.bn]);
const COLS={
  slides:{icon:'🖼️',t:'হোমের স্লাইডার ছবি',title:'bn',img:'src',fields:[photo('src','ছবি *'),bi('bn','en','ক্যাপশন (ছবির নিচের লেখা)')]},
  notices:{icon:'📋',t:'নোটিশ',title:'bn',fields:[one('date','তারিখ','date'),bi('bn','en','নোটিশের শিরোনাম *','text',1),bi('textBn','textEn','বিস্তারিত','area')]},
  schools:{icon:'🏫',t:'স্কুল / কলেজ / মাদ্রাসা',title:'bn',fields:[photos(),bi('bn','en','নাম *','text',1),
    sel('type','ধরন',[['স্কুল ও কলেজ','School & College'],['উচ্চ বিদ্যালয়','High School'],['প্রাথমিক বিদ্যালয়','Primary School'],['কলেজ','College'],['মাদ্রাসা','Madrasa'],['কিন্ডারগার্টেন','Kindergarten']]),
    sel('union','ইউনিয়ন',unionOpts()),bi('address','addressEn','ঠিকানা'),one('phone','ফোন (একাধিক হলে কমা দিয়ে)','tel'),one('est','প্রতিষ্ঠা সাল'),one('eiin','EIIN নম্বর'),
    bi('historyBn','historyEn','ইতিহাস ও পরিচিতি','area')]},
  hospitals:{icon:'🏥',t:'হাসপাতাল ও ক্লিনিক',title:'bn',fields:[photos(),bi('bn','en','নাম *','text',1),
    sel('type','ধরন',[['সরকারি স্বাস্থ্য কমপ্লেক্স','Government health complex'],['হাসপাতাল','Hospital'],['ক্লিনিক','Clinic'],['ডায়াগনস্টিক সেন্টার','Diagnostic centre'],['ফার্মেসি','Pharmacy']]),
    bi('address','addressEn','ঠিকানা'),one('phone','ফোন','tel'),bi('historyBn','historyEn','বিবরণ / ইতিহাস','area')]},
  doctors:{icon:'🩺',t:'ডাক্তার',title:'bn',fields:[photos(),bi('bn','en','নাম *','text',1),bi('speciality','specialityEn','বিভাগ / বিশেষজ্ঞতা'),
    bi('chamber','chamberEn','চেম্বারের ঠিকানা'),bi('time','timeEn','চেম্বারের সময়'),one('phone','ফোন','tel'),bi('historyBn','historyEn','পরিচিতি','area')]},
  history:{icon:'📜',t:'ভূজপুরের ইতিহাস',title:'bn',fields:[photos(),bi('bn','en','শিরোনাম *','text',1),bi('textBn','textEn','ইতিহাস (লেখা)','area')]},
  tourism:{icon:'🏞️',t:'পর্যটন স্থান',title:'bn',fields:[photos(),bi('bn','en','স্থানের নাম *','text',1),bi('placeBn','placeEn','অবস্থান'),bi('howBn','howEn','কীভাবে যাবেন'),
    bi('historyBn','historyEn','স্থানের ইতিহাস','area'),one('icon','আইকন (একটি ইমোজি, যেমন 🏞️)')]},
  transport:{icon:'🚌',t:'যাতায়াত',title:'bn',fields:[photos(),bi('bn','en','নাম / রুট *','text',1),
    sel('type','ধরন',[['বাস','Bus'],['সিএনজি / অটোরিকশা','CNG / Auto-rickshaw'],['লেগুনা','Leguna'],['মাইক্রোবাস / গাড়ি ভাড়া','Microbus / Car rental'],['অন্যান্য','Other']]),
    bi('route','routeEn','রুট (কোথা থেকে কোথায়)'),bi('time','timeEn','সময়'),bi('fare','fareEn','ভাড়া'),one('phone','ফোন','tel'),bi('historyBn','historyEn','বিবরণ','area')]},
  market:{icon:'🛍️',t:'বাজার ও ব্যবসা',title:'bn',fields:[photos(),bi('bn','en','দোকান / ব্যবসার নাম *','text',1),
    sel('type','ধরন',[['কাঁচাবাজার','Fresh market'],['মুদি দোকান','Grocery'],['রেস্টুরেন্ট ও খাবার','Restaurant & food'],['মিস্ত্রি ও সার্ভিস','Services & repair'],['ফার্মেসি','Pharmacy'],['কাপড় ও ফ্যাশন','Clothing & fashion'],['ইলেকট্রনিক্স','Electronics'],['অন্যান্য','Other']]),
    bi('address','addressEn','ঠিকানা'),bi('time','timeEn','খোলার সময়'),bi('products','productsEn','কী কী পাওয়া যায়','area'),one('phone','ফোন','tel'),bi('historyBn','historyEn','অন্য বিবরণ','area')]},
  videos:{icon:'🎬',t:'ভিডিও',title:'bn',fields:[bi('bn','en','ভিডিওর শিরোনাম *','text',1),one('link','YouTube বা Facebook ভিডিওর লিংক (লম্বা ভিডিওর জন্য এটাই সেরা)'),{k:'file',l:'অথবা ভিডিও ফাইল আপলোড (সর্বোচ্চ ৫০ MB)',t:'video'},bi('textBn','textEn','বর্ণনা','area')]},
  ads:{icon:'📢',t:'বিজ্ঞাপন (যোগাযোগ পাতায়)',title:'bn',fields:[photos('বিজ্ঞাপনের ছবি (একাধিক দেওয়া যাবে)'),bi('bn','en','বিজ্ঞাপনদাতা / ব্যবসার নাম *','text',1),bi('textBn','textEn','বিজ্ঞাপনের লেখা','area'),one('phone','ফোন','tel'),one('link','ওয়েবসাইট / ফেসবুক পেজের লিংক (https://...)'),one('until','দেখানোর শেষ তারিখ (ঐচ্ছিক — পরে নিজে লুকিয়ে যাবে)','date')]},
  gate:{icon:'🚪',t:'স্বাগত পর্দা (প্রথম পর্দার ছবি)',single:true,fields:[photo('photo','প্রথম পর্দার ছবি'),bi('bn','en','শিরোনাম (খালি রাখলে আগেরটাই থাকবে)'),bi('subBn','subEn','ছোট পরিচয়-লাইন (ঐচ্ছিক)')]},
  thana:{icon:'🚓',t:'থানার ছবি ও ওসির নম্বর',single:true,fields:[photo(),one('phone','ওসি / ডিউটি অফিসারের ফোন','tel')]},
  about:{icon:'👤',t:'আমার পরিচয় (যোগাযোগ পাতা)',single:true,fields:[photos('আপনার ছবি (একাধিক দেওয়া যাবে — প্রথমটি বড় প্রোফাইল ছবি, বাকিগুলো গ্যালারিতে)'),bi('bn','en','আপনার নাম *','text',1),bi('roleBn','roleEn','পরিচয় (যেমন: ওয়েবসাইট নির্মাতা)'),bi('bioBn','bioEn','নিজের সম্পর্কে কয়েক লাইন','area'),
    one('whatsapp','হোয়াটসঅ্যাপ নম্বর'),one('email','ইমেইল'),one('website','ওয়েবসাইট লিংক (https://...)'),one('facebook','ফেসবুক লিংক'),one('linkedin','লিংকডইন লিংক'),one('instagram','ইনস্টাগ্রাম লিংক'),one('phone','ফোন','tel')]}
};
const VIEWCOL={home:'slides',schools:'schools',madrasas:'schools',hospitals:'hospitals',doctors:'doctors',history:'history',tourism:'tourism',transport:'transport',market:'market',notices:'notices',thana:'thana',contact:'about',videos:'videos'};

/* ---------- ছোট সহায়ক UI ---------- */
function toast(msg,bad){const t=el('div','adm-toast',msg);if(bad)t.style.background='#b3261e';document.body.appendChild(t);setTimeout(()=>t.remove(),3200)}
function overlay(){const o=document.createElement('div');o.className='adm';const hd=el('div','adm-hd');o.appendChild(hd);const body=el('div','adm-body');o.appendChild(body);document.body.appendChild(o);document.body.classList.add('gated');return{o:o,hd:hd,body:body,close(){o.remove();if(!document.querySelector('.adm,#gate,#detailModal'))document.body.classList.remove('gated')}}}

/* ---------- লগইন ও নিবন্ধন (অ্যাডমিন ও সাধারণ সদস্য) ---------- */
function loginBox(onOk){authBox('login',onOk,true)}
function authBox(mode,onOk,adminOnly){
  const ov=overlay();let cur=mode||'login';
  ov.hd.appendChild(el('strong',null,adminOnly?'🔐 অ্যাডমিন লগইন':'🔐 লগইন / নিবন্ধন'));
  const x=el('button','adm-btn light','✕ বন্ধ');x.type='button';x.onclick=ov.close;ov.hd.appendChild(x);
  const tabs=el('div','nw-tabs');const box=document.createElement('div');
  if(!adminOnly)ov.body.appendChild(tabs);ov.body.appendChild(box);
  const finish=async()=>{
    try{if(!localStorage.getItem('visitorReg'))localStorage.setItem('visitorReg','account')}catch(e){}
    ov.close();const g=$('gate');if(g)closeGate();
    paintAdminUI();renderAbout();renderNews();
    if(adminOnly&&!isAdmin()){toast('এই অ্যাকাউন্টটি অ্যাডমিন নয়। অ্যাডমিনের ইমেইল দিয়ে লগইন করুন।',true);return}
    toast(isAdmin()?'✅ অ্যাডমিন হিসেবে লগইন হয়েছে':'✅ লগইন হয়েছে');if(onOk)onOk()};
  const field=(f,t,id,type,ac,max)=>{const l=el('label','fl',t);l.htmlFor=id;f.appendChild(l);const i=document.createElement('input');i.className='fi';i.id=id;i.type=type||'text';if(ac)i.autocomplete=ac;if(max)i.maxLength=max;f.appendChild(i);return i};
  function draw(){
    box.textContent='';tabs.textContent='';
    [['login','লগইন'],['signup','নতুন নিবন্ধন']].forEach(t=>{const b=el('button',cur===t[0]?'on':'',t[1]);b.type='button';b.onclick=()=>{cur=t[0];draw()};tabs.appendChild(b)});
    const f=document.createElement('form');box.appendChild(f);
    if(cur==='login'){
      const e=field(f,'ইমেইল','aEmail','email','username'),p=field(f,'পাসওয়ার্ড','aPass','password','current-password');
      const m=el('div','form-msg');f.appendChild(m);
      const b=el('button','adm-btn','লগইন করুন');b.type='submit';b.style.cssText='width:100%;margin-top:12px';f.appendChild(b);
      f.addEventListener('submit',async ev=>{ev.preventDefault();m.className='form-msg';m.textContent='লগইন হচ্ছে…';b.disabled=true;
        try{const r=await fetch(SB_URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:CFG.supabaseKey,'Content-Type':'application/json'},body:JSON.stringify({email:e.value.trim(),password:p.value})});
          const j=await r.json();
          if(!r.ok){m.className='form-msg err';m.textContent='ইমেইল বা পাসওয়ার্ড ঠিক নয়।';b.disabled=false;return}
          SES=null;saveSes(j,e.value.trim());await checkAdmin();await loadProfile();finish();
        }catch(x){m.className='form-msg err';m.textContent='ইন্টারনেট সংযোগে সমস্যা।';b.disabled=false}});
    }else{
      const n=field(f,'আপনার নাম *','sName','text','name',80),ph=field(f,'মোবাইল নম্বর *','sPhone','tel','tel',14),e=field(f,'ইমেইল (জিমেইল) *','sEmail','email','email'),p=field(f,'পাসওয়ার্ড * (কমপক্ষে ৮ অক্ষর)','sPass','password','new-password');
      const l=el('label','chk');const c=document.createElement('input');c.type='checkbox';l.appendChild(c);
      l.appendChild(el('span',null,'আমার নাম ও ছবি আমার পোস্টের সাথে প্রকাশ্যে দেখানো হবে। আমার ফোন ও ইমেইল শুধু অ্যাডমিন দেখতে পাবেন। আমি সত্য খবর দেব।'));f.appendChild(l);
      const m=el('div','form-msg');f.appendChild(m);
      const b=el('button','adm-btn','অ্যাকাউন্ট খুলুন');b.type='submit';b.style.cssText='width:100%;margin-top:6px';f.appendChild(b);
      f.addEventListener('submit',async ev=>{ev.preventDefault();
        const name=n.value.trim(),phone=(typeof normPhone==='function'?normPhone(ph.value):ph.value.replace(/\D/g,'')),email=e.value.trim(),pw=p.value;
        const bad=t=>{m.className='form-msg err';m.textContent=t};
        if(name.length<2)return bad('আপনার নাম লিখুন।');
        if(!/^01[3-9]\d{8}$/.test(phone))return bad('সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন।');
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return bad('সঠিক ইমেইল দিন।');
        if(pw.length<8)return bad('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের দিন।');
        if(!c.checked)return bad('সম্মতির টিক দিন।');
        m.className='form-msg';m.textContent='অ্যাকাউন্ট খোলা হচ্ছে…';b.disabled=true;
        try{const r=await fetch(SB_URL+'/auth/v1/signup',{method:'POST',headers:{apikey:CFG.supabaseKey,'Content-Type':'application/json'},body:JSON.stringify({email:email,password:pw,data:{name:name,phone:phone}})});
          const j=await r.json().catch(()=>({}));
          if(!r.ok){const t=JSON.stringify(j);bad(/already|registered|exists/i.test(t)?'এই ইমেইলে আগেই অ্যাকাউন্ট আছে। "লগইন" ট্যাবে যান।':(/password/i.test(t)?'পাসওয়ার্ডটি দুর্বল। আরও লম্বা বা কঠিন দিন।':(/rate|limit|many/i.test(t)?'অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।':'অ্যাকাউন্ট খোলা যায়নি।')));b.disabled=false;return}
          if(j.access_token){SES=null;saveSes(j,email);await checkAdmin();await loadProfile();finish();return}
          m.className='form-msg ok';m.textContent='অ্যাকাউন্ট তৈরি হয়েছে। ইমেইলে যাচাইয়ের লিংক গেছে — যাচাই করে লগইন করুন।';b.disabled=false;
        }catch(x){bad('ইন্টারনেট সংযোগে সমস্যা।');b.disabled=false}});
    }
  }
  draw();
}
function logout(silent){SES=null;PROFILE=null;try{localStorage.removeItem('adm')}catch(e){}paintAdminUI();renderNews();if(!silent)toast('লগআউট হয়েছে')}

/* ---------- ছবি তোলা/বাছাই ও আপলোড ---------- */
function shrink(file,max){return new Promise((res,rej)=>{
  const img=new Image(),u=URL.createObjectURL(file);
  img.onload=()=>{const k=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(b=>b?res(b):rej(new Error('ছবি পড়া যায়নি')),'image/jpeg',0.82)};
  img.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('ছবি পড়া যায়নি'))};img.src=u})}
async function uploadPhoto(file,folder){
  const blob=await shrink(file,1280);
  const path=folder+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,7)+'.jpg';
  const r=await api('/storage/v1/object/'+BUCKET+'/'+path,{method:'POST',headers:{'Content-Type':'image/jpeg','cache-control':'max-age=31536000'},body:blob});
  if(!r.ok)throw new Error('ছবি আপলোড হয়নি ('+r.status+')');
  return PUB+path;
}
function uploadVideo(file,onp){return new Promise(async(res,rej)=>{
  if(file.size>50*1024*1024){rej(new Error('ফাইল ৫০ MB-এর বেশি। বড় ভিডিও YouTube-এ আপলোড করে লিংক দিন।'));return}
  const t=await token();const ext=(file.name.match(/\.(mp4|mov|webm|m4v)$/i)||['','mp4'])[1].toLowerCase();
  const path='video/'+Date.now()+'-'+Math.random().toString(36).slice(2,7)+'.'+ext;
  const x=new XMLHttpRequest();x.open('POST',SB_URL+'/storage/v1/object/'+BUCKET+'/'+path);
  x.setRequestHeader('apikey',CFG.supabaseKey);if(t)x.setRequestHeader('Authorization','Bearer '+t);
  x.setRequestHeader('Content-Type',file.type||'video/mp4');x.setRequestHeader('cache-control','max-age=31536000');
  x.upload.onprogress=e=>{if(e.lengthComputable&&onp)onp(Math.round(e.loaded*100/e.total))};
  x.onload=()=>x.status>=200&&x.status<300?res(PUB+path):rej(new Error('ভিডিও আপলোড হয়নি ('+x.status+')'));
  x.onerror=()=>rej(new Error('ইন্টারনেট সংযোগে সমস্যা'));x.send(file)})}
function dropPhoto(url){if(url&&url.indexOf(PUB)===0){api('/storage/v1/object/'+BUCKET+'/'+url.slice(PUB.length),{method:'DELETE'}).catch(()=>{})}}

/* ---------- যোগ / এডিট ফর্ম ---------- */
function editor(colKey,row,preset,done){
  const C=COLS[colKey];const d=Object.assign({},preset||{},(row&&row.data)||{});
  const ov=overlay();ov.hd.appendChild(el('strong',null,(row?'✏️ এডিট: ':'＋ নতুন: ')+C.t));
  const cx=el('button','adm-btn light','✕ বাতিল');cx.type='button';cx.onclick=ov.close;ov.hd.appendChild(cx);
  const f=document.createElement('form');ov.body.appendChild(f);const get={};
  C.fields.forEach((fd,ix)=>{
    const id='af'+ix;
    if(fd.t==='video'){
      const st={url:d[fd.k]||''};get[fd.k]=()=>st.url;
      f.appendChild(el('div','fl',fd.l));const box=el('div','adm-ph');const info=el('div','adm-prev');box.appendChild(info);
      const paint=()=>{info.textContent=st.url?'🎬 ভিডিও আপলোড করা আছে':'ভিডিও ফাইল নেই'};paint();
      const inp=document.createElement('input');inp.type='file';inp.accept='video/*';inp.style.display='none';
      const pick=el('button','adm-btn','🎬 ভিডিও বাছুন');pick.type='button';pick.onclick=()=>inp.click();
      const rm=el('button','adm-btn light','🗑 সরান');rm.type='button';rm.onclick=()=>{st.url='';paint()};
      const msg=el('div','form-msg');
      inp.onchange=async()=>{const fl=inp.files[0];if(!fl)return;pick.disabled=true;msg.className='form-msg';msg.textContent='আপলোড হচ্ছে… ০%';
        try{st.url=await uploadVideo(fl,p=>{msg.textContent='আপলোড হচ্ছে… '+p+'%'});paint();msg.className='form-msg ok';msg.textContent='✅ আপলোড হয়েছে (সেভ করুন)'}catch(e){msg.className='form-msg err';msg.textContent=e.message}pick.disabled=false;inp.value=''};
      const bar=el('div','adm-row');bar.appendChild(pick);bar.appendChild(rm);box.appendChild(bar);box.appendChild(inp);box.appendChild(msg);f.appendChild(box);return;
    }
    if(fd.t==='photos'){
      let arr=Array.isArray(d.photos)&&d.photos.length?d.photos.slice():(d.photo?[d.photo]:[]);
      get.photos=()=>arr;get.photo=()=>arr[0]||'';
      f.appendChild(el('div','fl',fd.l));
      const box=el('div','adm-ph');const grid=el('div','adm-grid');box.appendChild(grid);
      const paint=()=>{grid.textContent='';
        if(!arr.length)grid.appendChild(el('div','adm-prev','🖼️ ছবি নেই'));
        arr.forEach((u,ix)=>{const c=el('div','adm-cell');const i=document.createElement('img');i.src=u;c.appendChild(i);
          if(ix===0)c.appendChild(el('span','adm-cover','প্রচ্ছদ'));
          const x=el('button','adm-x','✕');x.type='button';x.onclick=()=>{arr.splice(ix,1);paint()};c.appendChild(x);
          if(ix>0){const m=el('button','adm-m','◀');m.type='button';m.onclick=()=>{const v=arr.splice(ix,1)[0];arr.splice(ix-1,0,v);paint()};c.appendChild(m)}
          grid.appendChild(c)})};paint();
      const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.multiple=true;inp.style.display='none';
      const pick=el('button','adm-btn','📷 ছবি যোগ করুন (একাধিক বাছতে পারবেন)');pick.type='button';pick.onclick=()=>inp.click();
      const msg=el('div','form-msg');
      inp.onchange=async()=>{const fs=Array.from(inp.files);if(!fs.length)return;pick.disabled=true;let n=0;
        for(const fl of fs){n++;msg.className='form-msg';msg.textContent='আপলোড হচ্ছে… ('+n+'/'+fs.length+')';
          try{arr.push(await uploadPhoto(fl,colKey));paint()}catch(e){msg.className='form-msg err';msg.textContent=e.message;break}}
        if(!msg.classList.contains('err')){msg.className='form-msg ok';msg.textContent='✅ আপলোড হয়েছে (সেভ করুন)'}pick.disabled=false;inp.value=''};
      const bar=el('div','adm-row');bar.appendChild(pick);box.appendChild(bar);box.appendChild(inp);box.appendChild(msg);f.appendChild(box);
      return;
    }
    if(fd.t==='photo'){
      const box=el('div','adm-ph');const prev=el('div','adm-prev');box.appendChild(prev);
      const st={url:d[fd.k]||''};get[fd.k]=()=>st.url;
      const paint=()=>{prev.textContent='';if(safeUrl(st.url)){const i=document.createElement('img');i.src=st.url;prev.appendChild(i)}else prev.textContent='🖼️ ছবি নেই'};paint();
      const lb=el('div','fl',fd.l);f.appendChild(lb);f.appendChild(box);
      const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.style.display='none';
      const pick=el('button','adm-btn','📷 ছবি বাছুন / তুলুন');pick.type='button';pick.onclick=()=>inp.click();
      const rm=el('button','adm-btn light','🗑 ছবি সরান');rm.type='button';rm.onclick=()=>{st.url='';paint()};
      const msg=el('div','form-msg');
      inp.onchange=async()=>{const fl=inp.files[0];if(!fl)return;msg.className='form-msg';msg.textContent='ছবি আপলোড হচ্ছে…';pick.disabled=true;
        try{st.url=await uploadPhoto(fl,colKey);paint();msg.className='form-msg ok';msg.textContent='✅ ছবি আপলোড হয়েছে (সেভ করুন)'}catch(e){msg.className='form-msg err';msg.textContent=e.message}pick.disabled=false;inp.value=''};
      const bar=el('div','adm-row');bar.appendChild(pick);bar.appendChild(rm);box.appendChild(bar);box.appendChild(inp);box.appendChild(msg);
      return;
    }
    const mk=(key,label,type)=>{
      const l=el('label','fl',label);l.htmlFor=id+key;f.appendChild(l);
      let i;
      if(type==='area'){i=document.createElement('textarea');i.rows=4}
      else if(type==='sel'){i=document.createElement('select');const o0=document.createElement('option');o0.value='';o0.textContent='— বেছে নিন —';i.appendChild(o0);
        const cur=d[fd.k];const list=fd.opts.slice();if(cur&&!list.some(o=>o[0]===cur))list.push([cur,d[fd.k+'En']||cur]);
        list.forEach(o=>{const op=document.createElement('option');op.value=o[0];op.textContent=o[0];i.appendChild(op)});i.value=cur||''}
      else{i=document.createElement('input');i.type=type==='date'?'date':(type==='tel'?'tel':'text')}
      i.className='fi';i.id=id+key;f.appendChild(i);return i};
    if(fd.t==='sel'){const i=mk('',fd.l,'sel');get[fd.k]=()=>i.value;get[fd.k+'En']=()=>{const o=fd.opts.find(o=>o[0]===i.value);return o?o[1]:(d[fd.k+'En']||'')}}
    else if(fd.k2){const a=mk('a',fd.l+' (বাংলা)',fd.t);a.value=d[fd.k]||'';const b2=mk('b','English (ঐচ্ছিক)',fd.t);b2.value=d[fd.k2]||'';get[fd.k]=()=>a.value.trim();get[fd.k2]=()=>b2.value.trim();fd._req=a}
    else{const i=mk('',fd.l,fd.t);i.value=d[fd.k]||'';get[fd.k]=()=>i.value.trim()}
  });
  const m=el('div','form-msg');f.appendChild(m);
  const sv=el('button','adm-btn','💾 সেভ করুন');sv.type='submit';sv.style.cssText='width:100%;margin-top:14px';f.appendChild(sv);
  f.addEventListener('submit',async ev=>{ev.preventDefault();
    const data=Object.assign({},(row&&row.data)||{},preset||{});
    for(const k in get){const v=get[k]();if(v===''||v==null||(Array.isArray(v)&&!v.length))delete data[k];else data[k]=v}
    for(const fd of C.fields){if(fd.req&&!data[fd.k]){m.className='form-msg err';m.textContent='"'+fd.l.replace(' *','')+'" লিখুন।';return}
      if((fd.t==='photo'||fd.t==='video')&&row&&row.data&&row.data[fd.k]&&row.data[fd.k]!==data[fd.k])dropPhoto(row.data[fd.k])
      if(fd.t==='photos'&&row&&row.data){const old=(row.data.photos||[]).concat(row.data.photo||[]),now=data.photos||[];old.forEach(u=>{if(now.indexOf(u)<0&&data.photo!==u)dropPhoto(u)})}}
    if(colKey==='videos'&&!data.link&&!data.file){m.className='form-msg err';m.textContent='ভিডিওর লিংক দিন অথবা ভিডিও ফাইল আপলোড করুন।';return}
    if(colKey==='slides'&&!data.src){m.className='form-msg err';m.textContent='ছবি বাছুন।';return}
    sv.disabled=true;m.className='form-msg';m.textContent='সেভ হচ্ছে…';
    try{await saveRow(colKey,row,data);ov.close();toast('✅ সেভ হয়েছে');if(done)done()}catch(e){m.className='form-msg err';m.textContent=e.message;sv.disabled=false}
  });
}
async function saveRow(col,row,data){
  const H={'Content-Type':'application/json',Prefer:'return=representation'};
  if(row){const r=await api('/rest/v1/site_items?id=eq.'+encodeURIComponent(row.id),{method:'PATCH',headers:H,body:JSON.stringify({data:data})});
    if(!r.ok)throw new Error('সেভ হয়নি ('+r.status+')');const j=await r.json();if(!j.length)throw new Error('সেভ হয়নি — অ্যাডমিন অনুমতি নেই। Supabase-এ প্রথম তৈরি করা ইউজার দিয়ে লগইন করুন।');
    row.data=data;}
  else{const mx=rowsOf(col).reduce((a,r)=>Math.max(a,r.sort||0),0);
    const r=await api('/rest/v1/site_items',{method:'POST',headers:H,body:JSON.stringify({collection:col,data:data,sort:mx+1})});
    if(!r.ok)throw new Error('সেভ হয়নি ('+r.status+') — SQL ধাপ ও অ্যাডমিন ইউজার ঠিক আছে কি দেখুন।');const j=await r.json();ROWS.push(j[0]||j);}
  ROWS.sort((a,b)=>(a.sort||0)-(b.sort||0));applyAll();
}
async function ensureImported(col){
  const st=STATIC[col];if(!st||!Array.isArray(st)||!st.length||imported().has(col))return;
  toast('প্রথমবার: বর্তমান তথ্য সংরক্ষণ হচ্ছে…');
  const rows=st.map((d,i)=>({collection:col,data:d,sort:-(st.length-i)}));
  rows.push({collection:'_imported',data:{col:col},sort:0});
  const r=await api('/rest/v1/site_items',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(rows)});
  if(!r.ok)throw new Error('তথ্য আনা যায়নি ('+r.status+')');
  const j=await r.json();ROWS=ROWS.concat(j);ROWS.sort((a,b)=>(a.sort||0)-(b.sort||0));applyAll();
}

/* ---------- তালিকা ম্যানেজার (যোগ / এডিট / ডিলিট / ওঠানামা) ---------- */
async function manager(colKey,filter,preset){
  if(!isAdmin()){loginBox(()=>manager(colKey,filter,preset));return}
  const C=COLS[colKey];
  try{await ensureImported(colKey)}catch(e){toast(e.message,true);return}
  const ov=overlay();ov.hd.appendChild(el('strong',null,C.icon+' '+C.t));
  const cx=el('button','adm-btn light','✕ বন্ধ');cx.type='button';cx.onclick=ov.close;ov.hd.appendChild(cx);
  const draw=()=>{
    ov.body.textContent='';
    if(C.single){
      const row=rowsOf(colKey)[0];
      const b=el('button','adm-btn',row?'✏️ এডিট করুন':'＋ তথ্য দিন');b.type='button';b.style.width='100%';b.onclick=()=>editor(colKey,row,null,draw);ov.body.appendChild(b);return}
    const add=el('button','adm-btn','＋ নতুন যোগ করুন');add.type='button';add.style.cssText='width:100%;margin-bottom:12px';
    add.onclick=()=>editor(colKey,null,preset,draw);ov.body.appendChild(add);
    const list=rowsOf(colKey).filter(r=>!filter||filter(r.data));
    if(!list.length)ov.body.appendChild(el('div','placeholder','এখনো কিছু যোগ করা হয়নি।'));
    list.forEach(r=>{
      const c=el('div','adm-item');const th=el('div','adm-th');const im=r.data[C.img||'photo'];
      if(safeUrl(im)){const i=document.createElement('img');i.src=im;th.appendChild(i)}else th.textContent=C.icon;c.appendChild(th);
      const mid=el('div','adm-mid');mid.appendChild(el('b',null,r.data[C.title||'bn']||'(নাম নেই)'));
      const sub=r.data.type||r.data.date||r.data.placeBn||'';if(sub)mid.appendChild(el('small',null,sub));c.appendChild(mid);
      const bt=el('div','adm-act');
      const btn=(t,fn,cls)=>{const b=el('button','adm-ic'+(cls?' '+cls:''),t);b.type='button';b.onclick=fn;bt.appendChild(b)};
      btn('↑',()=>move(colKey,r,-1,draw));btn('↓',()=>move(colKey,r,1,draw));
      btn('✏️',()=>editor(colKey,r,null,draw));
      btn('🗑',async()=>{if(!confirm('"'+(r.data[C.title||'bn']||'এটি')+'" মুছে ফেলবেন?'))return;
        try{const x=await api('/rest/v1/site_items?id=eq.'+encodeURIComponent(r.id),{method:'DELETE',headers:{Prefer:'return=representation'}});
          if(!x.ok)throw new Error('মোছা যায়নি ('+x.status+')');const j=await x.json();if(!j.length)throw new Error('মোছা যায়নি — অ্যাডমিন অনুমতি নেই।');
          dropPhoto(r.data[C.img||'photo']);dropPhoto(r.data.file);(r.data.photos||[]).forEach(dropPhoto);ROWS=ROWS.filter(z=>z.id!==r.id);applyAll();draw();toast('🗑 মুছে ফেলা হয়েছে')}catch(e){toast(e.message,true)}},'del');
      c.appendChild(bt);ov.body.appendChild(c)});
  };
  draw();
}
async function move(col,r,dir,draw){
  const all=rowsOf(col).sort((a,b)=>(a.sort||0)-(b.sort||0)||String(a.created_at).localeCompare(String(b.created_at)));
  all.forEach((x,i)=>{x._i=i});
  const i=r._i,j=i+dir;if(j<0||j>=all.length)return;const o=all[j];
  // সবার ক্রম নতুন করে সাজাই
  all[i]=o;all[j]=r;
  try{for(let k=0;k<all.length;k++){if(all[k].sort!==k+1){
    const x=await api('/rest/v1/site_items?id=eq.'+encodeURIComponent(all[k].id),{method:'PATCH',headers:{'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({sort:k+1})});
    if(!x.ok)throw new Error('ক্রম বদলানো যায়নি');all[k].sort=k+1}}}catch(e){toast(e.message,true)}
  ROWS.sort((a,b)=>(a.sort||0)-(b.sort||0));applyAll();draw();
}

/* ---------- এলাকার সংবাদ ---------- */
let NEWS=[],NEWS_ST='',PENDING_BTN=null;
const bnDate=i=>{try{return new Date(i).toLocaleDateString('bn-BD',{day:'numeric',month:'long',year:'numeric'})}catch(e){return ''}};
const enDate=i=>{try{return new Date(i).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}catch(e){return ''}};
function avatar(u){const a=el('div','nw-av');if(safeUrl(u)){const i=document.createElement('img');i.src=u;i.alt='';i.onerror=()=>{i.remove();a.textContent='👤'};a.appendChild(i)}else a.textContent='👤';return a}
async function loadNews(){
  try{const r=await fetch(SB_URL+'/rest/v1/news_posts?select=id,author_name,author_photo,title,body,place,photos,created_at&status=eq.approved&order=created_at.desc&limit=60',{headers:sbH()});
    if(r.ok){NEWS=await r.json();NEWS_ST='ok'}else NEWS_ST='err'}catch(e){NEWS_ST='err'}
  renderNews();
}
async function delPost(p,after){
  if(!confirm('এই পোস্ট মুছে ফেলবেন?'))return;
  try{const x=await api('/rest/v1/news_posts?id=eq.'+encodeURIComponent(p.id),{method:'DELETE',headers:{Prefer:'return=representation'}});
    if(!x.ok)throw new Error('মোছা যায়নি ('+x.status+')');const j=await x.json();if(!j.length)throw new Error('মোছা যায়নি — অনুমতি নেই।');
    (p.photos||[]).forEach(dropPhoto);toast('🗑 মুছে ফেলা হয়েছে');if(after)after();loadNews()}catch(e){toast(e.message,true)}
}
function newsCard(p,mode,after){
  const c=el('div','nw-card');
  if(photoList(p).length)c.appendChild(galleryBox(p,'📰','nw-img'));
  const inn=el('div','nw-in');c.appendChild(inn);
  if(mode==='mine'){const st=p.status;inn.appendChild(el('span','nw-st '+st,st==='approved'?'✔ প্রকাশিত':(st==='rejected'?'✖ বাতিল':'⏳ অপেক্ষমাণ — অ্যাডমিন যাচাই করছেন')));
    if(st==='rejected'&&p.admin_note)inn.appendChild(el('div','nw-place','কারণ: '+p.admin_note))}
  inn.appendChild(el('h3',null,p.title));
  const meta=el('div','nw-meta');meta.appendChild(avatar(p.author_photo));meta.appendChild(el('span',null,p.author_name||''));
  meta.appendChild(el('span',null,'· '+bnDate(p.created_at),'· '+enDate(p.created_at)));
  if(mode==='public'||p.status==='approved')meta.appendChild(el('span','nw-ok','✔ অ্যাডমিন যাচাইকৃত','✔ Verified by admin'));
  inn.appendChild(meta);
  if(p.place)inn.appendChild(el('div','nw-place','📍 '+p.place));
  const long=String(p.body||'').length>240;
  const b=el('div','nw-body'+(long?' clamp':''),p.body||'');inn.appendChild(b);
  if(long){const t=el('button','nw-more','আরো পড়ুন ▾');t.type='button';t.onclick=()=>{const cl=b.classList.toggle('clamp');t.textContent=cl?'আরো পড়ুন ▾':'কম দেখুন ▴'};inn.appendChild(t)}
  if(mode==='review'){
    const w=p.profiles||{};const who=el('div','nw-who');
    who.appendChild(el('div',null,'👤 '+(w.name||p.author_name||'')));
    if(w.phone){const a=el('a',null,'📞 '+w.phone);a.href='tel:'+w.phone;a.style.cssText='color:var(--green);font-weight:700;display:block';who.appendChild(a)}
    if(w.email)who.appendChild(el('div',null,'✉ '+w.email));
    who.appendChild(el('div',null,'ফোন করে বা অন্যভাবে সত্যতা যাচাই করে তারপর প্রকাশ করুন।'));inn.appendChild(who);
    const bar=el('div','nw-adm');
    const act=(t,cls,fn)=>{const x=el('button',cls,t);x.type='button';x.onclick=fn;bar.appendChild(x)};
    const setSt=async(st,note)=>{try{const body={status:st,reviewed_at:new Date().toISOString()};if(note)body.admin_note=note;
        const r=await api('/rest/v1/news_posts?id=eq.'+encodeURIComponent(p.id),{method:'PATCH',headers:{'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(body)});
        if(!r.ok)throw new Error('হয়নি ('+r.status+')');const j=await r.json();if(!j.length)throw new Error('অ্যাডমিন অনুমতি নেই।');
        toast(st==='approved'?'✅ প্রকাশ হয়েছে':'বাতিল করা হয়েছে');c.remove();if(after)after();loadNews()}catch(e){toast(e.message,true)}};
    act('✅ সত্য — প্রকাশ করুন','',()=>setSt('approved'));
    act('✖ বাতিল','no',()=>{const n=prompt('বাতিলের কারণ (ঐচ্ছিক):');if(n===null)return;setSt('rejected',n.trim().slice(0,300))});
    act('🗑 মুছুন','gr',()=>delPost(p,()=>c.remove()));
    inn.appendChild(bar);
  }
  if(mode==='mine'&&p.status!=='approved'){const bar=el('div','nw-adm');const x=el('button','gr','🗑 মুছুন');x.type='button';x.onclick=()=>delPost(p,after);bar.appendChild(x);inn.appendChild(bar)}
  if(mode==='public'&&isAdmin()){const bar=el('div','nw-adm');const x=el('button','gr','🗑 প্রত্যাহার / মুছুন');x.type='button';x.onclick=()=>delPost(p);bar.appendChild(x);inn.appendChild(bar)}
  return c;
}
function renderNews(){
  const body=mkSection('news','📰 এলাকার সংবাদ','📰 Local News','এলাকার ঘটনা, দুর্ঘটনা ও গুরুত্বপূর্ণ খবর','Events, accidents and important news of our area');
  body.appendChild(el('div','nw-rule','ℹ️ এখানে এলাকার ঘটনা ও গুরুত্বপূর্ণ খবর দেওয়া যায়। খবর পোস্ট করতে অ্যাকাউন্ট লাগে। প্রতিটি পোস্ট অ্যাডমিন যাচাই করেন; সত্য হলে তবেই প্রকাশিত হয়। কারও বিরুদ্ধে অপরাধের অভিযোগ, কারও ব্যক্তিগত ছবি বা গুজব দেবেন না।','ℹ️ Post events and important news of our area. You need an account to post. The admin checks every post and publishes only true news. Do not post accusations of crime against anyone, private photos or rumours.'));
  const bar=el('div','nw-bar');PENDING_BTN=null;
  if(!loggedIn()){
    const t=el('p',null,'খবর পড়তে অ্যাকাউন্ট লাগে না। খবর দিতে হলে অ্যাকাউন্ট খুলুন বা লগইন করুন।','No account is needed to read. To post news, sign up or log in.');t.style.cssText='margin:0 0 10px;font-size:13px;color:#42584b';bar.appendChild(t);
    const bt=el('div','nw-btns');
    const b1=el('button','pri','🔑 লগইন','🔑 Log in');b1.type='button';b1.onclick=()=>authBox('login');
    const b2=el('button',null,'📝 নিবন্ধন করুন','📝 Sign up');b2.type='button';b2.onclick=()=>authBox('signup');
    bt.appendChild(b1);bt.appendChild(b2);bar.appendChild(bt);
  }else{
    const me=el('div','nw-me');me.appendChild(avatar(PROFILE&&PROFILE.photo));
    const mid=document.createElement('div');mid.appendChild(el('b',null,(PROFILE&&PROFILE.name)||SES.email||''));mid.appendChild(el('small',null,(SES.email||'')+(isAdmin()?' · অ্যাডমিন':'')));me.appendChild(mid);bar.appendChild(me);
    const bt=el('div','nw-btns');
    const mk=(t,en,cls,fn)=>{const b=el('button',cls,t,en);b.type='button';b.onclick=fn;bt.appendChild(b);return b};
    mk('✍️ নতুন খবর দিন','✍️ Post news','pri',postForm);
    mk('📂 আমার পোস্ট','📂 My posts','',myPosts);
    mk('👤 আমার প্রোফাইল','👤 My profile','',profileBox);
    if(isAdmin())PENDING_BTN=mk('🛡 অনুমোদনের অপেক্ষায়','🛡 Pending approval','pri',reviewPanel);
    mk('লগআউট','Log out','',()=>logout());
    bar.appendChild(bt);
    if(isAdmin())countPending();
  }
  body.appendChild(bar);
  if(NEWS_ST==='err')body.appendChild(el('div','placeholder','সংবাদ ব্যবস্থা শীঘ্রই চালু হবে।','The news system will start soon.'));
  else if(!NEWS.length)body.appendChild(el('div','placeholder','এখনো কোনো খবর প্রকাশিত হয়নি।','No news has been published yet.'));
  NEWS.forEach(p=>body.appendChild(newsCard(p,'public')));
  showView(viewFromHash(),false,true);if(english)applyLanguage();
}
async function countPending(){
  try{const r=await api('/rest/v1/news_posts?status=eq.pending&select=id');if(r.ok){const j=await r.json();if(PENDING_BTN&&j.length){PENDING_BTN.textContent='🛡 অনুমোদনের অপেক্ষায় ('+toBn(j.length)+')';PENDING_BTN.dataset.bn=PENDING_BTN.textContent;PENDING_BTN.dataset.en='🛡 Pending approval ('+j.length+')'}}}catch(e){}
}
function postForm(){
  if(!loggedIn()){authBox('login',postForm);return}
  const ov=overlay();let sent=false;const urls=[];
  ov.hd.appendChild(el('strong',null,'✍️ নতুন খবর দিন'));
  const cx=el('button','adm-btn light','✕ বাতিল');cx.type='button';cx.onclick=()=>{if(!sent)urls.forEach(dropPhoto);ov.close()};ov.hd.appendChild(cx);
  const f=document.createElement('form');ov.body.appendChild(f);
  const lab=(t,id)=>{const l=el('label','fl',t);l.htmlFor=id;f.appendChild(l)};
  lab('খবরের শিরোনাম *','pTitle');const ti=document.createElement('input');ti.className='fi';ti.id='pTitle';ti.maxLength=150;f.appendChild(ti);
  lab('স্থান (যেমন: ভূজপুর বাজার, ওয়ার্ড নম্বর)','pPlace');const pl=document.createElement('input');pl.className='fi';pl.id='pPlace';pl.maxLength=120;f.appendChild(pl);
  lab('বিস্তারিত * (কী ঘটেছে, কখন, কোথায়)','pBody');const bo=document.createElement('textarea');bo.className='fi';bo.id='pBody';bo.rows=7;bo.maxLength=4000;f.appendChild(bo);
  f.appendChild(el('div','fl','ছবি (সর্বোচ্চ ৪টি)'));
  const box=el('div','adm-ph');const grid=el('div','adm-grid');box.appendChild(grid);
  const paint=()=>{grid.textContent='';if(!urls.length)grid.appendChild(el('div','adm-prev','🖼️ ছবি নেই'));
    urls.forEach((u,ix)=>{const c=el('div','adm-cell');const i=document.createElement('img');i.src=u;c.appendChild(i);const x=el('button','adm-x','✕');x.type='button';x.onclick=()=>{dropPhoto(urls.splice(ix,1)[0]);paint()};c.appendChild(x);grid.appendChild(c)})};paint();
  const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.multiple=true;inp.style.display='none';
  const pick=el('button','adm-btn','📷 ছবি যোগ করুন');pick.type='button';pick.onclick=()=>inp.click();
  const pm=el('div','form-msg');
  inp.onchange=async()=>{const fs=Array.from(inp.files).slice(0,4-urls.length);if(!fs.length){pm.className='form-msg err';pm.textContent='সর্বোচ্চ ৪টি ছবি।';return}pick.disabled=true;let n=0;pm.className='form-msg';
    for(const fl of fs){n++;pm.textContent='আপলোড হচ্ছে… ('+n+'/'+fs.length+')';try{urls.push(await uploadPhoto(fl,'news/'+SES.uid));paint()}catch(e){pm.className='form-msg err';pm.textContent=e.message;break}}
    if(!pm.classList.contains('err'))pm.textContent='';pick.disabled=false;inp.value=''};
  const br=el('div','adm-row');br.appendChild(pick);box.appendChild(br);box.appendChild(inp);box.appendChild(pm);f.appendChild(box);
  const l=el('label','chk');const ck=document.createElement('input');ck.type='checkbox';l.appendChild(ck);
  l.appendChild(el('span',null,'আমি নিশ্চিত যে এই খবর সত্য। ভুল বা মিথ্যা খবরের দায় আমার। অ্যাডমিন যাচাইয়ের পর এটি প্রকাশিত হবে।'));f.appendChild(l);
  const m=el('div','form-msg');f.appendChild(m);
  const sv=el('button','adm-btn','📤 জমা দিন');sv.type='submit';sv.style.cssText='width:100%;margin-top:6px';f.appendChild(sv);
  f.addEventListener('submit',async ev=>{ev.preventDefault();
    const bad=t=>{m.className='form-msg err';m.textContent=t};
    const title=ti.value.trim(),text=bo.value.trim(),place=pl.value.trim();
    if(title.length<5)return bad('শিরোনাম অন্তত ৫ অক্ষরের লিখুন।');
    if(text.length<20)return bad('বিস্তারিত অন্তত ২০ অক্ষর লিখুন।');
    if(!ck.checked)return bad('সত্যতার টিক দিন।');
    sv.disabled=true;m.className='form-msg';m.textContent='জমা হচ্ছে…';
    try{if(!PROFILE)await loadProfile();if(!PROFILE)throw new Error('প্রোফাইল তৈরি হয়নি। আবার লগইন করুন।');
      const r=await api('/rest/v1/news_posts',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({title:title,body:text,place:place||null,photos:urls})});
      if(!r.ok){const t=await r.text();throw new Error(/too many|অনেক/i.test(t)?'আপনার অনেক পোস্ট অপেক্ষায় আছে বা আজ বেশি পোস্ট হয়েছে। পরে চেষ্টা করুন।':'জমা হয়নি ('+r.status+'). SQL ধাপ চালানো হয়েছে কি দেখুন।')}
      sent=true;ov.close();toast('✅ খবর জমা হয়েছে। অ্যাডমিন যাচাইয়ের পর প্রকাশিত হবে।')}catch(e){bad(e.message);sv.disabled=false}});
}
async function myPosts(){
  if(!loggedIn()){authBox('login',myPosts);return}
  const ov=overlay();ov.hd.appendChild(el('strong',null,'📂 আমার পোস্ট'));
  const cx=el('button','adm-btn light','✕ বন্ধ');cx.type='button';cx.onclick=ov.close;ov.hd.appendChild(cx);
  const draw=async()=>{ov.body.textContent='';ov.body.appendChild(el('div','placeholder','লোড হচ্ছে…'));
    try{const r=await api('/rest/v1/news_posts?author=eq.'+encodeURIComponent(SES.uid)+'&select=*&order=created_at.desc&limit=100');if(!r.ok)throw 0;const j=await r.json();
      ov.body.textContent='';if(!j.length)ov.body.appendChild(el('div','placeholder','আপনি এখনো কোনো খবর দেননি।'));
      j.forEach(p=>ov.body.appendChild(newsCard(p,'mine',draw)))}catch(e){ov.body.textContent='';ov.body.appendChild(el('div','placeholder','তালিকা আনা যায়নি।'))}};
  draw();
}
async function reviewPanel(){
  if(!isAdmin()){authBox('login',reviewPanel,true);return}
  const ov=overlay();ov.hd.appendChild(el('strong',null,'🛡 অনুমোদনের অপেক্ষায় থাকা খবর'));
  const cx=el('button','adm-btn light','✕ বন্ধ');cx.type='button';cx.onclick=()=>{ov.close();renderNews()};ov.hd.appendChild(cx);
  ov.body.appendChild(el('div','placeholder','লোড হচ্ছে…'));
  try{const r=await api('/rest/v1/news_posts?status=eq.pending&select=*,profiles(name,phone,email)&order=created_at.asc&limit=100');
    if(!r.ok)throw new Error('আনা যায়নি ('+r.status+') — SQL ধাপ চালানো হয়েছে কি দেখুন।');const j=await r.json();
    ov.body.textContent='';
    if(!j.length){ov.body.appendChild(el('div','placeholder','অনুমোদনের অপেক্ষায় কোনো খবর নেই।'));return}
    ov.body.appendChild(el('p','adm-note','প্রতিটি খবর সত্য কি না যাচাই করে তারপর "প্রকাশ করুন" চাপুন।'));
    j.forEach(p=>ov.body.appendChild(newsCard(p,'review')))}catch(e){ov.body.textContent='';ov.body.appendChild(el('div','placeholder',e.message))}
}
function profileBox(){
  if(!loggedIn()){authBox('login',profileBox);return}
  const ov=overlay();ov.hd.appendChild(el('strong',null,'👤 আমার প্রোফাইল'));
  const cx=el('button','adm-btn light','✕ বন্ধ');cx.type='button';cx.onclick=ov.close;ov.hd.appendChild(cx);
  const P=Object.assign({},PROFILE||{});const f=document.createElement('form');ov.body.appendChild(f);
  f.appendChild(el('div','fl','ছবি'));const box=el('div','adm-ph');const prev=el('div','adm-prev');box.appendChild(prev);
  const pv=()=>{prev.textContent='';if(safeUrl(P.photo)){const i=document.createElement('img');i.src=P.photo;prev.appendChild(i)}else prev.textContent='👤 ছবি নেই'};pv();
  const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.style.display='none';
  const pick=el('button','adm-btn','📷 ছবি বাছুন / তুলুন');pick.type='button';pick.onclick=()=>inp.click();
  const rm=el('button','adm-btn light','🗑 সরান');rm.type='button';rm.onclick=()=>{P.photo=null;pv()};
  const pm=el('div','form-msg');
  inp.onchange=async()=>{const fl=inp.files[0];if(!fl)return;pm.className='form-msg';pm.textContent='আপলোড হচ্ছে…';pick.disabled=true;
    try{P.photo=await uploadPhoto(fl,'news/'+SES.uid);pv();pm.className='form-msg ok';pm.textContent='✅ আপলোড হয়েছে (সেভ করুন)'}catch(e){pm.className='form-msg err';pm.textContent=e.message}pick.disabled=false;inp.value=''};
  const br=el('div','adm-row');br.appendChild(pick);br.appendChild(rm);box.appendChild(br);box.appendChild(inp);box.appendChild(pm);f.appendChild(box);
  const lab=(t,id)=>{const l=el('label','fl',t);l.htmlFor=id;f.appendChild(l)};
  lab('নাম *','prName');const n=document.createElement('input');n.className='fi';n.id='prName';n.maxLength=80;n.value=P.name||'';f.appendChild(n);
  lab('মোবাইল নম্বর (শুধু অ্যাডমিন দেখবেন)','prPhone');const ph=document.createElement('input');ph.className='fi';ph.id='prPhone';ph.type='tel';ph.value=P.phone||'';f.appendChild(ph);
  lab('ইমেইল (বদলানো যাবে না)','prEmail');const em=document.createElement('input');em.className='fi';em.id='prEmail';em.value=SES.email||'';em.readOnly=true;f.appendChild(em);
  f.appendChild(el('p','adm-note','নাম ও ছবি নতুন পোস্টের সাথে প্রকাশ্যে দেখা যাবে। আগের পোস্টে আগের নাম ও ছবিই থাকবে।'));
  const m=el('div','form-msg');f.appendChild(m);
  const sv=el('button','adm-btn','💾 সেভ করুন');sv.type='submit';sv.style.cssText='width:100%;margin-top:6px';f.appendChild(sv);
  f.addEventListener('submit',async ev=>{ev.preventDefault();
    const name=n.value.trim(),phone=(typeof normPhone==='function'?normPhone(ph.value):ph.value.replace(/\D/g,''));
    if(name.length<2){m.className='form-msg err';m.textContent='নাম লিখুন।';return}
    if(phone&&!/^01[3-9]\d{8}$/.test(phone)){m.className='form-msg err';m.textContent='সঠিক ১১ সংখ্যার নম্বর দিন।';return}
    sv.disabled=true;m.className='form-msg';m.textContent='সেভ হচ্ছে…';
    try{if(!PROFILE)await loadProfile();
      const r=await api('/rest/v1/profiles?id=eq.'+encodeURIComponent(SES.uid),{method:'PATCH',headers:{'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({name:name,phone:phone||null,photo:P.photo||null})});
      if(!r.ok)throw new Error('সেভ হয়নি ('+r.status+')');const j=await r.json();if(!j.length)throw new Error('সেভ হয়নি।');
      PROFILE=j[0];ov.close();renderNews();toast('✅ প্রোফাইল সেভ হয়েছে')}catch(e){m.className='form-msg err';m.textContent=e.message;sv.disabled=false}});
}

/* ---------- অ্যাডমিন বাটন ও হোম টাইল ---------- */
function chooser(title,keys){
  const ov=overlay();ov.hd.appendChild(el('strong',null,title));
  const cx=el('button','adm-btn light','✕ বন্ধ');cx.type='button';cx.onclick=ov.close;ov.hd.appendChild(cx);
  const g=el('div','fgrid');ov.body.appendChild(g);
  keys.forEach(k=>{const C=COLS[k];const b=el('button','fold');b.type='button';b.appendChild(el('span','fi2',C.icon));b.appendChild(el('b',null,C.t));b.onclick=()=>{ov.close();manager(k)};g.appendChild(b)});
}
function paintAdminUI(){
  let fb=$('admFab');
  const v=viewFromHash();
  if(isAdmin()){
    if(!fb){fb=el('button','adm-fab');fb.id='admFab';fb.type='button';document.body.appendChild(fb);
      fb.onclick=()=>{const k=viewFromHash()||'home';
        if(k==='news'){reviewPanel();return}
        if(k==='contact'){chooser('✉️ যোগাযোগ পাতা',['about','ads']);return}
        const col=VIEWCOL[k];if(!col){home();return}
        manager(col,k==='madrasas'?isMad:(k==='schools'?(d=>!isMad(d)):null),k==='madrasas'?{type:'মাদ্রাসা',typeEn:'Madrasa'}:null)}}
    const k=v||'home';const col=VIEWCOL[k];fb.textContent=k==='news'?'🛡 সংবাদ অনুমোদন':(k==='contact'?'⚙️ পরিচয় ও বিজ্ঞাপন':(col?'⚙️ এই পাতা এডিট':'⚙️ অ্যাডমিন'));fb.style.display='';
  }else if(fb)fb.style.display='none';
  const g=document.querySelector('.fgrid');
  const old=$('admTile');if(old)old.remove();
  if(g&&isAdmin()){const b=el('button','fold');b.id='admTile';b.type='button';b.appendChild(el('span','fi2','⚙️'));b.appendChild(el('b',null,'অ্যাডমিন প্যানেল'));b.appendChild(el('small',null,'যেকোনো তথ্য বদলান'));b.onclick=home;g.appendChild(b)}
  const ol=$('admLink');if(ol)ol.remove();
  paintCtAdm();
}
function home(){
  if(!isAdmin()){loginBox(home);return}
  const ov=overlay();ov.hd.appendChild(el('strong',null,'⚙️ অ্যাডমিন প্যানেল'));
  const cx=el('button','adm-btn light','✕ বন্ধ');cx.type='button';cx.onclick=ov.close;ov.hd.appendChild(cx);
  ov.body.appendChild(el('p','adm-note','কোন তথ্য বদলাতে চান বেছে নিন। প্রতিটি তালিকায় যোগ, এডিট, ডিলিট ও ছবি আপলোড করা যাবে।'));
  const g=el('div','fgrid');ov.body.appendChild(g);
  const nb=el('button','fold');nb.type='button';nb.appendChild(el('span','fi2','🛡'));nb.appendChild(el('b',null,'সংবাদ অনুমোদন'));nb.onclick=()=>{ov.close();reviewPanel()};g.appendChild(nb);
  Object.keys(COLS).forEach(k=>{const C=COLS[k];const b=el('button','fold');b.type='button';b.appendChild(el('span','fi2',C.icon));b.appendChild(el('b',null,C.t));
    b.onclick=()=>{ov.close();manager(k)};g.appendChild(b)});
  const lo=el('button','adm-btn light','লগআউট');lo.type='button';lo.style.cssText='width:100%;margin-top:16px';lo.onclick=()=>{logout();ov.close()};ov.body.appendChild(lo);
}

window.addEventListener('hashchange',paintAdminUI);window.addEventListener('popstate',()=>setTimeout(paintAdminUI,0));
document.addEventListener('click',()=>setTimeout(paintAdminUI,50));
renderAbout();paintAdminUI();loadContent();loadNews();
if(SES&&SES.admin===undefined&&loggedIn())checkAdmin().then(()=>{paintAdminUI();renderAbout();renderNews()});
if(loggedIn())loadProfile().then(()=>renderNews());
})();
