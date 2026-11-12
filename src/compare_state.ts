import {DEVICE_PRESETS,resolveDeviceViewport} from '../reference/device_presets.js';
import {pages} from './catalog.ts';
export const COMPARISON_STATE_KEY='tinybotCompareControlsV1';
export const previewDevices=[{id:'phone',device:'mobile',label:'Mobile',host:'web'},{id:'tablet',device:'tablet',label:'Tablet',host:'ipad'},{id:'desktop',device:'desktop',label:'Desktop',host:'desktop'}] as const;
export type PreviewDevice='phone'|'tablet'|'desktop';
export type PreviewStyle='cards'|'compact';
export type CompareState={page:string;theme:'light'|'dark';style:PreviewStyle;sync:boolean;scale:number;landscape:Partial<Record<PreviewDevice,boolean>>;presets:Partial<Record<PreviewDevice,string>>;enabled:Record<PreviewDevice,boolean>};
type StorageLike={getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void};
export const previewScales=[.35,.45,.5,.6,.65,.75,.85,1];
const record=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
/** 仅保存预览控件，业务表单与凭据不进入控制台状态。 */
export function normalizeCompareState(raw:unknown):CompareState {
 const input=record(raw),enabled=record(input.enabled),presets=record(input.presets),landscape=record(input.landscape);
 return {page:pages.some(p=>p.id===input.page)?String(input.page):'01',theme:input.theme==='dark'?'dark':'light',style:'cards',sync:typeof input.sync==='boolean'?input.sync:true,scale:previewScales.includes(Number(input.scale))?Number(input.scale):.65,
  enabled:Object.fromEntries(previewDevices.map(d=>[d.id,typeof enabled[d.id]==='boolean'?enabled[d.id]:true])) as Record<PreviewDevice,boolean>,
  presets:Object.fromEntries(previewDevices.filter(d=>DEVICE_PRESETS[d.id].some(p=>p.id===presets[d.id])).map(d=>[d.id,String(presets[d.id])])),
  landscape:Object.fromEntries(previewDevices.filter(d=>landscape[d.id]===true).map(d=>[d.id,true]))};
}
export function readCompareState(storage?:StorageLike,query=''):CompareState {
 let saved:Record<string,unknown>={};try{saved=record(JSON.parse((storage??globalThis.localStorage).getItem(COMPARISON_STATE_KEY)||'null'));}catch{}
 const q=new URLSearchParams(query);for(const key of ['page','theme'])if(q.has(key))saved[key]=q.get(key);
 if(q.has('scale'))saved.scale=Number(q.get('scale'));if(q.has('sync'))saved.sync=q.get('sync')!=='false';return normalizeCompareState(saved);
}
export function writeCompareState(storage:StorageLike,state:unknown):boolean {try{storage.setItem(COMPARISON_STATE_KEY,JSON.stringify(normalizeCompareState(state)));return true;}catch{return false;}}
export function viewportFor(id:PreviewDevice,state:CompareState){return resolveDeviceViewport(id,state.presets[id]||'',state.landscape[id]);}
/** 刻度与方格使用画布坐标，设备尺寸仍为未缩放的 CSS viewport。 */
export function canvasSize(state:CompareState){const visible=previewDevices.filter(d=>state.enabled[d.id]);return {width:Math.max(360,visible.reduce((sum,d)=>sum+viewportFor(d.id,state).width*state.scale,0)+48+Math.max(0,visible.length-1)*24),height:Math.max(216,...visible.map(d=>viewportFor(d.id,state).height*state.scale))+144};}
export function surfaceFor(page:string):string {if(['00','01'].includes(page))return 'home';if(['27','28','29','30'].includes(page))return 'settings';if(['02','24'].includes(page))return 'conversation';if(['12','13','14','15','25','26'].includes(page))return 'mobile';return 'work';}
