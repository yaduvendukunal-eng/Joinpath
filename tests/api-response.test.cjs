const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),ts=require('typescript');
function load(file,extra={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,Response,...extra});return exports;}
test('API client reports empty and HTML responses without exposing their content',async()=>{
 for(const body of ['', '<html>private server trace</html>']){const {api}=load('lib/joinpath/api.ts',{fetch:async()=>new Response(body,{status:500})});await assert.rejects(api('account'),e=>e.message.includes('/api/account (HTTP 500)')&&!e.message.includes('private server trace'));}
});
test('API client preserves server errors and handles valid account data',async()=>{
 const a=load('lib/joinpath/api.ts',{fetch:async()=>Response.json({error:'Database not initialized'},{status:503})});await assert.rejects(a.api('account'),/Database not initialized/);
 const b=load('lib/joinpath/api.ts',{fetch:async()=>Response.json({user:null,account:null})});assert.equal((await b.api('account')).account,null);
});
test('database setup errors return safe structured JSON including nested Drizzle causes',async()=>{
 const {apiFailure}=load('lib/joinpath/api-failure.ts');const response=apiFailure({message:'query failed',cause:{message:'D1_ERROR: no such table: accounts'}});assert.equal(response.status,503);assert.equal((await response.json()).code,'DATABASE_NOT_INITIALIZED');
 const hidden=await apiFailure(new Error('secret-internal-details')).text();assert.ok(!hidden.includes('secret-internal-details'));
});
