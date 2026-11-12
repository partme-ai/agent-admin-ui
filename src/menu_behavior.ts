import {shellEntries} from './shell_layout.ts';
const parents=shellEntries().filter(e=>e.node.children?.length);
/** 每一层同级互斥，深层菜单保留完整祖先路径。 */
export function accordionKeys(previous:readonly string[],next:readonly string[]):string[]{
 const valid=next.filter(key=>parents.some(e=>e.key===key));
 const opened=[...valid].reverse().find(key=>!previous.includes(key));
 if(opened){const entry=parents.find(e=>e.key===opened)!;return [...entry.ancestors,opened];}
 return valid.filter(key=>!valid.some(other=>other!==key&&other.startsWith(key+'/'))).flatMap(key=>[...(parents.find(e=>e.key===key)?.ancestors||[]),key]).filter((key,i,all)=>all.indexOf(key)===i);
}
/** 菜单可视区域内保留6px缓冲，仅计算自身需要滚动的最小距离。 */
export function menuScrollDelta(top:number,bottom:number,itemTop:number,itemBottom:number):number{
 if(itemTop<top+6)return itemTop-top-6;
 if(itemBottom>bottom-6)return itemBottom-bottom+6;
 return 0;
}
/** 细滑块覆盖在滚动区域上，不挤占菜单宽度；无溢出或未布局时不显示。 */
export function menuScrollThumb(clientHeight:number,scrollHeight:number,scrollTop:number):{visible:boolean;height:number;top:number}{
 if(clientHeight<=0||scrollHeight<=clientHeight)return {visible:false,height:0,top:0};
 const height=Math.min(clientHeight,Math.max(24,clientHeight*clientHeight/scrollHeight)),ratio=Math.max(0,Math.min(1,scrollTop/(scrollHeight-clientHeight)));
 return {visible:true,height,top:ratio*(clientHeight-height)};
}
