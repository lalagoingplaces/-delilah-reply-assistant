import assert from 'node:assert/strict';
process.env.PORT='0';process.env.HOST='127.0.0.1';process.env.APP_PASSCODE='synthetic-session-passcode';
const {server}=await import('./server.mjs');
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port;
try{
 const login=async(headers={},remember=true)=>fetch(url+'/api/login',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify({remember})});
 assert.equal((await login()).status,401);
 assert.equal((await login({'x-delilah-passcode':process.env.APP_PASSCODE,origin:'https://evil.example'})).status,403);
 const response=await login({'x-delilah-passcode':process.env.APP_PASSCODE});assert.equal(response.status,200);
 const cookie=response.headers.get('set-cookie');assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Strict/);assert.match(cookie,/Max-Age=2592000/);
 const headers={cookie:cookie.split(';')[0]};
 assert.equal((await (await fetch(url+'/api/status',{headers})).json()).authenticated,true);
 assert.equal((await fetch(url+'/api/references',{headers})).status,200);
 assert.equal((await fetch(url+'/api/references',{headers:{cookie:headers.cookie+'x'}})).status,401);
 const session=await login({'x-delilah-passcode':process.env.APP_PASSCODE},false);assert(!session.headers.get('set-cookie').includes('Max-Age'));
 const logout=await fetch(url+'/api/logout',{method:'POST',headers});assert.match(logout.headers.get('set-cookie'),/Max-Age=0/);
 console.log('PASS: persistent and session-only cookies, authenticated reload, protected references, wrong code, tampering, cross-origin login rejection and logout cookie clearing.');
}finally{server.close();}
