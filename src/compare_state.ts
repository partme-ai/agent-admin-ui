import {DEVICE_PRESETS,resolveDeviceViewport} from '../reference/device_presets.js';
import {pages,pathFor} from './catalog.ts';
import {normalizePreviewItem} from './state.ts';
export const COMPARISON_STATE_KEY='agentAdminCompareControlsV1';
const LEGACY_COMPARISON_STATE_KEY='tinybotCompareControlsV1';
export const previewDevices=[{id:'web',device:'desktop',label:'Web',host:'web'},{id:'desktop',device:'desktop',label:'Desktop',host:'desktop'},{id:'tablet',device:'tablet',label:'Pad',host:'ipad'},{id:'mobile',device:'mobile',label:'Mobile',host:'android'}] as const;
export type PreviewDevice='web'|'desktop'|'tablet'|'mobile';
export type PreviewStyle='cards'|'compact';
export type CompareState={page:string;item:string;theme:'light'|'dark';style:PreviewStyle;sync:boolean;scale:number;active:PreviewDevice;landscape:Partial<Record<PreviewDevice,boolean>>;presets:Partial<Record<PreviewDevice,string>>};
type StorageLike={getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void};
export const previewScales=[.35,.45,.5,.6,.65,.75,.85,1];
const record=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
/** 仅保存预览控件，业务表单与凭据不进入控制台状态。 */
export function normalizeCompareState(raw:unknown):CompareState {
 const input=record(raw),presets=record(input.presets),landscape=record(input.landscape);
 return {page:pages.some(p=>p.id===input.page)?String(input.page):'01',item:normalizePreviewItem(input.item),theme:input.theme==='dark'?'dark':'light',style:'cards',sync:typeof input.sync==='boolean'?input.sync:true,scale:previewScales.includes(Number(input.scale))?Number(input.scale):.65,
  active:previewDevices.find(d=>d.id===input.active)?.id||'web',
  presets:Object.fromEntries(previewDevices.filter(d=>DEVICE_PRESETS[d.id==='mobile'?'phone':d.id].some(p=>p.id===presets[d.id])).map(d=>[d.id,String(presets[d.id])])),
  landscape:Object.fromEntries(previewDevices.filter(d=>landscape[d.id]===true).map(d=>[d.id,true]))};
}
export function readCompareState(storage?:StorageLike,query=''):CompareState {
 let saved:Record<string,unknown>={};try{const source=storage??globalThis.localStorage;saved=record(JSON.parse(source.getItem(COMPARISON_STATE_KEY)||source.getItem(LEGACY_COMPARISON_STATE_KEY)||'null'));}catch{}
 const q=new URLSearchParams(query);for(const key of ['page','theme','item'])if(q.has(key))saved[key]=q.get(key);
 if(q.has('scale'))saved.scale=Number(q.get('scale'));if(q.has('sync'))saved.sync=q.get('sync')!=='false';if(q.has('tab'))saved.active=q.get('tab');return normalizeCompareState(saved);
}
export function writeCompareState(storage:StorageLike,state:unknown):boolean {try{storage.setItem(COMPARISON_STATE_KEY,JSON.stringify(normalizeCompareState(state)));return true;}catch{return false;}}
export function viewportFor(id:PreviewDevice,state:CompareState){return resolveDeviceViewport(id==='mobile'?'phone':id,state.presets[id]||'',state.landscape[id]);}
export function entryFor(id:PreviewDevice,state:CompareState){return `./${id}/index.html?theme=${state.theme}#${pathFor(state.page,state.item)}${state.item?`?item=${encodeURIComponent(state.item)}`:''}`;}
/** 刻度与方格使用画布坐标，设备尺寸仍为未缩放的 CSS viewport。 */
export function canvasSize(state:CompareState){const view=viewportFor(state.active,state);return {width:view.width*state.scale+48,height:Math.max(216,view.height*state.scale)+144};}
export function surfaceFor(page:string,item=''):string {if(['00','01'].includes(page))return 'home';if(['27','28','29','30','48','49','50','51','52'].includes(page)||(page==='33'&&item==='basic-voice'))return 'settings';if(['02','24'].includes(page))return 'conversation';return 'work';}
