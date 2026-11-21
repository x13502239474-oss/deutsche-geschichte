/* ============================================================
   德意志史诗 · 应用主逻辑
   路由 / 阅读器 / 搜索 / 笔记书签 / 进度 / 图表
   ============================================================ */
(function(){
"use strict";

const IDX = window.DG_INDEX;
const TOPICS = window.DG_TOPICS || [];
const FIGURES = window.DG_FIGURES || [];
const CHARTS = window.DG_CHARTS || {};
const MODULES = IDX.modules;

// ---------- 状态 ----------
const State = {
  view:"home",
  moduleData:{},        // 已加载的模块数据缓存
  searchLoaded:false,
  searchIndex:[],
  fontSize:18,
  darkReader:false,
  currentChapter:null,  // {mid, chIdx}
  currentTopic:null,
  noteTarget:null,
  noteText:"",
  chartTab:"dynasty",
  mapCurrent:null,
  libTab:"progress",
  tocFilter:"all",
  figFilter:"all"
};

// ---------- 本地存储 ----------
const STORE_KEY="dg_library_v1";
function loadStore(){
  try{return JSON.parse(localStorage.getItem(STORE_KEY))||{};}catch(e){return {};}
}
function saveStore(s){localStorage.setItem(STORE_KEY,JSON.stringify(s));}
let store=loadStore();
store.progress=store.progress||{};
store.bookmarks=store.bookmarks||[];
store.notes=store.notes||{};
store.settings=store.settings||{};

if(store.settings.fontSize) State.fontSize=store.settings.fontSize;
if(store.settings.darkReader) State.darkReader=store.settings.darkReader;

// ---------- 工具 ----------
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>n>=10000?(n/10000).toFixed(1)+"万":String(n);

// ---------- 视图路由 ----------
function showView(name){
  State.view=name;
  $$(".view").forEach(v=>v.classList.remove("active"));
  const el=document.getElementById("view-"+name);
  if(el)el.classList.add("active");
  window.scrollTo(0,0);
  updateGlobalProgress();
  // 更新导航高亮
  $$("[data-nav]").forEach(a=>{
    if(a.classList.contains("bottomnav")||a.closest(".drawer")){
      a.classList.toggle("active",a.getAttribute("data-nav")===name);
    }
  });
  closeDrawer();
}
function nav(name){
  if(name==="toc")renderTOC();
  if(name==="topics")renderTopics();
  if(name==="figures")renderFigures();
  if(name==="charts")renderCharts();
  if(name==="search"){renderSearchIntro();}
  if(name==="library")renderLibrary();
  if(name==="about")renderAbout();
  showView(name);
}

// 事件委托：所有 data-nav
document.addEventListener("click",e=>{
  const a=e.target.closest("[data-nav]");
  if(a){e.preventDefault();nav(a.getAttribute("data-nav"));}
});

// ---------- 抽屉 ----------
function openDrawer(){$("#drawer").classList.add("show");$("#drawer-overlay").classList.add("show");}
function closeDrawer(){$("#drawer").classList.remove("show");$("#drawer-overlay").classList.remove("show");}
$("#menu-btn").addEventListener("click",openDrawer);
$("#drawer-overlay").addEventListener("click",closeDrawer);
$("#search-btn").addEventListener("click",()=>nav("search"));
$("#library-btn").addEventListener("click",()=>nav("library"));

// ---------- 全局进度 ----------
function updateGlobalProgress(){
  const m=MODULES.length;
  let done=0,partial=0;
  MODULES.forEach(mod=>{
    const total=mod.chapters.reduce((s,c)=>s+c.sections.length,0);
    const p=store.progress[mod.id];
    if(p){
      let read=0;
      mod.chapters.forEach((c,ci)=>{
        const cp=p["c"+ci];
        if(cp){mod.chapters[ci].sections.forEach((_,si)=>{if(cp["s"+si])read++;});}
      });
      if(read>=total)done++;else if(read>0)partial++;
    }
  });
  const pct=m?((done+partial*0.5)/m*100):0;
  $("#global-progress").style.width=pct+"%";
}

// ---------- 首页渲染 ----------
function renderHome(){
  const eras=$("#home-eras");
  eras.innerHTML=MODULES.map(m=>`
    <div class="era-cell" data-open-module="${m.id}">
      <div class="enum">${String(m.id).padStart(2,"0")}</div>
      <div class="ey">${esc(m.years)}</div>
      <div class="et">${esc(m.title)}</div>
      <div class="era-arrow">阅读 →</div>
    </div>`).join("");
  eras.addEventListener("click",e=>{
    const cell=e.target.closest("[data-open-module]");
    if(cell){const id=+cell.getAttribute("data-open-module");openModule(id);}
  });
  const teasers=$("#home-topics");
  teasers.innerHTML=TOPICS.slice(0,6).map(t=>`
    <div class="topic-teaser" data-open-topic="${t.id}">
      <div class="tt-num">专题 ${String(TOPICS.indexOf(t)+1).padStart(2,"0")}</div>
      <div class="tt-title">${esc(t.title)}</div>
    </div>`).join("");
  teasers.addEventListener("click",e=>{
    const cell=e.target.closest("[data-open-topic]");
    if(cell){openTopic(cell.getAttribute("data-open-topic"));}
  });
}

// ---------- 目录 ----------
function renderTOC(){
  const list=$("#toc-list");
  const filtered=MODULES.filter(m=>State.tocFilter==="all"||m.era===State.tocFilter);
  list.innerHTML=filtered.map(m=>{
    const secTotal=m.chapters.reduce((s,c)=>s+c.sections.length,0);
    let readSec=0;const p=store.progress[m.id];
    if(p)m.chapters.forEach((c,ci)=>{const cp=p["c"+ci];if(cp)c.sections.forEach((_,si)=>{if(cp["s"+si])readSec++;});});
    const pct=secTotal?Math.round(readSec/secTotal*100):0;
    return `<div class="toc-item" data-module="${m.id}">
      <div class="toc-module">
        <div class="toc-idx">${String(m.id).padStart(2,"0")}</div>
        <div class="toc-main">
          <div class="toc-meta-top">
            <span class="era-badge">${esc(m.era)}</span>
            <span class="toc-years">${esc(m.years)}</span>
            ${pct>0?`<span class="toc-years">已读 ${pct}%</span>`:""}
          </div>
          <div class="toc-mtitle">${esc(m.title)}</div>
          <div class="toc-msub">${esc(m.subtitle)}</div>
          <div class="toc-summary">${esc(m.summary)}</div>
          <div class="toc-expand">展开 ${m.chapters.length} 章 · ${fmt(m.charCount)}字 <span class="toc-chevron">▶</span></div>
        </div>
      </div>
      <div class="toc-chapters">
        ${m.chapters.map((c,ci)=>`
          <div style="margin-bottom:10px">
            <div class="toc-chapter" data-chapter="${ci}" data-module="${m.id}">
              <span class="ch-num">${String(c.num).padStart(2,"0")}</span>
              <span class="ch-title">${esc(c.title)}</span>
              <span class="ch-size">${fmt(c.charCount)}字</span>
              <span class="ch-go">→</span>
            </div>
            <div class="toc-section-list">
              ${c.sections.map((s,si)=>`<div class="toc-sec" data-sec="${si}" data-chapter="${ci}" data-module="${m.id}">${esc(s.heading)} · ${s.chars}字</div>`).join("")}
            </div>
          </div>`).join("")}
      </div>
    </div>`;
  }).join("");
  // 绑定
  list.querySelectorAll(".toc-module").forEach(el=>{
    el.addEventListener("click",e=>{
      if(e.target.closest(".toc-chapter")||e.target.closest(".toc-sec"))return;
      el.parentElement.classList.toggle("open");
    });
  });
  list.querySelectorAll(".toc-chapter").forEach(el=>{
    el.addEventListener("click",e=>{
      e.stopPropagation();
      const mid=+el.getAttribute("data-module"),ci=+el.getAttribute("data-chapter");
      openChapter(mid,ci);
    });
  });
  list.querySelectorAll(".toc-sec").forEach(el=>{
    el.addEventListener("click",e=>{
      e.stopPropagation();
      const mid=+el.getAttribute("data-module"),ci=+el.getAttribute("data-chapter"),si=+el.getAttribute("data-sec");
      openChapter(mid,ci,si);
    });
  });
}
$$(".filter-chip[data-era]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    State.tocFilter=btn.getAttribute("data-era");
    $$(".filter-chip[data-era]").forEach(b=>b.classList.toggle("active",b===btn));
    renderTOC();
  });
});

