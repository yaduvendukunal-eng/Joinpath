const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const exp = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/prototype/model.ts','utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports: exp, structuredClone, crypto: globalThis.crypto, Date, URL });
const {seed, update, actors, matching, permitted, signals} = exp;
const actor = id => actors.find(a=>a.id===id);
const now='2026-10-30T12:00:00.000Z';
const fresh=()=>seed(Date.parse(now));
const run=(s,a,c,at=now)=>update(s,actor(a),c,at);
test('college assessment changes explainable matching without automatically shortlisting',()=>{
 let s=fresh(); assert.equal(matching(s.students[0],s.vacancies[0]).percent,67);
 s=run(s,'u1',{type:'skill',studentId:'s1',name:'SQL',level:1,assessed:'2026-10-29',evidence:'Reviewed lab exercise'});
 assert.equal(matching(s.students[0],s.vacancies[0]).percent,100);
 assert.equal(s.vacancies[0].shortlisted.length,0);
 assert.throws(()=>run(s,'c1',{type:'skill',studentId:'s1',name:'SQL',level:3,assessed:'2026-10-29',evidence:'Invalid assessor'}));
});
test('withdrawn skill permissions block shortlist and college assessment',()=>{
 let s=fresh();s=run(s,'s1',{type:'consent',recipient:'c1',categories:['profile','joining']});
 assert.equal(permitted(s.students[0],actor('c1'),'skills'),false);
 assert.throws(()=>run(s,'c1',{type:'shortlist',vacancyId:'v1',studentId:'s1'}));
 s=run(s,'s1',{type:'consent',recipient:'u1',categories:[]});
 assert.throws(()=>run(s,'u1',{type:'skill',studentId:'s1',name:'SQL',level:2,assessed:'2026-10-29',evidence:'Lab'}));
});
test('vacancy -> shortlist -> offer -> generated learning plan keeps offers independent',()=>{
 let s=run(fresh(),'c1',{type:'vacancy',title:'Data Associate',requirements:'SQL:2, Python:2'});
 const v=s.vacancies.at(-1);
 s=run(s,'c1',{type:'shortlist',vacancyId:v.id,studentId:'s1'});
 s=run(s,'c1',{type:'issue',vacancyId:v.id,studentId:'s1',date:'2026-11-15'});
 const o=s.offers.at(-1);s=run(s,'c1',{type:'plan',offerId:o.id});
 assert.equal(s.tasks.filter(t=>t.offerId===o.id).length,2);
 s=run(s,'s1',{type:'respond',offerId:o.id,response:'Accepted'});
 assert.equal(s.offers.find(x=>x.id==='o2').response,'Pending');
 assert.throws(()=>run(s,'c2',{type:'date',offerId:o.id,date:'2026-12-01',reason:'Wrong company'}));
});
test('deferral resets confirmation and retains history; requests enforce cooldown',()=>{
 let s=run(fresh(),'s1',{type:'respond',offerId:'o1',response:'Accepted'});
 s=run(s,'c1',{type:'date',offerId:'o1',date:'2026-12-02',reason:'Batch changed'});
 assert.equal(s.offers[0].response,'Pending');assert.match(s.offers[0].history.at(-1).text,/Batch changed/);
 s=run(s,'c1',{type:'request',offerId:'o1'});
 assert.throws(()=>run(s,'c1',{type:'request',offerId:'o1'}),/24 hours/);
});
test('two aged requests trigger a signal; consent withdrawal is not risk evidence',()=>{
 let s=fresh();assert.ok(signals(s.students[0],s.offers,actor('c1'),Date.parse(now)).some(x=>x.includes('2 confirmation')));
 s=run(s,'s1',{type:'consent',recipient:'c1',categories:[]});
 assert.equal(signals(s.students[0],s.offers,actor('c1'),Date.parse(now)).length,0);
});
test('checkboxes never verify learning; evidence review and resubmission are distinct',()=>{
 let s=run(fresh(),'s1',{type:'task',taskId:'t1',checked:true});assert.equal(s.tasks[0].state,'Not submitted');
 s=run(s,'s1',{type:'submit',taskId:'t1',evidence:'https://example.com/project'});
 assert.throws(()=>run(s,'c2',{type:'review',taskId:'t1',result:'Verified',feedback:'Wrong employer'}));
 s=run(s,'c1',{type:'review',taskId:'t1',result:'Needs revision',feedback:'Add validation'});
 s=run(s,'s1',{type:'submit',taskId:'t1',evidence:'https://example.com/project-v2'});
 s=run(s,'c1',{type:'review',taskId:'t1',result:'Verified',feedback:'Criteria satisfied'});
 s=run(s,'s1',{type:'task',taskId:'t1',checked:false});assert.equal(s.tasks[0].state,'Verified');
});
test('college support case supports company reply and college resolution',()=>{
 let s=run(fresh(),'u1',{type:'case',offerId:'o1',subject:'Date clarification',message:'Please confirm arrangements.'});
 const id=s.cases[0].id;
 assert.throws(()=>run(s,'c2',{type:'reply',caseId:id,message:'Unrelated company'}));
 s=run(s,'c1',{type:'reply',caseId:id,message:'Updated schedule is correct.'});
 s=run(s,'u1',{type:'closeCase',caseId:id});assert.equal(s.cases[0].closed,true);
});
test('joining verification requires accepted intent and actual nonfuture attendance',()=>{
 let s=fresh();assert.throws(()=>run(s,'c1',{type:'joined',offerId:'o1',date:'2026-10-30',reason:'Attendance'}));
 s=run(s,'c1',{type:'joined',offerId:'o3',date:'2026-10-30',reason:'Day-one attendance register DEMO-12'});
 assert.equal(s.offers.find(o=>o.id==='o3').status,'Joined');
 assert.throws(()=>run(fresh(),'c1',{type:'joined',offerId:'o3',date:'2026-12-01',reason:'Future attendance'}));
});
test('invalid dates, future assessments, duplicate requirements and unsafe evidence are rejected',()=>{
 assert.throws(()=>run(fresh(),'c1',{type:'date',offerId:'o1',date:'2026-02-31',reason:'Invalid'}));
 assert.throws(()=>run(fresh(),'u1',{type:'skill',studentId:'s1',name:'SQL',level:2,assessed:'2027-01-01',evidence:'Future'}));
 assert.throws(()=>run(fresh(),'c1',{type:'vacancy',title:'Engineer',requirements:'SQL:1, sql:2'}));
 assert.throws(()=>run(fresh(),'s1',{type:'submit',taskId:'t1',evidence:'javascript:alert(1)'}));
});
