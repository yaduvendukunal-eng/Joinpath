const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function harness(file){let identity={userId:'s1',email:'student@example.test',displayName:'Student'};const rows={accounts:[{id:'s1',email:'student@example.test',name:'Private Name',organization:'College',role:'student',employerId:'c1',collegeId:'u1',createdAt:'2026-01-01',consent:'{}',completed:'[]',history:'[]',joiningStatus:'No offer yet',joiningDate:null},{id:'c1',role:'company',organization:'Acme'},{id:'c2',role:'company',organization:'Other Co'},{id:'u1',role:'college',organization:'College'}],consent_events:[]};const table=n=>new Proxy({_table:n},{get:(t,k)=>k==='_table'?n:k});const accounts=table('accounts'),consentEvents=table('consent_events');const db={select(fields){let t,p=()=>true;const q={from(v){t=v._table;return q},where(v){p=v;return q},orderBy(){return q},limit(){return q},get:async()=>rows[t].find(p),then(ok,no){return Promise.resolve(rows[t].filter(p).map(x=>fields?Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,x[v]])):structuredClone(x))).then(ok,no)}};return q},update(t){return{set(vals){return{where:async p=>{rows[t._table].filter(p).forEach(x=>Object.assign(x,vals))}}}}},insert(t){return{values:async v=>rows[t._table].push(v)}},batch:async x=>Promise.all(x)};const exports={};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{exports,require:n=>n.endsWith('api-failure')?{apiFailure:()=>Response.json({error:'Server unavailable'},{status:503})}:n.includes('chatgpt-auth')?{getChatGPTUser:async()=>identity}:n==='drizzle-orm'?{eq:(k,v)=>x=>x[k]===v,or:(...f)=>x=>f.some(p=>p(x)),desc:x=>x}:n.endsWith('schema')?{accounts,consentEvents}:{getDb:()=>db},Response,Request,URL,Date,crypto:globalThis.crypto});return{api:exports,rows,login:u=>identity=u?{userId:u,email:u+'@example.test',displayName:u}:null,post:b=>exports.POST(new Request('https://site.test/api/workspace',{method:'POST',headers:{origin:'https://site.test','content-type':'application/json'},body:JSON.stringify(b)}))}}
const choices=(profile=false,learning=false,joining=false)=>({company:{profile,learning,joining},college:{profile:false,learning:false,joining:false}});
test('anonymous reads and writes are denied',async()=>{const h=harness('app/api/workspace/route.ts');h.login(null);assert.equal((await h.api.GET()).status,401);assert.equal((await h.post({action:'complete',module:'01'})).status,401)});
test('default consent hides the student and sensitive fields are projected server-side',async()=>{const h=harness('app/api/workspace/route.ts');h.login('c1');assert.equal((await(await h.api.GET()).json()).candidates.length,0);h.rows.accounts[0].consent=JSON.stringify(choices(false,true,false));const c=(await(await h.api.GET()).json()).candidates[0];assert.equal(c.name,'Student · details private');assert.equal(c.email,null);assert.equal(c.joiningStatus,null);assert.equal(c.progress,0);assert.equal(c.signal,'No learning activity for 21+ days');h.login('c2');assert.equal((await(await h.api.GET()).json()).candidates.length,0)});
test('grant, audit, recipient isolation, and withdraw affect subsequent API reads',async()=>{const h=harness('app/api/workspace/route.ts');assert.equal((await h.post({action:'consent',choices:choices(true,true,true),employerId:'c1',collegeId:'u1'})).status,200);assert.equal(h.rows.consent_events.length,1);h.login('c1');assert.equal((await(await h.api.GET()).json()).candidates[0].name,'Private Name');h.login('u1');assert.equal((await(await h.api.GET()).json()).candidates.length,0);h.login('s1');await h.post({action:'consent',choices:choices(),employerId:'c1',collegeId:'u1'});h.login('c1');assert.equal((await(await h.api.GET()).json()).candidates.length,0);assert.equal(h.rows.consent_events.length,2)});
test('student cannot perform company writes and company requires explicit joining consent',async()=>{const h=harness('app/api/workspace/route.ts');const b={action:'offer',studentId:'s1',date:'2026-12-01',reason:'First joining batch'};assert.equal((await h.post(b)).status,403);h.login('c1');assert.equal((await h.post(b)).status,403);h.rows.accounts[0].consent=JSON.stringify(choices(false,false,true));assert.equal((await h.post(b)).status,200);assert.equal(h.rows.accounts[0].joiningStatus,'Awaiting reply');h.login('c2');assert.equal((await h.post(b)).status,403);h.login('s1');assert.equal((await h.post({action:'confirm'})).status,200);assert.equal(h.rows.accounts[0].joiningStatus,'Confirmed')});
test('account role cannot be changed by a later login payload',async()=>{const h=harness('app/api/account/route.ts');const r=await h.post({role:'company',name:'Escalate',organization:'Corp'});assert.equal((await r.json()).role,'student');assert.equal(h.rows.accounts[0].role,'student')});
test('invalid consent recipients and cross-origin mutations are rejected',async()=>{const h=harness('app/api/workspace/route.ts');assert.equal((await h.post({action:'consent',choices:choices(true),employerId:'u1'})).status,400);assert.equal((await h.api.POST(new Request('https://site.test/api/workspace',{method:'POST',headers:{origin:'https://evil.test'},body:'{}'}))).status,403)});

