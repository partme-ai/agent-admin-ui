/** 浏览器翻页句柄；跳过动画不等于跳过主题更新。 */
export type ThemeTransitionHandle={ready:Promise<void>;updateCallbackDone:Promise<void>;finished:Promise<void>;skipTransition:()=>void};
type Host={schedule:(job:()=>void)=>void;commit:(job:()=>void)=>void;enabled:()=>boolean;mark:(active:boolean)=>void;start?:((update:()=>void)=>ThemeTransitionHandle)};
/** 纯视觉调度器：不访问存储，快速切换只提交最后一次选择。 */
export function createThemeTransition(host:Host){
 let version=0,disposed=false,current:ThemeTransitionHandle|null=null;
 const skip=()=>{try{current?.skipTransition();}catch{/* 取消快照失败不影响接下来的主题提交。 */}current=null;};
 return {
  /** 在React生命周期之外安排一次切换，返回前不修改持久化配置。 */
  run(update:()=>void,animate=true){
   if(disposed)return;const requested=++version;skip();
   host.schedule(()=>{
    if(disposed||requested!==version)return;
    let committed=false;
    const commit=()=>{if(disposed||requested!==version||committed)return;committed=true;host.commit(update);};
    const finish=()=>{if(requested===version){current=null;host.mark(false);}};
    if(!animate||!host.enabled()||!host.start){commit();finish();return;}
    host.mark(true);
    try{
     const animation=host.start(commit);current=animation;
     void animation.ready.catch(()=>{});
     void animation.updateCallbackDone.catch(()=>{commit();finish();});
     void animation.finished.then(finish,finish);
    }catch{commit();finish();}
   });
  },
  /** 用户偏好减少动画时立即结束视觉过渡，仍允许当前主题更新。 */
  finish(){skip();host.mark(false);},
  /** 卸载时清理动画和排队任务，防止迟到回调重新写入页面。 */
  dispose(){disposed=true;version++;skip();host.mark(false);}
 };
}
