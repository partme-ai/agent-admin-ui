import {useEffect,useRef,useState} from 'react';
import {Alert,Button,Input,Select,Space,Upload} from 'antd';
import {CameraOutlined,UploadOutlined,StopOutlined} from '@ant-design/icons';
import {decodeQrPixels} from '../qr_reader';
import {CameraSession,type CameraPhase} from '../camera_session';
import {createOffer,offerPayload} from '../terminal_interconnect';
export function TerminalScanner({onDetected}:{onDetected:(value:string)=>void}){
 const video=useRef<HTMLVideoElement>(null),generation=useRef(0),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),mounted=useRef(true),session=useRef<CameraSession|null>(null),phaseRef=useRef<CameraPhase>('idle'),frameCallback=useRef<number|undefined>(undefined);
 const [phase,setPhase]=useState<CameraPhase>('idle'),[error,setError]=useState(''),[text,setText]=useState(''),[example,setExample]=useState('server');
 function stop(){generation.current++;clearTimeout(timer.current);session.current?.stop();}
 function interrupt(message:string){const running=phase!=='idle';stop();if(mounted.current&&running)setError(message);}
 useEffect(()=>{
  mounted.current=true;
  session.current=new CameraSession({
   acquire:()=>navigator.mediaDevices?.getUserMedia?navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:960}},audio:false}):Promise.reject({name:'UnsupportedCamera'}),
   attach:async media=>{const el=video.current;if(!el)throw Error('closed');el.srcObject=media;await el.play();},
   detach:()=>{clearTimeout(timer.current);const el=video.current;if(el){if(frameCallback.current!==undefined)el.cancelVideoFrameCallback?.(frameCallback.current);frameCallback.current=undefined;el.pause();el.srcObject=null;}},
   phase:p=>{phaseRef.current=p;if(mounted.current)setPhase(p);},error:message=>{generation.current++;if(mounted.current)setError(message);}
  });
  const leave=()=>{if(phaseRef.current==='idle')return;stop();if(mounted.current)setError('页面已离开前台，相机已关闭。返回后可重新扫码。');};
  const hidden=()=>{if(document.hidden)leave();};
  document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',leave);
  return()=>{mounted.current=false;document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',leave);stop();session.current=null;};
 },[]);
 function detected(value:string){stop();try{onDetected(value);}catch(e){if(mounted.current)setError((e as Error).message);}}
 async function start(){
  stop();const turn=generation.current;setError('');
  if(!navigator.mediaDevices?.getUserMedia){setError('当前环境不支持相机，请使用 HTTPS / localhost，或选择二维码图片。');return;}
  const opened=await session.current?.start();
  if(!opened||turn!==generation.current||!mounted.current)return;
  const el=video.current;if(!el){stop();return;}
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx){stop();setError('浏览器无法读取相机画面，请选择二维码图片。');return;}
  let lastPresented=-1,lastFrame=performance.now();
  // MediaStream的currentTime在无新帧时也可能前进，必须观察实际呈现帧。
  const presented=()=>{if(turn!==generation.current||!mounted.current)return;lastFrame=performance.now();frameCallback.current=el.requestVideoFrameCallback(presented);};
  if(el.requestVideoFrameCallback)frameCallback.current=el.requestVideoFrameCallback(presented);
  const read=()=>{try{
   if(turn!==generation.current||!mounted.current||!session.current?.active)return;
   if(el.readyState>=2&&el.videoWidth&&el.videoHeight){
    if(!el.requestVideoFrameCallback){const frames=el.getVideoPlaybackQuality?.().totalVideoFrames;if(frames!==undefined&&frames!==lastPresented){lastPresented=frames;lastFrame=performance.now();}}
    const scale=Math.min(1,960/el.videoWidth);canvas.width=Math.round(el.videoWidth*scale);canvas.height=Math.round(el.videoHeight*scale);ctx.drawImage(el,0,0,canvas.width,canvas.height);
    const value=decodeQrPixels(ctx.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height);if(value){detected(value);return;}
   }
   if(performance.now()-lastFrame>8000){stop();setError('相机画面已停止更新，已关闭采集，请重试。');return;}
   timer.current=setTimeout(read,180);
  }catch{stop();setError('图像采集已中断，请重试相机或选择二维码图片。');}};read();
 }
 async function image(file:File){stop();setError('');const turn=generation.current;if(file.size>10*1024*1024){setError('图片超过10MB，请选择较小的二维码图片。');return false;}const url=URL.createObjectURL(file);try{const img=new Image();img.src=url;await img.decode();if(!mounted.current||turn!==generation.current)return false;const scale=Math.min(1,1600/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error();ctx.drawImage(img,0,0,canvas.width,canvas.height);const value=decodeQrPixels(ctx.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height);if(!value)setError('图片中没有识别到二维码，请选择清晰图片。');else detected(value);}catch{if(mounted.current&&turn===generation.current)setError('图片无法读取，请选择 PNG、JPEG 或 WebP 图片。');}finally{URL.revokeObjectURL(url);}return false;}
 return <div className="terminal-scanner"><div className="terminal-camera"><video ref={video} muted playsInline aria-label="扫码相机画面" onError={()=>interrupt('相机画面无法播放，请重试。')}/><div className="terminal-camera-guide"/><span>{phase==='scanning'?'将服务端二维码放入框内':phase==='requesting'?'正在请求相机权限':'扫描 TinyBot 服务二维码'}</span></div><Space wrap><Button type="primary" icon={<CameraOutlined/>} disabled={phase!=='idle'} onClick={start}>{error?'重试相机':'打开相机'}</Button><Button icon={<StopOutlined/>} disabled={phase==='idle'} onClick={stop}>停止扫码</Button><Upload accept="image/png,image/jpeg,image/webp" maxCount={1} showUploadList={false} beforeUpload={image}><Button icon={<UploadOutlined/>}>选择二维码图片</Button></Upload></Space>{error&&<Alert type="warning" showIcon title={error}/>}<p className="muted small-text">图像只在当前浏览器中识别；识别后仍需核对服务与双方确认。</p><Input.TextArea aria-label="二维码内容" rows={3} placeholder="也可粘贴 TinyBot 二维码内容" value={text} onChange={e=>setText(e.target.value)}/><Button disabled={!text.trim()} onClick={()=>detected(text)}>识别二维码内容</Button><div className="terminal-scanner-example"><span>本地扫码演练</span><Select aria-label="扫码演练服务" value={example} onChange={setExample} options={[{value:'server',label:'TinyBot Server'},{value:'desktop',label:'TinyBot Desktop'}]}/><Button onClick={()=>detected(offerPayload(createOffer({name:example==='server'?'演练 Server':'演练 Desktop',target:example as 'server'|'desktop',endpoint:example==='server'?'https://server.tinybot.test':'http://192.168.3.8:8000'})))}>识别示例二维码</Button></div></div>;
}
