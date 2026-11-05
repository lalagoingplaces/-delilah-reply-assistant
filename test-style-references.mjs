import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {styleProfiles,selectReferences,referenceAudit,catalog} from './references.mjs';
process.env.OPENAI_API_KEY='mock-only-test';
const {generate,polishDraft}=await import('./server.mjs');
const raw=JSON.parse(readFileSync(new URL('./references.json',import.meta.url)));
test('all seven manual styles receive only their own guide with valid document provenance',()=>{
 for(const style of Object.keys(styleProfiles)){
  const selected=selectReferences({personality:style,message:'humor small talk confidence domination'});
  assert.deepEqual(selected.map(r=>r.id),['voice','style-'+style]);
  for(const o of selected[1].origins){const source=raw.find(s=>s.id===o.sourceId);assert.equal(o.sha256,source.sha256);assert(source.chunks.some(c=>c.page===o.page));}
  assert(referenceAudit(selected,['voice','style-'+style],style).sources.every(s=>s.applicable));
 }
 assert.deepEqual(catalog().find(s=>s.id==='05').styles,['playful']);
 for(const id of ['01','02','06','09','10','11','12','13','14','15','16'])assert.equal(catalog().find(s=>s.id===id).automaticRetrieval,false);
});
test('Smart Select cannot claim guidance from a different style; safety overrides all style packs',()=>{
 const selected=selectReferences({personality:'spicy',smartSelect:true});
 assert.equal(selected.filter(s=>s.kind==='style-guidance').length,7);
 assert.throws(()=>referenceAudit(selected,['style-playful'],'sweet'),/different style/);
 const audit=referenceAudit(selected,['voice','style-sweet'],'sweet');
 assert.equal(audit.sources.find(s=>s.id==='style-playful').applicable,false);
 for(const opts of [{ageConcern:true},{direction:'boundaries'}])assert.deepEqual(selectReferences({...opts,personality:'spicy',smartSelect:true}).map(s=>s.id),['voice','style-safe']);
});
test('private assignments filter manual retrieval and constrain Smart Select reports',()=>{
 const ref={id:'my-sweet',kind:'voice',enabled:true,title:'Warm voice',text:'My own warm wording',styles:['sweet']};
 assert(!selectReferences({personality:'spicy',privateReferences:[ref]}).some(s=>s.id==='private-my-sweet'));
 assert(selectReferences({personality:'sweet',privateReferences:[ref]}).some(s=>s.id==='private-my-sweet'));
 const smart=selectReferences({smartSelect:true,privateReferences:[ref]});
 assert.throws(()=>referenceAudit(smart,['private-my-sweet'],'spicy'),/different style/);
 assert.throws(()=>selectReferences({privateReferences:[{...ref,styles:['invalid']}]}),/Invalid/);
 assert(selectReferences({personality:'natural',privateReferences:[{...ref,styles:[]}]}).some(s=>s.id==='private-my-sweet'));
});
test('real request wiring preserves styles, revisions, buyer isolation and removes laughter outside humor',async()=>{
 const saved=globalThis.fetch;let payload;let mood='intimate';let chosen='spicy';
 globalThis.fetch=async(url,options)=>{payload=JSON.parse(options.body);return {ok:true,json:async()=>({output:[{content:[{type:'output_text',text:JSON.stringify({conversation_mood:mood,selected_style:chosen,context:'Synthetic test',suggestions:[{label:'One',reply:'I like talking with you lol',why:''},{label:'Two',reply:'haha I wanted to hear from you',why:''}],used_reference_ids:['voice','style-'+chosen]})}]}]})};};
 try{
  for(const m of ['intimate','serious','neutral','boundary','humorous']){
   mood=m;const result=await generate({message:'I wanted a quiet moment with you',personality:'spicy',smartSelect:false,buyerUsername:'BuyerOne',history:[{kind:'incoming',content:'BuyerOne only'}],screenshotRequest:true,styleConfirmed:false,revisionInstruction:'More personal'});
   assert.equal(result.suggestions.length,2);
   for(const r of result.suggestions)assert.equal(/\b(lol|haha)\b/i.test(r.reply),m==='humorous');
   const input=JSON.parse(payload.input[0].content);
   assert.deepEqual(input.referencePassages.map(r=>r.id),['voice','style-spicy']);
   assert.deepEqual(input.referencePassages[1].styles,['spicy']);assert.equal(input.history[0].content,'BuyerOne only');
   assert.equal(input.revisionInstruction,'More personal');assert.equal(payload.store,false);
   assert(payload.instructions.includes('ONLY when responding to something actually funny'));
   assert(payload.instructions.includes('Keep commas sparse'));
   assert(payload.text.format.schema.required.includes('conversation_mood'));
  }
  chosen='sweet';mood='intimate';const polished=await polishDraft({draft:'I like having this time with you'});
  assert(polished.suggestions.every(r=>! /\b(lol|haha)\b/i.test(r.reply)));
  assert(JSON.parse(payload.input[0].content).referencePassages.some(r=>r.id==='style-sweet'));
 }finally{globalThis.fetch=saved;}
});
