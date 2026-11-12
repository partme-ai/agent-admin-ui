import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {menuScrollDelta,menuScrollThumb} from './menu_behavior';
/** 三端菜单共用局部滚动与覆盖滑块；不改变正文或浏览器的滚动位置。 */
export function useMenuScroll(targetKey:string,layoutKey:string){
 const viewport=useRef<HTMLDivElement>(null),[thumb,setThumb]=useState({visible:false,height:0,top:0}),[scrolling,setScrolling]=useState(false);
 const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),drag=useRef<{pointer:number;y:number;top:number}|null>(null);
 function measure(){const el=viewport.current;if(el){const next=menuScrollThumb(el.clientHeight,el.scrollHeight,el.scrollTop);setThumb(old=>old.visible===next.visible&&old.height===next.height&&old.top===next.top?old:next);}}
 function onScroll(){measure();setScrolling(true);clearTimeout(timer.current);timer.current=setTimeout(()=>setScrolling(false),800);}
 useEffect(()=>{
  const el=viewport.current;if(!el)return;
  const reveal=()=>{
   const label=Array.from(el.querySelectorAll<HTMLElement>('[data-menu-key]')).find(n=>n.dataset.menuKey===targetKey);
   const item=label?.closest<HTMLElement>('.ant-menu-item,.ant-menu-submenu-title')||el.querySelector<HTMLElement>('.ant-menu-item-selected');
   if(item&&item.getClientRects().length&&item.getBoundingClientRect().height>0){const a=el.getBoundingClientRect(),b=item.getBoundingClientRect(),delta=menuScrollDelta(a.top,a.bottom,b.top,b.bottom);if(Math.abs(delta)>.5)el.scrollTop+=delta;}
   measure();
  };
  const frame=requestAnimationFrame(reveal),observer=new ResizeObserver(reveal);observer.observe(el);const menu=el.querySelector('.shell-menu');if(menu)observer.observe(menu);
  // Menu子项的展开动画会改变菜单高度，ResizeObserver在动画后校正可见位置。
  return()=>{cancelAnimationFrame(frame);observer.disconnect();};
 },[targetKey,layoutKey]);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 function onPointerDown(event:PointerEvent<HTMLDivElement>){
  const el=viewport.current;if(!el)return;event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);
  if((event.target as HTMLElement).classList.contains('shell-scroll-track')){const box=event.currentTarget.getBoundingClientRect(),travel=el.clientHeight-thumb.height;if(travel>0)el.scrollTop=(event.clientY-box.top-thumb.height/2)/travel*(el.scrollHeight-el.clientHeight);}
  drag.current={pointer:event.pointerId,y:event.clientY,top:el.scrollTop};setScrolling(true);
 }
 function onPointerMove(event:PointerEvent<HTMLDivElement>){const el=viewport.current,start=drag.current;if(!el||!start||start.pointer!==event.pointerId)return;const travel=el.clientHeight-thumb.height;if(travel>0)el.scrollTop=start.top+(event.clientY-start.y)/travel*(el.scrollHeight-el.clientHeight);}
 function onPointerUp(event:PointerEvent<HTMLDivElement>){if(drag.current?.pointer!==event.pointerId)return;drag.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);onScroll();}
 return {viewport,thumb,scrolling,onScroll,onPointerDown,onPointerMove,onPointerUp};
}