// ---------- 模块/章节数据加载 ----------
function loadModuleData(mid){
  if(State.moduleData[mid])return Promise.resolve(State.moduleData[mid]);
  return new Promise((resolve,reject)=>{
    const s=document.createElement("script");
    s.src="data/module-"+String(mid).padStart(2,"0")+".js";
    s.onload=()=>{
      const d=window["DG_MODULE_"+mid];
      if(d){State.moduleData[mid]=d;resolve(d);}else reject(new Error("load fail "+mid));
    };
    s.onerror=()=>reject(new Error("network error "+mid));
    document.head.appendChild(s);
  });
}
function openModule(mid){
  nav("toc");
  setTimeout(()=>{
    const item=document.querySelector('.toc-item[data-module="'+mid+'"]');
    if(item){item.classList.add("open");item.scrollIntoView({behavior:"smooth",block:"center"});}
  },100);
}

// ---------- 阅读器 ----------
async function openChapter(mid,ci,scrollSi){
  const mod=MODULES.find(m=>m.id===mid);
  let data;
  try{data=await loadModuleData(mid);}catch(e){alert("章节加载失败，请检查网络或本地文件。");return;}
  const ch=data.chapters[ci];
  State.currentChapter={mid,ci,ch,mod};
  State.currentTopic=null;

  $("#reader-crumb").innerHTML=`目录 / <b>${esc(mod.title)}</b> / 第${ch.num}章`;
  const art=$("#reader-article");
  art.classList.toggle("dark-mode",State.darkReader);
  art.style.setProperty("--read-size",State.fontSize+"px");
  art.innerHTML=`
    <div class="reader-top">
      <div class="reader-era-tag">${esc(mod.era)} · ${esc(mod.years)}</div>
      <div class="reader-chapter-label">${esc(mod.title)} · 第 ${ch.num} 章</div>
      <h1>${esc(ch.title)}</h1>
      <div class="reader-subtitle">${esc(mod.subtitle)}</div>
      <div class="reader-source">正文来源：${esc(ch.volTitle)} · 第${ch.num}章（整理自《德国通史》，邢来顺、吴友法主编，江苏人民出版社2019年版）。已按主题重新编排小节。</div>
    </div>
    <div id="reader-sections">
      ${ch.sections.map((s,si)=>`
        <section class="reader-section" data-si="${si}">
          <h2 id="sec-${si}">${esc(s.heading)}</h2>
          ${renderBody(s.body,si===0)}
        </section>`).join("")}
    </div>`;
  // 恢复该书签状态
  updateBookmarkBtn();
  // 标注已读
  markSectionRead(mid,ci,scrollSi||0);
  // 底部导航
  renderReaderBottom(mid,ci);
  showView("reader");
  setupReaderScroll(mid,ci,ch);
  if(scrollSi!==undefined){
    setTimeout(()=>{const t=document.getElementById("sec-"+scrollSi);if(t)t.scrollIntoView({behavior:"smooth",block:"start"});},200);
  }
}

