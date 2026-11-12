import {grokExpressions,grokExpressionEyes} from './grok_expressions.ts';
/** 情绪样式只包含受控图元参数；不能承载脚本、外链或任意SVG。 */
export type EmotionStyle={left:string;right:string;mouth:string;effect:string;motif:string;accent:string;intensity:number;tempo:number;tilt:number;grok_expression?:string};
export const eyeOptions=['open','wide','smile','closed','wink','sleepy','angry','sad','heart','star','cross','spiral','rolling'];
export const mouthOptions=['none','smile','laugh','frown','open','flat','kiss','tongue','teeth','wavy','zip','diagonal'];
export const effectOptions=['none','blush','tears','tear','sweat','hearts','sparkle','halo','anger','cloud','sleep','sick','hot','cold','glasses','monocle','party','crack','melt','money','mask','bandage','thermometer','nose','vomit','sneeze','horns','skull','crossbones','hug','cover-mouth','cover-eyes','cover-ears','shush','think','brow','dotted','sigh','shake','bags','stars','explosion','nerd','distort','fear','steam','swear','hundred','letter','arrow','ribbon','sparkle-heart','growing-heart','beat-heart','orbit-heart','two-hearts','heart-tile','heart-mark','broken-heart','fire-heart','heal-heart'];
export const eyeLabels=['圆眼','睁大','笑眼','闭眼','眨眼','半睁','愤怒','忧伤','爱心','星星','交叉','旋涡','上望'];
export const mouthLabels=['无嘴型','微笑','大笑','难过','张嘴','平静','亲吻','吐舌','露齿','波浪','拉链','斜嘴'];
export const effectLabels=['无','脸红','双泪','单泪','汗滴','爱心','闪光','光环','怒气','云雾','困倦','不适','热感','冷感','墨镜','单片眼镜','庆祝','裂纹','融化','财迷','口罩','绷带','体温计','长鼻','反胃','喷嚏','小角','骷髅','交叉骨','抱抱','捂嘴','遮眼','捂耳','嘘','思索','挑眉','虚线','叹气','震惊','眼袋','星环','爆炸','学究眼镜','扭曲','惊恐','鼻息','气话','满分','情书','爱心箭','心结','闪亮心','放大心','心跳','环绕心','双心','爱心框','心叹号','碎心','炽热心','治愈心'];
export function validateEmotionStyle(v:unknown):EmotionStyle{
 if(!v||typeof v!=='object'||Array.isArray(v))throw Error('情绪样式无效。');
 const o=v as Record<string,unknown>,keys=['left','right','mouth','effect','motif','accent','intensity','tempo','tilt'];
 if(Object.keys(o).some(k=>!keys.includes(k)&&k!=='grok_expression')||keys.some(k=>!(k in o))||!eyeOptions.includes(String(o.left))||!eyeOptions.includes(String(o.right))||!mouthOptions.includes(String(o.mouth))||!effectOptions.includes(String(o.effect))||!['face','cat','monkey','heart'].includes(String(o.motif))||!/^#[\da-fA-F]{6}$/.test(String(o.accent)))throw Error('情绪样式包含未知字段或图元。');
 for(const [k,min,max] of [['intensity',.3,1.5],['tempo',.3,2],['tilt',-180,180]] as const)if(typeof o[k]!=='number'||!Number.isFinite(o[k])||o[k]<min||o[k]>max)throw Error('情绪强度、节奏或角度超出范围。');
 if('grok_expression' in o&&!grokExpressions.some(e=>e.id===o.grok_expression))throw Error('LaoA表情ID无效。');
 return {...o} as EmotionStyle;
}
/** 所有眼型保持双眼各48点，供同一实时渲染器进行平滑变形。 */
export function emotionEyes(style:EmotionStyle):number[][][]{
 if(style.grok_expression){const index=grokExpressions.findIndex(e=>e.id===style.grok_expression);if(index>=0)return grokExpressionEyes[index].map(ring=>{const center=ring.reduce((a,p)=>[a[0]+p[0]/48,a[1]+p[1]/48],[0,0]);return ring.map(p=>p.map((v,k)=>center[k]+(v-center[k])*(.8+style.intensity*.2)));});}
 return [style.left,style.right].map((kind,index)=>Array.from({length:48},(_,i)=>{
  const a=i/48*Math.PI*2,cx=index?154:75,cy=96,k=style.intensity;let x=Math.cos(a)*13,y=Math.sin(a)*22;
  if(kind==='wide'){x*=1.25;y*=1.25;}
  if(['closed','wink','sleepy','smile','sad','angry'].includes(kind)){const xx=Math.cos(a);x=xx*18;y=Math.sin(a)*(['closed','wink'].includes(kind)?2:kind==='sleepy'?6:3)+(kind==='smile'?-1:kind==='sad'?1:0)*9*(1-xx*xx);if(kind==='angry')y+=xx*(index?8:-8);}
  if(kind==='heart'){x=16*Math.sin(a)**3;y=-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a));}
  if(kind==='star'){const r=i% (48/8)<3?20:10;x=Math.cos(a)*r;y=Math.sin(a)*r;}
  if(kind==='cross'){const r=6+15*Math.abs(Math.sin(a*2))**5;x=Math.cos(a)*r;y=Math.sin(a)*r;}
  if(kind==='spiral'){const r=8+i/48*9;x=Math.cos(a*2)*r;y=Math.sin(a*2)*r;}
  if(kind==='rolling')y-=10;
  return [cx+x*(.8+k*.2),cy+y*(.8+k*.2)];
 }));
}
const heart='<path d="M0 7C-24-7-11-23 0-12C11-23 24-7 0 7Z"/>';
/** 受控线条绘制情绪装饰；表情来自自有图元，不依赖系统Emoji字体。 */
export function emotionOverlay(c:EmotionStyle,time=0,reduce=false):string{
 const t=reduce?0:time*c.tempo,k=c.intensity,col=c.accent,f=c.effect;
 const line=(d:string,color='#edf4f1',width=5)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
 const ellipse=(x:number,y:number,rx:number,ry:number,fill=col)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
 const h=(x:number,y:number,scale=1)=>`<g fill="${col}" transform="translate(${x} ${y}) scale(${scale})">${heart}</g>`;
 let s='';
 const mouth:Record<string,string>={none:'',smile:line('M92 143Q114 164 136 143'),frown:line('M92 155Q114 135 136 155'),flat:line('M95 150H133'),diagonal:line('M95 144L133 157'),open:ellipse(114,150,12,18,'#edf4f1'),laugh:'<path d="M87 139Q114 151 141 139Q133 181 114 174Q95 175 87 139Z" fill="#edf4f1"/>',kiss:line('M107 142L121 149L107 156'),tongue:`${line('M91 143Q114 159 137 143')}<path d="M112 153V167Q126 182 134 165V150Z" fill="${col}"/>`,teeth:'<rect x="88" y="139" width="52" height="23" rx="8" fill="#edf4f1"/>'+line('M99 140V160M114 140V162M129 140V160M89 150H139','#424650',2),wavy:line('M87 152Q96 141 105 152T123 152T141 152'),zip:line('M88 150H140')+Array.from({length:7},(_,i)=>line(`M${92+i*7} 145V155`,'#edf4f1',3)).join('')};
 s+=`<g transform="translate(114 150) scale(${k}) translate(-114 -150)">${mouth[c.mouth]||''}</g>`;
 if(c.motif==='cat'){s+=`<path d="M30 48L28 0L76 30M153 29L201 0L200 48" fill="${col}"/>`+line('M13 129L57 135M14 148L55 144M173 135L214 128M174 144L215 151',col,3);}
 if(c.motif==='monkey')s+=ellipse(18,105,17,23,'#b29580')+ellipse(211,105,17,23,'#b29580');
 if(c.motif==='heart')s+=h(114,201,1.3);
 if(f==='blush')s+=ellipse(49,128,17,8)+ellipse(180,128,17,8);
 if(['tear','tears','sweat','fear'].includes(f))for(const x of f==='tears'?[58,173]:f==='sweat'?[190]:[61])s+=`<path d="M${x} ${f==='sweat'?53:111}q-19 28 0 31q19-3 0-31" fill="#95dbe8" transform="translate(0 ${reduce?0:Math.sin(t*4)*3})"/>`;
 if(['hearts','two-hearts','orbit-heart','sparkle-heart','growing-heart','beat-heart','heart-tile','heart-mark','broken-heart','fire-heart','heal-heart','letter','arrow','ribbon'].includes(f)){
  const scale=(f==='growing-heart'?1.3:f==='beat-heart'?1+Math.sin(t*5)*.15:1)*k;
  if(f==='heart-tile')s+='<rect x="172" y="21" width="51" height="54" rx="10" fill="#7f6ba2"/>';
  s+=h(198+(f==='orbit-heart'?Math.sin(t*2)*9:0),58,scale);
  if(['hearts','two-hearts','orbit-heart'].includes(f))s+=h(31,37,.6);
  if(f==='sparkle-heart')s+=line('M171 24V36M165 30H177M219 65V77M213 71H225',col,3);
  if(f==='broken-heart')s+=line('M198 40L190 48L202 55L194 63','#262d3a',4);
  if(f==='heal-heart')s+='<rect x="180" y="44" width="34" height="11" rx="3" fill="#eddfbd" transform="rotate(-30 198 50)"/>';
  if(f==='fire-heart')s+=line('M180 60Q169 47 177 28Q184 38 183 16Q212 20 219 44', '#fbb65b',5);
  if(f==='arrow')s+=line('M171 71L224 22M211 23L224 22L223 35',col,4);
  if(f==='ribbon')s+=line('M179 48H216M198 32V65M198 48Q174 25 184 25Q198 22 198 48Q222 25 212 25Q198 22 198 48','#f5d97d',4);
  if(f==='heart-mark')s+=ellipse(198,77,3,3);
  if(f==='letter')s+='<path d="M174 62V83H221V62L198 76Z" fill="#ece7e2"/>';
 }
 if(['anger','swear'].includes(f))s+=line('M187 34V44H177M199 34V44H209M187 66V56H177M199 66V56H209',col,5);
 if(f==='swear')s+=line('M98 147L104 157M101 144L97 160M121 147V157M116 152H127',col,3);
 if(['sparkle','stars','party','explosion'].includes(f)){s+=line('M25 30V54M13 42H37M193 14V34M183 24H203',col,4);if(f==='explosion')s+=`<path d="M70 13L61-13L94-4L111-29L126-3L158-16L152 16" fill="${col}"/>`;if(f==='party')s+=`<path d="M77 13L100-36L135 17Z" fill="${col}"/>`+line('M163 13L177 6M14 75L1 63M216 85L233 72',col,4);if(f==='stars')s+=`<ellipse cx="114" cy="35" rx="100" ry="22" fill="none" stroke="${col}" stroke-width="3" transform="rotate(${reduce?0:t*20} 114 35)"/>`;}
 if(f==='halo')s+='<ellipse cx="114" cy="4" rx="55" ry="14" fill="none" stroke="#f2d67a" stroke-width="6"/>';
 if(['glasses','nerd','monocle'].includes(f)){s+=`<g stroke="#394250" stroke-width="5" fill="${f==='glasses'?'#394250':'none'}">${f!=='monocle'?'<rect x="47" y="75" width="57" height="42" rx="15"/><path d="M105 90H124"/>':''}<rect x="125" y="75" width="57" height="42" rx="15"/></g>`;}
 if(['mask','cover-mouth','sneeze'].includes(f))s+=`<path d="M82 131Q114 140 146 131L140 170Q114 181 88 170Z" fill="${f==='cover-mouth'?col:'#d4e7e7'}"/>`+line('M91 146H138M93 156H136','#98b4b7',2);
 if(f==='cover-eyes')s+=`<path d="M34 94Q32 63 47 66L93 104L84 120ZM143 104L181 65Q195 61 195 94L154 120Z" fill="${col}"/>`;
 if(f==='cover-ears'||f==='hug'||f==='fear')s+=`<path d="M22 113Q-5 88 9 80Q25 79 40 115L49 147L29 152ZM187 116Q201 80 218 80Q237 91 207 115L199 151L179 145Z" fill="${col}"/>`;
 if(f==='shush')s+='<rect x="109" y="133" width="11" height="47" rx="5" fill="#eccdb3"/>';
 if(f==='think')s+=line('M115 172L137 163L154 171M139 163V150',col,9);
 if(f==='brow')s+=line('M130 61Q155 43 177 61');
 if(f==='bags')s+=line('M55 125Q74 135 95 126M134 126Q155 136 174 125',col,5);
 if(f==='sleep')s+=line('M167 15H186L167 34H186M194 37H207L194 50H207','#c0c8f3',4);
 if(f==='bandage')s+='<path d="M25 39L202 64L207 38L37 15Z" fill="#ebe3d4"/>';
 if(f==='thermometer')s+='<rect x="128" y="149" width="54" height="9" rx="4" fill="#e8e5df" transform="rotate(30 128 149)"/>'+line('M153 168L169 177','#f38a9c',4);
 if(['hot','cold','sick','vomit'].includes(f)){s+=ellipse(47,134,15,8,f==='hot'?'#f08468':f==='cold'?'#99dbed':'#b0c88e');s+=ellipse(181,134,15,8,f==='hot'?'#f08468':f==='cold'?'#99dbed':'#b0c88e');if(f==='vomit')s+='<path d="M102 158V198Q116 215 135 196L130 158Z" fill="#a6c08b"/>';if(f==='cold')s+=line('M185 30V54M174 36L195 49M174 49L195 36','#b2e9f6',3);}
 if(f==='horns')s+=`<path d="M25 42L35-15L65 27M166 27L195-15L203 42" fill="${col}"/>`;
 if(['skull','crossbones'].includes(f))s+=line('M102 121L114 109L126 121Z',col,4)+(f==='crossbones'?line('M72 180L157 218M157 180L72 218',col,10):'');
 if(f==='crack')s+=line('M114 20L102 59L121 81L106 118', '#324454',4);
 if(f==='melt')s+=`<path d="M51 188Q25 213 44 223Q63 235 75 211Q104 247 124 216Q171 238 186 203" fill="${col}"/>`;
 if(f==='dotted')s+='<ellipse cx="114" cy="111" rx="100" ry="95" fill="none" stroke="#edf4f1" stroke-dasharray="4 8" stroke-width="3"/>';
 if(f==='cloud'||f==='sigh'||f==='steam')s+=`<path d="M40 146Q-12 127-7 153Q-29 167-6 177Q16 199 42 171M188 148Q228 132 237 151Q260 161 239 179Q218 197 188 174" fill="#d9e5eb" opacity=".75"/>`;
 if(f==='shake'||f==='distort')s+=line('M13 61Q0 94 12 128M218 61Q233 94 220 128',col,4);
 if(f==='nose')s+=`<path d="M111 122L180 119L181 132L111 130Z" fill="${col}"/>`;
 if(f==='money')s+=line('M68 72V116M82 77Q56 72 72 93Q92 112 61 108M148 72V116M164 77Q138 72 154 93Q174 112 143 108',col,4);
 if(f==='hundred')s+=line('M32 29V6M44 7Q30-1 36 22Q48 32 50 9M63 7Q49-1 55 22Q67 32 69 9M29 36L72 28',col,4);
 return `<g data-emotion-effect="${f}">${s}</g>`;
}
