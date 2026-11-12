import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {useConsole} from './context';
import {readOnboarding,onboardingKey,onboardingSteps,onboardingTarget,type OnboardingState,type OnboardingStep} from './onboarding';

const Context=createContext<ReturnType<typeof useGuidanceState>|null>(null);
function useGuidanceState(){
 const c=useConsole(),[state,setState]=useState(()=>readOnboarding(localStorage)),[storageError,setStorageError]=useState('');
 const [tour,setTour]=useState<'intro'|'page'|null>(null);
 const previous=useRef(c.store);
 const env={store:c.store,skills:c.product.skills,host:c.host,station:c.product.station,checks:c.product.agentChecks};
 const rows=onboardingSteps(state,env);
 function patch(patch:Partial<OnboardingState>){setState(s=>({...s,...patch}));}
 useEffect(()=>{try{localStorage.setItem(onboardingKey,JSON.stringify(state));setStorageError('');}catch{setStorageError('浏览器未允许保存引导进度，本次仍可继续；关闭后需重新选择。');}},[state]);
 // 只跟随用户在原页面实际创建或修改的资源，不替用户写入业务配置。
 useEffect(()=>{
  const before=previous.current;previous.current=c.store;if(!state.active)return;
  const patch:Partial<OnboardingState>={};
  if(state.current==='model'&&['06','07'].includes(c.page)){
   const changed=c.store.connections.find(m=>(m.role||'LLM')==='LLM'&&m!==before.connections.find(x=>x.id===m.id));if(changed)patch.modelId=changed.id;
  }
  if(state.current==='knowledge'&&['09','10','11'].includes(c.page)){
   const id=c.page==='10'?c.store.docs.find(d=>d.id===c.selected)?.knowledge:c.selected;
   if(id&&c.store.knowledge.some(k=>k.id===id)&&id!==state.knowledgeId)patch.knowledgeId=id;
  }
  if(['agent','trial','publish'].includes(state.current)&&c.page==='04'){
   const created=c.store.agents.find(a=>!before.agents.some(old=>old.id===a.id));
   const id=created?.id||(c.store.agents.some(a=>a.id===c.selected)?c.selected:'');
   if(id&&state.agentId!==id)patch.agentId=id;
  }
  if(Object.keys(patch).length)setState(s=>({...s,...patch}));
 },[c.store,c.page,c.selected,state.active,state.current,state.agentId,state.knowledgeId]);
 function start(step:OnboardingStep){
  const unskipped={...state,skipped:state.skipped.filter(s=>s!==step)},target=onboardingTarget(step,unskipped,env);
  patch({active:true,collapsed:false,current:target.step,skipped:unskipped.skipped});setTour(null);
  if(target.step!==step)c.notify(`先完成「${rows.find(r=>r.id===target.step)?.title}」，再继续${rows.find(r=>r.id===step)?.title}。`);
  c.go(target.page,target.item);
 }
 function next(){const remaining=rows.find(r=>r.status==='pending');if(remaining)start(remaining.id);else{patch({active:false,collapsed:false});c.go('01');}}
 function skip(step:OnboardingStep){patch({skipped:[...new Set([...state.skipped,step])]});}
 function restore(step:OnboardingStep){patch({skipped:state.skipped.filter(s=>s!==step)});}
 function replay(){setTour(null);patch({intro:'paused',tourStep:state.intro==='done'?0:state.tourStep});c.go('01');setTour('intro');}
 function pause(){patch({active:false});setTour(null);}
 return {state,patch,rows,start,next,skip,restore,replay,pause,tour,setTour,storageError};
}
export function OnboardingProvider({children}:{children:ReactNode}){const value=useGuidanceState();return <Context.Provider value={value}>{children}</Context.Provider>;}
export function useOnboarding(){const value=useContext(Context);if(!value)throw Error('Onboarding provider missing');return value;}