function renderBody(body,isFirst){
  // 按空行分段，每段作为<p>；首段使用首字下沉
  const paras=body.split(/\n+/).map(p=>p.trim()).filter(p=>p.length>0);
  return paras.map((p,i)=>`<p class="${isFirst&&i===0?"reader-drop":""}">${esc(p)}</p>`).join("");
}

function setupReaderScroll(mid,ci,ch){
  const fill=$("#reader-progress-fill");
  const art=$("#reader-article");
  const onScroll=()=>{
    const r=art.getBoundingClientRect();
    const total=art.offsetHeight-window.innerHeight+200;
    let pct=0;
    if(total>0)pct=Math.min(100,Math.max(0,(-r.top+100)/total*100));
    fill.style.width=pct+"%";
    // 标记视口内小节为已读
    const secs=art.querySelectorAll(".reader-section");
    secs.forEach(s=>{
      const sr=s.getBoundingClientRect();
      if(sr.top<window.innerHeight*0.7&&sr.bottom>0){
        markSectionRead(mid,ci,+s.getAttribute("data-si"),true);
      }
    });
  };
  window.addEventListener("scroll",onScroll,{passive:true});
  State._scrollHandler=onScroll;
}
function markSectionRead(mid,ci,si,silent){
  if(!store.progress[mid])store.progress[mid]={};
  if(!store.progress[mid]["c"+ci])store.progress[mid]["c"+ci]={};
  const cp=store.progress[mid]["c"+ci];
  if(cp["s"+si])return;
  cp["s"+si]=Date.now();
  saveStore(store);
  updateGlobalProgress();
}

// 阅读器工具
$("#reader-back").addEventListener("click",()=>nav("toc"));
$("#font-plus").addEventListener("click",()=>adjustFont(1));
$("#font-minus").addEventListener("click",()=>adjustFont(-1));
function adjustFont(d){
  State.fontSize=Math.max(15,Math.min(26,State.fontSize+d));
  $("#reader-article").style.setProperty("--read-size",State.fontSize+"px");
  $("#topic-article").style.setProperty("--read-size",State.fontSize+"px");
  store.settings.fontSize=State.fontSize;saveStore(store);
}
$("#theme-toggle").addEventListener("click",()=>{
  State.darkReader=!State.darkReader;
  $("#reader-article").classList.toggle("dark-mode",State.darkReader);
  $("#topic-article").classList.toggle("dark-mode",State.darkReader);
  store.settings.darkReader=State.darkReader;saveStore(store);
});
$("#reader-bookmark").addEventListener("click",()=>{
  if(!State.currentChapter)return;
  toggleBookmark({type:"chapter",mid:State.currentChapter.mid,ci:State.currentChapter.ci});
});
$("#topic-bookmark").addEventListener("click",()=>{
  if(!State.currentTopic)return;
  toggleBookmark({type:"topic",id:State.currentTopic});
});
function toggleBookmark(item){
  const key=item.type==="chapter"?`c_${item.mid}_${item.ci}`:`t_${item.id}`;
  const idx=store.bookmarks.findIndex(b=>b.key===key);
  if(idx>=0){store.bookmarks.splice(idx,1);}else{store.bookmarks.push({key,...item,ts:Date.now()});}
  saveStore(store);updateBookmarkBtn();
}
function isBookmarked(item){
  const key=item.type==="chapter"?`c_${item.mid}_${item.ci}`:`t_${item.id}`;
  return store.bookmarks.some(b=>b.key===key);
}
function updateBookmarkBtn(){
  if(State.currentChapter){
    const on=isBookmarked({type:"chapter",mid:State.currentChapter.mid,ci:State.currentChapter.ci});
    $("#reader-bookmark").textContent=on?"★":"☆";
    $("#reader-bookmark").style.color=on?"var(--gold)":"";
  }
  if(State.currentTopic){
    const on=isBookmarked({type:"topic",id:State.currentTopic});
    $("#topic-bookmark").textContent=on?"★":"☆";
    $("#topic-bookmark").style.color=on?"var(--gold)":"";
  }
}

function renderReaderBottom(mid,ci){
  const mod=MODULES.find(m=>m.id===mid);
  const bottom=$("#reader-bottom");
  const prevCi=ci-1,nextCi=ci+1;
  bottom.innerHTML=`
    ${prevCi>=0?`<div class="rb-nav"><button class="rb-btn" id="rb-prev"><small>← 上一章</small><span>${esc(mod.chapters[prevCi].title)}</span></button></div>`:""}
    ${nextCi<mod.chapters.length?`<div class="rb-nav"><button class="rb-btn" id="rb-next" style="text-align:right;margin-left:auto"><small>下一章 →</small><span>${esc(mod.chapters[nextCi].title)}</span></button></div>`:""}
    <button class="rb-note-btn" id="rb-note">✎ 为此章添加阅读笔记</button>
    <div class="rb-annot-tabs">
      <button id="rb-see-notes">查看本章笔记</button>
      <button data-nav="library">前往我的书架</button>
    </div>`;
  const prev=$("#rb-prev"),next=$("#rb-next");
  if(prev)prev.onclick=()=>openChapter(mid,prevCi);
  if(next)next.onclick=()=>openChapter(mid,nextCi);
  $("#rb-note").onclick=()=>openNote({type:"chapter",mid,ci,title:mod.chapters[ci].title});
  $("#rb-see-notes").onclick=()=>{nav("library");setTimeout(()=>switchLibTab("notes"),50);};
}

