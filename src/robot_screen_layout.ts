import type {TrialDeviceProfile} from './robot_trial.ts';

/** 布局使用设备的逻辑像素，预览仅整体等比适配，不单独压缩字幕字号。 */
export function robotScreenLayout(profile:TrialDeviceProfile){
 const {width,height,shape}=profile;
 if(width>=480&&width/height>=1.5){
  const fontSize=Math.round(height/16),lineHeight=Math.round(fontSize*1.4),lines=4;
  return {width,height,previewWidth:Math.min(width,360),fontSize,lineHeight,lines,
   face:{x:16,y:16,width:Math.round(width*.48),height:height-32},
   caption:{x:Math.round(width*.54),y:Math.round((height-lineHeight*lines)/2),width:Math.round(width*.42),height:lineHeight*lines}};
 }
 const round=shape==='round',fontSize=round?14:15,lineHeight=21,lines=round?2:3;
 return {width,height,previewWidth:width,fontSize,lineHeight,lines,
  face:{x:Math.round((width-224)/2)+(round?16:0),y:4,width:round?192:224,height:154},
  caption:{x:round?48:14,y:round?166:167,width:round?144:width-28,height:lineHeight*lines}};
}
