import type {TrialPhase} from './robot_trial.ts';
export const expressionGroups=['日常情绪','亲近互动','低落情绪','强烈反应','动作','对话状态'] as const;
export type EyeShape='open'|'happy'|'closed'|'heart'|'star'|'droop'|'angry'|'wide'|'spiral'|'dot'|'sleepy'|'worried';
export type MouthShape='smile'|'grin'|'laugh'|'flat'|'sad'|'wavy'|'o'|'small'|'kiss'|'cat'|'talking'|'frown';
export type FaceEffect='none'|'blush'|'hearts'|'tears'|'streams'|'stars'|'sparkle'|'sweat'|'zzz'|'question'|'exclaim'|'drool'|'music'|'hug'|'broken';
export type FaceMotion='still'|'breathe'|'bounce'|'tilt'|'nod'|'shake'|'left'|'right'|'float'|'tremble'|'spin';
/** 简约矢量表情资产。标识用于后续设备映射，不等同于已下发设备。 */
export type RobotExpression={id:string;name:string;group:typeof expressionGroups[number];left:EyeShape;right:EyeShape;mouth:MouthShape;effect:FaceEffect;motion:FaceMotion};
type Row=[string,string,EyeShape,EyeShape,MouthShape,FaceEffect,FaceMotion];
const groups:Row[][]=[
 [['neutral','平静','open','open','small','none','breathe'],['smile','微笑','open','open','smile','none','still'],['happy','开心','happy','happy','grin','blush','bounce'],['laugh','大笑','closed','closed','laugh','none','bounce'],['excited','兴奋','star','star','laugh','sparkle','bounce'],['proud','得意','sleepy','sleepy','grin','stars','tilt'],['relaxed','放松','happy','happy','small','none','breathe'],['satisfied','满足','closed','closed','smile','blush','breathe']],
 [['blink','眨眼','open','open','smile','blush','still'],['wink','单眼wink','closed','open','grin','sparkle','tilt'],['cute','卖萌','wide','wide','cat','blush','tilt'],['shy','害羞','droop','droop','small','blush','left'],['love','心动','heart','heart','smile','hearts','float'],['kiss','亲亲','closed','closed','kiss','hearts','tilt'],['hug','抱抱','happy','happy','smile','hug','breathe'],['grateful','感谢','happy','happy','grin','hearts','nod']],
 [['sad','悲伤','droop','droop','sad','none','breathe'],['tear','含泪','wide','wide','sad','tears','still'],['cry','哭泣','worried','worried','frown','streams','tremble'],['sob','委屈','droop','droop','wavy','tears','tremble'],['lonely','孤单','dot','dot','small','broken','left'],['worried','担心','worried','worried','wavy','sweat','breathe'],['disappointed','失落','closed','closed','sad','none','tilt'],['tired','疲惫','sleepy','sleepy','flat','sweat','breathe']],
 [['surprised','惊讶','wide','wide','o','exclaim','still'],['shocked','震惊','dot','dot','o','exclaim','tremble'],['confused','疑惑','open','sleepy','wavy','question','tilt'],['angry','生气','angry','angry','frown','exclaim','tremble'],['grumpy','气鼓鼓','angry','angry','small','blush','shake'],['scared','害怕','wide','wide','wavy','sweat','tremble'],['embarrassed','尴尬','open','sleepy','flat','sweat','left'],['dizzy','晕乎乎','spiral','spiral','o','stars','spin']],
 [['nod','点头','happy','happy','smile','none','nod'],['shake','摇头','closed','closed','flat','none','shake'],['look_left','向左看','open','open','small','none','left'],['look_right','向右看','open','open','small','none','right'],['sleepy','困困','sleepy','sleepy','o','zzz','breathe'],['asleep','睡觉','closed','closed','small','zzz','float'],['yawn','打哈欠','closed','closed','o','drool','breathe'],['playful','调皮','open','closed','cat','music','tilt']],
 [['attentive','认真听','wide','wide','small','none','breathe'],['thinking','思考','sleepy','open','small','question','tilt'],['talking','说话','open','open','talking','none','breathe'],['curious','好奇','wide','open','o','question','right'],['greeting','打招呼','happy','open','grin','sparkle','nod'],['celebrating','庆祝','star','happy','laugh','stars','bounce'],['error','出错','worried','worried','flat','exclaim','shake'],['offline','休息','sleepy','sleepy','flat','none','still']]
];
export const robotExpressions:RobotExpression[]=groups.flatMap((rows,index)=>rows.map(([id,name,left,right,mouth,effect,motion])=>({id,name,group:expressionGroups[index],left,right,mouth,effect,motion})));
/** 本地文字试聊规则，仅用于表情演示，不声称执行模型情绪识别。 */
export function expressionForDialogue(text:string):string{
 if(/难过|悲伤|想哭|伤心/.test(text))return 'sad';
 if(/谢谢|感谢/.test(text))return 'grateful';
 if(/开心|高兴|太棒|成功/.test(text))return 'happy';
 if(/害怕|恐怖/.test(text))return 'scared';
 if(/生气|愤怒/.test(text))return 'grumpy';
 if(/晚安|睡觉/.test(text))return 'sleepy';
 if(/你好|早上好/.test(text))return 'greeting';
 return 'talking';
}
/** 手动预览优先，自动模式使用当前对话阶段；未知资产安全回退。 */
export function resolveExpression(id:string|null,phase:TrialPhase,text=''):RobotExpression{
 const automatic:Record<TrialPhase,string>={idle:'neutral',listening:'attentive',thinking:'thinking',speaking:expressionForDialogue(text),stopped:'offline'};
 return robotExpressions.find(e=>e.id===(id||automatic[phase]))||robotExpressions[0];
}