// ---------- 专题 ----------
function renderTopics(){
  const list=$("#topic-list");
  list.innerHTML=TOPICS.map((t,i)=>`
    <div class="topic-card" data-topic="${t.id}">
      <div class="tc-num">${String(i+1).padStart(2,"0")}</div>
      <div class="tc-body">
        <h3>${esc(t.title)}</h3>
        <p>${esc(t.subtitle)}　—　${esc(t.words)}</p>
        <div class="tc-meta">含 ${t.sections.length} 节 · 关联 ${t.related.length} 个历史模块</div>
      </div>
    </div>`).join("");
  list.querySelectorAll(".topic-card").forEach(c=>{
    c.onclick=()=>openTopic(c.getAttribute("data-topic"));
  });
}
function openTopic(id){
  const t=TOPICS.find(x=>x.id===id);
  if(!t)return;
  State.currentTopic=id;State.currentChapter=null;
  $("#topic-crumb").innerHTML=`专题研究 / <b>${esc(t.title)}</b>`;
  const art=$("#topic-article");
  art.classList.toggle("dark-mode",State.darkReader);
  art.style.setProperty("--read-size",State.fontSize+"px");
  art.innerHTML=`
    <div class="reader-top">
      <div class="reader-era-tag">专题研究 · ${esc(t.words)}</div>
      <div class="reader-chapter-label">TIEFENSTUDIE ${String(TOPICS.indexOf(t)+1).padStart(2,"0")}</div>
      <h1>${esc(t.title)}</h1>
      <div class="reader-subtitle">${esc(t.subtitle)}</div>
    </div>
    ${t.sections.map((s,i)=>`
      <section class="reader-section">
        <h2>${esc(s.h)}</h2>
        ${s.p.map((p,pi)=>`<p class="${i===0&&pi===0?"reader-drop":""}">${esc(p)}</p>`).join("")}
      </section>`).join("")}
    <section class="reader-section">
      <h2>延伸阅读路径</h2>
      <p>本专题关联的原始章节，来自《德国通史》六卷本：</p>
      <div class="fd-links" style="margin-top:14px">
        ${t.related.map(r=>`<button class="fd-link" data-goto-module="${r.m}">${esc(r.t)}<small>→</small></button>`).join("")}
      </div>
      <p style="margin-top:18px;font-size:.9em;color:var(--ink-3)">※ 本专题为基于可靠历史资料撰写的独立分析，非原书摘录。学术争议部分呈现不同研究观点。</p>
    </section>`;
  art.querySelectorAll("[data-goto-module]").forEach(b=>{
    b.onclick=()=>openModule(+b.getAttribute("data-goto-module"));
  });
  $("#topic-bottom").innerHTML=`<button class="rb-note-btn" id="topic-note-btn">✎ 为此专题添加阅读笔记</button>`;
  $("#topic-note-btn").onclick=()=>openNote({type:"topic",id,title:t.title});
  updateBookmarkBtn();
  showView("topic-detail");
}
$("#topic-back").addEventListener("click",()=>nav("topics"));

// ---------- 人物 ----------
function renderFigures(){
  const grid=$("#figure-grid");
  const filtered=FIGURES.filter(f=>State.figFilter==="all"||f.cat===State.figFilter);
  grid.innerHTML=filtered.map(f=>`
    <div class="figure-card" data-figure="${f.id}">
      <div class="figure-cat">${esc(f.cat)}</div>
      <div class="figure-monogram">${esc(f.name.charAt(0))}</div>
      <div class="figure-name">${esc(f.name)}</div>
      <div class="figure-de">${esc(f.de)}</div>
      <div class="figure-years">${esc(f.years)}</div>
      <div class="figure-one">${esc(f.one)}</div>
    </div>`).join("");
  grid.querySelectorAll(".figure-card").forEach(c=>{
    c.onclick=()=>openFigure(c.getAttribute("data-figure"));
  });
}
$$(".filter-chip[data-fcat]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    State.figFilter=btn.getAttribute("data-fcat");
    $$(".filter-chip[data-fcat]").forEach(b=>b.classList.toggle("active",b===btn));
    renderFigures();
  });
});
function openFigure(id){
  const f=FIGURES.find(x=>x.id===id);
  if(!f)return;
  const box=$("#figure-detail");
  box.innerHTML=`
    <div class="fd-head">
      <div class="fd-monogram">${esc(f.name.charAt(0))}</div>
      <div class="fd-cat">${esc(f.cat)}</div>
      <h1>${esc(f.name)}</h1>
      <div class="fd-de">${esc(f.de)}</div>
      <div class="fd-years">${esc(f.years)}</div>
    </div>
    <div class="fd-section">
      <h3>生平与事迹</h3>
      <p>${esc(f.bio)}</p>
    </div>
    <div class="fd-section">
      <h3>相关历史章节</h3>
      <div class="fd-links">
        ${f.chapters.map(c=>`<button class="fd-link" data-goto-module="${c.m}">${esc(c.t)}<small>→</small></button>`).join("")}
      </div>
    </div>
    ${f.links&&f.links.length?`<div class="fd-section">
      <h3>相关人物</h3>
      <div class="fd-links">
        ${f.links.map(l=>`<button class="fd-link" data-goto-figure="${l.id}">${esc(l.name)}<small>→</small></button>`).join("")}
      </div>
    </div>`:""}`;
  box.querySelectorAll("[data-goto-module]").forEach(b=>b.onclick=()=>openModule(+b.getAttribute("data-goto-module")));
  box.querySelectorAll("[data-goto-figure]").forEach(b=>b.onclick=()=>openFigure(b.getAttribute("data-goto-figure")));
  showView("figure-detail");
}
$("#figure-back").addEventListener("click",()=>nav("figures"));

