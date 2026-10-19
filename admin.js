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
const isAdmin=()=>!!(SES&&SES.at);
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
function saveSes(j,email){SES={at:j.access_token,rt:j.refresh_token,exp:Date.now()+(j.expires_in||3600)*1000,email:email||(j.user&&j.user.email)||''};try{localStorage.setItem('adm',JSON.stringify(SES))}catch(e){}}
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
  window.HISTORY_DATA=eff('history',STATIC.history,imp);window.TOURISM_DATA=eff('tourism',STATIC.tourism,imp);
  const T=JSON.parse(JSON.stringify(STATIC.thana)),tr=rowsOf('thana')[0];
  if(tr&&tr.data){if(tr.data.photo)T.photo=tr.data.photo;if(tr.data.phone){const f=(T.facts||[]).find(x=>'phone' in x);if(f)f.phone=tr.data.phone}}
  window.THANA_DATA=T;
  renderSlider();renderNotices();renderDir();renderHistory();renderTourism();renderThana();renderAbout();
  if(window.refreshDynamic)refreshDynamic();
  refreshCounts();showView(viewFromHash(),false,true);
  if(english)applyLanguage();
  paintAdminUI();
}

/* ---------- আমার পরিচয় (যোগাযোগ পাতায়) ---------- */
function renderAbout(){
  const old=$('aboutMe');if(old)old.remove();
  const sec=$('contact');if(!sec)return;
  const row=rowsOf('about')[0];const d=Object.assign({},ABOUT_DEFAULT,(row&&row.data)||{});
  const box=el('div','about-me');box.id='aboutMe';
  box.appendChild(el('h2',null,'👤 কে বানিয়েছেন','👤 Who made this'));
  const ph=el('div','am-photo');
  if(safeUrl(d.photo)){const i=document.createElement('img');i.src=d.photo;i.alt='';i.onerror=()=>{i.remove();ph.textContent='👤'};ph.appendChild(i)}else ph.textContent='👤';
  box.appendChild(ph);
  const nm=el('p','am-name');nm.appendChild(el('b',null,d.bn,d.en||d.bn));
  box.appendChild(nm);
  if(d.roleBn)box.appendChild(el('div','am-role',d.roleBn,d.roleEn||d.roleBn));
  if(d.bioBn)box.appendChild(el('p','am-bio',d.bioBn,d.bioEn||d.bioBn));
  const soc=el('div','am-soc');
  [['website','🌐','Website'],['facebook','f','Facebook'],['linkedin','in','LinkedIn'],['instagram','◎','Instagram']].forEach(s=>{
    const u=safeUrl(d[s[0]]);if(!u)return;const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener';a.textContent=s[1];a.setAttribute('aria-label',s[2]);soc.appendChild(a)});
  if(d.phone){const a=document.createElement('a');a.href='tel:'+String(d.phone).replace(/[^\d+]/g,'');a.textContent='📞';a.setAttribute('aria-label','Call');soc.appendChild(a)}
  if(soc.children.length)box.appendChild(soc);
  sec.insertBefore(box,sec.firstChild);
}

/* ---------- ফিল্ড-তালিকা (কোন তথ্যের কোন ঘর) ---------- */
const bi=(k,k2,l,t,req)=>({k:k,k2:k2,l:l,t:t||'text',req:req});
const one=(k,l,t)=>({k:k,l:l,t:t||'text'});
const photo=(k,l)=>({k:k||'photo',l:l||'ছবি',t:'photo'});
const photos=()=>({k:'photos',l:'ছবি (একাধিক দেওয়া যাবে — প্রথমটি প্রচ্ছদ)',t:'photos'});
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
  thana:{icon:'🚓',t:'থানার ছবি ও ওসির নম্বর',single:true,fields:[photo(),one('phone','ওসি / ডিউটি অফিসারের ফোন','tel')]},
  about:{icon:'👤',t:'আমার পরিচয় (যোগাযোগ পাতা)',single:true,fields:[photo(),bi('bn','en','আপনার নাম *','text',1),bi('roleBn','roleEn','পরিচয় (যেমন: ওয়েবসাইট নির্মাতা)'),bi('bioBn','bioEn','নিজের সম্পর্কে কয়েক লাইন','area'),
    one('website','ওয়েবসাইট লিংক (https://...)'),one('facebook','ফেসবুক লিংক'),one('linkedin','লিংকডইন লিংক'),one('instagram','ইনস্টাগ্রাম লিংক'),one('phone','ফোন','tel')]}
};
const VIEWCOL={home:'slides',schools:'schools',madrasas:'schools',hospitals:'hospitals',doctors:'doctors',history:'history',tourism:'tourism',transport:'transport',market:'market',notices:'notices',thana:'thana',contact:'about'};

/* ---------- ছোট সহায়ক UI ---------- */
function toast(msg,bad){const t=el('div','adm-toast',msg);if(bad)t.style.background='#b3261e';document.body.appendChild(t);setTimeout(()=>t.remove(),3200)}
function overlay(){const o=document.createElement('div');o.className='adm';const hd=el('div','adm-hd');o.appendChild(hd);const body=el('div','adm-body');o.appendChild(body);document.body.appendChild(o);document.body.classList.add('gated');return{o:o,hd:hd,body:body,close(){o.remove();if(!document.querySelector('.adm,#gate,#detailModal'))document.body.classList.remove('gated')}}}

/* ---------- লগইন ---------- */
function loginBox(onOk){
  const ov=overlay();ov.hd.appendChild(el('strong',null,'🔐 অ্যাডমিন লগইন'));const x=el('button','adm-btn light','✕ বন্ধ');x.type='button';x.onclick=ov.close;ov.hd.appendChild(x);
  const f=document.createElement('form');ov.body.appendChild(f);
  const lab=(t,i)=>{const l=el('label','fl',t);l.htmlFor=i;f.appendChild(l)};
  lab('ইমেইল','aEmail');const e=document.createElement('input');e.className='fi';e.id='aEmail';e.type='email';e.autocomplete='username';f.appendChild(e);
  lab('পাসওয়ার্ড','aPass');const p=document.createElement('input');p.className='fi';p.id='aPass';p.type='password';p.autocomplete='current-password';f.appendChild(p);
  const m=el('div','form-msg');f.appendChild(m);
  const b=el('button','adm-btn','লগইন করুন');b.type='submit';b.style.cssText='width:100%;margin-top:12px';f.appendChild(b);
  f.addEventListener('submit',async ev=>{ev.preventDefault();m.className='form-msg';m.textContent='লগইন হচ্ছে…';b.disabled=true;
    try{const r=await fetch(SB_URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:CFG.supabaseKey,'Content-Type':'application/json'},body:JSON.stringify({email:e.value.trim(),password:p.value})});
      const j=await r.json();
      if(!r.ok){m.className='form-msg err';m.textContent='ইমেইল বা পাসওয়ার্ড ঠিক নয়।';b.disabled=false;return}
      saveSes(j,e.value.trim());try{localStorage.setItem('visitorReg','admin')}catch(x){}
      ov.close();const g=$('gate');if(g)closeGate();paintAdminUI();toast('✅ অ্যাডমিন হিসেবে লগইন হয়েছে');if(onOk)onOk();
    }catch(x){m.className='form-msg err';m.textContent='ইন্টারনেট সংযোগে সমস্যা।';b.disabled=false}});
}
function logout(silent){SES=null;try{localStorage.removeItem('adm')}catch(e){}paintAdminUI();if(!silent)toast('লগআউট হয়েছে')}

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
function dropPhoto(url){if(url&&url.indexOf(PUB)===0){api('/storage/v1/object/'+BUCKET+'/'+url.slice(PUB.length),{method:'DELETE'}).catch(()=>{})}}

