import {useMenuScroll} from './use_menu_scroll';
import {ConfigProvider,Menu,type MenuProps} from 'antd';
import {Icon} from './components';
import {useConsole} from './context';
import {shellGroups,shellSelection,shellTarget,shellSubmenuIcons} from './shell_layout';

/** 三端共用官方 Menu；触控图标栏与完整抽屉只改变呈现，不复制路由。 */
export function ShellNavigation({owner,openKeys,onOpenChange,onNavigate,drawer=false,collapsed=false}:{owner:string;openKeys:string[];onOpenChange:(keys:string[])=>void;onNavigate:()=>void;drawer?:boolean;collapsed?:boolean}){
 const c=useConsole(),tabletRail=c.device==='tablet'&&!drawer,rail=!drawer&&(tabletRail||collapsed);
 const selection=tabletRail?owner:shellSelection(c.page,c.selected,owner);
 const target=rail?owner:openKeys.includes(owner)?selection:openKeys[0]||owner;
 const scroll=useMenuScroll(target,`${rail}/${drawer}/${openKeys.join('|')}`);
 const childLabel=(key:string,label:string)=><span data-menu-key={key}>{label}</span>;
 const counts:Record<string,number>={agents:c.store.agents.length,models:c.store.connections.length,knowledge:c.store.knowledge.length,devices:c.store.bots.length,extensions:c.store.extensions.length};
 const label=(n:{key:string;label:string})=><span className="shell-menu-label" data-menu-key={n.key}><span>{n.label}</span>{!!counts[n.key]&&<b className="shell-menu-count">{counts[n.key]}</b>}</span>;
 const renderItems=(nodes:typeof shellGroups[number]['items'],prefix='',depth=0):MenuProps['items']=>nodes.map(n=>{const key=prefix?`${prefix}/${n.key}`:n.key;return {key,className:depth?'shell-submenu-entry':undefined,label:depth?childLabel(key,n.label):label(n),title:n.label,icon:<Icon name={depth?shellSubmenuIcons[key]:n.key==='resources'?'book':n.key==='system'?'settings':n.key==='remote'?'devices':n.key}/>,children:n.children?.length&&!(tabletRail&&depth===0)?renderItems(n.children,key,depth+1):undefined};});
 const items:MenuProps['items']=renderItems(shellGroups.flatMap(g=>g.items));
 return <nav className={`shell-navigation ${drawer?'shell-navigation-drawer':''} ${rail?'shell-navigation-rail':''} ${scroll.scrolling?'is-scrolling':''}`}  aria-label={drawer?'全部功能导航':'主导航'}>
  <div className="shell-menu-viewport" ref={scroll.viewport} tabIndex={0} aria-label="菜单滚动区域" onScroll={scroll.onScroll}><ConfigProvider theme={drawer?c.drawerNavigationConfig:c.navigationConfig}>
   <Menu className="shell-menu" classNames={{popup:{root:'shell-menu-popup'}}} aria-label={drawer?'全部功能菜单':'主导航菜单'} mode="inline" theme={drawer?c.theme:c.navigationMode} inlineCollapsed={rail} inlineIndent={14} selectedKeys={[selection]} openKeys={rail?undefined:openKeys} onOpenChange={rail?undefined:keys=>onOpenChange(keys)} triggerSubMenuAction="click" items={items} onClick={({key})=>{const target=shellTarget(key);if(target){c.go(target.page,target.item);onNavigate();}}}/>
  </ConfigProvider></div>
  {scroll.thumb.visible&&<div className="shell-scroll-track" aria-hidden="true" onPointerDown={scroll.onPointerDown} onPointerMove={scroll.onPointerMove} onPointerUp={scroll.onPointerUp} onPointerCancel={scroll.onPointerUp}><div className="shell-scroll-thumb" style={{height:scroll.thumb.height,transform:`translateY(${scroll.thumb.top}px)`}}/></div>}
 </nav>;
}
