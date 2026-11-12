import {useEffect,useLayoutEffect,useState,useReducer,useRef,type ReactNode} from 'react';
import {theme as antTheme,Avatar,Badge,Button,ConfigProvider,Drawer,Input,Alert,Empty,Skeleton,Result,Tooltip,Dropdown,Modal,Form,Upload,Space} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import './role_navigation.css';
import {CheckOutlined,RightOutlined,SearchOutlined,BellOutlined,MenuOutlined,ArrowRightOutlined,MenuFoldOutlined,MenuUnfoldOutlined,ClockCircleOutlined,DesktopOutlined,DownOutlined,SettingOutlined} from '@ant-design/icons';
import {useConsole} from './context';
import {navItems,pages} from './catalog';
import {resolvePage,normalizePreview} from './state';
import {Icon} from './components';
import {accordionKeys} from './menu_behavior';
import {shellOwner,shellAncestors,terminalEntry} from './shell_layout';
import {ShellNavigation} from './ShellNavigation';
import {sidebarReducer} from './sidebar_behavior';
import {systemThemes} from './system_theme';
import {BrandLogo} from './BrandLogo';
export function Shell({children}:{children:ReactNode}){
 const c=useConsole();const {token}=antTheme.useToken();const [sidebar,dispatchSidebar]=useReducer(sidebarReducer,{collapsed:false});const {collapsed}=sidebar;const [now,setNow]=useState(()=>new Date()),[more,setMore]=useState(false),[search,setSearch]=useState(false),[notifications,setNotifications]=useState(false),[term,setTerm]=useState(''),[compact,setCompact]=useState(false);
 const sidebarToggleRef=useRef<HTMLButtonElement>(null),focusSidebarToggle=useRef(false);
 function toggleSidebar(){focusSidebarToggle.current=true;dispatchSidebar({type:'toggle'});}
 useEffect(()=>{if(focusSidebarToggle.current){focusSidebarToggle.current=false;sidebarToggleRef.current?.focus({preventScroll:true});}},[collapsed]);
 const current=pages.find(p=>p.id===c.page);const currentTitle=c.page==='65'?({computer:'电脑操控',browser:'浏览器',search:'网页搜索',fetch:'网页抓取',documents:'文档处理',ocr:'OCR'}[c.selected]||'智能体工具'):c.page==='30'&&['terminals','remote'].includes(c.selected)?terminalEntry.label:c.page==='30'&&['theme','appearance'].includes(c.selected)?'系统主题':c.page==='30'&&c.selected==='guide'?'引导':c.page==='52'&&(!c.selected||c.selected==='general')?'常规设置':current?.title;const active=shellOwner(c.page,current?.nav||'home',c.selected);
 const [expanded,setExpanded]=useState<string[]>([active]),[zoom,setZoom]=useState(100);
 useLayoutEffect(()=>setExpanded(shellAncestors(c.page,c.selected,active)),[active,c.page,c.selected,more]);
 const self=c.store.members.find(m=>m.id==='u1')||c.store.members[0];
 function chooseTheme(value:string){c.setThemeMode(value as 'light'|'dark'|'system');}
 const avatar=self?.avatar||'';
 function openProfile(){c.go('54');}
 function setLanguage(value:string){c.setStore(s=>({...s,preferences:{...s.preferences,language:value}}));}

 const previewState=useRef({page:c.page,theme:c.theme,style:compact?'compact':'cards'});previewState.current={page:c.page,theme:c.theme,style:compact?'compact':'cards'};
 const pendingPreview=useRef<ReturnType<typeof normalizePreview>>(null);
 const postPreview=(type:string)=>{if(window.parent!==window)window.parent.postMessage({type,...previewState.current},location.origin);};
 useEffect(()=>{const receive=(event:MessageEvent)=>{if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='tinybot-preview')return;const v=normalizePreview(event.data);if(v){pendingPreview.current=v;if(resolvePage(location.hash.slice(1))!==v.page)c.go(v.page);c.setTheme(v.theme);if(v.style)setCompact(v.style==='compact');const current=previewState.current;if(current.page===v.page&&current.theme===v.theme&&(!v.style||current.style===v.style)){pendingPreview.current=null;postPreview('tinybot-preview-applied');}}};addEventListener('message',receive);postPreview('tinybot-ready');return()=>removeEventListener('message',receive);},[]);
 useEffect(()=>{const target=pendingPreview.current;if(target){if(c.page!==target.page||c.theme!==target.theme||(target.style&&previewState.current.style!==target.style))return;pendingPreview.current=null;postPreview('tinybot-preview-applied');return;}postPreview('tinybot-navigation');},[c.page,c.theme,compact]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();setSearch(true);}};addEventListener('keydown',key);return()=>removeEventListener('keydown',key);},[]);
 useEffect(()=>{const timer=setInterval(()=>setNow(new Date()),60000);return()=>clearInterval(timer);},[]);
 const pending=c.store.missions.filter(m=>m.status==='待审批').length;
 const menu=(drawer=false)=><ShellNavigation owner={active} openKeys={expanded} onOpenChange={keys=>setExpanded(previous=>accordionKeys(previous,keys))} onNavigate={()=>setMore(false)} drawer={drawer} collapsed={c.device==='desktop'&&collapsed}/>;
 const currentThemeName=c.activeSystemTheme.preset_id==='custom'?c.activeSystemTheme.custom?.name||'我的主题':systemThemes.find(t=>t.id===c.activeSystemTheme.preset_id)?.name||'霁蓝';
 const accountSelectedKeys=[c.store.preferences.language==='系统默认'?'language-system':c.store.preferences.language==='English'?'language-en':'language-zh',`theme-${c.activeSystemTheme.mode}`,compact?'mode-config':'mode-daily',zoom===100?'zoom-reset':'zoom-current'];
 const accountChoice=(key:string,label:string,onClick:()=>void,disabled=false)=>({key,label,onClick,disabled,extra:<span className="account-choice-mark" style={{display:'flex',alignItems:'center',width:token.fontSizeIcon,height:token.fontSizeIcon,color:token.colorPrimary}}>{accountSelectedKeys.includes(key)&&<CheckOutlined aria-label="当前选中" style={{fontSize:token.fontSizeIcon}}/>}</span>});
 const accountMenu={className:'account-dropdown-menu',selectable:true,selectedKeys:accountSelectedKeys,items:[{key:'profile',label:<span className="account-menu-identity"><Avatar src={avatar||undefined} size={30}>{self?.name?.slice(0,1)||'A'}</Avatar><span><strong>{self?.name||'Alex'}</strong><small>ID · {self?.id||'u1'}</small></span></span>,onClick:openProfile},{type:'divider' as const},
 {key:'personal-info',label:'基础信息',onClick:openProfile},
 {key:'language',label:`界面语言 · ${c.store.preferences.language}`,children:[accountChoice('language-system','系统默认',()=>setLanguage('系统默认')),accountChoice('language-en','English',()=>setLanguage('English')),accountChoice('language-zh','简体中文',()=>setLanguage('简体中文'))]},
 {key:'theme-center',label:`系统主题 · ${currentThemeName}`,style:{paddingInlineEnd:token.controlPaddingHorizontal+token.fontSizeSM},extra:<RightOutlined aria-hidden="true" style={{position:'absolute',insetInlineEnd:token.paddingXS,top:'50%',transform:'translateY(-50%)',display:'flex',alignItems:'center',fontSize:token.fontSizeIcon,color:token.colorIcon}}/>,onClick:()=>c.go('30','theme')},
 {key:'theme',label:`颜色主题 · ${{system:'系统默认',light:'浅色主题',dark:'深色主题'}[c.activeSystemTheme.mode]}`,children:[accountChoice('theme-system','系统默认',()=>chooseTheme('system')),accountChoice('theme-light','浅色主题',()=>chooseTheme('light')),accountChoice('theme-dark','深色主题',()=>chooseTheme('dark'))]},
 {key:'zoom',label:`界面缩放 · ${zoom}%`,children:[...(zoom!==100?[accountChoice('zoom-current',`当前比例 · ${zoom}%`,()=>setZoom(zoom))]:[]),accountChoice('zoom-out','缩小',()=>setZoom(v=>Math.max(80,v-10)),zoom<=80),accountChoice('zoom-in','放大',()=>setZoom(v=>Math.min(120,v+10)),zoom>=120),accountChoice('zoom-reset','实际大小 · 100%',()=>setZoom(100))]},
 {type:'divider' as const},
 {key:'logout',label:'注销登录',danger:true,onClick:()=>c.confirm('注销当前登录', '退出登录界面，保留已配置的模型、角色和知识库。',()=>{c.setProduct(s=>({...s,sessionActive:false}));c.go('00');})}]};
 const timeLabel=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
 if(c.page==='00'&&!c.product.sessionActive)return <div className="signed-out-layout">{children}</div>;
 return <ConfigProvider locale={c.store.preferences.language==='English'||(c.store.preferences.language==='系统默认'&&navigator.language.startsWith('en'))?enUS:zhCN} button={{autoInsertSpace:false}}>
 <div data-density="compact" className={`app-shell buddy-shell device-${c.device} ${c.device==='desktop'&&collapsed?'shell-sidebar-collapsed':''} ${compact?'density-compact':''}`}>
  <aside className="sidebar" id="tinybot-sidebar"><div className="sidebar-brand-row"><a href="#/w/demo/home" className="brand" aria-label={`${c.branding.name} 工作台`}><span className="brand-mark"><BrandLogo logo={c.branding.logo}/></span><strong title={c.branding.name}>{c.branding.name}<span title={c.branding.slogan}>{c.branding.slogan}</span></strong></a></div>{menu()}{c.host!=='web'&&<div className="sidebar-bottom"><Dropdown menu={accountMenu} trigger={['click']} placement="topLeft"><button className="account" aria-label="账户菜单"><Avatar className="account-avatar" src={avatar||undefined} size={28}>{self?.name?.slice(0,1)||'A'}</Avatar><span><strong>{self?.name||'Alex'}</strong></span><DownOutlined/></button></Dropdown><Tooltip title={terminalEntry.label}><Button type="text" icon={<DesktopOutlined/>} aria-label="打开终端互联" onClick={()=>c.go(terminalEntry.page,terminalEntry.item)}/></Tooltip><Tooltip title="常规设置"><Button type="text" icon={<SettingOutlined/>} aria-label="打开设置" onClick={()=>c.go('52','general')}/></Tooltip></div>}</aside>
  {c.device==='desktop'&&<Button ref={sidebarToggleRef} type="text" className="desktop-sidebar-toggle" icon={collapsed?<MenuUnfoldOutlined/>:<MenuFoldOutlined/>} aria-label={collapsed?'展开侧栏':'收起侧栏'} aria-expanded={!collapsed} aria-controls="tinybot-sidebar" onClick={toggleSidebar}/>}
  <section className="main-shell"><header className="topbar"><div className="location-label">{c.device==='tablet'&&<Button type="text" className="header-sidebar-toggle" icon={<MenuUnfoldOutlined/>} aria-label="展开导航" aria-expanded={more} aria-controls="tinybot-sidebar" onClick={()=>setMore(true)}/>}<span className="mobile-logo brand-mark"><BrandLogo logo={c.branding.logo}/></span><span className="header-product">{c.branding.name} 控制中心</span><span className="breadcrumb-divider">/</span><strong>{currentTitle||'工作台'}</strong></div><div className="topbar-actions"><button className="shell-service-state" onClick={()=>c.go('29')}><span/>服务未连接</button>{pending>0&&<button className="shell-pending" onClick={()=>c.go('16')}><ClockCircleOutlined/>{pending} 项待审批</button>}<span className="shell-clock"><ClockCircleOutlined/>{timeLabel}</span><Tooltip title="搜索 ⌘K"><Button type="text" icon={<SearchOutlined/>} aria-label="全局搜索" onClick={()=>setSearch(true)}/></Tooltip><Badge dot={pending>0}><Button type="text" icon={<BellOutlined/>} aria-label="通知" onClick={()=>setNotifications(true)}/></Badge>{(c.host==='web'||c.device==='mobile')&&<Dropdown menu={accountMenu} trigger={['click']} placement="bottomRight"><button className="mobile-account-menu" aria-label="账户菜单"><Avatar src={avatar||undefined} size={30}>{self?.name?.slice(0,1)||'A'}</Avatar></button></Dropdown>}</div></header>
  <main className="main-scroll" id="main-content" data-page={`CON-P${c.page}`}><div className="page-content" style={{zoom:zoom/100}}>
   {c.scenario==='loading'?<Skeleton active paragraph={{rows:12}}/>:c.scenario==='empty'?<Empty description="当前工作空间还没有数据"><Button type="primary" onClick={()=>{c.setScenario('normal');c.go('00');}}>开始准备</Button></Empty>:c.scenario==='error'?<Result status="warning" title="暂时无法读取此页面" subTitle="请求未成功，已有配置不会被覆盖。" extra={<Button onClick={()=>c.setScenario('normal')}>重新读取</Button>}/>:<>{c.scenario==='offline'&&<Alert showIcon type="warning" title="当前服务离线" description="展示最后读取的数据；所有写入与控制已暂停。"/>}{c.scenario==='readonly'&&<Alert showIcon type="info" title="只读权限" description="可以查看内容；配置、执行和删除操作不可用。"/>}<div className={['offline','readonly'].includes(c.scenario)?'read-only-content':''} inert={['offline','readonly'].includes(c.scenario)}>{children}</div></>}
  </div></main>
  <nav className="bottom-nav" aria-label="移动导航">{navItems.filter(n=>['home','models','knowledge','agents'].includes(n.key)).map(n=><button key={n.key} aria-current={(c.page==='02'?'agents':active)===n.key?'page':undefined} className={(c.page==='02'?'agents':active)===n.key?'active':''} onClick={()=>c.go(n.page)}><Icon name={n.key}/><span>{n.key==='agents'?'智能体':n.key==='chat'?'调试':n.label}</span></button>)}<button onClick={()=>setMore(true)}><MenuOutlined/><span>更多</span></button></nav>
  </section>
 </div>

 <Drawer className="shell-nav-drawer" title={`${c.branding.name} · 全部功能`} open={more} onClose={()=>setMore(false)} placement="left" size={300}>{menu(true)}</Drawer>
 <Drawer title="快速找到想做的事" open={search} onClose={()=>setSearch(false)} width={c.device==='mobile'?'100%':480}><Input autoFocus prefix={<SearchOutlined/>} placeholder="搜索功能、模型、知识库…" value={term} onChange={e=>setTerm(e.target.value)}/><div className="search-results">{pages.filter(p=>!term||p.title.includes(term)).map(p=><Button block type="text" key={p.id} onClick={()=>{c.go(p.id);setSearch(false);}}>{p.title}<ArrowRightOutlined/></Button>)}</div></Drawer>
 <Drawer title="通知与待办" open={notifications} onClose={()=>setNotifications(false)} width={c.device==='mobile'?'100%':420}>{c.store.missions.filter(m=>['待审批','待核实'].includes(m.status)).map(m=><div className="notification-item" key={m.id}><Icon name="tasks"/><div><strong>{m.name}</strong><p>{m.status} · {m.time}</p><Button size="small" onClick={()=>{c.go('17',m.id);setNotifications(false);}}>查看任务</Button></div></div>)}</Drawer>
 </ConfigProvider>;
}
