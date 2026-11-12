import upstream from './vendor/laoa_grokbot/data.json' with {type:'json'};
/** TinyBot展示名称，依据原轮廓与状态池命名；不是上游官方命名，不改变原数据、编号或状态池。 */
const upstreamNames=[
 '安静待机','认真聆听','欢欣鼓舞','惊讶睁眼','倦意半睁',
 '犹豫侧目','平和注视','凝神怒视','若有所思','好奇探看',
 '专注聆听','开怀畅笑','灵动打量','安然闭目','怀疑挑眉',
 '自信侧望','严肃凝视','笑意弯弯','惊奇注视','轻松愉悦',
 '振奋期待','惊喜睁圆','困倦眯眼','调皮侧眼','害羞低眉'
];
/** LaoA风格扩展参数：复用原轮廓的有机边缘，保持双眼各48点拓扑。 */
type Eye={w:number;h:number;tilt?:number;dy?:number};
const eye=(w:number,h:number,tilt=0,dy=0):Eye=>({w,h,tilt,dy});
const soft=(w=31,h=48,tilt=0,dy=0)=>eye(w,h,tilt,dy);
type Definition={id:string;name:string;group:string;state:string;emoji:string;left:Eye;right:Eye};
const definitions:Definition[]=[];
const add=(id:string,name:string,group:string,state:string,emoji:string,left:Eye,right:Eye=left)=>definitions.push({id,name,group,state,emoji,left,right});
// 参数逐项表达不同感受；不按编号随机扭曲，也不修改vendor原版数据。
add('gentle','温柔微笑','喜悦','happy','🙂',soft(38,10));
add('beaming','眉开眼笑','喜悦','happy','😄',soft(49,9,-3),soft(49,9,3));
add('delighted','喜出望外','喜悦','excited','😃',soft(40,62,-8),soft(36,58,8));
add('giggle','忍不住笑','喜悦','laughing','🤭',soft(44,6,-5,3),soft(38,7,7,0));
add('belly-laugh','开怀大笑','喜悦','laughing','😆',soft(53,7,-10),soft(53,7,10));
add('joyful-tears','喜极而泣','喜悦','laughing','😂',soft(46,11,-4),soft(48,10,5));
add('content','心满意足','喜悦','happy','😌',soft(35,5,0,7),soft(35,5,0,7));
add('sunny','阳光灿烂','喜悦','excited','😀',soft(36,57,-5),soft(45,17,5));
add('wink-left','左眼眨眼','俏皮','playful','😉',soft(42,5,10),soft(34,53,-6));
add('wink-right','右眼眨眼','俏皮','playful','😜',soft(34,53,6),soft(42,5,-10));
add('cheeky','调皮坏笑','俏皮','playful','😛',soft(39,14,14),soft(32,44,-14));
add('mischief','狡黠一笑','俏皮','playful','😏',soft(43,13,13),soft(42,9,-10));
add('silly','古灵精怪','俏皮','playful','🤪',soft(41,61,13),soft(31,9,-15,9));
add('smug','小小得意','俏皮','proud','😎',soft(42,16,8,-3),soft(40,8,-8,5));
add('teasing','俏皮挑眉','俏皮','playful','😝',soft(33,58,-16,-9),soft(43,8,-8,5));
add('bashful-wink','害羞眨眼','俏皮','shy','😙',soft(37,6,12,6),soft(26,43,-12,4));
add('bashful','羞涩低眉','亲近','shy','😊',soft(31,10,9,10),soft(31,10,-9,10));
add('adoring','满眼喜欢','亲近','shy','🥰',soft(36,37),soft(36,37));
add('heart-eyes','心动眼睛','亲近','shy','😍',soft(45,46,-8),soft(45,46,8));
add('sparkle-eyes','惊喜注视','亲近','excited','🤩',soft(43,43),soft(43,43));
add('tender','温柔陪伴','亲近','shy','🤗',soft(29,38,-8,4),soft(29,38,8,4));
add('grateful','感动感谢','亲近','shy','🥹',soft(39,52,7,5),soft(39,52,-7,5));
add('kissing','亲昵眯眼','亲近','shy','😘',soft(29,7,18,7),soft(29,7,-18,7));
add('hopeful','满怀期待','亲近','curious','🥺',soft(39,63,7,-2),soft(39,63,-7,-2));
add('pensive','低落沉思','忧伤','sad','😔',soft(39,11,-5,10),soft(39,11,5,10));
add('downcast','垂眸难过','忧伤','sad','😞',soft(42,8,-12,14),soft(42,8,12,14));
add('crying','委屈落泪','忧伤','sad','😢',soft(43,19,-10,3),soft(43,19,10,3));
add('sobbing','伤心大哭','忧伤','sad','😭',soft(47,8,-9,0),soft(47,8,9,0));
add('hurt','受伤委屈','忧伤','sad','😥',soft(31,40,-13,10),soft(42,11,9,8));
add('pleading','可怜巴巴','忧伤','sad','🥺',soft(43,67,11,7),soft(43,67,-11,7));
add('holding-tears','强忍泪水','忧伤','sad','🥲',soft(42,27,-5),soft(40,14,5));
add('disappointed','失落无奈','忧伤','sad','☹️',soft(35,13,-18,9),soft(35,13,18,9));
add('annoyed','有点不爽','愤怒','angry','😒',soft(42,17,5),soft(42,17,-5));
add('angry','怒目而视','愤怒','angry','😠',soft(49,25,8),soft(49,25,-8));
add('furious','怒气冲冲','愤怒','angry','😡',soft(53,34,12),soft(53,34,-12));
add('pouting','鼓气赌气','愤怒','angry','😤',soft(39,29,3,9),soft(39,29,-3,9));
add('frustrated','烦躁抓狂','愤怒','angry','😫',soft(37,37,-6),soft(43,43,6));
add('stern','严肃提醒','愤怒','angry','🤨',soft(42,31,0,-1),soft(42,14,0,2));
add('resentful','不服气','愤怒','angry','😾',soft(46,14,16,4),soft(37,20,-13,0));
add('grumpy','生闷气','愤怒','angry','👿',soft(34,22,5,12),soft(34,22,-5,12));
add('surprised','突然惊讶','惊惧','surprised','😮',soft(42,66),soft(42,66));
add('astonished','目瞪口呆','惊惧','surprised','😲',soft(49,76,-3),soft(49,76,3));
add('startled','吓了一跳','惊惧','scared','😱',soft(29,73,-11,-8),soft(29,73,11,-8));
add('worried','担心不安','惊惧','scared','😟',soft(40,33,-12,-4),soft(40,33,12,-4));
add('anxious','紧张忐忑','惊惧','scared','😰',soft(25,62,14),soft(30,58,-12));
add('fearful','害怕发抖','惊惧','scared','😨',soft(42,47,-6,-7),soft(42,47,6,-7));
add('flustered','惊慌失措','惊惧','scared','😳',soft(44,57,-14),soft(32,68,15,5));
add('shocked','震惊失语','惊惧','surprised','🫢',soft(34,78,-7),soft(46,67,7));
add('curious','好奇打量','复杂感受','curious','🧐',soft(42,63,-12,-4),soft(27,44,8,6));
add('skeptical','半信半疑','复杂感受','suspicious','🤨',soft(33,57,-15,-10),soft(44,11,-4,9));
add('confused','迷惑不解','复杂感受','confused','😕',soft(30,38,17,7),soft(39,59,-15,-7));
add('unimpressed','一脸无语','复杂感受','bored','😑',soft(46,9,0,9),soft(46,9,0,9));
add('side-eye','斜眼怀疑','复杂感受','suspicious','😒',soft(36,23,12,-2),soft(37,17,-2,6));
add('awkward','尴尬微笑','复杂感受','confused','😬',soft(40,6,-13),soft(34,13,12,6));
add('uncertain','犹豫不决','复杂感受','confused','🫤',soft(34,44,17,4),soft(28,54,-5,-4));
add('relieved','如释重负','复杂感受','happy','😮‍💨',soft(40,5,5,13),soft(40,5,-5,13));
add('sleepy','困眼朦胧','疲倦','drowsy','😪',soft(38,18,-7,13),soft(38,18,7,13));
add('asleep','安然入睡','疲倦','sleeping','😴',soft(42,4,-5,16),soft(42,4,5,16));
add('weary','疲惫不堪','疲倦','drowsy','😩',soft(44,12,-16,17),soft(44,12,16,17));
add('exhausted','精疲力尽','疲倦','drowsy','🫩',soft(47,5,-9,20),soft(47,5,9,20));
add('dizzy','头晕眼花','疲倦','confused','😵',soft(36,42,-13),soft(36,42,13));
add('woozy','晕乎乎','疲倦','confused','🥴',soft(30,51,-23),soft(36,14,17,12));
add('unwell','不太舒服','疲倦','sad','🤒',soft(31,23,-11,9),soft(37,10,9,15));
add('peaceful','宁静安心','疲倦','sleeping','😇',soft(37,4,-2,11),soft(37,4,2,11));

