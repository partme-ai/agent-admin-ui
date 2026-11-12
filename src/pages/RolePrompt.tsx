import {useState} from 'react';
import {Alert,Button,Empty,Form,Input,Modal,Segmented,Select,Space,Tag} from 'antd';
import {BookOutlined,FileTextOutlined,PlusOutlined,SaveOutlined} from '@ant-design/icons';
import {useConsole} from '../context';
import type {Agent} from '../state';
import {cloneRoleProfile,effectiveRoleInstructions} from '../role_profile';
import '../role_prompt.css';

const examplePrompt=`## 职责
理解用户真正想完成的事情，提供清晰、可操作的帮助。

## 回答方式
优先给出结论，再解释必要依据；信息不足时先询问关键问题。

## 知识与工具
只使用当前角色已授权的知识和工具。引用资料时说明来源。

## 行为边界
不编造执行结果；设备操作、写入与外部发送先核对权限并请求确认。

## 无法完成时
说明缺少的条件，保留已经完成的工作，并给出可继续的下一步。`;
const suspiciousCredential=(text:string)=>/\bsk-[A-Za-z0-9_-]{16,}|\bAKIA[A-Z0-9]{16}\b|-----BEGIN [A-Z ]*PRIVATE KEY-----|authorization\s*[:=]\s*bearer\s+[A-Za-z0-9._-]{12,}/i.test(text);

