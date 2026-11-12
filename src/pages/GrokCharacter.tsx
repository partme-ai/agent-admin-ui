import {grokExpressionEyes,grokExpressions,grokPool} from '../grok_expressions';
import {labCharacter} from '../grok_customizer';
import {useEffect,useId,useRef} from 'react';
import {characterData,normalizeCharacter,type CharacterConfig,type EyeRings} from '../character_config';
import {sceneSvg,blendEyes} from '../character_scene';
import './character.css';
/** 可定制形象实时渲染；每个实例独立管理RAF、表情池、视线与眨眼。 */
export function GrokCharacter({config,animate=true,actionNonce=0}:{config:CharacterConfig;animate?:boolean;actionNonce?:number}){
 const root=useRef<HTMLDivElement>(null),lastEyes=useRef<EyeRings|null>(null),id=useId().replace(/[^a-zA-Z0-9]/g,''),key=JSON.stringify(config);
 useEffect(()=>{
  const el=root.current;if(!el)return;const c=labCharacter(config),media=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,closed=false,start=performance.now(),last=start,blinkStart=-1000,nextBlink=start+3500,nextExpression=start,index=c.expression>=0?c.expression:grokPool(c.state)[0],from=lastEyes.current||grokExpressionEyes[index],target=grokExpressionEyes[index],morph=0,velocity=0,gazeX=0,gazeY=0;
  const range=(a:number[])=>a[0]+Math.random()*(a[1]-a[0]);
  const render=(now:number)=>{
   const elapsed=(now-start)/1000,dt=Math.min(.04,Math.max(0,(now-last)/1000));last=now;
   if(c.expression<0&&now>=nextExpression){const pool=grokPool(c.state),possible=pool.filter(i=>i!==index);from=lastEyes.current||target;index=possible.length?possible[Math.floor(Math.random()*possible.length)]:pool[0];target=grokExpressionEyes[index];morph=0;velocity=0;nextExpression=now+range((characterData.EXPR_CADENCE as Record<string,number[]>)[c.state]||[4000,8000]);}
   velocity+=(-14*velocity-49*(morph-1))*dt;morph+=velocity*dt;
   if(media.matches||!animate)morph=1;
   const eyes=blendEyes(from,target,morph);lastEyes.current=eyes;
   const blinkRange=(characterData.BLINK as Record<string,number[]|null>)[c.state];if(blinkRange&&now>=nextBlink){blinkStart=now;nextBlink=now+range(blinkRange);}
   const b=(now-blinkStart)/320,blink=b>=0&&b<1?Math.max(.04,Math.abs(b*2-1)):1;
   el.innerHTML=sceneSvg(c,elapsed,{eyes,gazeX,gazeY,blink:media.matches?1:blink,maskId:id,reduce:media.matches||!animate});el.dataset.expression=String(index);el.dataset.grokExpression=grokExpressions[index].id;
  };
  const loop=(now:number)=>{if(closed||document.hidden)return;render(now);frame=requestAnimationFrame(loop);};
  const resume=()=>{cancelAnimationFrame(frame);last=performance.now();if(!document.hidden&&animate&&!media.matches)frame=requestAnimationFrame(loop);else render(last);};
  const move=(e:PointerEvent)=>{const box=el.getBoundingClientRect();gazeX=Math.max(-15,Math.min(15,((e.clientX-box.left)/box.width-.5)*30));gazeY=Math.max(-10,Math.min(10,((e.clientY-box.top)/box.height-.5)*20));};
  const leave=()=>{gazeX=0;gazeY=0;},blink=()=>{blinkStart=performance.now();};
  el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);el.addEventListener('pointerdown',blink);document.addEventListener('visibilitychange',resume);media.addEventListener('change',resume);render(start);resume();
  return()=>{closed=true;cancelAnimationFrame(frame);el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave);el.removeEventListener('pointerdown',blink);document.removeEventListener('visibilitychange',resume);media.removeEventListener('change',resume);};
 },[key,animate,actionNonce,id]);
 return <div ref={root} className="grok-character" role="img" aria-label={`可定制角色：${config.name}`} data-pack="grok" data-state={config.state}/>;
}
