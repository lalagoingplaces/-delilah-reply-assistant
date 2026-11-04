import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sources=JSON.parse(readFileSync(new URL('./references.json',import.meta.url),'utf8'));
const voice=readFileSync(new URL('./voice.txt',import.meta.url),'utf8');
const hash=s=>createHash('sha256').update(s).digest('hex');
const stop=new Set('the and you your yours they their that this with have what how are was were for from just like really can could would should will been but not its dont does did she her his him our out about into then than when where why all some very want know said message buyer conversation screenshot latest'.split(' '));
const terms=s=>[...new Set((s.toLowerCase().match(/[a-z]{3,}/g)||[]).filter(t=>!stop.has(t)))];
export function catalog(){return [{id:'voice',title:'Delilah — Authentic Voice & Personality Reference',sha256:hash(voice),passages:1},...sources.map(s=>({id:s.id,title:s.title,filename:s.filename,sha256:s.sha256,passages:s.chunks.length,automaticRetrieval:['03','04','05','07','08','14'].includes(s.id),scope:['03','04','05','07','08','14'].includes(s.id)?'Communication, humor, confidence guidance':'Indexed; excluded from automatic chat retrieval in this revision'}))];}
export function selectReferences({message='',excerpt='',direction='stay',ageConcern=false,privateReferences=[]}={}){
 const selected=[{id:'voice',sourceId:'voice',title:'Delilah — Authentic Voice & Personality Reference',page:null,sha256:hash(voice),reason:'Primary voice guide, always supplied',text:voice}];
 const q=terms(message+' '+excerpt);const ranked=[];
 if(!Array.isArray(privateReferences)||privateReferences.length>20)throw Object.assign(new Error('Invalid private reference collection.'),{code:400});
 const ids=new Set();
 for(const r of privateReferences){
  if(!r||typeof r.id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(r.id)||ids.has(r.id)||typeof r.title!=='string'||r.title.length>100||typeof r.text!=='string'||r.text.length>12000||!['voice','guidance','offerings'].includes(r.kind))throw Object.assign(new Error('Invalid private reference.'),{code:400});
  ids.add(r.id);if(r.enabled!==true)continue;
  if(r.kind==='voice'||r.kind==='offerings'){
   const text=r.text.slice(0,r.kind==='voice'?3000:2500);
   selected.push({id:'private-'+r.id,sourceId:'private-'+r.id,title:r.title,page:null,sha256:hash(r.text),reason:'Private '+r.kind+' reference, supplied while enabled (first '+text.length+' characters)',text});
  }else{
   for(let off=0;off<r.text.length;off+=850){const text=r.text.slice(off,off+1100),words=new Set(terms(text)),matches=q.filter(t=>words.has(t));if(matches.length>=2)ranked.push({score:matches.length+1,source:{id:'private-'+r.id,title:r.title,sha256:hash(r.text)},chunk:{id:'private-'+r.id+'-'+off,page:null,text},matches});}
  }
 }
 // Bound always-supplied private context; reject excess rather than silently omit it.
 if(selected.length>5)throw Object.assign(new Error('Enable at most four voice/offerings references; use guidance for other documents.'),{code:400});
 const baselineCount=selected.length;

 for(const source of sources){
  // Sexual-technique material is not useful context for ordinary chat, boundaries, or age concerns.
  const communication=['05','07','08'].includes(source.id);
  const confidence=['03','04','14'].includes(source.id);
  if(!communication&&!confidence)continue;
  if(ageConcern&&!communication)continue;
  for(const chunk of source.chunks){
   const words=new Set(terms(chunk.text));let matches=q.filter(t=>words.has(t));
   let score=matches.length;
   if(direction==='boundaries'&&confidence&&/boundar|consent|respect/i.test(chunk.text))score+=3;
   if(matches.length<2&&score<3)continue;
   ranked.push({score,source,chunk,matches});
  }
 }
 ranked.sort((a,b)=>b.score-a.score||a.chunk.id.localeCompare(b.chunk.id));
 const seen=new Set();
 for(const r of ranked){if(seen.has(r.source.id))continue;seen.add(r.source.id);
  selected.push({id:r.chunk.id,sourceId:r.source.id,title:r.source.title,page:r.chunk.page,sha256:r.source.sha256,reason:'Matched current chat: '+r.matches.join(', ')+(direction==='boundaries'?' · boundary context':''),text:r.chunk.text});
  if(selected.length===baselineCount+2)break;
 }
 return selected;
}
export function referenceAudit(selected,reportedIds){
 if(!Array.isArray(reportedIds)||reportedIds.some(id=>!selected.some(s=>s.id===id)))throw new Error('AI reported a reference that was not supplied. Retry.');
 return {method:'Local lexical passage retrieval; voice guide always supplied',generatedAt:new Date().toISOString(),notice:'Supplied means included in the request. AI-reported use is self-reported, not proof of influence.',sources:selected.map(s=>({...s,reportedUsed:reportedIds.includes(s.id)}))};
}
