import {retainCurrentAgentChecks} from './agent_linkage';
import {createContext,useContext,useState,useEffect,useRef,useCallback,type ReactNode} from 'react';
import {App as AntApp} from 'antd';
import {initialStore,type Store} from './state';
import {pathFor,type Host,type Device} from './catalog';
import {resolvePage,selectionFromPath} from './state';
import {initialProduct,audit,type ProductState} from './product_state';
import {useSystemTheme} from './system_theme_provider';
import {resolveConsoleHost,resolveConsoleDevice} from './shell_layout';
import {readSystemBrand,writeSystemBrand,systemBrandKey,type SystemBrand} from './system_brand';
type NavigationGuard=(proceed:()=>void)=>void;
type Context=ReturnType<typeof useSystemTheme>&{branding:SystemBrand;brandingError:string;saveBranding:(value:SystemBrand)=>boolean;setNavigationGuard:(guard:NavigationGuard|null)=>void;product:ProductState;setProduct:React.Dispatch<React.SetStateAction<ProductState>>;store:Store;setStore:React.Dispatch<React.SetStateAction<Store>>;page:string;go:(page:string,id?:string)=>void;selected:string;host:Host;setHost:(h:Host)=>void;device:Device;theme:'light'|'dark';setTheme:(t:'light'|'dark')=>void;scenario:string;setScenario:(s:string)=>void;notify:(s:string)=>void;confirm:(title:string,body:string,action:()=>void)=>void};
const Ctx=createContext<Context|null>(null);
export const useConsole=()=>{const c=useContext(Ctx);if(!c)throw new Error('Console context missing');return c;};
export function ConsoleProvider({children}:{children:ReactNode}){
 const systemTheme=useSystemTheme();
 const [initialBrand]=useState(()=>readSystemBrand(localStorage));
 const [branding,setBranding]=useState(initialBrand.settings),[brandingError,setBrandingError]=useState(initialBrand.error||'');
 const saveBranding=useCallback((value:SystemBrand)=>{try{writeSystemBrand(localStorage,value);const saved=readSystemBrand(localStorage);if(saved.error)throw Error(saved.error);setBranding(saved.settings);setBrandingError('');return true;}catch(e){setBrandingError(`系统标识未能保存：${(e as Error).message}。当前标识和草稿已保留。`);return false;}},[]);
 useEffect(()=>{document.title=`${branding.name} · 智能控制台`;},[branding.name]);
 useEffect(()=>{const changed=(event:StorageEvent)=>{if(event.key!==systemBrandKey)return;const next=readSystemBrand(localStorage);setBrandingError(next.error||'');if(!next.error)setBranding(next.settings);};addEventListener('storage',changed);return()=>removeEventListener('storage',changed);},[]);
 const query=new URLSearchParams(location.search);
 const lockedHost=document.documentElement.dataset.consoleHost||null;
 const device=resolveConsoleDevice(query.get('device'),innerWidth,lockedHost) as Device;
 const [product,setProduct]=useState(initialProduct);
 const [store,setStore]=useState(initialStore),[page,setPage]=useState(()=>location.hash?resolvePage(location.hash.slice(1)):'01');
 const previousStore=useRef(store);
 useEffect(()=>{const before=previousStore.current;previousStore.current=store;const labels:Partial<Record<keyof Store,string>>={agents:'智能体配置',connections:'模型连接',roleMemories:'智能体记忆',knowledge:'知识库',docs:'知识文档',systemEntries:'系统参数',storage:'存储配置',preferences:'客户端偏好',extensions:'插件与连接'};const changes=(Object.keys(labels) as (keyof Store)[]).filter(key=>before[key]!==store[key]);if(changes.length)setProduct(p=>({...p,audits:[audit('更新'+changes.map(key=>labels[key]).join('、'),'当前工作空间'),...p.audits].slice(0,500)}));},[store]);
 const [host,setHost]=useState<Host>(()=>resolveConsoleHost(query.get('host'),lockedHost));
 useEffect(()=>{setProduct(p=>{const agentChecks=retainCurrentAgentChecks({store,skills:p.skills,host,station:p.station},p.agentChecks);return agentChecks===p.agentChecks?p:{...p,agentChecks};});},[store,product.skills,product.station,host]);
 const [scenario,setScenario]=useState('normal');
 const [selected,setSelected]=useState(selectionFromPath(location.hash)||query.get('item')||'');
 const {message,modal}=AntApp.useApp();
 const navigationGuard=useRef<NavigationGuard|null>(null),lastHash=useRef(location.hash);
 const setNavigationGuard=useCallback((guard:NavigationGuard|null)=>{navigationGuard.current=guard;},[]);
 function performGo(id:string,item=''){
  setSelected(item);let path=pathFor(id,item);if(id==='10'){const doc=store.docs.find(d=>d.id===item);if(doc)path=path.replace('/knowledge/k1/',`/knowledge/${encodeURIComponent(doc.knowledge)}/`);}location.hash=path+(item?`?item=${encodeURIComponent(item)}`:'');
  lastHash.current=location.hash;setPage(id);document.querySelector('.main-scroll')?.scrollTo({top:0});
 }
 function go(id:string,item=''){const proceed=()=>performGo(id,item);if(navigationGuard.current)navigationGuard.current(proceed);else proceed();}
 useEffect(()=>{const change=()=>{const nextHash=location.hash;const apply=()=>{lastHash.current=nextHash;setPage(resolvePage(nextHash.slice(1)));setSelected(selectionFromPath(nextHash));};if(nextHash!==lastHash.current&&navigationGuard.current){history.replaceState(null,'',location.pathname+location.search+lastHash.current);navigationGuard.current(()=>{history.replaceState(null,'',location.pathname+location.search+nextHash);apply();});}else apply();};addEventListener('hashchange',change);return()=>removeEventListener('hashchange',change);},[]);
 return <Ctx.Provider value={{...systemTheme,branding,brandingError,saveBranding,product,setProduct,setNavigationGuard,store,setStore,page,go,selected,host,setHost,device,scenario,setScenario,notify:s=>message.info(s),confirm:(title,body,action)=>modal.confirm({title,content:body,okText:'确认',cancelText:'取消',onOk:action})}}>{children}</Ctx.Provider>;
}
