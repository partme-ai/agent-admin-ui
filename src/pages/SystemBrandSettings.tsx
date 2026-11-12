import {useRef,useState} from 'react';
import {Alert,Button,Drawer,Form,Input,Space,Upload} from 'antd';
import {useConsole} from '../context';
import {KeyValue,Section} from '../components';
import {BrandLogo} from '../BrandLogo';
import {defaultSystemBrand,maxBrandLogoBytes,parseSystemBrand,validateBrandLogo,type SystemBrand} from '../system_brand';
export function SystemBrandSettings(){
 const c=useConsole(),[draft,setDraft]=useState<SystemBrand|null>(null),[error,setError]=useState(''),[uploading,setUploading]=useState(false),uploadVersion=useRef(0);
 function close(){uploadVersion.current++;setUploading(false);setDraft(null);setError('');}
 async function upload(file:File){
  const version=++uploadVersion.current;setUploading(true);setError('');
  try{
   if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>maxBrandLogoBytes)throw Error('请选择 256 KB 以内的 PNG、JPG 或 WebP 图片。');
   const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(Error('Logo 文件读取失败，请重新选择。'));reader.readAsDataURL(file);});
   validateBrandLogo(data);const url=URL.createObjectURL(file);
   try{const image=new Image();image.src=url;try{await image.decode();}catch{throw Error('Logo 图片无法解码，请换一张有效图片。');}if(!image.naturalWidth||image.naturalWidth>4096||image.naturalHeight>4096)throw Error('Logo 尺寸不能超过 4096 × 4096。');}finally{URL.revokeObjectURL(url);}
   if(version===uploadVersion.current)setDraft(value=>value?{...value,logo:data}:value);
  }catch(e){if(version===uploadVersion.current)setError((e as Error).message||'Logo 图片无法解码，请换一张图片。');}
  finally{if(version===uploadVersion.current)setUploading(false);}
  return false;
 }
 function save(){if(!draft||uploading)return;try{const value=parseSystemBrand(JSON.stringify(draft));if(c.saveBranding(value)){close();c.notify('系统标识已保存');}}catch(e){setError((e as Error).message);}}
 const preview=draft||c.branding;
 return <><Section title="系统信息" extra={<Button onClick={()=>{setError('');setDraft({...c.branding});}}>编辑标识</Button>}>
  <div className="system-brand-summary"><span className="brand-mark"><BrandLogo logo={c.branding.logo}/></span><div><strong title={c.branding.name}>{c.branding.name}</strong><span title={c.branding.slogan}>{c.branding.slogan}</span></div></div>
  {c.brandingError&&<Alert type="warning" showIcon title={c.brandingError}/>}
  <KeyValue items={[["系统名称",c.branding.name],["Slogan",c.branding.slogan],["智能体框架","AgentScope-Rust"],["工作空间",c.store.preferences.name],["当前宿主",{web:'Agent Admin UI Web',desktop:'Agent Admin UI Desktop',android:'Android Tablet',ipad:'iPad'}[c.host]],["当前版本","交互原型 1.88"]]}/>
 </Section>
 <Drawer title="编辑系统标识" open={!!draft} onClose={close} size={c.device==='mobile'?'100%':440} footer={<div className="system-brand-footer"><Button disabled={uploading} onClick={()=>{setDraft(defaultSystemBrand());setError('');}}>恢复默认</Button><Space><Button onClick={close}>取消</Button><Button type="primary" loading={uploading} onClick={save}>保存标识</Button></Space></div>}>
  <div className="system-brand-preview"><span className="brand-mark"><BrandLogo logo={preview.logo}/></span><div><strong>{preview.name||'系统名称'}</strong><span>{preview.slogan||'Slogan'}</span></div></div>
  <Form layout="vertical" onFinish={save}>
   <Form.Item label="Logo"><Space wrap><Upload accept="image/png,image/jpeg,image/webp" showUploadList={false} beforeUpload={upload}><Button loading={uploading}>上传 Logo</Button></Upload><Button disabled={!draft?.logo||uploading} onClick={()=>setDraft(value=>value?{...value,logo:''}:value)}>使用默认图标</Button></Space><p className="muted small-text">PNG、JPG、WebP，256 KB 以内，推荐正方形透明背景。</p></Form.Item>
   <Form.Item label="系统名称" required><Input aria-label="系统名称" value={draft?.name||''} maxLength={24} showCount onChange={e=>{setError('');setDraft(value=>value?{...value,name:e.target.value}:value);}}/></Form.Item>
   <Form.Item label="Slogan" required><Input aria-label="系统 Slogan" value={draft?.slogan||''} maxLength={48} showCount onChange={e=>{setError('');setDraft(value=>value?{...value,slogan:e.target.value}:value);}}/></Form.Item>
  </Form>
  {(error||c.brandingError)&&<Alert type="error" showIcon title={error||c.brandingError}/>}
  <p className="muted small-text">保存在当前浏览器，同源窗口同步显示。</p>
 </Drawer></>;
}
