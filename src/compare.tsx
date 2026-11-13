import {useState,useRef,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {ConfigProvider,Select,Segmented,Switch,Button,Space,Tabs,theme as antTheme} from 'antd';
import {ExportOutlined} from '@ant-design/icons';
import {DEVICE_PRESETS} from '../reference/device_presets.js';
import {pages} from './catalog';
import {normalizePreview} from './state';
import {CanvasRuler} from './CanvasRuler';
import {previewDevices,previewScales,readCompareState,writeCompareState,viewportFor,canvasSize,surfaceFor,entryFor,type PreviewDevice} from './compare_state';
import './compare.css';
// 以 TinyClaw 的控制栏、设备排序与标尺画布为布局基线，来源见 reference/provenance.json。
function Compare(){
 const [controls,setControls]=useState(()=>readCompareState(undefined,location.search));
 const [storageError,setStorageError]=useState(false);
 const refs=useRef<Record<string,HTMLIFrameElement|null>>({});const ready=useRef(new WeakSet<Window>());const current=useRef(controls);current.current=controls;
 const {page,item,theme,style,sync,scale,active,landscape}=controls;const board=canvasSize(controls);
 const change=<K extends keyof typeof controls>(key:K,value:typeof controls[K])=>setControls(s=>({...s,[key]:value}));
 const changeDevice=(key:'landscape'|'presets',id:PreviewDevice,value:boolean|string)=>setControls(s=>({...s,[key]:{...s[key],[id]:value}}));
 function send(frame:HTMLIFrameElement|null){if(!frame?.contentWindow)return;const {page,item,theme,style}=current.current;ready.current.delete(frame.contentWindow);frame.contentWindow.postMessage({type:'agent-admin-preview',page,item,theme,style},location.origin);}
 function broadcast(){Object.values(refs.current).forEach(send);}
 useEffect(()=>{broadcast();},[page,item,theme,style]);
 useEffect(()=>{try{setStorageError(!writeCompareState(localStorage,controls));}catch{setStorageError(true);}const q=new URLSearchParams({page,theme,sync:String(sync),scale:String(scale),tab:active});if(item)q.set('item',item);history.replaceState(null,'','?'+q);},[controls]);
 useEffect(()=>{const receive=(event:MessageEvent)=>{if(event.origin!==location.origin)return;const frame=Object.values(refs.current).find(f=>f?.contentWindow===event.source);if(!frame?.contentWindow)return;
  if(event.data?.type==='agent-admin-ready'){send(frame);return;}const v=normalizePreview(event.data);if(!v)return;
  if(event.data?.type==='agent-admin-preview-applied'){const expected=current.current;if(v.page===expected.page&&(v.item||'')===expected.item&&v.theme===expected.theme&&v.style===expected.style)ready.current.add(frame.contentWindow);return;}
  if(!sync||!ready.current.has(frame.contentWindow)||event.data?.type!=='agent-admin-navigation')return;
  setControls(s=>s.page===v.page&&s.item===(v.item||'')&&s.theme===v.theme?s:{...s,page:v.page,item:v.item||'',theme:v.theme});
 };addEventListener('message',receive);return()=>removeEventListener('message',receive);},[sync]);
 return <ConfigProvider button={{autoInsertSpace:false}} theme={{algorithm:theme==='dark'?antTheme.darkAlgorithm:antTheme.defaultAlgorithm,token:{colorPrimary:'#1677ff',borderRadius:6}}}>
 <main className={`comparison ${theme}`}><header className="comparison-header"><div className="comparison-brand"><strong>Agent Admin UI · 四端界面设计</strong><small>Web / Desktop / Pad / Mobile · 独立访问与页签对比</small></div>
 <Space wrap className="comparison-controls">
  <Segmented aria-label="功能区域" value={surfaceFor(page,item)} onChange={v=>setControls(s=>({...s,page:({home:'01',work:'03',settings:'30',conversation:'02'} as Record<string,string>)[v],item:''}))} options={[{value:'home',label:'主页'},{value:'work',label:'工作'},{value:'settings',label:'设置'},{value:'conversation',label:'对话'}]}/>
  <Select aria-label="预览页面" className="page-picker" showSearch optionFilterProp="label" value={page} onChange={v=>setControls(s=>({...s,page:v,item:''}))} options={pages.map(p=>({value:p.id,label:`${p.id} · ${p.title}`}))}/>
  <Segmented aria-label="颜色模式" value={theme} onChange={v=>change('theme',v as 'light'|'dark')} options={[{value:'light',label:'浅色'},{value:'dark',label:'深色'}]}/>
  <Select aria-label="统一缩放" className="scale-picker" value={scale} onChange={v=>change('scale',v)} options={previewScales.map(value=>({value,label:Math.round(value*100)+'%'}))}/>
  <label className="comparison-toggle"><Switch aria-label="页面联动" checked={sync} onChange={v=>change('sync',v)}/><span>联动</span></label>
 </Space><Tabs className="comparison-tabs" aria-label="预览端" activeKey={active} onChange={v=>change('active',v as PreviewDevice)} items={previewDevices.map(d=>({key:d.id,label:d.label}))}/>{storageError&&<small className="comparison-storage-error" role="status">浏览器未能保存控制台选择；刷新后可能恢复默认值。</small>}</header>
 <div className="comparison-canvas"><div className="comparison-board" style={{minWidth:board.width}}><div className="ruler-corner" title="标尺单位：画布 CSS px">px</div><CanvasRuler length={board.width}/><CanvasRuler vertical length={board.height}/>
 <div className="comparison-devices">{previewDevices.filter(d=>d.id===active).map(d=>{const view=viewportFor(d.id,controls);return <section key={d.id} className="comparison-device" style={{width:view.width*scale}} aria-label={`${d.label} 预览区域`}>
  <div className="device-label"><strong>{d.label}</strong><Button size="small" aria-label={`旋转 ${d.label}`} onClick={()=>changeDevice('landscape',d.id,!landscape[d.id])}>{view.width>view.height?'横屏':'竖屏'} ↻</Button><a href={entryFor(d.id,controls)} target="_blank" rel="noopener noreferrer" aria-label={`独立打开 ${d.label}`} title="独立打开"><ExportOutlined/></a></div>
  <Select className="device-preset" aria-label={`${d.label} 设备分辨率`} value={view.id} onChange={v=>changeDevice('presets',d.id,v)} options={DEVICE_PRESETS[d.id==='mobile'?'phone':d.id].map(p=>({value:p.id,label:`${p.name} · ${p.width} × ${p.height}`}))}/>
  <div className="device-metrics">{view.width} × {view.height} CSS px · {Math.round(scale*100)}%</div>
  <div className="device-window" style={{height:view.height*scale}}><iframe title={`${d.label} 交互界面`} ref={f=>{refs.current[d.id]=f;}} onLoad={()=>send(refs.current[d.id])} src={`./${d.id}/index.html`} style={{width:view.width,height:view.height,transform:`scale(${scale})`}}/></div>
 </section>;})}</div></div></div>
 </main></ConfigProvider>;
}
createRoot(document.getElementById('root')!).render(<Compare/>);
