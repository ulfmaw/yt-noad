const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=readFileSync(path.join(__dirname,'../noad.js'),'utf8');
const player='https://www.youtube.com/youtubei/v1/player';
function install(fetch){const window={fetch};vm.runInNewContext(source,{window,Request,Response});return window;}
const ads=()=>({adPlacements:[1],playerAds:[2],adSlots:[3],adBreakHeartbeatParams:{token:'fixture'}});

test('initial and nested player data keep video information while removing ad fields',()=>{
 const window=install(async()=>{}),info={...ads(),videoDetails:{title:'Fixture'},playerResponse:{...ads(),streamingData:{formats:[{url:'https://example.invalid/video'}]}}};
 window.ytInitialPlayerResponse=info;
 assert.equal(window.ytInitialPlayerResponse,info);
 for(const key of Object.keys(ads())){assert.equal(Object.hasOwn(info,key),false);assert.equal(Object.hasOwn(info.playerResponse,key),false);}
 assert.equal(info.videoDetails.title,'Fixture');assert.equal(info.playerResponse.streamingData.formats.length,1);
});
test('unrelated fetch returns the original response without parsing it',async()=>{
 const original=new Response('not JSON'),window=install(async()=>original);
 assert.equal(await window.fetch('https://www.youtube.com/youtubei/v1/browse'),original);assert.equal(original.bodyUsed,false);
});
test('player JSON is cleaned and response status and headers are preserved',async()=>{
 const original=new Response(JSON.stringify({...ads(),videoDetails:{videoId:'fixture'}}),{status:200,headers:{'content-type':'application/json','x-fixture':'kept'}}),window=install(async()=>original);
 const response=await window.fetch(player),data=await response.json();
 assert.equal(data.videoDetails.videoId,'fixture');for(const key of Object.keys(ads()))assert.equal(Object.hasOwn(data,key),false);
 assert.equal(response.status,200);assert.equal(response.headers.get('x-fixture'),'kept');assert.equal(original.bodyUsed,false);
});
test('Request and init arguments are passed to the original fetch',async()=>{
 const request=new Request(player),init={credentials:'include'};let received;
 const window=install(async function(...args){received={args,receiver:this};return new Response('{"videoDetails":{}}');});
 await window.fetch(request,init);assert.equal(received.args[0],request);assert.equal(received.args[1],init);assert.equal(received.receiver,window);
});
test('HTML error response fails open without consuming its body',async()=>{
 const original=new Response('<html>temporary server error</html>',{status:503}),window=install(async()=>original);
 const response=await window.fetch(player);assert.equal(response,original);assert.equal(original.bodyUsed,false);assert.equal(await response.text(),'<html>temporary server error</html>');
});
test('204 player response fails open',async()=>{
 const original=new Response(null,{status:204}),window=install(async()=>original);
 assert.equal(await window.fetch(player),original);
});
test('original network errors are preserved',async()=>{
 const original=new TypeError('fixture network failure'),window=install(async()=>{throw original;});
 await assert.rejects(window.fetch(player),error=>error===original);
});