/* ---------- যোগ / এডিট ফর্ম ---------- */
function editor(colKey,row,preset,done){
  const C=COLS[colKey];const d=Object.assign({},preset||{},(row&&row.data)||{});
  const ov=overlay();ov.hd.appendChild(el('strong',null,(row?'✏️ এডিট: ':'＋ নতুন: ')+C.t));
  const cx=el('button','adm-btn light','✕ বাতিল');cx.type='button';cx.onclick=ov.close;ov.hd.appendChild(cx);
  const f=document.createElement('form');ov.body.appendChild(f);const get={};
  C.fields.forEach((fd,ix)=>{
    const id='af'+ix;
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
      if(fd.t==='photo'&&row&&row.data&&row.data[fd.k]&&row.data[fd.k]!==data[fd.k])dropPhoto(row.data[fd.k])
      if(fd.t==='photos'&&row&&row.data){const old=(row.data.photos||[]).concat(row.data.photo||[]),now=data.photos||[];old.forEach(u=>{if(now.indexOf(u)<0&&data.photo!==u)dropPhoto(u)})}}
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
          dropPhoto(r.data[C.img||'photo']);ROWS=ROWS.filter(z=>z.id!==r.id);applyAll();draw();toast('🗑 মুছে ফেলা হয়েছে')}catch(e){toast(e.message,true)}},'del');
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