// ---------- 图表 ----------
function renderCharts(){
  const tabs=$("#chart-tabs");
  const panel=$("#chart-panel");
  function draw(){
    const tab=State.chartTab;
    if(tab==="dynasty")panel.innerHTML=renderDynasty();
    else if(tab==="hrr")panel.innerHTML=renderHRR();
    else if(tab==="rivalry")panel.innerHTML=renderRivalry();
    else if(tab==="maps")panel.innerHTML=renderMaps();
    bindCharts();
  }
  tabs.querySelectorAll(".ctab").forEach(b=>{
    b.onclick=()=>{
      State.chartTab=b.getAttribute("data-chart");
      tabs.querySelectorAll(".ctab").forEach(x=>x.classList.toggle("active",x===b));
      draw();
    };
  });
  draw();
}
function renderDynasty(){
  const d=CHARTS.dynasty;if(!d)return "";
  let y=30;const cards=[];
  d.eras.forEach(era=>{
    const nodeH=34,headerH=30;
    const h=headerH+era.nodes.length*nodeH+16;
    cards.push(`<div class="chart-card">
      <h3>${esc(era.label)}</h3>
      <div class="cc-sub">${esc(era.years)}</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px">
        ${era.nodes.map(n=>`
          <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:${n.emp?"#4a1c22":"var(--coal-3)"};border:1px solid ${n.emp?"var(--gold-2)":"var(--line-dark)"};border-radius:2px">
            <span style="font-family:var(--serif);font-size:14px;color:var(--ivory)">${esc(n.name)}</span>
            <span style="font-family:Georgia,serif;font-size:10px;color:var(--gold-2);margin-left:auto;white-space:nowrap">${esc(n.y)}</span>
          </div>`).join("")}
      </div>
    </div>`);
  });
  return cards.join("")+`<div class="chart-card"><div class="figcaption">${esc(d.note)}</div></div>`;
}
function renderHRR(){
  const d=CHARTS.hrr;if(!d)return "";
  return `<div class="chart-card">
    <h3>神圣罗马帝国政治结构</h3>
    <div class="cc-sub">${esc(d.center.sub)}</div>
    <div style="text-align:center;padding:26px;background:#4a1c22;border:1px solid var(--gold-2);margin-bottom:30px">
      <div style="font-family:var(--serif);font-size:20px;color:var(--gold-2);letter-spacing:2px">${esc(d.center.name)}</div>
      <div style="font-size:12px;color:var(--ivory-2);opacity:.7;margin-top:6px">${esc(d.center.sub)}</div>
    </div>
    <svg viewBox="0 0 600 60"><line class="hrr-conn" x1="300" y1="0" x2="300" y2="30"/><line class="hrr-conn" x1="80" y1="30" x2="520" y2="30"/><line class="hrr-conn" x1="80" y1="30" x2="80" y2="55"/><line class="hrr-conn" x1="230" y1="30" x2="230" y2="55"/><line class="hrr-conn" x1="380" y1="30" x2="380" y2="55"/><line class="hrr-conn" x1="520" y1="30" x2="520" y2="55"/></svg>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px">
      ${d.tiers.map(t=>`<div style="background:var(--coal-3);border:1px solid var(--gold);padding:18px">
        <div style="font-family:var(--serif);font-size:16px;color:var(--gold-2);margin-bottom:4px">${esc(t.title)}</div>
        <div style="font-size:11px;color:var(--ink-3);margin-bottom:12px">${esc(t.sub)}</div>
        ${t.items.map(i=>`<div style="font-size:12px;color:var(--ivory-2);padding:4px 0;border-bottom:1px solid var(--line-dark)">${esc(i)}</div>`).join("")}
      </div>`).join("")}
    </div>
    <div class="figcaption">${esc(d.note)}</div>
  </div>`;
}
function renderRivalry(){
  const d=CHARTS.rivalry;if(!d)return "";
  const n=d.events.length;
  const W=640,pad=30,step=(W-pad*2)/(n-1);
  let dots="",labels="";
  d.events.forEach((e,i)=>{
    const x=pad+i*step;
    const y=i%2===0?90:150;
    dots+=`<circle class="tl-dot" cx="${x}" cy="${y}" r="5" data-ev="${i}"/>`;
    labels+=`<text class="tl-year" x="${x}" y="${i%2===0?72:132}" text-anchor="middle">${esc(e.year)}</text>`;
    labels+=`<text class="tl-label" x="${x}" y="${i%2===0?112:172}" text-anchor="middle">${esc(e.title.length>7?e.title.slice(0,7)+"…":e.title)}</text>`;
  });
  return `<div class="chart-card">
    <h3>普鲁士与奥地利竞争时间轴</h3>
    <div class="cc-sub">点击节点查看事件详情 · 1740—1866</div>
    <svg viewBox="0 0 ${W} 220" style="margin-top:20px">
      <line class="tl-line" x1="${pad}" y1="120" x2="${W-pad}" y2="120" stroke-dasharray="4,4"/>
      ${dots}${labels}
    </svg>
    <div class="tl-info" id="tl-info">点击上方时间轴节点，查看普奥竞争中的关键事件。</div>
    <div class="figcaption">${esc(d.note)}</div>
  </div>`;
}
function renderMaps(){
  const maps=CHARTS.maps||[];
  const m=maps[0];
  let html=`<div class="chart-card">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">
      ${maps.map((x,i)=>`<button class="ctab map-tab ${i===0?"active":""}" data-map="${i}">${esc(x.title)}</button>`).join("")}
    </div>`;
  html+=`<h3 id="map-title">${esc(m.title)}</h3><div class="cc-sub" id="map-sub">${esc(m.sub)}</div>`;
  html+=`<div id="map-svg-wrap">${m.svg}</div>`;
  html+=`<div class="map-panel" id="map-panel"><h4>地图说明</h4><p>点击地图区域查看详细说明。地图为历史示意，非精确地理边界。</p></div>`;
  html+=`<div class="figcaption" id="map-legend">${esc(m.legend)}</div></div>`;
  return html;
}
function bindCharts(){
  if(State.chartTab==="rivalry"){
    const d=CHARTS.rivalry;
    document.querySelectorAll("[data-ev]").forEach(c=>{
      c.onclick=()=>{
        const e=d.events[+c.getAttribute("data-ev")];
        $("#tl-info").innerHTML=`<b>${esc(e.year)} · ${esc(e.title)}</b><br>${esc(e.desc)}`;
      };
    });
  }
  if(State.chartTab==="maps"){
    const maps=CHARTS.maps;
    function showMap(idx){
      const m=maps[idx];
      $("#map-title").textContent=m.title;
      $("#map-sub").textContent=m.sub;
      $("#map-svg-wrap").innerHTML=m.svg;
      $("#map-panel").innerHTML=`<h4>地图说明</h4><p>点击地图区域查看详细说明。地图为历史示意，非精确地理边界。</p>`;
      $("#map-legend").textContent=m.legend;
      document.querySelectorAll(".map-tab").forEach((b,i)=>b.classList.toggle("active",i===idx));
      bindMapRegions(m);
    }
    document.querySelectorAll(".map-tab").forEach(b=>b.onclick=()=>showMap(+b.getAttribute("data-map")));
    bindMapRegions(maps[0]);
  }
}
function bindMapRegions(m){
  document.querySelectorAll("#map-svg-wrap [data-info]").forEach(el=>{
    el.onclick=()=>{
      const key=el.getAttribute("data-info");
      const info=m.info[key];
      if(info)$("#map-panel").innerHTML=`<h4>${esc(info.t)}</h4><p>${esc(info.d)}</p>`;
    };
  });
}

