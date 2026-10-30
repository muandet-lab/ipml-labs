(function(root){
const EPS=1e-8;
function cross(a,b){return a[0]*b[1]-a[1]*b[0]}
function inside(v,gens){if(Math.hypot(...v)<EPS)return false;for(const g of gens){if(Math.abs(cross(g,v))<EPS&&g[0]*v[0]+g[1]*v[1]>EPS)return true}for(let i=0;i<gens.length;i++)for(let j=i+1;j<gens.length;j++){const d=cross(gens[i],gens[j]);if(Math.abs(d)<EPS)continue;let a=cross(v,gens[j])/d,b=cross(gens[i],v)/d;if(a>=-EPS&&b>=-EPS)return true}return false}
function analyze(gs){let lower=0,upper=1,valid=true;for(const [x,y]of gs){let slope=x-y;if(Math.abs(slope)<EPS){if(y<=0)valid=false}else if(slope>0)lower=Math.max(lower,-y/slope);else upper=Math.min(upper,-y/slope)}let coherent=valid&&lower<upper-EPS;let witness=null;if(!coherent){let candidates=[0,1];for(let k=0;k<2;k++){let den=gs[0][k]-gs[1][k];if(Math.abs(den)>EPS){let t=-gs[1][k]/den;if(t>=0&&t<=1)candidates.push(t)}}candidates.sort((a,b)=>a-b);let ts=[...candidates,...candidates.slice(1).map((x,i)=>(x+candidates[i])/2)];for(const t of ts){let v=gs[0].map((x,i)=>t*x+(1-t)*gs[1][i]);if(v.every(x=>x<=EPS)){witness={t,v,strict:v.every(x=>x<-EPS)};if(witness.strict)break}}}return {lower,upper,coherent,witness}}
root.GambleMath={inside,analyze};
})(typeof window==='undefined'?globalThis:window);
