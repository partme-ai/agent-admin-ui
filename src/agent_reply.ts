/** 本地对话调试夹具，仅验证消息与资源联动，不调用模型或远程工具。 */
export function buildTrialReply(agent:{name:string;instructions:string;knowledge:string[];profile?:{greeting:string}},input:string):{text:string;citation:boolean}{
 if(/你好|介绍|你是谁|叫什么/.test(input))return {text:`你好，我是${agent.name.split(' · ')[0]}。${agent.profile?.greeting||'请告诉我你想处理的问题。'}`,citation:false};
 return {text:`已收到「${input.slice(0,80)}」。这是本地模拟回复，用于检查当前智能体的消息流程与资源关联；实际回答将在接入模型服务后生成。`,citation:false};
}
