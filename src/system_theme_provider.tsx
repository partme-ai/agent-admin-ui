import {flushSync} from 'react-dom';
import {revealInitialTypography} from './initial_typography';
import {createThemeTransition} from './theme_transition';
import './theme_transition.css';
import {createContext,useContext,useState,useEffect,useCallback,useMemo,useRef,useLayoutEffect,type ReactNode} from 'react';
import {ConfigProvider,theme as antTheme} from 'antd';
import {systemThemeConfig,resolveThemeColors,navigationThemeConfig,sidebarIsDark,themeVariablesFromToken} from './antd_theme';
import zhCN from 'antd/locale/zh_CN';
import {buildSystemTheme,defaultSystemTheme,parseSystemTheme,readSystemTheme,writeSystemTheme,resolveSystemMode,systemThemeKey,type SystemThemeSettings,type SystemThemeMode} from './system_theme';

type ThemeContext={savedSystemTheme:SystemThemeSettings;activeSystemTheme:SystemThemeSettings;theme:'light'|'dark';systemDark:boolean;themeStorageError:string;navigationConfig:ReturnType<typeof navigationThemeConfig>;drawerNavigationConfig:ReturnType<typeof navigationThemeConfig>;navigationMode:'light'|'dark';previewSystemTheme:(s:SystemThemeSettings)=>void;clearSystemThemePreview:()=>void;applySystemTheme:(s:SystemThemeSettings)=>boolean;setThemeMode:(m:SystemThemeMode)=>void;setTheme:(m:'light'|'dark')=>void;transitionSystemTheme:(update:()=>void,animate?:boolean)=>void};
const Context=createContext<ThemeContext|null>(null);
export function useSystemTheme(){const value=useContext(Context);if(!value)throw Error('System theme context missing');return value;}
/** 统一主题位于 Ant App 之上，使确认弹窗、消息与下拉浮层继承同一组颜色。 */
export function SystemThemeProvider({children}:{children:ReactNode}){
 useEffect(()=>{
  let active=true;
  void revealInitialTypography({frame:()=>new Promise(resolve=>requestAnimationFrame(()=>resolve())),ready:()=>document.fonts?.ready||Promise.resolve(),active:()=>active,reveal:()=>document.documentElement.removeAttribute('data-console-booting')});
  return()=>{active=false;};
 },[]);
 const [transition]=useState(()=>createThemeTransition({schedule:job=>queueMicrotask(job),commit:flushSync,enabled:()=>document.visibilityState==='visible'&&!matchMedia('(prefers-reduced-motion: reduce)').matches,mark:active=>{const root=document.documentElement;if(active){root.dataset.themeTransition='page';}else{delete root.dataset.themeTransition;}},start:typeof document.startViewTransition==='function'?update=>document.startViewTransition(update):undefined}));
 const transitionSystemTheme=useCallback((update:()=>void,animate=true)=>transition.run(update,animate),[transition]);
 useEffect(()=>()=>transition.dispose(),[transition]);
 const followingSystem=useRef(false);
 const [initial]=useState(()=>{const result=readSystemTheme(localStorage);const q=new URLSearchParams(location.search).get('theme');return !result.found&&!result.error&&(q==='light'||q==='dark')?{...result,settings:{...defaultSystemTheme(),mode:q as SystemThemeMode}}:result;});
 const [saved,setSaved]=useState(initial.settings),[preview,setPreview]=useState<SystemThemeSettings|null>(null),[modeOverride,setModeOverride]=useState<'light'|'dark'|null>(null),[error,setError]=useState(initial.error||'');
 const [systemDark,setSystemDark]=useState(()=>matchMedia('(prefers-color-scheme: dark)').matches);
 useEffect(()=>{const media=matchMedia('(prefers-color-scheme: dark)'),change=()=>{const dark=media.matches;if(followingSystem.current)transition.run(()=>setSystemDark(dark));else setSystemDark(dark);};media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 useEffect(()=>{const change=(event:StorageEvent)=>{if(event.key!==systemThemeKey)return;const next=readSystemTheme(localStorage);setError(next.error||'');if(!next.error)setSaved(next.settings);};addEventListener('storage',change);return()=>removeEventListener('storage',change);},[]);
 const active=preview||saved;followingSystem.current=!modeOverride&&active.mode==='system';
 const mode=resolveSystemMode(modeOverride||active.mode,systemDark),colors=useMemo(()=>buildSystemTheme(active,mode),[active,mode]);
 const previewSystemTheme=useCallback((next:SystemThemeSettings)=>{setModeOverride(null);setPreview(parseSystemTheme(JSON.stringify(next)));},[]);
 const clearSystemThemePreview=useCallback(()=>{setPreview(null);setModeOverride(null);},[]);
 const applySystemTheme=useCallback((next:SystemThemeSettings)=>{try{const value=parseSystemTheme(JSON.stringify(next));writeSystemTheme(localStorage,value);setSaved(value);setPreview(null);setModeOverride(null);setError('');return true;}catch(e){setError(`主题未能保存：${(e as Error).message}。已有主题和机器人配置保持原样。`);return false;}},[]);
 const setThemeMode=useCallback((next:SystemThemeMode)=>{transition.run(()=>{applySystemTheme({...saved,mode:next});},next!==saved.mode);},[saved,applySystemTheme,transition]);
 const setTheme=useCallback((next:'light'|'dark')=>transition.run(()=>setModeOverride(next)),[transition]);
 const device=(new URLSearchParams(location.search).get('device')||(innerWidth<600?'mobile':innerWidth<1000?'tablet':'desktop')) as 'desktop'|'tablet'|'mobile';
 const [reduceMotion,setReduceMotion]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)'),change=()=>{setReduceMotion(media.matches);if(media.matches)transition.finish();};media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 const config=useMemo(()=>systemThemeConfig(active,mode,device,reduceMotion),[active,mode,device,reduceMotion]);
 const resolved=useMemo(()=>resolveThemeColors(active,mode,device),[active,mode,device]);
 const navigationConfig=useMemo(()=>navigationThemeConfig(resolved,mode,device,'sidebar',active.preset_id==='custom'?active.custom?.appearance:undefined),[resolved,mode,device,active]);
 const drawerNavigationConfig=useMemo(()=>navigationThemeConfig(resolved,mode,device,'drawer',active.preset_id==='custom'?active.custom?.appearance:undefined),[resolved,mode,device,active]);
 return <Context.Provider value={{savedSystemTheme:saved,activeSystemTheme:active,theme:mode,systemDark,themeStorageError:error,navigationConfig,drawerNavigationConfig,navigationMode:sidebarIsDark(resolved)?'dark':'light',previewSystemTheme,clearSystemThemePreview,applySystemTheme,setThemeMode,setTheme,transitionSystemTheme}}><ConfigProvider locale={zhCN} button={{autoInsertSpace:false}} theme={config}><ThemeTokenBridge palette={colors} mode={mode} preset={active.preset_id} customized={active.preset_id==='custom'?active.custom?.appearance:undefined}/>{children}</ConfigProvider></Context.Provider>;
}
/** 读取 Provider 解析后的 Token，将相同主题应用到自有外壳。 */
function ThemeTokenBridge({palette,mode,preset,customized}:{customized?:import('./theme_customization').ThemeAppearance;palette:ReturnType<typeof buildSystemTheme>;mode:'light'|'dark';preset:string}){
 const {token}=antTheme.useToken();
 useLayoutEffect(()=>{
  const root=document.documentElement,vars=themeVariablesFromToken(token,palette);
  root.dataset.theme=mode;root.dataset.systemTheme=preset;
  if(customized)root.dataset.themeCustomized='true';else delete root.dataset.themeCustomized;
  if(customized?.font_size!==undefined)root.dataset.themeTypography='true';else delete root.dataset.themeTypography;
  if(customized?.density)root.dataset.themeDensity=customized.density;else delete root.dataset.themeDensity;
  if(customized?.shadow&&customized.shadow!=='default')root.dataset.themeShadow='true';else delete root.dataset.themeShadow;
  for(const [key,value] of Object.entries(vars))root.style.setProperty(key,value);
  return()=>{for(const key of Object.keys(vars))root.style.removeProperty(key);};
 },[token,palette,mode,preset,customized]);
 return null;
}
