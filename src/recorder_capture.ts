import './vendor/recorder/recorder-core.js';
import type {CaptureContext,CaptureEnvironment,RecorderOptions,RecorderPort} from './microphone_capture';
type RecorderApi={ (options:RecorderOptions):RecorderPort;GetContext:(create:boolean)=>AudioContext|null;CloseNewCtx:(context:CaptureContext)=>void };
/** 使用本地锁定的Recorder源码，不从CDN加载，也不调用模型服务。 */
export function browserCaptureEnvironment():CaptureEnvironment{
 const policy=(document as Document&{permissionsPolicy?:{allowsFeature:(name:string)=>boolean};featurePolicy?:{allowsFeature:(name:string)=>boolean}});
 const microphoneAllowed=()=>{const value=policy.permissionsPolicy||policy.featurePolicy;return !value||value.allowsFeature('microphone');};
 const Recorder=(window as typeof window&{Recorder:RecorderApi}).Recorder;
 return {
  preflight:()=>!microphoneAllowed()?'当前嵌入页面不允许访问麦克风。请在独立页面打开试聊，或联系管理员。':!window.isSecureContext?'麦克风需要安全页面。请使用 HTTPS 或本机 localhost 地址。':!navigator.mediaDevices?.getUserMedia?'当前浏览器不支持麦克风采集，请使用新版 Chrome、Edge 或 Safari。':'',
  getStream:()=>navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false}),
  createContext:()=>{const context=Recorder.GetContext(true);if(!context)throw new Error('AudioContext unavailable');if(context.state==='suspended')void context.resume().catch(()=>{});return context;},
  closeContext:context=>Recorder.CloseNewCtx(context),
  createRecorder:options=>Recorder(options)
 };
}
