const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function identity(result){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/chatgpt-auth.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:name=>name==='next/navigation'?{redirect:path=>{throw new Error('REDIRECT '+path);}}:{serverAuth:async()=>({auth:{getUser:async()=>result}})}});return exports;}
test('Supabase errors, missing users and unconfirmed emails are denied',async()=>{
 for(const result of [{error:new Error('invalid'),data:{user:null}},{error:null,data:{user:null}},{error:null,data:{user:{id:'u',email:'u@example.test'}}}])assert.equal(await identity(result).getChatGPTUser(),null);
});
test('only verified Supabase user identity is used; role metadata cannot grant privileges',async()=>{
 const auth=identity({error:null,data:{user:{id:'verified-id',email:'student@example.test',email_confirmed_at:'2026-10-30',user_metadata:{display_name:'Student',role:'company'}}}});
 const user=await auth.getChatGPTUser();assert.equal(user.userId,'verified-id');assert.equal(user.email,'student@example.test');assert.equal(user.role,undefined);
});
test('unauthenticated dashboard access redirects to login and blocks external return paths',async()=>{
 const auth=identity({error:null,data:{user:null}});await assert.rejects(auth.requireChatGPTUser('https://evil.test'),/REDIRECT \/login/);assert.equal(auth.chatGPTSignInPath('//evil.test'),'/login');
});