// ---------- 搜索 ----------
function ensureSearchIndex(){
  if(State.searchLoaded)return Promise.resolve();
  return new Promise((resolve,reject)=>{
    let loaded=0;const total=MODULES.length;
    MODULES.forEach(m=>{
      loadModuleData(m.id).then(d=>{
        d.chapters.forEach(c=>{
          c.sections.forEach((s,si)=>{
            State.searchIndex.push({
              mid:m.id,ci:d.chapters.indexOf(c),si,
              module:m.title,chapter:c.title,heading:s.heading,body:s.body
            });
          });
        });
        loaded++;
        $("#search-status").textContent=`正在建立全文索引… ${loaded}/${total}`;
        if(loaded===total){State.searchLoaded=true;resolve();}
      }).catch(()=>{loaded++;if(loaded===total){State.searchLoaded=true;resolve();}});
    });
  });
}
function renderSearchIntro(){
  $("#search-results").innerHTML=`<div class="lib-empty">输入关键词，在全部 ${fmt(IDX.totalChars)} 字正文中检索。<br>首次搜索需加载并索引全部章节，请稍候。</div>`;
  $("#search-status").textContent="";
}
let searchTimer=null;
$("#search-input").addEventListener("input",e=>{
  const q=e.target.value.trim();
  clearTimeout(searchTimer);
  if(!q){renderSearchIntro();return;}
  searchTimer=setTimeout(()=>doSearch(q),300);
});
async function doSearch(q){
  $("#search-status").textContent="正在索引全文…";
  await ensureSearchIndex();
  $("#search-status").textContent="";
  const results=[];
  const lq=q.toLowerCase();
  for(const item of State.searchIndex){
    const hay=(item.heading+" "+item.body).toLowerCase();
    const idx=hay.indexOf(lq);
    if(idx>=0){
      let snippet=item.body.slice(Math.max(0,idx-60),idx+120).replace(/\n/g," ");
      snippet="…"+snippet+"…";
      results.push({item,snippet});
    }
    if(results.length>=60)break;
  }
  const box=$("#search-results");
  box.innerHTML=`<div style="font-size:12px;color:var(--ink-3);margin-bottom:14px">找到 ${results.length} 条结果${results.length>=60?"（仅显示前60条）":""}</div>`+
   results.map(r=>`
    <div class="sr-item" data-r="${r.item.mid}_${r.item.ci}_${r.item.si}">
      <div class="sr-path">${esc(r.item.module)} / ${esc(r.item.chapter)} / ${esc(r.item.heading)}</div>
      <div class="sr-title">${esc(r.item.heading)}</div>
      <div class="sr-snippet">${highlight(r.snippet,q)}</div>
    </div>`).join("")||`<div class="lib-empty">没有找到相关结果。试试其他关键词。</div>`;
  box.querySelectorAll(".sr-item").forEach(el=>{
    el.onclick=()=>{
      const [mid,ci,si]=el.getAttribute("data-r").split("_").map(Number);
      openChapter(mid,ci,si);
    };
  });
}
function highlight(text,q){
  const escaped=esc(text);
  const eq=esc(q).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  return escaped.replace(new RegExp(eq,"gi"),m=>`<mark>${m}</mark>`);
}

