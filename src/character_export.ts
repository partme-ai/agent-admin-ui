import {labCharacter} from './grok_customizer.ts';
import {normalizeCharacter,characterStates,type CharacterConfig} from './character_config.ts';
import {sceneSvg} from './character_scene.ts';
import upstreamLicense from './character_license.ts';
/** 根据固定背景将RGBA转换为逐行RGB565小端数据。 */
export function rgbaToRgb565(rgba:Uint8ClampedArray):Uint8Array{
 const bytes=new Uint8Array(rgba.length/2);for(let i=0;i<rgba.length;i+=4){const a=rgba[i+3]/255,r=Math.round(rgba[i]*a+23*(1-a)),g=Math.round(rgba[i+1]*a+27*(1-a)),b=Math.round(rgba[i+2]*a+32*(1-a)),v=((r>>3)<<11)|((g>>2)<<5)|(b>>3);bytes[i/2]=v&255;bytes[i/2+1]=v>>8;}return bytes;
}
const encoder=new TextEncoder(),crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
const crc32=(bytes:Uint8Array)=>{let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
/** 标准ZIP STORE容器；不依赖压缩库，兼容系统解压工具。 */
export function zipStore(files:{name:string;data:Uint8Array}[]):Uint8Array{
 const entries:Uint8Array[]=[],central:Uint8Array[]=[];let offset=0,centralSize=0;const names=new Set<string>();
 for(const file of files){if(!/^[a-zA-Z0-9_.-]+$/.test(file.name)||file.name.includes('..')||names.has(file.name))throw Error('不安全或重复的资源文件名');names.add(file.name);
  const name=encoder.encode(file.name),crc=crc32(file.data),header=new Uint8Array(30+name.length),h=new DataView(header.buffer);h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x800,true);h.setUint32(14,crc,true);h.setUint32(18,file.data.length,true);h.setUint32(22,file.data.length,true);h.setUint16(26,name.length,true);header.set(name,30);
  const dir=new Uint8Array(46+name.length),d=new DataView(dir.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x800,true);d.setUint32(16,crc,true);d.setUint32(20,file.data.length,true);d.setUint32(24,file.data.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);dir.set(name,46);entries.push(header,file.data);central.push(dir);offset+=header.length+file.data.length;centralSize+=dir.length;
 }
 const end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,centralSize,true);e.setUint32(16,offset,true);
 const output=new Uint8Array(offset+centralSize+22);let at=0;for(const chunk of [...entries,...central,end]){output.set(chunk,at);at+=chunk.length;}return output;
}
export const deviceEstimate=(width:number,height:number,frames:number,states:number)=>width*height*2*frames*states;
/** 绘制受控SVG到Canvas，资源不走网络，完成后立即释放临时URL。 */
async function raster(config:CharacterConfig,width:number,height:number,time:number):Promise<HTMLCanvasElement>{
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');if(!ctx)throw Error('当前浏览器无法绘制导出图片。');
 const svg=sceneSvg(config,time),url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
 try{const image=new Image();await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(Error('形象资源绘制失败'));image.src=url;});ctx.fillStyle='#171b20';ctx.fillRect(0,0,width,height);const scale=Math.min(width/294,height/310);ctx.drawImage(image,(width-294*scale)/2,(height-310*scale)/2,294*scale,310*scale);return canvas;}finally{URL.revokeObjectURL(url);}
}
export function downloadCharacterFile(name:string,data:BlobPart,type:string){const blob=new Blob([data],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export async function characterPng(config:CharacterConfig,width=512,height=512):Promise<Blob>{const canvas=await raster(config,width,height,0);return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('PNG编码失败')),'image/png'));}
/** 将角色标准姿态绘制成分享卡，用户自行下载或选择系统分享。 */
export async function characterPoster(config:CharacterConfig):Promise<Blob>{
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#f3f5f2';ctx.fillRect(0,0,1080,1440);ctx.fillStyle='#252c28';ctx.font='600 54px system-ui';ctx.fillText('TinyBot · 我的角色',72,120);ctx.font='32px system-ui';ctx.fillText(config.name,72,190);const image=await raster(config,936,936,0);ctx.drawImage(image,72,250);ctx.font='28px system-ui';ctx.fillText(`形象 · ${characterStates.find(s=>s.id===config.state)?.name||config.state}`,72,1260);ctx.fillStyle='#727d75';ctx.font='21px system-ui';ctx.fillText('渲染改编自 LaoA-GrokBot · 老A玩AI · MIT',72,1350);return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('分享卡生成失败')),'image/png'));
}
export type DeviceExportOptions={width:number;height:number;frames:number;fps:number;allStates:boolean;signal?:AbortSignal;onProgress?:(done:number,total:number)=>void};
/** 烘焙RGB565帧与资源清单。输出资源不等于已刷写或已在实体屏幕验收。 */
export async function deviceCharacterPackage(value:CharacterConfig,options:DeviceExportOptions):Promise<Uint8Array>{
 const c=labCharacter(value),{width,height,frames,fps}=options;
 if(c.pack!=='grok')throw Error('请先选择可定制角色形象。');
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<32||height<32||width>512||height>512||![1,12,24].includes(frames)||!Number.isInteger(fps)||fps<1||fps>30)throw Error('不支持的设备导出参数。');
 const states=options.allStates?characterStates.map(s=>s.id):[c.state],size=deviceEstimate(width,height,frames,states.length);
 if(size>16*1024*1024)throw Error('资源超过16MiB，请降低尺寸、帧数或选择单个状态。');
 const output=new Uint8Array(size),stride=width*height*2,clips=[];let offset=0,done=0;
 for(const state of states){const start=offset;for(let frame=0;frame<frames;frame++){
  if(options.signal?.aborted)throw Error('已取消设备资源导出。');
  const canvas=await raster({...c,state,...(options.allStates?{emotion:undefined,emotion_id:undefined}:{}),expression:options.allStates?-1:c.expression,action:options.allStates?'none':c.action},width,height,frame/fps);
  if(options.signal?.aborted)throw Error('已取消设备资源导出。');
  output.set(rgbaToRgb565(canvas.getContext('2d')!.getImageData(0,0,width,height).data),offset);offset+=stride;options.onProgress?.(++done,states.length*frames);
 }clips.push({state,offset_bytes:start,length_bytes:offset-start,frame_count:frames,fps,loop:frames>1,frame_stride_bytes:stride});}
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',output as Uint8Array<ArrayBuffer>)),b=>b.toString(16).padStart(2,'0')).join('');
 const manifest={schema_version:1,format:'tinybot-avatar-rgb565',pixel_format:'RGB565',byte_order:'little-endian',row_order:'top-to-bottom',width,height,background:'#171b20',alpha:false,data_file:'frames.bin',data_bytes:output.length,sha256:digest,clips,source:{repository:'zhulin025/LaoA-GrokBot',commit:'527c3b5746bed34da3a6d4f9747e483c84534a41',license:'MIT'},device_validation:'not_verified'};
 return zipStore([{name:'manifest.json',data:encoder.encode(JSON.stringify(manifest,null,2))},{name:'character.json',data:encoder.encode(JSON.stringify(c,null,2))},{name:'frames.bin',data:output},{name:'LICENSE.txt',data:encoder.encode(upstreamLicense)},{name:'README.txt',data:encoder.encode('TinyBot ESP32 avatar resource pack\nRGB565 little-endian, opaque, row-major.\nRead manifest.json; seek offset_bytes + frame_index * frame_stride_bytes in frames.bin.\nRead one frame at a time; do not load the entire animation into RAM.\nPanel byte order, rotation and clipping must match your display driver. LVGL users must adapt to the installed LVGL version; this raw binary is not an LVGL .bin image header.\nNo firmware has been flashed. Physical screen playback, memory, frame rate and flash partition capacity are NOT verified.\nArtwork/contour source: LaoA-GrokBot, copyright 2026 老A玩AI, MIT.\n') }]);
}
