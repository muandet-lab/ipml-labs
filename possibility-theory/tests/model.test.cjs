const assert=require('node:assert/strict');
const M=require('../model.js');let identities=0,models=0;
for(const a of [0,.2,.6,1])for(const b of [0,.2,.6,1])for(const c of [0,.2,.6,1]){
 const pi=[a,b,c];if(Math.max(...pi)!==1)continue;models++;
 const vs=M.vertices(pi);assert(vs.length);vs.forEach(v=>assert(M.compatible(pi,v)));
 const levels=[...new Set(pi.filter(x=>x>0))].sort((a,b)=>b-a);
 for(let e=0;e<8;e++){
  const values=vs.map(v=>M.probability(v,e));
  assert(Math.abs(Math.min(...values)-M.necessity(pi,e))<1e-8);
  assert(Math.abs(Math.max(...values)-M.possibility(pi,e))<1e-8);
  let belief=0,plausibility=0;
  levels.forEach((level,i)=>{const mask=pi.reduce((m,x,j)=>x>=level?m|(1<<j):m,0),mass=level-(levels[i+1]||0);if((mask&e)===mask)belief+=mass;if(mask&e)plausibility+=mass;});
  assert(Math.abs(belief-M.necessity(pi,e))<1e-8);
  assert(Math.abs(plausibility-M.possibility(pi,e))<1e-8);
  for(let f=0;f<8;f++){
   assert.equal(M.possibility(pi,e|f),Math.max(M.possibility(pi,e),M.possibility(pi,f)));
   assert.equal(M.necessity(pi,e&f),Math.min(M.necessity(pi,e),M.necessity(pi,f)));identities+=2;
  }
 }
}
assert(!M.compatible([1,.6,.6],[0,.5,.5]));
assert.equal(M.vertices([1,1,1]).length,3);
assert.equal(M.vertices([1,1,0]).length,2);
assert.equal(M.vertices([1,0,0]).length,1);
console.log(`Passed ${models} normalized models, ${identities} max/min identities, all event envelope and consonant mass checks, and singleton trap / degenerate set cases.`);