/* ---------- অ্যাডমিন বাটন ও হোম টাইল ---------- */
function paintAdminUI(){
  let fb=$('admFab');
  const v=viewFromHash();
  if(isAdmin()){
    if(!fb){fb=el('button','adm-fab');fb.id='admFab';fb.type='button';document.body.appendChild(fb);
      fb.onclick=()=>{const k=viewFromHash()||'home';const col=VIEWCOL[k];if(!col){home();return}
        manager(col,k==='madrasas'?isMad:(k==='schools'?(d=>!isMad(d)):null),k==='madrasas'?{type:'মাদ্রাসা',typeEn:'Madrasa'}:null)}}
    const col=VIEWCOL[v||'home'];fb.textContent=col?'⚙️ এই পাতা এডিট':'⚙️ অ্যাডমিন';fb.style.display='';
  }else if(fb)fb.style.display='none';
  const g=document.querySelector('.fgrid');
  const old=$('admTile');if(old)old.remove();
  if(g&&isAdmin()){const b=el('button','fold');b.id='admTile';b.type='button';b.appendChild(el('span','fi2','⚙️'));b.appendChild(el('b',null,'অ্যাডমিন প্যানেল'));b.appendChild(el('small',null,'যেকোনো তথ্য বদলান'));b.onclick=home;g.appendChild(b)}
  let lk=$('admLink');
  if(!lk){lk=el('div','adm-link');lk.id='admLink';const a=document.createElement('a');a.href='#';a.textContent='🔐 অ্যাডমিন';a.onclick=e=>{e.preventDefault();isAdmin()?home():loginBox(home)};lk.appendChild(a);
    const f=$('folders');if(f)f.appendChild(lk)}
  const a=lk.querySelector('a');a.textContent=isAdmin()?'⚙️ অ্যাডমিন প্যানেল ('+(SES.email||'')+')':'🔐 অ্যাডমিন লগইন';
}
function home(){
  if(!isAdmin()){loginBox(home);return}
  const ov=overlay();ov.hd.appendChild(el('strong',null,'⚙️ অ্যাডমিন প্যানেল'));
  const cx=el('button','adm-btn light','✕ বন্ধ');cx.type='button';cx.onclick=ov.close;ov.hd.appendChild(cx);
  ov.body.appendChild(el('p','adm-note','কোন তথ্য বদলাতে চান বেছে নিন। প্রতিটি তালিকায় যোগ, এডিট, ডিলিট ও ছবি আপলোড করা যাবে।'));
  const g=el('div','fgrid');ov.body.appendChild(g);
  Object.keys(COLS).forEach(k=>{const C=COLS[k];const b=el('button','fold');b.type='button';b.appendChild(el('span','fi2',C.icon));b.appendChild(el('b',null,C.t));
    b.onclick=()=>{ov.close();manager(k)};g.appendChild(b)});
  const lo=el('button','adm-btn light','লগআউট');lo.type='button';lo.style.cssText='width:100%;margin-top:16px';lo.onclick=()=>{logout();ov.close()};ov.body.appendChild(lo);
}
// গেটে (প্রথম নিবন্ধন পর্দায়) অ্যাডমিনের জন্য ছোট লিংক
(function(){const g=$('gate');if(!g)return;const c=g.querySelector('.gate-card');if(!c)return;
  const d=el('div');d.style.cssText='text-align:center;margin-top:12px;font-size:12px';const a=document.createElement('a');a.href='#';a.textContent='🔐 অ্যাডমিন লগইন';a.style.color='var(--green)';a.onclick=e=>{e.preventDefault();loginBox()};d.appendChild(a);c.appendChild(d)})();

window.addEventListener('hashchange',paintAdminUI);window.addEventListener('popstate',()=>setTimeout(paintAdminUI,0));
document.addEventListener('click',()=>setTimeout(paintAdminUI,50));
renderAbout();paintAdminUI();loadContent();
})();
