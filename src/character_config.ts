import {grokExpressions,grokPublicExpressions,grokPool} from './grok_expressions.ts';
import {validateEmotionStyle,type EmotionStyle} from './emotion_style.ts';
import data from './vendor/laoa_grokbot/data.json' with {type:'json'};
import {characterColors,isCharacterColor} from './character_colors.ts';
export const characterData=data;
export type EyeRings=number[][][];
export type CharacterConfig={schema_version:1;pack:'minimal'|'grok';name:string;color:string;shape:string;parts:string[];accessories:string[];expression:number;state:string;action:string;emotion?:EmotionStyle;emotion_id?:string;emotion_set_id?:string};
const names:Record<string,string>={sleeping:'睡眠',waking:'唤醒',idle:'待机',listening:'认真聆听',thinking:'思考',searching:'搜索',working:'工作',excited:'兴奋',surprised:'惊讶',suspicious:'怀疑',angry:'生气',drowsy:'困倦',happy:'开心',curious:'好奇',confused:'困惑',bored:'无聊',proud:'得意',shy:'害羞',sad:'难过',laughing:'大笑',scared:'害怕',playful:'调皮',celebrate:'庆祝',orbit:'轨道',radar:'雷达',progress:'进度',spawning:'诞生',humming:'哼唱',loading:'加载',dictating:'听写',writing:'书写',sending:'发送',receiving:'接收',uploading:'上传',notifying:'通知',alerting:'警报',dragging:'拖拽',bouncing:'弹跳','powering-down':'关机表现'};
export const characterStates=Object.entries(data.GROUPS).flatMap(([group,states])=>states.map(id=>({id,name:names[id],group:({'Cycle de vie':'生命周期','Réactions':'情绪反应','Morphes agent':'代理形态','Cycle produit':'产品流程'} as Record<string,string>)[group]})));
export const characterParts=[['hands','双手'],['feet','双脚'],['tail','尾巴'],['antenna','天线']];
export const characterAccessories=[['straw-hat','草帽'],['glasses','眼镜'],['bowtie','蝴蝶结'],['cape','披风']];
export const characterActions=[['bounce','蹦跳'],['shake','摇头'],['peek','探头'],['pinch','捏脸'],['squish','挤压'],['wave','挥手'],['nod','点头'],['look_left','向左看'],['look_right','向右看']];
export const defaultCharacter=():CharacterConfig=>({schema_version:1,pack:'grok',name:'我的机器人',color:'blue',shape:'blob',parts:[],accessories:[],expression:grokExpressions.findIndex(e=>e.id==='hopeful'),state:'curious',action:'none'});
/** 迁移旧角色时只保留受支持的数据，不执行导入内容中的脚本。 */
export function normalizeCharacter(input?:unknown):CharacterConfig{
 const d=defaultCharacter(),v=input&&typeof input==='object'?input as Partial<CharacterConfig>:{};
 const unique=(list:unknown,allowed:string[])=>Array.isArray(list)?[...new Set(list.filter((x):x is string=>typeof x==='string'&&allowed.includes(x)))]:[];
 let emotion:EmotionStyle|undefined;try{if(v.emotion)emotion=validateEmotionStyle(v.emotion);}catch{/* 迁移时退回旧状态；严格导入在parseCharacter拒绝无效值。 */}
 return {...(emotion?{emotion}:{}),...(typeof v.emotion_id==='string'&&/^unicode:[a-f0-9-]+$/.test(v.emotion_id)?{emotion_id:v.emotion_id}:{}),...(typeof v.emotion_set_id==='string'&&/^[\w-]{1,80}$/.test(v.emotion_set_id)?{emotion_set_id:v.emotion_set_id}:{}),...d,pack:'grok',name:typeof v.name==='string'?v.name.slice(0,60):d.name,color:isCharacterColor(v.color)?v.color:d.color,shape:data.SHAPES.some(s=>s[0]===v.shape)?v.shape!:d.shape,expression:Number.isInteger(v.expression)&&v.expression!>=-1&&v.expression!<grokExpressions.length?v.expression!:d.expression,state:characterStates.some(s=>s.id===v.state)?v.state!:d.state,action:characterActions.some(a=>a[0]===v.action)?v.action!:'none',parts:unique(v.parts,characterParts.map(x=>x[0])),accessories:unique(v.accessories,characterAccessories.map(x=>x[0]))};
}
/** JSON是可编辑的形象母版，只接受白名单字段与固定版本。 */
export function parseCharacter(json:string):CharacterConfig{
 if(json.length>32768)throw Error('形象配置过大，请选择TinyBot导出的JSON。');
 const v=JSON.parse(json);if(!v||typeof v!=='object'||Array.isArray(v)||v.schema_version!==1)throw Error('不支持的形象配置版本。');
 const keys=Object.keys(defaultCharacter()),optional=['emotion','emotion_id','emotion_set_id'];if(Object.keys(v).some(k=>!keys.includes(k)&&!optional.includes(k))||keys.some(k=>!(k in v)))throw Error('配置包含未知字段或缺少必填项。');
 if(v.pack!=='grok'&&v.pack!=='minimal')throw Error('不支持的形象类型。');const n=normalizeCharacter(v);if([...keys.filter(k=>k!=='pack'),...optional.filter(k=>k in v)].some(k=>JSON.stringify(n[k as keyof CharacterConfig])!==JSON.stringify(v[k])))throw Error('形象配置包含无效颜色、外形、状态或部件。');return n;
}
export function randomCharacter(random= Math.random):CharacterConfig{
 const pick=<T,>(list:T[])=>list[Math.min(list.length-1,Math.floor(random()*list.length))];
 return {...defaultCharacter(),pack:'grok',color:pick(characterColors)[0],shape:pick(data.SHAPES)[0],state:pick(characterStates).id,expression:Math.floor(random()*grokPublicExpressions.length),parts:characterParts.filter(()=>random()<.45).map(p=>p[0]),accessories:characterAccessories.filter(()=>random()<.3).map(a=>a[0]),action:pick(characterActions)[0]};
}
/** 对话阶段只驱动屏幕表现，不发送物理设备动作。 */
export function stateForTrial(phase:string,emotion=''):string{if(phase==='speaking'){const mapped=({happy:'happy',sad:'sad',scared:'scared',grumpy:'angry',grateful:'shy',greeting:'waking'} as Record<string,string>)[emotion];if(mapped)return mapped;}return ({idle:'idle',listening:'listening',thinking:'thinking',speaking:'humming',stopped:'idle'} as Record<string,string>)[phase]||'idle';}
export function expressionIndex(config:CharacterConfig,time=0):number{
 if(config.expression>=0)return config.expression;
 const pool=grokPool(config.state),cadence=(data.EXPR_CADENCE as Record<string,number[]>)[config.state]||[4000,8000];
 return pool[Math.floor(time/((cadence[0]+cadence[1])/2000))%pool.length];
}
