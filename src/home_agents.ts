import type {Agent} from './state.ts';
import {roleMarketTemplates,type RoleMarketTemplate} from './role_market.ts';

export type HomeAgentCard={kind:'agent';agent:Agent}|{kind:'template';template:RoleMarketTemplate};

/** 按首页容量展示资源；已有智能体优先，模板补位不写入用户配置。 */
export function homeAgentCards(agents:readonly Agent[],limit=6):HomeAgentCard[]{
 const capacity=Math.max(0,Math.floor(limit));
 const cards:HomeAgentCard[]=agents.slice(0,capacity).map(agent=>({kind:'agent',agent}));
 const names=new Set(agents.map(agent=>agent.name.split(' · ')[0].trim()));
 for(const template of roleMarketTemplates){
  if(cards.length>=capacity)break;
  if(!names.has(template.name.split(' · ')[0].trim()))cards.push({kind:'template',template});
 }
 return cards;
}

/** 由内容区实宽计算列数；至少一列，并为两行保留足够的不同资源。 */
export function homeGridColumns(width:number,available:number):number{
 const fitting=Math.max(1,Math.floor((Math.max(0,width)+10)/238));
 return Math.min(fitting,Math.max(1,Math.floor(available/2)));
}
