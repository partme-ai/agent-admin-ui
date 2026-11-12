import {trialEmotionCharacter} from '../emotion_sets';
import {useEmotionSets} from '../use_emotion_sets';
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import type {TrialDeviceProfile,TrialPhase} from '../robot_trial';
import {GrokCharacter} from './GrokCharacter';
import {labCharacter,legacyExpressionCharacter} from '../grok_customizer';
import {legacyFaceMappings} from '../legacy_expression_mapping';
import {normalizeCharacter,stateForTrial,type CharacterConfig} from '../character_config';
import {trialPhaseLabel} from '../robot_trial';
import {robotScreenLayout} from '../robot_screen_layout';

/** 设备屏幕是试聊的主视图；表情、字幕与语音状态使用同一轮次。 */
export function RobotScreen({profile,phase,subtitle,speaker,voiceName,expression=null,dialogueExpression,appearance}:{appearance?:CharacterConfig;dialogueExpression?:string;expression?:string|null;profile:TrialDeviceProfile;phase:TrialPhase;subtitle:string;speaker:string;voiceName:string}){
 const library=useEmotionSets(),base=labCharacter(trialEmotionCharacter(normalizeCharacter(appearance),phase,dialogueExpression||'',library.sets));
 const selected=expression||(phase==='speaking'?dialogueExpression:'');
 const mapped=selected&&legacyFaceMappings.some(x=>x.id===selected)?legacyExpressionCharacter(base,selected):null,character=mapped||base;
 const layout=robotScreenLayout(profile),display=useRef<HTMLDivElement>(null),subtitles=useRef<HTMLDivElement>(null),[scale,setScale]=useState(Math.min(1,360/profile.width));
 useLayoutEffect(()=>{const element=display.current;if(!element)return;const resize=()=>setScale(element.getBoundingClientRect().width/profile.width);resize();const observer=new ResizeObserver(resize);observer.observe(element);return()=>observer.disconnect();},[profile.id,profile.width]);
 useEffect(()=>{subtitles.current?.scrollTo({top:subtitles.current.scrollHeight});},[subtitle,profile.id]);
 return <div className={`robot-device screen-preview device-shape-${profile.shape}`} data-profile={profile.id} style={{'--screen-preview-width':`${layout.previewWidth}px`} as CSSProperties}>
  <div ref={display} className={`robot-display phase-${phase}`} role="region" aria-label="模拟机器人屏幕" aria-description={`${trialPhaseLabel[phase]} · ${speaker} · ${voiceName}`} style={{aspectRatio:`${profile.width} / ${profile.height}`}}>
   <div className="robot-screen-canvas" data-native-width={profile.width} data-native-height={profile.height} data-scale={scale.toFixed(4)} style={{width:layout.width,height:layout.height,transform:`scale(${scale})`}}>
    <div className="robot-screen-face" style={{left:layout.face.x,top:layout.face.y,width:layout.face.width,height:layout.face.height}}>
     <GrokCharacter config={{...character,state:mapped?character.state:phase==='idle'?character.state:stateForTrial(phase,dialogueExpression),expression:mapped||phase==='idle'||phase==='stopped'?character.expression:-1,action:mapped?character.action:'none'}}/>
    </div>
    <div className="robot-screen-caption" ref={subtitles} aria-live="polite" style={{left:layout.caption.x,top:layout.caption.y,width:layout.caption.width,height:layout.caption.height,fontSize:layout.fontSize,lineHeight:`${layout.lineHeight}px`}}><p>{subtitle}</p></div>
   </div>
  </div>
 </div>;
}