// ---------- 笔记弹层 ----------
function noteKey(t){
  return t.type==="chapter"?`c_${t.mid}_${t.ci}`:`t_${t.id}`;
}
function openNote(target){
  State.noteTarget=target;
  const key=noteKey(target);
  State.noteText=store.notes[key]||"";
  $("#note-context").textContent=target.title||"";
  $("#note-text").value=State.noteText;
  $("#note-modal").classList.add("show");
  setTimeout(()=>$("#note-text").focus(),100);
}
function closeNote(){$("#note-modal").classList.remove("show");}
$("#note-close").addEventListener("click",closeNote);
$("#note-modal").addEventListener("click",e=>{if(e.target.id==="note-modal")closeNote();});
$("#note-save").addEventListener("click",()=>{
  if(!State.noteTarget)return;
  const key=noteKey(State.noteTarget);
  const text=$("#note-text").value.trim();
  if(text)store.notes[key]=text;else delete store.notes[key];
  saveStore(store);closeNote();
});
$("#note-delete").addEventListener("click",()=>{
  if(!State.noteTarget)return;
  delete store.notes[noteKey(State.noteTarget)];
  saveStore(store);$("#note-text").value="";closeNote();
});

// ---------- 书架 ----------
function switchLibTab(tab){
  State.libTab=tab;
  $$(".libtab").forEach(b=>b.classList.toggle("active",b.getAttribute("data-lib")===tab));
  renderLibrary();
}
$$(".libtab").forEach(b=>b.onclick=()=>switchLibTab(b.getAttribute("data-lib")));
function renderLibrary(){
  const progCount=Object.keys(store.progress).length;
  $("#library-summary").innerHTML=`
    <div class="lsum-item"><b>${progCount}</b><span>已开始模块</span></div>
    <div class="lsum-item"><b>${store.bookmarks.length}</b><span>书签</span></div>
    <div class="lsum-item"><b>${Object.keys(store.notes).length}</b><span>笔记</span></div>`;
  const body=$("#library-body");
  if(State.libTab==="progress"){
    const items=Object.keys(store.progress).map(mid=>{
      const m=MODULES.find(x=>x.id===+mid);if(!m)return null;
      const total=m.chapters.reduce((s,c)=>s+c.sections.length,0);
      let read=0;m.chapters.forEach((c,ci)=>{const cp=store.progress[mid]["c"+ci];if(cp)c.sections.forEach((_,si)=>{if(cp["s"+si])read++;});});
      const pct=Math.round(read/total*100);
      const last=Math.max(...m.chapters.flatMap((c,ci)=>c.sections.map((_,si)=>store.progress[mid]["c"+ci]?.["s"+si]||0)));
      return {m,pct,last};
    }).filter(Boolean).sort((a,b)=>b.last-a.last);
    body.innerHTML=items.length?items.map(it=>`
      <div class="lib-card" data-lib-mod="${it.m.id}">
        <div class="lib-card-head"><span class="lib-path">${esc(it.m.era)} · ${esc(it.m.years)}</span><span class="lib-pct">${it.pct}%</span></div>
        <div class="lib-title">${esc(it.m.title)}</div>
        <div class="lib-progress-bar"><div style="width:${it.pct}%"></div></div>
        <div class="lib-date">共 ${it.m.chapters.length} 章 · ${fmt(it.m.charCount)}字</div>
      </div>`).join(""):`<div class="lib-empty">还没有阅读记录。<br>打开任意章节，进度会自动保存在这里。</div>`;
    body.querySelectorAll("[data-lib-mod]").forEach(c=>c.onclick=()=>nav("toc")||setTimeout(()=>openModule(+c.getAttribute("data-lib-mod")),100));
  }else if(State.libTab==="bookmarks"){
    body.innerHTML=store.bookmarks.length?store.bookmarks.slice().reverse().map(b=>{
      let title,path,fn;
      if(b.type==="chapter"){
        const m=MODULES.find(x=>x.id===b.mid);
        title=m?m.chapters[b.ci].title:"章节";
        path=m?m.title:"";
        fn=()=>openChapter(b.mid,b.ci);
      }else{
        const t=TOPICS.find(x=>x.id===b.id);
        title=t?t.title:"专题";path="专题研究";fn=()=>openTopic(b.id);
      }
      return `<div class="lib-card" data-bm="${esc(b.key)}">
        <div class="lib-card-head"><span class="lib-path">${esc(path)}</span><span style="color:var(--gold)">★</span></div>
        <div class="lib-title">${esc(title)}</div>
      </div>`;
    }).join(""):`<div class="lib-empty">还没有书签。<br>在阅读时点击页面顶部的星标即可收藏。</div>`;
    body.querySelectorAll("[data-bm]").forEach(c=>{
      c.onclick=()=>{
        const b=store.bookmarks.find(x=>x.key===c.getAttribute("data-bm"));
        if(b.type==="chapter")openChapter(b.mid,b.ci);else openTopic(b.id);
      };
    });
  }else{
    const keys=Object.keys(store.notes);
    body.innerHTML=keys.length?keys.map(k=>{
      let title,path,fn,target;
      if(k.startsWith("c_")){
        const [,mid,ci]=k.split("_");const m=MODULES.find(x=>x.id===+mid);
        title=m?m.chapters[+ci].title:"章节";path=m?m.title:"";
        target={type:"chapter",mid:+mid,ci:+ci,title};
        fn=()=>openChapter(+mid,+ci);
      }else{
        const id=k.slice(2);const t=TOPICS.find(x=>x.id===id);
        title=t?t.title:"专题";path="专题研究";
        target={type:"topic",id,title};
        fn=()=>openTopic(id);
      }
      return `<div class="lib-card" data-note="${esc(k)}">
        <div class="lib-card-head"><span class="lib-path">${esc(path)}</span><span style="color:var(--gold)">✎</span></div>
        <div class="lib-title">${esc(title)}</div>
        <div class="lib-note-text">${esc(store.notes[k])}</div>
        <div class="lib-date"><button class="note-edit" style="color:var(--gold);font-size:11px">编辑</button></div>
      </div>`;
    }).join(""):`<div class="lib-empty">还没有笔记。<br>在阅读时点击「为此章添加阅读笔记」即可记录。</div>`;
    body.querySelectorAll("[data-note]").forEach(c=>{
      const k=c.getAttribute("data-note");
      c.onclick=e=>{
        if(e.target.closest(".note-edit")){
          let target;
          if(k.startsWith("c_")){const [,mid,ci]=k.split("_");const m=MODULES.find(x=>x.id===+mid);target={type:"chapter",mid:+mid,ci:+ci,title:m?m.chapters[+ci].title:"章节"};}
          else{const id=k.slice(2);const t=TOPICS.find(x=>x.id===id);target={type:"topic",id,title:t?t.title:"专题"};}
          openNote(target);
        }else{
          if(k.startsWith("c_")){const [,mid,ci]=k.split("_");openChapter(+mid,+ci);}
          else openTopic(k.slice(2));
        }
      };
    });
  }
}
$("#clear-all-data").addEventListener("click",()=>{
  if(!confirm("确定要清除所有本地阅读数据吗？此操作不可撤销。"))return;
  store={progress:{},bookmarks:[],notes:{},settings:store.settings};
  saveStore(store);renderLibrary();updateGlobalProgress();
});

