type InitialTypography={frame:()=>Promise<void>;ready:()=>Promise<unknown>;reveal:()=>void;active?:()=>boolean};
/** 等首屏布局发现实际使用的字库，再显示内容，避免替代字体被网页字体替换时跳动。 */
export async function revealInitialTypography({frame,ready,reveal,active=()=>true}:InitialTypography):Promise<void>{
 await frame();
 if(!active())return;
 // FontFaceSet.ready在成功或字体请求失败后都结束；失败时显示浏览器最终回退。
 try{await ready();}catch{/* 不让字体API异常阻塞已有页面。 */}
 await frame();
 if(active())reveal();
}
