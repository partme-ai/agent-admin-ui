/** 系统外观标识，与主题、机器人形象和业务配置分别保存。 */
export type SystemBrand={schema_version:1;name:string;slogan:string;logo:string};
export const systemBrandKey='tinybot.system-brand.v1';
export const maxBrandLogoBytes=256*1024;
export function defaultSystemBrand():SystemBrand{return {schema_version:1,name:'TinyBot',slogan:'机器人控制中心',logo:''};}
/** 校验本地图片格式、字节签名和大小；实际解码由上传界面完成。 */
export function validateBrandLogo(logo:string):void{
 if(logo==='')return;
 const match=/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(logo);
 if(!match||match[2].length%4!==0||match[2].length>Math.ceil(maxBrandLogoBytes/3)*4)throw Error('Logo 请选择 256 KB 以内的 PNG、JPG 或 WebP 图片。');
 let bytes:string;try{bytes=atob(match[2]);}catch{throw Error('Logo 图片编码无效。');}
 if(bytes.length>maxBrandLogoBytes)throw Error('Logo 图片不能超过 256 KB。');
 const signature=match[1]==='png'?bytes.startsWith('\x89PNG\r\n\x1a\n'):match[1]==='jpeg'?bytes.startsWith('\xff\xd8\xff'):bytes.startsWith('RIFF')&&bytes.slice(8,12)==='WEBP';
 if(!signature)throw Error('Logo 图片内容与文件类型不一致。');
}
export function parseSystemBrand(raw:string):SystemBrand{
 if(raw.length>360000)throw Error('系统标识配置过大。');
 let value:unknown;try{value=JSON.parse(raw);}catch{throw Error('系统标识配置无法读取。');}
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('系统标识配置格式不正确。');
 const v=value as Record<string,unknown>;
 if(v.schema_version!==1||typeof v.name!=='string'||typeof v.slogan!=='string'||typeof v.logo!=='string')throw Error('系统标识配置版本或字段不正确。');
 const name=v.name.trim(),slogan=v.slogan.trim();
 if(!name||Array.from(name).length>24||/[\x00-\x1f\x7f]/.test(name))throw Error('系统名称请填写 1～24 个字。');
 if(!slogan||Array.from(slogan).length>48||/[\x00-\x1f\x7f]/.test(slogan))throw Error('Slogan 请填写 1～48 个字。');
 validateBrandLogo(v.logo);return {schema_version:1,name,slogan,logo:v.logo};
}
export function readSystemBrand(storage:Pick<Storage,'getItem'>):{settings:SystemBrand;error?:string}{
 try{const raw=storage.getItem(systemBrandKey);return {settings:raw?parseSystemBrand(raw):defaultSystemBrand()};}
 catch(e){return {settings:defaultSystemBrand(),error:`系统标识未能读取：${(e as Error).message}。原记录已保留。`};}
}
export function writeSystemBrand(storage:Pick<Storage,'setItem'>,settings:SystemBrand):void{storage.setItem(systemBrandKey,JSON.stringify(parseSystemBrand(JSON.stringify(settings))));}