// ---------- 关于 ----------
function renderAbout(){
  $("#about-body").innerHTML=`
    <p class="accent">一座以阅读为本的德国历史数字图书馆。</p>
    <h3>项目定位</h3>
    <p>「德意志史诗」是一个个人数字图书馆，目标是提供一部可以长期阅读与研究的德国历史数字著作。核心原则是阅读为主、学习为辅——让连贯的历史叙事本身呈现历史的复杂与厚重，而非将历史拆解为考试知识点。</p>
    <h3>资料来源与编排说明</h3>
    <p>网站正文主体整理自《德国通史》（全六卷，邢来顺、吴友法主编，江苏人民出版社2019年版）。这部国家社科基金重大项目成果提供了从远古到2010年的系统叙述，本站将其59章正文按26个历史主题重新编排，各章保留原始小节结构，以便连续阅读。原文在整理过程中仅做了段落重组与标点规范，未改动史实内容。</p>
    <p>另两部参考书——《德意志道路：现代化进程研究》（李工真）与《德国史1918—2014》（Mary Fulbrook）——因所提供版本为扫描图片，未能获取可检索全文。本站的专题分析部分参考了这两部著作的研究视角与问题意识，独立撰写，不标注原书引文与页码，也不虚构任何原文观点。</p>
    <h3>内容原则</h3>
    <ul>
      <li>德国历史不从俾斯麦开始：本站以六分之一以上的篇幅讲述神圣罗马帝国、中世纪诸侯、宗教改革与普鲁士崛起。</li>
      <li>严格区分德意志地区、德意志民族、德意志帝国与现代德国这几个不同概念。</li>
      <li>对纳粹主义、战争责任与大屠杀采用严谨、客观的历史研究方式，直面历史创伤。</li>
      <li>学术争议呈现不同观点，不将复杂历史简化为单一结论。</li>
      <li>不含考试、答题、积分、勋章与打卡系统。</li>
    </ul>
    <h3>功能</h3>
    <p>完整目录、连续长篇正文、人物档案与关联、王朝世系图、帝国政体结构图、普奥竞争时间轴、统一战争与世界大战示意地图、全文搜索，以及保存在本机的阅读进度、书签与笔记。全部数据本地存储，无需联网。</p>
    <h3>技术说明</h3>
    <p>本站为纯静态网站，采用按需加载：26个模块各自独立，打开时才载入，保证首屏轻快。阅读进度、笔记与书签保存在浏览器的本地存储中，清除浏览器数据会一并清除。</p>
    <p style="margin-top:36px;color:var(--gold);font-family:Georgia,serif;letter-spacing:2px">DEUTSCHE GESCHICHTE · EINE DIGITALE BIBLIOTHEK</p>`;
}

// ---------- 初始化 ----------
renderHome();
updateGlobalProgress();
renderSearchIntro();

// 窗口滚动进度（首页等）
window.addEventListener("scroll",()=>{
  if(State.view==="reader"&&State._scrollHandler)return;
  const h=document.documentElement.scrollHeight-window.innerHeight;
  const p=h>0?window.scrollY/h*100:0;
  $("#global-progress").style.width=p+"%";
},{passive:true});

console.log("DG Library ready:",MODULES.length,"modules,",fmt(IDX.totalChars),"chars");
})();