test('students can check and uncheck all six cards without changing consent or joining status',async()=>{
 const h=harness('app/api/workspace/route.ts');
 for(const module of ['01','02','03','04','consent','joining']){
  assert.equal((await h.post({action:'complete',module,completed:true})).status,200);
  assert.ok(JSON.parse(h.rows.accounts[0].completed).includes(module));
  assert.equal((await h.post({action:'complete',module,completed:false})).status,200);
  assert.ok(!JSON.parse(h.rows.accounts[0].completed).includes(module));
 }
 assert.equal(h.rows.accounts[0].consent,'{}');
 assert.equal(h.rows.accounts[0].joiningStatus,'No offer yet');
 assert.equal((await h.post({action:'complete',module:'01',completed:'false'})).status,400);
});
test('non-learning ticks do not inflate employer learning progress',async()=>{
 const h=harness('app/api/workspace/route.ts');
 for(const module of ['01','02','03','04','consent','joining'])await h.post({action:'complete',module,completed:true});
 h.rows.accounts[0].consent=JSON.stringify(choices(false,true,false));h.login('c1');
 assert.equal((await(await h.api.GET()).json()).candidates[0].progress,100);
});

test('registration rejects anonymous users and cross-origin requests',async()=>{
 const h=harness('app/api/account/route.ts');h.login(null);
 assert.equal((await h.post({role:'student',name:'Person',organization:''})).status,401);
 h.login('new');assert.equal((await h.api.POST(new Request('https://site.test/api/account',{method:'POST',headers:{origin:'https://evil.test','content-type':'application/json'},body:JSON.stringify({role:'student',name:'Person',organization:''})}))).status,403);
});
test('each account role is saved using authenticated identity, never supplied credentials',async()=>{
 for(const role of ['student','college','company']){
  const h=harness('app/api/account/route.ts');h.login('new-'+role);
  const response=await h.post({role,name:'New Person',organization:'Example Institution',id:'attacker-id',email:'spoof@example.test',password:'must-not-be-stored'});
  assert.equal(response.status,200);assert.equal((await response.json()).role,role);
  const saved=h.rows.accounts.find(a=>a.id==='new-'+role);assert.ok(saved);assert.equal(saved.email,'new-'+role+'@example.test');assert.equal(saved.password,undefined);
  h.login('new-'+role);assert.equal((await(await h.api.GET()).json()).account.role,role);
 }
});
test('malformed role registration is rejected and account responses are not cached',async()=>{
 const h=harness('app/api/account/route.ts');h.login('new');
 assert.equal((await h.post({role:'admin',name:'Person',organization:'Example'})).status,400);
 assert.equal((await h.api.GET()).headers.get('Cache-Control'),'no-store');
});
