/* Finite, normalized numerical possibility models on three states. */
(function(root){
'use strict';
const EPS=1e-9, states=['A','B','C'];
function members(mask){return [0,1,2].filter(i=>mask&(1<<i));}
function name(mask){return mask===0?'∅':mask===7?'Ω':'{'+members(mask).map(i=>states[i]).join(', ')+'}';}
function possibility(pi,mask){return Math.max(0,...members(mask).map(i=>pi[i]));}
function necessity(pi,mask){return 1-possibility(pi,7^mask);}
function probability(p,mask){return members(mask).reduce((a,i)=>a+p[i],0);}
function solve(a,b){a=a.map((r,i)=>[...r,b[i]]);for(let k=0;k<3;k++){let j=k;for(let i=k+1;i<3;i++)if(Math.abs(a[i][k])>Math.abs(a[j][k]))j=i;if(Math.abs(a[j][k])<EPS)return null;[a[k],a[j]]=[a[j],a[k]];const d=a[k][k];a[k]=a[k].map(x=>x/d);for(let i=0;i<3;i++)if(i!==k){const d=a[i][k];a[i]=a[i].map((x,j)=>x-d*a[k][j]);}}return a.map(r=>Math.abs(r[3])<EPS?0:r[3]);}
function compatible(pi,p){return p.every(x=>x>=-EPS)&&Math.abs(p.reduce((a,b)=>a+b,0)-1)<EPS&&Array.from({length:8},(_,m)=>probability(p,m)<=possibility(pi,m)+EPS).every(Boolean);}
function vertices(pi){if(Math.abs(Math.max(...pi)-1)>EPS)throw Error('Possibility distribution must be normalized');const rows=[[1,0,0],[0,1,0],[0,0,1]],b=[0,0,0];for(let m=1;m<7;m++){rows.push([0,1,2].map(i=>m&(1<<i)?1:0));b.push(possibility(pi,m));}const v=[];for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){const p=solve([[1,1,1],rows[i],rows[j]],[1,b[i],b[j]]);if(p&&compatible(pi,p)&&!v.some(q=>q.every((x,k)=>Math.abs(x-p[k])<EPS)))v.push(p);}return v;}
const api={states,members,name,possibility,necessity,probability,compatible,vertices};if(typeof module!=='undefined')module.exports=api;else root.PossibilityModel=api;
})(typeof globalThis!=='undefined'?globalThis:this);
