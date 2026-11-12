import {AudioOutlined} from '@ant-design/icons';
import type {CaptureSnapshot} from '../microphone_capture';
import './microphone_input.css';
/** 实时波形来自当前PCM；静音保持平直，不以固定动画伪装输入。 */
export function MicrophoneInput({capture}:{capture:CaptureSnapshot}){
 const active=capture.phase==='recording';
 const label=capture.phase==='requesting'?'等待麦克风授权':active?'麦克风采集中':capture.phase==='error'?'采集已中断':capture.phase==='stopped'&&capture.samples?'采集已结束':'麦克风未开启';
 return <div className={`microphone-input mic-${capture.phase}`} aria-label="麦克风采集状态">
  <div className="microphone-meter-row"><AudioOutlined/><svg className="microphone-wave" viewBox="0 0 192 30" role="img" aria-label="麦克风输入波形">{capture.waveform.map((peak,i)=>{const height=active?Math.max(2,Math.min(28,peak*70)):2;return <rect key={i} x={i*6+1} y={(30-height)/2} width="3" height={height} rx="1.5"/>;})}</svg><span role="meter" aria-label="麦克风输入音量" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(capture.level)}>{Math.round(capture.level)}%</span></div>
  <div className="microphone-info"><span role="status">{label}</span><span>{capture.samples?`${(capture.durationMs/1000).toFixed(1)}s · ${(capture.sampleRate/1000).toFixed(1).replace('.0','')}kHz · 单声道`:capture.phase==='requesting'?'可随时取消':active?'等待音频输入':'点击开始连续试聊'}</span></div>
  <p>{active?'本地自动收句，音频不上传。':capture.phase==='error'?'资源已释放，检查后可重试；不会自动录音。':capture.phase==='stopped'&&capture.samples?'麦克风已释放；可用文字测试模拟回应。':'采集不上传，结束后释放麦克风。'}</p>
 </div>;
}
