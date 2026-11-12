/** 机器人屏幕试聊的交互阶段，与真实设备连接状态分别管理。 */
export type TrialPhase='idle'|'listening'|'thinking'|'speaking'|'stopped';
export type TrialState={phase:TrialPhase;turn:number};
export type TrialEvent={type:'listen'|'submit'|'stop'|'reset'}|{type:'respond'|'finish';turn:number};
export const initialTrialState=():TrialState=>({phase:'idle',turn:0});
/** 轮次递增使停止、切换和离开前的异步回调失效。 */
export function transitionTrial(state:TrialState,event:TrialEvent):TrialState{
 if(event.type==='reset')return {phase:'idle',turn:state.turn+1};
 if(event.type==='stop')return {phase:'stopped',turn:state.turn+1};
 if(event.type==='listen')return {phase:'listening',turn:state.turn+1};
 if(event.type==='submit')return {phase:'thinking',turn:state.turn+1};
 if(!('turn' in event)||event.turn!==state.turn)return state;
 if(event.type==='respond'&&state.phase==='thinking')return {...state,phase:'speaking'};
 if(event.type==='finish'&&state.phase==='speaking')return {...state,phase:'idle'};
 return state;
}
export const isCurrentTrialTurn=(state:TrialState,turn:number,phase?:TrialPhase)=>state.turn===turn&&(!phase||state.phase===phase);
/** 屏幕适配预设，不表示已读取真实硬件的显示能力。 */
export const trialDeviceProfiles=[
 {id:'esp32-square',name:'TinyBot ESP32 · 方形屏',shortName:'ESP32 方形屏',width:240,height:240,shape:'square'},
 {id:'esp32-round',name:'TinyBot ESP32 · 圆形屏',shortName:'ESP32 圆形屏',width:240,height:240,shape:'round'},
 {id:'esp32-landscape',name:'TinyBot ESP32 · 横向屏',shortName:'ESP32 横向屏',width:320,height:240,shape:'wide'},
 {id:'pi-wide',name:'TinyBot Pi · 触控屏',shortName:'Pi 触控屏',width:800,height:480,shape:'wide'}
] as const;
export type TrialDeviceProfile=typeof trialDeviceProfiles[number];
export const trialVoices=[
 {id:'warm',name:'温暖女声',description:'柔和 · 自然',rate:.94,pitch:1.15},
 {id:'clear',name:'清晰男声',description:'沉稳 · 清晰',rate:.95,pitch:.82},
 {id:'bright',name:'活力童声',description:'轻快 · 活泼',rate:1.08,pitch:1.4}
];
export const trialPhaseLabel:Record<TrialPhase,string>={idle:'等待对话',listening:'正在聆听',thinking:'正在思考',speaking:'正在说话',stopped:'已停止'};
/** 本地试聊夹具用于检查屏幕和交互；不调用模型或执行设备工具。 */
export function buildTrialReply(agent:{name:string;instructions:string;knowledge:string[];profile?:{greeting:string}},input:string):{text:string;citation:boolean}{
 const name=agent.name.split(' · ')[0];
 if(/故事/.test(input))return {text:`好呀！一只小机器人想找到最亮的星星。它走过森林，最后发现，朋友们窗前的灯光，就是离它最近的星光。你想给这只小机器人起什么名字？`,citation:false};
 if(/配网|连接|怎么用|如何使用/.test(input))return {text:'先给机器人接通电源，在设备中心选择添加设备，完成网络配置，再为它选择智能体和声音。准备好后，就可以叫它和你聊天啦。',citation:agent.knowledge.length>0};
 if(/你好|介绍|你是谁|叫什么/.test(input))return {text:`你好呀，我是${name}！${agent.profile?.greeting||''}${/学习|启发/.test(agent.instructions)?'我喜欢和你一起发现新知识。':/设备|维护/.test(agent.instructions)?'我可以陪你检查设备，解答使用中的问题。':'很高兴认识你，你可以问我问题，也可以和我聊聊今天的趣事。'}`,citation:false};
 if(/设备|巡检/.test(input))return {text:'我会先看看设备的电量、网络和最近的状态。如果需要重启或执行任务，我会先征求你的同意。',citation:agent.knowledge.length>0};
 if(/为什么|学习|解释|月亮/.test(input))return {text:'我们一起想一想吧。就像机器人用传感器认识世界，我们也可以先观察，再提出问题，最后用一个小实验验证答案。你最想先了解哪一部分？',citation:false};
 return {text:`我听到了。关于“${input.slice(0,36)}”，我们可以一步一步聊。你希望${name}先给你一个简单的解释，还是一个有趣的例子？`,citation:false};
}
