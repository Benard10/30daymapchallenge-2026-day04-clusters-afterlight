/* AFTERLIGHT. All displayed measurements come from the bundled source-derived atlas. */
'use strict';
const $ = id => document.getElementById(id);
const {valid, growth, spearman, temporalCorrelation} = AfterlightStatistics;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const state = {year:2004, iso3:'', playing:false, timer:null, atlas:null, map:null, ready:false, playbackRequest:0, rasterRequest:0};
const africaBounds = [[-27,-49],[65,39]];
const format = (v, digits=1) => valid(v) ? new Intl.NumberFormat('en',{maximumFractionDigits:digits}).format(v) : 'Unavailable';
function money(v){if(!valid(v))return 'Unavailable';if(v>=1e12)return '$'+format(v/1e12,2)+'tn';if(v>=1e9)return '$'+format(v/1e9,1)+'bn';return '$'+format(v/1e6,0)+'m';}
function row(country,year=state.year){return country.series.find(d=>d.year===year)||{};}
function selected(){return state.atlas.countries.find(c=>c.iso3===state.iso3);}
function continentalSeries(){return state.atlas.years.map(year=>{const rows=state.atlas.countries.map(c=>row(c,year));const sum=k=>{const values=rows.map(r=>r[k]).filter(valid);return values.length?values.reduce((a,b)=>a+b,0):null;};const area=rows.reduce((a,r)=>a+(valid(r.validArea)?r.validArea:0),0);return {year,gdp:sum('gdp'),totalRadiance:sum('totalRadiance'),meanRadiance:area?sum('totalRadiance')/area:null,litArea:sum('litArea'),clusterCount:sum('clusterCount'),concentration:null,gdpCountries:rows.filter(r=>valid(r.gdp)).length};});}
function balancedContinentalSeries(){
  const countries=state.atlas.countries.filter(c=>state.atlas.years.every(year=>{const r=row(c,year);return valid(r.gdp)&&valid(r.totalRadiance);}));
  state.balancedCount=countries.length;
  return state.atlas.years.map(year=>({year,gdp:countries.length?countries.reduce((sum,c)=>sum+row(c,year).gdp,0):null,totalRadiance:countries.length?countries.reduce((sum,c)=>sum+row(c,year).totalRadiance,0):null}));
}
function rankText(key,value){if(!valid(value))return 'Not ranked · insufficient observations';const entries=state.atlas.countries.map(c=>row(c)).filter(r=>valid(r[key]));return '#'+(1+entries.filter(r=>r[key]>value).length)+' of '+entries.length+' countries';}
function renderPanel(){const country=selected(),series=country?country.series:continentalSeries(),r=series.find(d=>d.year===state.year)||{},prev=series.find(d=>d.year===state.year-1)||{},delta=growth(r.gdp,prev.gdp);$('inspector').classList.toggle('has-selection',Boolean(country));$('place-name').textContent=country?country.name:'Africa';$('panel-year').textContent=state.year;$('radiance').textContent=format(r.meanRadiance,2);$('radiance-rank').textContent=country?rankText('meanRadiance',r.meanRadiance):'Area-weighted mean · available land observations';const baseline=series.find(d=>d.year===2004)||{},lightChange=country?growth(r.totalRadiance,baseline.totalRadiance):null,gdpChange=country?growth(r.gdp,baseline.gdp):null;const changeLabel=v=>(v>0?'+':'')+format(v,0)+'%';$('light-change').textContent=valid(lightChange)?changeLabel(lightChange):'\u2014';$('light-change-note').textContent=country?(valid(lightChange)?'since 2004':'2004 comparison unavailable'):'Choose a country to compare';$('gdp').textContent=money(r.gdp);$('gdp-change').textContent=country?(valid(gdpChange)?changeLabel(gdpChange)+' since 2004':'2004 comparison unavailable'):(r.gdpCountries||0)+' countries reporting';$('lit-area').textContent=valid(r.litArea)?format(r.litArea,0)+' km²':'Unavailable';$('clusters').textContent=valid(r.clusterCount)?format(r.clusterCount,0)+(country?' intersecting clusters':' country cluster intersections'):'Cluster count unavailable';$('concentration').textContent=valid(r.concentration)?format(r.concentration*100,1)+'%':'—';$('concentration-rank').textContent=country?rankText('concentration',r.concentration):'Select a country to measure concentration';const corr=country?temporalCorrelation(series,$('correlation-metric').value):{rho:null,n:0};$('correlation').textContent=valid(corr.rho)?(corr.rho>0?'+':'')+corr.rho.toFixed(2):'—';$('pairs').textContent=corr.n;$('correlation-note').textContent=country?(valid(corr.rho)?($('correlation-metric').value==='concentration'?'Concentration change (percentage points)':'Annual percentage change in '+($('correlation-metric').value==='meanRadiance'?'mean brightness':'total light'))+' vs GDP growth, 2004-2024. Association does not establish causation.':'At least 10 paired annual changes and variation in both series are needed.'):'Select a country to compare changes in light and GDP through time.';renderTrend(country?series:balancedContinentalSeries());renderRankings();renderScatter();$('map-caption').textContent=country?country.name+' · '+state.year+' · annual night-time lights':'The shape of a continent, written in light.';}
function renderTrend(series){const lightKey='totalRadiance',lightLabel='Total night lights';document.querySelector('.light-key').textContent=lightLabel;const svg=$('trend'),base=series.find(r=>valid(r.gdp)&&r.gdp>0&&valid(r[lightKey])&&r[lightKey]>0);if(!base){$('trend-baseline').textContent='START = 100';$('trend-reading').textContent='';$('trend-note').textContent='A comparison needs both light and GDP data for the same starting year.';svg.innerHTML='<text x="146" y="60" fill="#929dab" text-anchor="middle" font-size="10">Shared observations unavailable</text>';return;}$('trend-baseline').textContent=base.year+' = 100';$('trend-note').textContent='100 is the starting level. 200 means double.';const current=series.find(r=>r.year===state.year)||{},lc=growth(current.totalRadiance,base.totalRadiance),gc=growth(current.gdp,base.gdp),describe=(value,label)=>valid(value)?label+' '+(value>=0?'up ':'down ')+format(Math.abs(value),0)+'%':label+' unavailable';$('trend-reading').textContent=selected()?'In '+state.year+': '+describe(lc,'lights')+'; '+describe(gc,'GDP')+' since '+base.year+'.':'The same '+state.balancedCount+' countries are compared throughout.';const keys=[lightKey,'gdp'],indexed=keys.map(k=>series.map(r=>valid(r[k])?r[k]/base[k]*100:null)),values=indexed.flat().filter(valid),lo=Math.min(80,...values),hi=Math.max(120,...values),x=y=>28+(y-2004)/20*256,y=v=>100-(v-lo)/(hi-lo)*86;let html=[0,.5,1].map(t=>{const yy=14+t*86;return '<line x1="28" x2="284" y1="'+yy+'" y2="'+yy+'" stroke="#293342" stroke-dasharray="2 4"/>';}).join('');html+='<line x1="28" x2="284" y1="'+y(100)+'" y2="'+y(100)+'" stroke="#66707d" stroke-dasharray="3 4"/><text x="1" y="'+(y(100)+3)+'" fill="#aab5c4" font-size="8">100</text>';indexed.forEach((arr,j)=>{let path='',open=false;arr.forEach((v,i)=>{if(!valid(v)){open=false;return;}path+=(open?'L':'M')+x(series[i].year).toFixed(1)+','+y(v).toFixed(1);open=true;});html+='<path d="'+path+'" fill="none" stroke="'+(j?'#a69de6':'#f0c787')+'" stroke-width="2"/>';});html+='<line x1="'+x(state.year)+'" x2="'+x(state.year)+'" y1="8" y2="106" stroke="#c3ccd8" opacity=".45"/>';indexed.forEach((arr,j)=>{const i=series.findIndex(r=>r.year===state.year);if(valid(arr[i]))html+='<circle cx="'+x(state.year)+'" cy="'+y(arr[i])+'" r="3.5" fill="'+(j?'#a69de6':'#f0c787')+'" stroke="#101621" stroke-width="1.5"/>';});svg.innerHTML=html;svg.setAttribute('aria-label',lightLabel+' and GDP indexed to '+base.year+' = 100. Selected year '+state.year+'.');}
function renderRankings(){const key=$('rank-metric').value,entries=state.atlas.countries.map(c=>({c,r:row(c)})).filter(d=>valid(d.r[key])).sort((a,b)=>b.r[key]-a.r[key]);if($('rank-order').value==='ascending')entries.reverse();const list=$('rank-list');list.replaceChildren();entries.forEach(({c,r},i)=>{const li=document.createElement('li'),button=document.createElement('button'),n=document.createElement('span'),name=document.createElement('span'),value=document.createElement('strong');n.textContent=1+entries.filter(d=>d.r[key]>r[key]).length;name.textContent=c.name;value.textContent=key==='gdp'?money(r[key]):key==='concentration'?format(r[key]*100,1)+'%':format(r[key],2);button.append(n,name,value);button.addEventListener('click',()=>chooseCountry(c.iso3));if(c.iso3===state.iso3)button.style.color='var(--gold)';li.append(button);list.append(li);});}
function renderScatter(){
  const entries=state.atlas.countries.map(c=>({c,r:row(c)})).filter(d=>valid(d.r.gdp)&&d.r.gdp>0&&valid(d.r.totalRadiance)&&d.r.totalRadiance>0),svg=$('scatter');
  if(!entries.length){svg.replaceChildren();$('cross-correlation').textContent='Matched observations unavailable.';return;}
  const xx=entries.map(d=>Math.log10(d.r.gdp)),yy=entries.map(d=>Math.log10(d.r.totalRadiance)),xmin=Math.floor(Math.min(...xx)),xmax=Math.ceil(Math.max(...xx)),ymin=Math.floor(Math.min(...yy)),ymax=Math.ceil(Math.max(...yy)),x=v=>34+(v-xmin)/(xmax-xmin||1)*242,y=v=>135-(v-ymin)/(ymax-ymin||1)*115;
  svg.innerHTML='<path d="M34 20V135H276" fill="none" stroke="#45505e"/><text x="154" y="164" text-anchor="middle" fill="#929dab" font-size="9">GDP (US$, log scale)</text><text x="10" y="80" transform="rotate(-90 10 80)" text-anchor="middle" fill="#929dab" font-size="9">Total light (log scale)</text>';
  const ns='http://www.w3.org/2000/svg';
  for(let t=xmin;t<=xmax;t++){const text=document.createElementNS(ns,'text');text.setAttribute('x',x(t));text.setAttribute('y','149');text.setAttribute('text-anchor','middle');text.setAttribute('fill','#929dab');text.setAttribute('font-size','8');text.textContent='10^'+t;svg.append(text);}
  entries.forEach(({c,r},i)=>{const dot=document.createElementNS(ns,'circle'),title=document.createElementNS(ns,'title');dot.setAttribute('cx',x(xx[i]));dot.setAttribute('cy',y(yy[i]));dot.setAttribute('r',c.iso3===state.iso3?5:3);dot.setAttribute('fill',c.iso3===state.iso3?'#fff3d6':'#f0c787');dot.setAttribute('opacity',c.iso3===state.iso3?'1':'.65');dot.setAttribute('tabindex','0');dot.setAttribute('role','button');dot.setAttribute('data-country',c.iso3);dot.setAttribute('aria-label',c.name+', '+money(r.gdp)+' GDP, select country');title.textContent=c.name+' / '+money(r.gdp)+' / '+state.year;dot.append(title);dot.addEventListener('click',()=>chooseCountry(c.iso3));dot.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();chooseCountry(c.iso3);svg.querySelector('[data-country="'+c.iso3+'"]')?.focus();}});svg.append(dot);});
  const rho=spearman(entries.map(d=>d.r.gdp),entries.map(d=>d.r.totalRadiance));$('cross-correlation').textContent=state.year+' cross-country Spearman rho: '+(valid(rho)?rho.toFixed(2):'unavailable')+' / '+entries.length+' countries with positive observations. Country size affects both totals.';
}
function fitCountry(country){if(!state.ready)return;const b=country?.cameraBounds||country?.bounds;state.map.stop();state.map.fitBounds(b?[[b[0],b[1]],[b[2],b[3]]]:africaBounds,{padding:{top:75,bottom:190,left:30,right:30},maxZoom:7,duration:reducedMotion.matches?0:1900});}
function updatePlaybackControls(){
  const enabled=Boolean(state.ready&&state.iso3);
  for(const id of ['play','previous','next','year'])$(id).disabled=!enabled;
  $('review-country').textContent=state.iso3?selected().name+' / one country at a time':'Choose a country first';
}
function chooseCountry(iso3,{fly=true}={}){
  pause();$('inspector').scrollTop=0;
  state.iso3=state.atlas.countries.some(c=>c.iso3===iso3)?iso3:'';
  $('country').value=state.iso3;$('map-country').value=state.iso3;
  if(state.ready)state.map.setFilter('country-selected',['==',['get','iso3'],state.iso3]);
  renderPanel();updatePlaybackControls();
  $('playback-caption').textContent=state.iso3?selected().name+' selected. Press play to review 2004-2024.':'Choose a country to start its timeline.';
  if(fly)fitCountry(selected());
  if(state.iso3)setYear(2004,{manual:false});
}
function commitYear(year){
  state.year=year;
  $('year').value=year;$('year-output').textContent=year;$('panel-year').textContent=year;
  document.querySelector('.year-watermark').textContent=year;
  $('observation-tag').textContent=year<2012?'Earlier satellite records / includes estimates':year===2012?'Change from older to newer satellite records':'Newer satellite records';
  if(state.atlas){renderPanel();if(state.ready){const missing=state.atlas.countries.filter(c=>!valid(row(c,year).meanRadiance)).map(c=>c.iso3);state.map.setPaintProperty('country-land','fill-color',['case',['in',['get','iso3'],['literal',missing]],'#33303c','#17202a']);}}
}
async function setYear(year,{manual=true}={}){
  if(manual)pause();
  const target=Math.max(2004,Math.min(2024,+year));
  if(!state.ready){commitYear(target);return;}
  const request=++state.rasterRequest,path='data/lights/'+target+'.png';
  try{
    await new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=reject;img.src=path;});
    if(request!==state.rasterRequest)return;
    const b=state.atlas.rasterBounds||[-19,-36,56,38];
    state.map.getSource('nightlights').updateImage({url:path,coordinates:[[b[0],b[3]],[b[2],b[3]],[b[2],b[1]],[b[0],b[1]]]});
    commitYear(target);$('status').hidden=true;
  }catch{
    if(request===state.rasterRequest){pause();$('year').value=state.year;$('status').textContent='The '+target+' light layer could not load. Try another year or reload the atlas.';$('status').hidden=false;}
  }
}
function schedule(){
  clearTimeout(state.timer);
  if(!state.playing||!state.iso3)return;
  const session=state.playbackRequest;
  state.timer=setTimeout(async()=>{
    if(!state.playing||session!==state.playbackRequest)return;
    if(state.year>=2024){pause();$('playback-caption').textContent=selected().name+' / review complete. Press play to restart or choose another country.';return;}
    await setYear(state.year+1,{manual:false});
    if(state.playing&&session===state.playbackRequest)schedule();
  },Number($('speed').value));
}
async function play(){
  if(!state.atlas||!state.ready||!state.iso3)return;
  const session=++state.playbackRequest;
  if(state.year===2024)await setYear(2004,{manual:false});
  if(session!==state.playbackRequest||!state.iso3)return;
  state.playing=true;$('play').textContent='\u2161';$('play').setAttribute('aria-label','Pause country timeline');
  $('playback-caption').textContent='Following '+selected().name+' through time. The country stays selected.';
  schedule();
}
function pause(){
  state.playbackRequest++;state.rasterRequest++;state.playing=false;clearTimeout(state.timer);
  if(state.map)state.map.stop();
  $('play').textContent='\u25b6';$('play').setAttribute('aria-label','Play country timeline');
  $('playback-caption').textContent=state.iso3&&state.atlas?selected().name+' paused. Scrub the years or press play.':'Choose a country to start its timeline.';
}
function setupMap(geojson){if(!window.maplibregl)throw new Error('Map library unavailable. Check your internet connection and reload.');const map=state.map=new maplibregl.Map({container:'map',style:{version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#080e18'}}]},center:[19,0],zoom:2,attributionControl:false,maxZoom:9,minZoom:1,renderWorldCopies:false});map.addControl(new maplibregl.AttributionControl({compact:true,customAttribution:'Cheng et al. 2026 · Natural Earth · World Bank'}));map.on('load',()=>{map.addSource('countries',{type:'geojson',data:geojson});map.addLayer({id:'country-land',type:'fill',source:'countries',paint:{'fill-color':'#17202a','fill-opacity':.77}});const b=state.atlas.rasterBounds||[-19,-36,56,38];map.addSource('nightlights',{type:'image',url:'data/lights/'+state.year+'.png',coordinates:[[b[0],b[3]],[b[2],b[3]],[b[2],b[1]],[b[0],b[1]]]});map.addLayer({id:'lights',type:'raster',source:'nightlights',paint:{'raster-opacity':1,'raster-fade-duration':reducedMotion.matches?0:350,'raster-resampling':'linear'}});map.addLayer({id:'country-borders',type:'line',source:'countries',paint:{'line-color':'#748395','line-width':.6,'line-opacity':.38}});map.addLayer({id:'country-selected',type:'line',source:'countries',filter:['==',['get','iso3'],''],paint:{'line-color':'#f0c787','line-width':1.5,'line-opacity':.85}});state.ready=true;fitCountry(null);$('status').hidden=true;updatePlaybackControls();map.on('click','country-land',e=>{const iso=e.features[0]?.properties.iso3;if(state.atlas.countries.some(c=>c.iso3===iso))chooseCountry(iso);});const popup=new maplibregl.Popup({closeButton:false,closeOnClick:false,offset:12});map.on('mousemove','country-land',e=>{map.getCanvas().style.cursor='pointer';const iso=e.features[0]?.properties.iso3,c=state.atlas.countries.find(c=>c.iso3===iso),node=document.createElement('div');node.className='map-tooltip';const title=document.createElement('strong'),detail=document.createElement('span');title.textContent=c?c.name:(e.features[0]?.properties.name||'Context boundary');detail.textContent=c?state.year+' / '+format(row(c).meanRadiance,2)+' nW/cm?/sr':'Context only / not ranked';node.append(title,detail);popup.setLngLat(e.lngLat).setDOMContent(node).addTo(map);});map.on('mouseleave','country-land',()=>{map.getCanvas().style.cursor='';popup.remove();});});map.on('dragstart',e=>{if(e.originalEvent)pause();});map.on('zoomstart',e=>{if(e.originalEvent)pause();});map.on('error',e=>{console.warn('Map resource:',e.error?.message);});}
async function init(){try{const responses=await Promise.all([fetch('data/atlas.json'),fetch('data/countries.geojson')]);if(responses.some(r=>!r.ok))throw new Error('Atlas data could not load. Serve this folder over HTTP and reload.');const [atlas,geo]=await Promise.all(responses.map(r=>r.json()));state.atlas=atlas;atlas.countries.sort((a,b)=>a.name.localeCompare(b.name));for(const c of atlas.countries){const option=document.createElement('option');option.value=c.iso3;option.textContent=c.name;$('country').append(option);$('map-country').append(option.cloneNode(true));}$('country').disabled=false;$('map-country').disabled=false;const prepared=atlas.metadata?.preparedAt?new Date(atlas.metadata.preparedAt).toLocaleDateString('en',{day:'numeric',month:'short',year:'numeric'}):null;$('data-version').textContent='Covers 2004-2024 / '+atlas.countries.length+' countries'+(prepared?' / Prepared '+prepared:'. Source details are linked above.');setYear(2004,{manual:false});setupMap(geo);for(const year of atlas.years){const img=new Image();img.src='data/lights/'+year+'.png';}}catch(error){$('status').textContent=error.message;$('status').hidden=false;console.error(error);}}
$('country').addEventListener('change',e=>chooseCountry(e.target.value));$('map-country').addEventListener('change',e=>chooseCountry(e.target.value));$('year').addEventListener('input',e=>setYear(e.target.value));$('previous').addEventListener('click',()=>setYear(state.year-1));$('next').addEventListener('click',()=>setYear(state.year+1));$('play').addEventListener('click',()=>state.playing?pause():play());$('speed').addEventListener('change',schedule);$('overview').addEventListener('click',()=>chooseCountry(''));$('zoom-in').addEventListener('click',()=>{pause();state.map?.zoomIn({duration:reducedMotion.matches?0:300});});$('zoom-out').addEventListener('click',()=>{pause();state.map?.zoomOut({duration:reducedMotion.matches?0:300});});$('correlation-metric').addEventListener('change',()=>state.atlas&&renderPanel());$('rank-metric').addEventListener('change',()=>state.atlas&&renderRankings());$('rank-order').addEventListener('change',()=>state.atlas&&renderRankings());document.addEventListener('afterlight:dialog-open',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});reducedMotion.addEventListener('change',pause);init();
