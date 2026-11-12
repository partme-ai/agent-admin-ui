import {robotExpressions} from './robot_expressions.ts';

/** 旧48项只保留语义兼容；新图形继续使用圆润双眼，部分装饰效果为近似表达。 */
type Mapping={id:string;grokId:string;state:string;action:string;name:string};
const rows:[string,string,string,string?][]=[
 ['neutral','laoa-01','idle'],['smile','gentle','happy'],['happy','beaming','happy'],['laugh','belly-laugh','laughing'],
 ['excited','delighted','excited'],['proud','smug','proud'],['relaxed','peaceful','idle'],['satisfied','content','happy'],
 ['blink','laoa-00','idle'],['wink','wink-left','playful'],['cute','pleading','shy'],['shy','bashful','shy'],
 ['love','heart-eyes','shy'],['kiss','kissing','shy'],['hug','tender','shy'],['grateful','grateful','shy','nod'],
 ['sad','pensive','sad'],['tear','holding-tears','sad'],['cry','sobbing','sad'],['sob','crying','sad'],
 ['lonely','downcast','sad'],['worried','worried','scared'],['disappointed','disappointed','sad'],['tired','weary','drowsy'],
 ['surprised','surprised','surprised'],['shocked','shocked','surprised'],['confused','confused','confused'],['angry','angry','angry'],
 ['grumpy','pouting','angry'],['scared','fearful','scared'],['embarrassed','awkward','confused'],['dizzy','woozy','confused'],
 ['nod','grateful','shy','nod'],['shake','unimpressed','bored','shake'],['look_left','laoa-05','curious','look_left'],['look_right','laoa-06','curious','look_right'],
 ['sleepy','sleepy','drowsy'],['asleep','asleep','sleeping'],['yawn','weary','drowsy'],['playful','cheeky','playful'],
 ['attentive','laoa-03','listening'],['thinking','curious','thinking'],['talking','laoa-01','humming'],['curious','curious','curious'],
 ['greeting','sunny','waking','wave'],['celebrating','beaming','celebrate','bounce'],['error','worried','alerting','shake'],['offline','peaceful','idle']
];
export const legacyFaceMappings:Mapping[]=rows.map(([id,grokId,state,action='none'])=>({id,grokId,state,action,name:robotExpressions.find(e=>e.id===id)!.name}));
/** 别名只扩展检索，不增加图形数量或改变原版编号。 */
export function legacyFaceAliases(grokId:string):string[]{return legacyFaceMappings.filter(x=>x.grokId===grokId).flatMap(x=>[x.id,x.name]);}