// 默认正面姿态仅追加，不改变此前89套轮廓及编号。
add('neutral-front','正面等候','基础姿态','idle','',soft(28,50,0,2));

/** 旧扩展编号保留，但几何仅由圆形和圆头长条构成，不再生成凹角或符号眼。 */
function contour(spec:Eye,index:number,centerX=index?153:78,symmetric=false):number[][]{
 const cx=centerX,cy=112+(spec.dy||0),angle=(spec.tilt||0)*Math.PI/180,r=Math.min(spec.w,spec.h)/2,half=Math.abs(spec.h-spec.w)/2;
 return Array.from({length:48},(_,i)=>{const a=i/48*Math.PI*2-Math.PI/2,co=Math.cos(a),si=Math.sin(a);let x=co*r,y=si*r;
  if(spec.h>=spec.w)y+=(symmetric&&Math.abs(si)<1e-9?0:si>=0?1:-1)*half;else x+=(co>=0?1:-1)*half;
  return [Number((cx+x*Math.cos(angle)-y*Math.sin(angle)).toFixed(3)),Number((cy+x*Math.sin(angle)+y*Math.cos(angle)).toFixed(3))];
 });
}
export const grokExpressions=[...upstream.EXPRESSIONS.map((_,i)=>({id:`laoa-${String(i).padStart(2,'0')}`,name:upstreamNames[i],group:'LaoA原版',state:'idle',emoji:'',origin:'upstream' as const})),...definitions.map(({left:_,right:__,...d})=>({...d,origin:'tinybot' as const}))];
export const grokExpressionEyes=[...upstream.EXPRESSIONS,...definitions.map(d=>[contour(d.left,0,78,d.id==='neutral-front'),contour(d.right,1,d.id==='neutral-front'?150:153,d.id==='neutral-front')])];
export const grokPublicExpressions=grokExpressions;
/** 中性正视双眼在库内的追加索引，供默认形象与绘制器共用。 */
export const neutralFrontExpressionIndex=grokExpressions.findIndex(e=>e.id==='neutral-front');
export function grokPool(state:string):number[]{return [...((upstream.POOLS as Record<string,number[]>)[state]||upstream.POOLS.idle)];}
/** Emoji只做语义索引；画面继续使用LaoA风格轮廓。 */
export function grokForEmotion(emoji:string,category:string):string{
 const overrides:Record<string,string>={'🥺':'pleading','🥹':'grateful','😒':'side-eye','🤨':'skeptical','😇':'peaceful'};
 if(overrides[emoji])return overrides[emoji];const direct=definitions.find(d=>d.emoji===emoji);if(direct)return direct.id;
 return ({'喜悦':'beaming','爱与亲近':'adoring','俏皮':'cheeky','含蓄与思索':'bashful','平静与复杂':'uncertain','疲倦与安定':'sleepy','不适与眩晕':'unwell','自信与庆祝':'smug','忧伤与惊惧':'worried','愤怒与强烈感受':'angry','猫脸情绪':'gentle','情绪符号':'shocked'} as Record<string,string>)[category]||'gentle';
}
