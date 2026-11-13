// CSS viewport dimensions for layout review; these are not physical display pixels.
export const DEVICE_PRESETS = {
 web: [
  {id:'web-default',name:'Web 标准视口',width:1280,height:1024},
  {id:'web-compact',name:'Web 紧凑视口',width:1024,height:768},
  {id:'web-wide',name:'Web 宽屏',width:1440,height:900},
 ],
 phone: [
  {id:'mobile-default',name:'默认手机',width:390,height:884},
  {id:'iphone-se',name:'iPhone SE',width:375,height:667},
  {id:'iphone-16',name:'iPhone 16',width:393,height:852},
  {id:'android-compact',name:'Android 紧凑屏',width:360,height:800},
  {id:'android-large',name:'Android 大屏',width:412,height:915},
 ],
 tablet: [
  {id:'tablet-default',name:'iPad 标准屏',width:768,height:1024},
  {id:'tablet-medium',name:'平板中屏',width:820,height:1180},
  {id:'tablet-large',name:'平板大屏',width:1024,height:1366},
 ],
 desktop: [
  {id:'desktop-default',name:'默认桌面',width:1280,height:1024},
  {id:'laptop-compact',name:'紧凑笔记本',width:1366,height:768},
  {id:'laptop',name:'笔记本',width:1440,height:900},
  {id:'full-hd',name:'Full HD 桌面',width:1920,height:1080},
 ],
};
export function resolveDeviceViewport(deviceId,presetId,rotated=false){
 const presets=DEVICE_PRESETS[deviceId];
 if(!presets)throw new Error(`Unknown device: ${deviceId}`);
 const preset=presets.find(item=>item.id===presetId)||presets[0];
 return {...preset,width:rotated?preset.height:preset.width,height:rotated?preset.width:preset.height};
}
