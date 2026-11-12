import type {EyeShape,MouthShape,RobotExpression} from '../robot_expressions';
import './robot_face.css';
const eyes:Record<EyeShape,string>={open:'M-9-20 Q-18-20-18-9 V11 Q-18 23-7 23 H7 Q18 23 18 11 V-9 Q18-20 9-20Z',happy:'M-19 7 Q0-22 19 7',closed:'M-18 2 Q0 17 18 2',heart:'M0 16 C-32-2-14-29 0-13 C14-29 32-2 0 16Z',star:'M0-23 7-7 24-7 11 4 16 22 0 12-16 22-11 4-24-7-7-7Z',droop:'M-18-7 Q0 7 18-7 V13 Q16 25 5 25 H-5 Q-18 25-18 13Z',angry:'M-19-18 19-4 V13 Q19 23 8 23 H-8 Q-19 23-19 13Z',wide:'M0-26 C28-26 28 28 0 28 C-28 28-28-26 0-26Z',spiral:'M-3 6 C-18 6-14-13 0-13 C23-13 23 20 0 20 C-33 20-29-28 3-28',dot:'M0-9 A9 9 0 1 0 .1-9Z',sleepy:'M-18 1 H18 V9 Q18 21 7 21 H-7 Q-18 21-18 9Z',worried:'M-18-7 Q-2-22 18-15 V12 Q18 24 6 24 H-6 Q-18 24-18 12Z'};
const mouths:Record<Exclude<MouthShape,'talking'>,string>={smile:'M111 105 Q130 128 149 105',grin:'M107 103 Q130 130 153 103Z',laugh:'M109 100 Q130 107 151 100 Q150 133 130 133 Q110 133 109 100Z',flat:'M115 112 H145',sad:'M113 119 Q130 98 147 119',wavy:'M109 114 Q116 104 123 114 T137 114 T151 114',o:'M130 104 A9 12 0 1 0 130.1 104Z',small:'M122 111 Q130 116 138 111',kiss:'M124 104 136 109 124 114 136 119',cat:'M112 107 Q119 124 130 110 Q141 124 148 107',frown:'M111 120 Q130 102 149 120Z'};
function Eye({shape,x,mirror=false}:{shape:EyeShape;x:number;mirror?:boolean}){const stroke=['happy','closed','spiral'].includes(shape);return <g transform={`translate(${x} 61) scale(${mirror?-1:1} 1)`}><path d={eyes[shape]} fill={stroke?'none':'currentColor'} stroke={stroke?'currentColor':'none'} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/></g>;}
const heart='M0 8 C-18-2-8-18 0-8 C8-18 18-2 0 8Z';
/** 共享SVG表情；目录缩略图不播放动画，主屏幕支持减少动态效果偏好。 */
export function RobotFace({expression:e,mini=false}:{expression:RobotExpression;mini?:boolean}){
 return <svg className={`robot-expression robot-face face-${e.id} motion-${e.motion} ${mini?'face-mini':''}`} viewBox="0 0 260 160" role="img" aria-label={`机器人表情：${e.name}`} data-expression={e.id}>
  <title>{e.name}</title>
  <g className="face-pose">
   <g className="face-eyes"><Eye shape={e.left} x={72}/><Eye shape={e.right} x={188} mirror/>{e.id==='wink'&&<path className="face-stroke" d="M43 48 35 42 M43 62 32 61"/>}</g>
   {e.mouth==='talking'?<g className="face-mouth-bars">{[0,1,2,3,4].map(v=><rect key={v} x={109+v*9} y={104-v%3*3} width="5" height={12+v%3*6} rx="2.5"/>)}</g>:<path className={`face-mouth mouth-${e.mouth}`} d={mouths[e.mouth]} fill={['grin','laugh','frown'].includes(e.mouth)?'currentColor':'none'}/>}
   <g className={`face-fx fx-${e.effect}`}>
    {e.effect==='blush'&&<><ellipse cx="38" cy="94" rx="15" ry="5"/><ellipse cx="222" cy="94" rx="15" ry="5"/></>}
    {e.effect==='hearts'&&<><path d={heart} transform="translate(29 30) scale(.9)"/><path d={heart} transform="translate(230 29) scale(.65)"/></>}
    {e.effect==='hug'&&<g className="face-stroke"><path d="M29 101 Q9 125 50 137 L69 128 M231 101 Q251 125 210 137 L191 128"/></g>}
    {['tears','streams'].includes(e.effect)&&[58,202].map(x=><g className="face-tear" key={x}>{e.effect==='streams'?<path d={`M${x-5} 82 Q${x} 94 ${x+5} 82 L${x+4} 138 Q${x} 145 ${x-4} 138Z`}/>:<path d={`M${x} 88 Q${x-13} 110 ${x} 112 Q${x+13} 110 ${x} 88Z`}/>}</g>)}
    {['stars','sparkle'].includes(e.effect)&&[28,230].map((x,i)=><path key={x} d={e.effect==='stars'?'M0-12 4-4 13-3 6 3 8 12 0 7-8 12-6 3-13-3-4-4Z':'M0-14 4-4 14 0 4 4 0 14-4 4-14 0-4-4Z'} transform={`translate(${x} ${i?86:25}) scale(${i?.7:1})`}/>)}
    {e.effect==='sweat'&&<path d="M223 28 Q207 52 223 54 Q239 52 223 28Z"/>}
    {e.effect==='drool'&&<path d="M140 122 Q147 117 147 127 V142 Q140 150 137 141Z"/>}
    {e.effect==='zzz'&&<g className="face-stroke"><path d="M211 30 H225 L211 43 H225 M231 11 H245 L231 24 H245"/></g>}
    {e.effect==='question'&&<g className="face-stroke"><path d="M220 24 C220 11 240 11 240 25 Q240 32 231 35 V39 M231 47 V48"/></g>}
    {e.effect==='exclaim'&&<g className="face-stroke"><path d="M231 15 V33 M231 44 V45"/></g>}
    {e.effect==='music'&&<g className="face-stroke"><path d="M222 42 V18 L239 14 V36"/><ellipse cx="215" cy="43" rx="7" ry="5"/><ellipse cx="232" cy="37" rx="7" ry="5"/></g>}
    {e.effect==='broken'&&<><path d="M29 117 C7 105 18 88 28 99 L25 106 33 109 29 117Z"/><path d="M34 116 37 107 30 104 34 98 C48 88 56 106 34 116Z"/></>}
   </g>
  </g>
 </svg>;
}
