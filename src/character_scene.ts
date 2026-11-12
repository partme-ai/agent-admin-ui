import {resolveCharacterColor,characterEyeColor} from './character_colors.ts';
import {labCharacter} from './grok_customizer.ts';
import {grokExpressionEyes,neutralFrontExpressionIndex} from './grok_expressions.ts';
import {characterData,expressionIndex,normalizeCharacter,type CharacterConfig,type EyeRings} from './character_config.ts';
/** 同拓扑轮廓插值，源自LaoA-GrokBot的双眼48点数据。 */
export function blendEyes(a:EyeRings,b:EyeRings,t:number):EyeRings{if(t<=0)return structuredClone(a);if(t>=1)return structuredClone(b);return a.map((ring,i)=>ring.map((p,j)=>p.map((n,k)=>n+(b[i][j][k]-n)*Math.max(0,Math.min(1,t)))));}
const path=(ring:number[][])=>'M'+ring.map(p=>p.map(v=>v.toFixed(2)).join(' ')).join('L')+'Z';
export type SceneOptions={eyes?:EyeRings;gazeX?:number;gazeY?:number;blink?:number;maskId?:string;reduce?:boolean};
/** 统一场景用于实时SVG、PNG及设备帧烘焙，避免另写导出图形导致外观分叉。 */
export function sceneSvg(value:CharacterConfig,time=0,options:SceneOptions={}):string{
 const c=labCharacter(value),shape=characterData.SHAPES.find(s=>s[0]===c.shape)![2],color=resolveCharacterColor(c.color)[2];
 const eyes=options.eyes||grokExpressionEyes[expressionIndex(c,time)],id=(options.maskId||'character-mask').replace(/[^a-zA-Z0-9_-]/g,''),parts=new Set(c.parts),items=new Set(c.accessories);
 const moving=!options.reduce,t=moving?time:0,s=Math.sin(t*Math.PI*2),pulse=Math.sin(t*Math.PI),duration=c.action==='wave'?1.35:c.action==='pinch'?1.2:.95,u=Math.min(1,t/duration),wave=Math.sin(u*Math.PI),active=moving&&t<duration;
 let transform='';
 if(['excited','happy','laughing','playful','celebrate','bouncing'].includes(c.state))transform=`translate(0 ${-Math.abs(s)*6})`;
 else if(['thinking','curious','confused','shy','dragging','listening'].includes(c.state))transform=`rotate(${pulse*4} 114 114)`;
 else if(['sleeping','drowsy','humming','loading','progress','powering-down'].includes(c.state))transform=`translate(114 114) scale(${1+pulse*.025} ${1-pulse*.025}) translate(-114 -114)`;
 else if(['orbit','spawning','sending','receiving'].includes(c.state))transform=`translate(114 114) scale(${.87+.13*Math.cos(t*2)} 1) translate(-114 -114)`;
 else if(['scared','alerting','angry'].includes(c.state))transform=`translate(${Math.sin(t*35)*1.5} 0)`;
 if(active&&c.action!=='none'){
  if(c.action==='nod')transform=`translate(0 ${wave*6}) translate(114 114) scale(1 ${1-wave*.06}) translate(-114 -114)`;
  if(c.action==='bounce')transform=`translate(0 ${-wave*24})`;
  if(c.action==='shake')transform=`rotate(${Math.sin(u*Math.PI*6)*12*(1-u)} 114 114)`;
  if(c.action==='peek')transform=`translate(${Math.sin(u*Math.PI*2)*27} 0) rotate(${s*6} 114 114)`;
  if(['pinch','squish'].includes(c.action))transform=`translate(114 160) scale(${c.action==='pinch'?1-wave*.3:1+wave*.2} ${c.action==='pinch'?1+wave*.12:1-wave*.25}) translate(-114 -160)`;
 }
 let back='',bodyParts='',front='';
 if(items.has('cape'))back='<path fill="#7657d8" d="M25 79Q-2 119 13 210Q65 192 90 168ZM204 79Q231 119 216 210Q164 192 139 168Z"/>';
 if(parts.has('antenna'))bodyParts+='<path d="M114 18V-5"/><circle cx="114" cy="-12" r="8" fill="currentColor"/>';
 if(parts.has('tail'))bodyParts+='<path d="M205 154C246 151 254 181 230 198C216 208 214 220 227 228"/>';
 if(parts.has('hands')||c.action==='wave'){bodyParts+='<g><path d="M25 132C5 136-8 148-17 165"/><circle cx="-20" cy="170" r="10" fill="currentColor"/></g>';bodyParts+=`<g transform="rotate(${active&&c.action==='wave'?Math.sin(u*Math.PI*5)*-45:0} 204 132)"><path d="M204 132C224 136 237 148 246 165"/><circle cx="249" cy="170" r="10" fill="currentColor"/></g>`;}
 if(parts.has('feet'))bodyParts+='<path d="M72 202V224M157 202V224"/><ellipse cx="62" cy="230" rx="24" ry="10" fill="currentColor"/><ellipse cx="167" cy="230" rx="24" ry="10" fill="currentColor"/>';
 if(items.has('straw-hat'))front+='<g fill="#e9bd57" stroke="#b57b24" stroke-width="3"><path d="M63 28Q72-24 114-28Q156-24 165 28Z"/><ellipse cx="114" cy="31" rx="91" ry="18"/><path fill="#d94b5d" stroke="none" d="M64 10Q114 22 164 10L166 27Q114 38 62 27Z"/></g>';
 if(items.has('glasses'))front+='<g fill="none" stroke="#171813" stroke-width="8"><circle cx="72" cy="108" r="37"/><circle cx="157" cy="108" r="37"/><path d="M109 106Q114 99 120 106M35 102L12 94M194 102L217 94"/></g>';
 if(items.has('bowtie'))front+='<g fill="#ff2d8b"><path d="M114 172L78 151Q62 143 64 176Q65 205 82 194L114 178ZM114 172L150 151Q166 143 164 176Q163 205 146 194L114 178Z"/><circle cx="114" cy="175" r="12"/></g>';
 const blinkRange=(characterData.BLINK as Record<string,number[]|null>)[c.state];const period=blinkRange?(blinkRange[0]+blinkRange[1])/2000:0,phase=period?t%period:2,blink=options.blink??(moving&&period&&phase<.32?Math.max(.04,Math.abs(phase/.16-1)):1);
 const glance=active&&c.action==='look_left'?-12*wave:active&&c.action==='look_right'?12*wave:0;
 const frontFacing=c.expression===neutralFrontExpressionIndex&&c.state==='idle'&&c.action==='none';
 // 默认等候始终正视前方，鼠标经过预览时不改变视线；其他表情继续跟随。
 const gx=frontFacing?0:Math.max(-15,Math.min(15,(options.gazeX||0)+glance)),gy=frontFacing?0:Math.max(-10,Math.min(10,options.gazeY||0));
 const eyeMarkup=eyes.map(ring=>{const center=ring.reduce((a,p)=>[a[0]+p[0]/ring.length,a[1]+p[1]/ring.length],[0,0]);const scan=['searching','working','radar','dictating','writing','uploading'].includes(c.state)&&moving?Math.sin(t*3)*7:0;return `<path d="${path(ring)}" transform="translate(${gx+scan} ${gy+center[1]*(1-blink)}) scale(1 ${blink})"/>`;}).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-32 -44 294 310" width="294" height="310"><defs><clipPath id="${id}"><path d="${shape}"/></clipPath></defs><g transform="${transform}">${back}<g color="${color}" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">${bodyParts}</g><path fill="${color}" d="${shape}"/><g transform="rotate(0 114 111)"><g fill="${characterEyeColor(c.color)}" clip-path="url(#${id})">${eyeMarkup}</g></g>${front}</g></svg>`;
}
