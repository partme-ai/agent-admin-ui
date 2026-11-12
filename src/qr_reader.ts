import jsQR from './vendor/jsqr/jsQR.cjs';
/** 二维码仅在本地解码，不上传图像；识别结果仍须通过配对协议校验。 */
export function decodeQrPixels(data:Uint8ClampedArray,width:number,height:number):string|null{return jsQR(data,width,height,{inversionAttempts:'attemptBoth'})?.data||null;}
export function releaseCamera(stream:MediaStream|null):void{stream?.getTracks().forEach(track=>track.stop());}
export function cameraError(error:unknown):string{const name=(error as {name?:string})?.name;return name==='NotAllowedError'?'相机权限被拒绝，请在浏览器中允许，或选择二维码图片。':name==='NotFoundError'?'没有找到相机，请选择二维码图片或输入服务地址。':name==='NotReadableError'?'相机正被占用，请关闭其他使用相机的应用后重试。':'相机采集已中断，可以重试或选择二维码图片。';}
