import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sources=JSON.parse(readFileSync(new URL('./references.json',import.meta.url),'utf8'));
const voice=readFileSync(new URL('./voice.txt',import.meta.url),'utf8');
const hash=s=>createHash('sha256').update(s).digest('hex');
export const styleProfiles={
 flirty:{description:'Warm personal interest with light non-graphic attraction. Answer what they said; teasing is optional, never a substitute for responding.',origins:[['08',3,'Notice the specific thing someone said and respond with genuine interest.']],guidance:'Make the connection specific to this exchange. Do not turn a sincere moment into a challenge or a joke.'},
 naughty:{description:'Close, confident, suggestive but non-graphic. More personal than Flirty; no automatic jokes or coy evasions.',origins:[['04',3,'Confidence comes from comfort with yourself rather than performing for approval.'],['08',6,'Read the other person and respect their comfort level instead of pushing.']],guidance:'Match welcomed intimacy with sincere attention and simple direct wording. Do not describe sexual acts or invent physical experiences.'},
 spicy:{description:'Bolder, more direct non-graphic attraction. Sharper banter only when welcomed; profanity is optional rather than required.',origins:[['04',3,'Self-assurance does not require approval seeking or a performance.'],['08',6,'Encouraging connection must remain balanced with the other person’s comfort and boundaries.']],guidance:'Distinguish confident intimacy from comedy. Do not replace a meaningful reply with a stock dare, sales pitch, or escalating demand.'},
 playful:{description:'A small witty observation or friendly teasing that responds to something actually funny in the exchange.',origins:[['05',3,'Humor can come from a small unexpected turn in an ordinary observation.']],guidance:'Use the current chat as the setup instead of borrowing pickup lines or stand-up routines. If the moment is sincere or intimate, skip the joke.'},
 sweet:{description:'Kind, attentive and quietly affectionate. Acknowledge what matters to this buyer without exaggerated praise or fake closeness.',origins:[['07',6,'Pay attention and respond thoughtfully so the other person feels heard.'],['08',4,'Notice the emotional meaning of what someone shares.']],guidance:'Prefer one specific caring response over generic reassurance. Do not invent pet names, personal feelings, or relationship commitments.'},
 confident:{description:'Calm, direct and self-assured. Answer first and state limits clearly without apologizing excessively or turning bossy.',origins:[['04',3,'Confidence can be grounded in self-acceptance rather than external validation.'],['08',6,'Respect comfort levels and recognize when to pull back.']],guidance:'Avoid theatrical dominance, pressure, or humiliation. A boundary is complete without an added flirt or question.'},
 natural:{description:'Everyday Delilah. Plain, relaxed, matter-of-fact wording that directly fits the latest message.',origins:[['07',6,'Show genuine interest by attending to what the person actually says.'],['08',3,'Listen and follow the subject they raised rather than cycling through empty small talk.']],guidance:'A short answer can stand alone. Ask a follow-up only when it adds something; do not interview the buyer.'}
};
const calibrationExamples={
 natural:['Just finished a 12 hour shift and the dog stole my couch spot','After 12 hours I think you earned that spot'],
 playful:['I put my coffee in the fridge and tried to unlock the door with my TV remote','You might need a second cup before you try leaving the house'],
 sweet:['My dad is in the hospital and I need someone to talk to','I’m sorry to hear that. You can talk to me'],
 confident:['Can we meet this weekend? (Creator has already said no meetups)','I don’t do meetups. We can keep talking here'],
 flirty:['I like that you say exactly what you think','No point making you guess'],
 naughty:['I like having your attention tonight (Creator already said she enjoys their conversation)','I like having a little time with you too'],
 spicy:['I like knowing you enjoy talking to me (Creator has confirmed she does)','Good because I’m enjoying this too']
};
const origin=(id,page)=>{const s=sources.find(s=>s.id===id);return {sourceId:id,title:s.title,page,sha256:s.sha256};};
export function catalog(){return [{id:'voice',title:'Delilah — Authentic Voice & Personality Reference',sha256:hash(voice),passages:1,automaticRetrieval:true,styles:Object.keys(styleProfiles),scope:'Baseline voice, always supplied'},...sources.map(s=>{const styles=Object.keys(styleProfiles).filter(k=>styleProfiles[k].origins.some(([id])=>id===s.id));return {id:s.id,title:s.title,filename:s.filename,sha256:s.sha256,passages:s.chunks.length,automaticRetrieval:styles.length>0,styles,scope:styles.length?'Reviewed communication principles only; original PDF passages are not automatically sent':'Indexed only; excluded from automatic chat retrieval'};})];}
export function selectReferences({message='',excerpt='',direction='stay',ageConcern=false,personality='flirty',smartSelect=false,privateReferences=[]}={}){
 const selected=[{id:'voice',sourceId:'voice',title:'Delilah — Authentic Voice & Personality Reference',page:null,sha256:hash(voice),reason:'Primary voice guide, always supplied',kind:'voice',styles:Object.keys(styleProfiles),text:voice}];
 const styles=Object.keys(styleProfiles);
 const manual=styles.includes(personality)?personality:'flirty';
 if(ageConcern||direction==='boundaries'){
  const text='Use calm, neutral, clear wording. State the relevant limit or acknowledge the concern. No flirtation, sexual suggestion, teasing, laughter fillers, or pressure. Respect the supplied boundary without inventing one.';
  selected.push({id:'style-safe',sourceId:'voice',title:'Neutral and boundary guidance',page:null,sha256:hash(text),kind:'style-guidance',styles,reason:ageConcern?'Age or consent concern overrides flirting':'Boundary direction overrides flirting',text,origins:[origin('08',6)]});
 }else for(const style of smartSelect?styles:[manual]){
  const profile=styleProfiles[style];
  const example=calibrationExamples[style];
  const text=[profile.description,profile.guidance,'Editorial tone example, invented for calibration rather than an authentic quote. Never reuse its facts unless present in the actual chat. Buyer example: '+example[0]+'; concise reply example: '+example[1], 'Reviewed source principles (paraphrases, not source quotations):',...profile.origins.map(([id,page,summary])=>`[${id}, page ${page}] ${summary}`)].join('\n');
  selected.push({id:'style-'+style,sourceId:'style-'+style,title:style[0].toUpperCase()+style.slice(1)+' — reviewed reference guidance',page:null,sha256:hash(text),kind:'style-guidance',styles:[style],origins:profile.origins.map(([id,page])=>origin(id,page)),reason:smartSelect?'Candidate for Smart Select; use only if selected_style is '+style:'Assigned to selected '+style+' style',text});
 }
 if(!Array.isArray(privateReferences)||privateReferences.length>20)throw Object.assign(new Error('Invalid private reference collection.'),{code:400});
 const ids=new Set();let alwaysPrivate=0;const ranked=[];
 const terms=s=>[...new Set((s.toLowerCase().match(/[a-z]{4,}/g)||[]).filter(t=>!['that','this','with','your','have','what','from','they','just','like','buyer','message','conversation'].includes(t)))];
 const query=terms(message+' '+excerpt);
 for(const r of privateReferences){
  if(!r||typeof r.id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(r.id)||ids.has(r.id)||typeof r.title!=='string'||r.title.length>100||typeof r.text!=='string'||r.text.length>12000||!['voice','guidance','offerings'].includes(r.kind)||r.styles!==undefined&&(!Array.isArray(r.styles)||r.styles.length>7||r.styles.some(s=>!styles.includes(s))))throw Object.assign(new Error('Invalid private reference.'),{code:400});
  ids.add(r.id);if(r.enabled!==true)continue;
  const assigned=r.styles?.length?r.styles:styles;
  if(!smartSelect&&!assigned.includes(manual))continue;
  const base={sourceId:'private-'+r.id,title:r.title,page:null,sha256:hash(r.text),kind:'private-'+r.kind,styles:assigned};
  if(r.kind==='voice'||r.kind==='offerings'){
   if(++alwaysPrivate>4)throw Object.assign(new Error('Enable at most four voice/offerings references; use guidance for other documents.'),{code:400});
   selected.push({...base,id:'private-'+r.id,reason:'Enabled private '+r.kind+' reference; style scope: '+assigned.join(', '),text:r.text.slice(0,r.kind==='voice'?3000:2500)});
  }else for(let off=0;off<r.text.length;off+=850){const text=r.text.slice(off,off+1100),words=new Set(terms(text)),matches=query.filter(t=>words.has(t));if(matches.length>=2)ranked.push({...base,id:'private-'+r.id+'-'+off,reason:'Matched private guidance: '+matches.join(', '),text,score:matches.length});}
 }
 const seen=new Set();ranked.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
 for(const r of ranked){if(seen.has(r.sourceId))continue;seen.add(r.sourceId);selected.push(r);if(seen.size>=2)break;}
 return selected;
}
export function referenceAudit(selected,reportedIds,selectedStyle){
 if(!Array.isArray(reportedIds)||reportedIds.some(id=>!selected.some(s=>s.id===id)))throw new Error('AI reported a reference that was not supplied. Retry.');
 if(selectedStyle&&reportedIds.some(id=>!selected.find(s=>s.id===id).styles.includes(selectedStyle)))throw new Error('AI reported guidance for a different style. Retry.');
 return {method:'Explicit style assignments with reviewed source summaries; voice always supplied',selectedStyle,generatedAt:new Date().toISOString(),notice:'Supplied means included in the request. AI-reported use is self-reported, not proof of influence. Reviewed summaries are not full source documents.',sources:selected.map(s=>({...s,applicable:!selectedStyle||s.styles.includes(selectedStyle),reportedUsed:reportedIds.includes(s.id)}))};
}