/** 角色提示词只有 agent.instructions 一份事实源；预览不写回人格或性格。 */
export function RolePrompt({agent,onChange}:{agent:Agent;onChange:(patch:Partial<Agent>)=>void}){
 const c=useConsole(),[view,setView]=useState(c.device==='desktop'?'对照':'编辑'),[preview,setPreview]=useState('最终生效'),[example,setExample]=useState(false),[templateOpen,setTemplateOpen]=useState(false),[selected,setSelected]=useState(''),[saving,setSaving]=useState(false),[templateName,setTemplateName]=useState(''),[templateError,setTemplateError]=useState(''),[inputError,setInputError]=useState('');
 const instructions=agent.instructions||'',profile=cloneRoleProfile(agent.profile),effective=effectiveRoleInstructions(instructions,profile),template=c.store.promptTemplates.find(t=>t.id===selected);
 function apply(text:string){if(suspiciousCredential(text)){setInputError('检测到疑似认证凭据，请移除后改用连接中的凭据引用。');return false;}onChange({instructions:text});setInputError('');return true;}
 function saveTemplate(){
  const name=templateName.trim();
  if(!name){setTemplateError('请填写模板名称');return;}
  if(c.store.promptTemplates.some(t=>t.name.trim().toLocaleLowerCase()===name.toLocaleLowerCase())){setTemplateError('已有同名提示词模板，请换一个名称');return;}
  if(!instructions.trim()){setTemplateError('请先填写角色提示词');return;}
  if(suspiciousCredential(instructions)){setTemplateError('提示词包含疑似凭据，请移除后再保存');return;}
  c.setStore(s=>({...s,promptTemplates:[...s.promptTemplates,{id:crypto.randomUUID(),name,instructions}]}));setSaving(false);setTemplateName('');setTemplateError('');c.notify('已保存为我的提示词模板，角色草稿保持不变。');
 }
 return <section className="role-prompt" aria-label="角色提示词 Prompt">
  <div className="role-prompt-heading"><div><h3>角色提示词</h3><p>明确它怎样回答、何时使用知识与工具，以及遇到问题时怎样处理。</p></div><Space wrap><Button icon={<BookOutlined/>} onClick={()=>{setSelected('');setTemplateOpen(true);}}>我的模板</Button><Button icon={<FileTextOutlined/>} onClick={()=>setExample(true)}>结构示例</Button><Button icon={<SaveOutlined/>} disabled={!instructions.trim()} onClick={()=>{setTemplateName(`${agent.name.split(' · ')[0]} · 提示词`);setTemplateError('');setSaving(true);}}>存为模板</Button></Space></div>
  <div className="role-prompt-toolbar"><Segmented aria-label="提示词编辑视图" value={view} options={['编辑','预览','对照']} onChange={setView}/><span><FileTextOutlined/> 人格与性格会与本页提示词共同生效</span></div>
  <div className={`role-prompt-workspace view-${view==='对照'?'split':view==='编辑'?'edit':'preview'}`}>
   <div className="role-prompt-editor"><div className="role-prompt-panel-title"><strong>原始提示词</strong><Tag>角色草稿</Tag></div><Form layout="vertical"><Form.Item required label="角色提示词正文" validateStatus={inputError||!instructions.trim()?'error':undefined} help={inputError||(!instructions.trim()?'提示词不能为空，请描述角色的职责和回答规则。':undefined)}><Input.TextArea aria-label="角色提示词正文" value={instructions} rows={16} showCount onChange={e=>apply(e.target.value)} placeholder="写下角色的职责、回答方式、知识与工具规则，以及行为边界…" spellCheck={false}/></Form.Item></Form><div className="role-prompt-editor-footer"><span>仅修改提示词，不覆盖人格、性格或能力配置。</span><span>{instructions.trim().length?'等待父面板保存 / 发布':'尚未填写'}</span></div></div>
   <div className="role-prompt-preview"><div className="role-prompt-panel-title"><strong>内容预览</strong><Segmented size="small" aria-label="提示词预览内容" value={preview} options={['原始 Prompt','最终生效']} onChange={setPreview}/></div><div className="role-prompt-preview-meta">{preview==='最终生效'?<><span className="role-prompt-dot"/>人格与性格 ＋ 角色提示词</>:<><FileTextOutlined/>仅显示本页编辑内容</>}</div><pre aria-label={preview==='最终生效'?'最终生效提示词':'原始提示词预览'}>{preview==='最终生效'?effective:instructions||'尚未填写角色提示词。'}</pre></div>
  </div>
  <p className="role-prompt-note">保存草稿和发布使用面板顶部按钮。预览为本地内容组合，不调用模型；密钥、令牌等认证信息请在模型或工具连接中引用。</p>
  <Modal className="role-prompt-modal" title="角色提示词结构示例" open={example} onCancel={()=>setExample(false)} width={650} footer={<Space wrap><Button onClick={()=>setExample(false)}>取消</Button><Button icon={<PlusOutlined/>} onClick={()=>{if(apply(instructions.trim()?`${instructions.trim()}\n\n${examplePrompt}`:examplePrompt))setExample(false);}}>追加到末尾</Button><Button type="primary" onClick={()=>c.confirm('替换角色提示词',`将替换「${agent.name}」当前草稿中的提示词正文，人格与性格保持不变。`,()=>{if(apply(examplePrompt))setExample(false);})}>替换当前提示词</Button></Space>}><p className="muted">示例帮助组织正文，按角色的实际职责修改。取消不会改变当前草稿。</p><pre className="role-prompt-template-preview">{examplePrompt}</pre></Modal>
  <Modal className="role-prompt-modal" title="从我的提示词模板应用" open={templateOpen} onCancel={()=>setTemplateOpen(false)} width={650} footer={<Space><Button onClick={()=>setTemplateOpen(false)}>取消</Button><Button type="primary" disabled={!template} onClick={()=>{if(!template)return;c.confirm('应用提示词模板',`使用「${template.name}」替换当前提示词正文，只修改本页草稿，人格与性格保持不变。`,()=>{if(apply(template.instructions))setTemplateOpen(false);});}}>应用到角色</Button></Space>}><Form layout="vertical"><Form.Item label="选择提示词模板"><Select aria-label="选择提示词模板" allowClear value={selected||undefined} placeholder="选择已有模板" onChange={id=>setSelected(id||'')} options={c.store.promptTemplates.map(t=>({value:t.id,label:t.name}))}/></Form.Item></Form>{template?<><div className="role-prompt-template-info"><strong>{template.name}</strong><span>{template.instructions.length} 字</span></div><pre className="role-prompt-template-preview">{template.instructions}</pre></>:<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={c.store.promptTemplates.length?'先选择模板，预览后再应用。':'还没有提示词模板，可先把当前正文存为模板。'}/>}</Modal>
  <Modal title="保存为提示词模板" open={saving} onCancel={()=>{setSaving(false);setTemplateError('');}} onOk={saveTemplate} okText="保存模板" cancelText="取消"><Form layout="vertical"><Form.Item label="模板名称" required validateStatus={templateError?'error':undefined} help={templateError||'保存提示词正文，不包含人格、性格、密钥或运行记忆。'}><Input aria-label="角色提示词模板名称" value={templateName} maxLength={60} onChange={e=>{setTemplateName(e.target.value);setTemplateError('');}} placeholder="例如：设备问答 · 简洁版"/></Form.Item></Form><div className="role-prompt-template-info"><span>当前角色：{agent.name}</span><span>{instructions.length} 字</span></div></Modal>
 </section>;
}
