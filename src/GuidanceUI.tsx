import {useEffect,useState,type ReactNode} from 'react';
import {Alert,Button,Modal,Select,Space,Tag,Tour,type TourProps} from 'antd';
import {ArrowRightOutlined,CheckOutlined,CloseOutlined,DownOutlined,QuestionCircleOutlined,UpOutlined} from '@ant-design/icons';
import {useConsole} from './context';
import {useOnboarding} from './onboarding_provider';
import {onboardingOrder,probeOnboardingModel,type OnboardingStep} from './onboarding';
import './onboarding.css';

const labels={model:'模型',knowledge:'知识库',agent:'智能体',trial:'对话调试',publish:'发布'};
const pageHelp:Record<string,{title:string;description:string;selector:string}[]>={
 '06':[{title:'选择厂商与接入方案',description:'左侧选厂商，右侧配置区域、套餐、协议和模型。当前不会向厂商发送请求。',selector:'.provider-browser-list'},{title:'保存后检查连接',description:'保存配置后进行演示检测，再在配置清单里选择这条 LLM 连接。待检测或停用的模型不能进入就绪状态。',selector:'.provider-detail'}],
 '07':[{title:'保存模型连接',description:'按厂商实际字段填写配置。当前只做本地校验与演练，不验证真实密钥或模型可用性。',selector:'.model-config-main'}],
 '08':[{title:'创建或使用已有知识库',description:'可以打开一个已有知识库，也可以新建。普通对话不依赖知识库，可在清单里选择稍后配置。',selector:'.page-actions'}],
 '09':[{title:'导入资料',description:'导入 TXT 或 Markdown，打开文档任务建立本地索引。PDF 和 Office 当前等待解析服务，不会假装处理成功。',selector:'.page-actions'},{title:'确认已索引',description:'只有非空文本且状态为已索引，才完成本次知识准备。修改切片或模型后需要重新索引。',selector:'.knowledge-documents-table,.knowledge-documents-mobile'}],
 '10':[{title:'处理与失败重试',description:'点击开始解析与索引；失败时检查文本再重试。当前为本地索引演练，不执行向量化。',selector:'.page-actions'}],
 '11':[{title:'先验证资料命中',description:'输入与资料有关的问题，检查命中来源。这里是本地文本匹配；实际问答效果等待知识服务接入。',selector:'form'}],
 '03':[{title:'选定本次智能体',description:'打开智能体配置继续编辑，或从市场创建。引导会检查它是否使用本次选择的模型与知识。',selector:'.asset-grid'}],
 '05':[{title:'从模板创建草稿',description:'查看人格、Prompt、能力和声音，选择后进入智能体配置定制，不覆盖已有智能体。',selector:'.page-header'}],
 '04':[{title:'检查 Prompt 与关联资源',description:'人格、角色提示词、十项能力、知识与扩展分别配置。主模型和知识需与本次清单一致，不需要的能力可以不启用。',selector:'.role-tab-list'},{title:'保存、试聊再发布',description:'先保存草稿，完成一轮模拟回应，再确认发布。配置或依赖变化后需重新试聊；新会话使用发布快照。',selector:'.role-creation-flow'}],
 '02':[{title:'确认智能体与知识',description:'选择要调试的智能体及关联知识，检查模型、工具、技能和记忆。',selector:'.agent-debug-config'},{title:'完成一次模拟回应',description:'可用文字测试，无需麦克风授权。完整回应才算通过；停止、插话和离开会取消本轮。当前不接真实 ASR、LLM 或 TTS。',selector:'.agent-debug-conversation'}],
};
function helpForPage(c:ReturnType<typeof useConsole>){
 if(c.page==='09'&&c.store.knowledge.find(k=>k.id===c.selected)?.kind==='faq')return [{title:'维护问答',description:'添加标准问、相似问、反例与答案；启用后参与本地文本匹配。向量索引和模型生成尚未接入。',selector:'.knowledge-faq-table'},{title:'知识库配置',description:'模型、向量存储与 FAQ 索引方式在“配置知识库”中维护。配置变化后需重新检查本地索引与智能体试聊。',selector:'.page-actions'}];
 return pageHelp[c.page];
}
const stepPages:Record<OnboardingStep,string[]>={model:['06','07'],knowledge:['08','09','10','11'],agent:['03','04','05'],trial:['02','04'],publish:['04']};
const visibleTarget=(selector:string)=>()=>Array.from(document.querySelectorAll<HTMLElement>(selector)).find(e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0)||document.querySelector<HTMLElement>('.page-header')||document.body;

function ModelProbe(){
 const c=useConsole(),g=useOnboarding(),[open,setOpen]=useState(false),[fault,setFault]=useState<'success'|'auth'|'network'>('success'),[result,setResult]=useState<ReturnType<typeof probeOnboardingModel>|null>(null);
 const model=c.store.connections.find(m=>m.id===g.state.modelId);
 if(!model||(!model.config&&!model.customProviderId))return null;
 return <><Button size="small" onClick={()=>{setOpen(true);setResult(null);}}>本地检测演练</Button><Modal title="模型连接 · 本地演练" open={open} onCancel={()=>setOpen(false)} width={440} footer={<Space wrap><Button onClick={()=>setOpen(false)}>返回配置</Button><Button type="primary" disabled={model.enabled===false} onClick={()=>{const checked=probeOnboardingModel(model,fault,c.store.customProviders);setResult(checked);c.setStore(s=>({...s,connections:s.connections.map(m=>m.id===model.id?{...m,status:checked.status}:m)}));}}>执行本地检测</Button></Space>}><p>{model.name} · {model.model}</p><Alert type="info" title="只校验已保存配置并模拟响应，不发送网络请求，也不验证真实密钥。"/><label className="guide-probe-label">模拟服务响应</label><Select aria-label="模型检测演练结果" value={fault} onChange={setFault} options={[{value:'success',label:'响应成功'},{value:'auth',label:'鉴权失败'},{value:'network',label:'连接中断'}]} style={{width:'100%'}}/>{result&&<Alert className="margin-top" showIcon type={result.ok?'success':'warning'} title={result.message}/>}</Modal></>;
}

/** 引导选择仅改变本次任务的目标 ID，实际配置仍使用原页面编辑器。 */
function ResourceChoice({step}:{step:OnboardingStep}){
 const c=useConsole(),g=useOnboarding(),s=g.state;
 const definitions={
  model:{value:s.modelId,field:'modelId',placeholder:'选择本次模型连接',options:c.store.connections.filter(m=>(m.role||'LLM')==='LLM').map(m=>({value:m.id,label:`${m.name} · ${m.enabled===false?'已停用':m.status}`}))},
  knowledge:{value:s.knowledgeId,field:'knowledgeId',placeholder:'选择本次知识库',options:c.store.knowledge.map(k=>({value:k.id,label:k.name}))},
  agent:{value:s.agentId,field:'agentId',placeholder:'选择本次智能体',options:c.store.agents.map(a=>({value:a.id,label:`${a.name} · ${a.published?'已发布':'草稿'}`}))},
 };
 if(!(step in definitions))return null;
 const d=definitions[step as keyof typeof definitions];
 return <Select className="guide-resource-choice" aria-label={d.placeholder} showSearch allowClear optionFilterProp="label" placeholder={d.placeholder} value={d.options.some(o=>o.value===d.value)?d.value:undefined} options={d.options} onChange={value=>{g.patch({[d.field]:value||'',skipped:g.state.skipped.filter(s=>s!==step)});if(step==='agent'&&value&&c.page==='04'&&c.selected!==value)c.go('04',value);}}/>;
}

export function OnboardingChecklist({full=false}:{full?:boolean}){
 const g=useOnboarding(),done=g.rows.filter(r=>r.status==='done').length,skipped=g.rows.filter(r=>r.status==='skipped').length;
 const remaining=g.rows.find(r=>r.status==='pending'),collapsed=g.state.collapsed&&!full;
 return <section className={`onboarding-checklist ${collapsed?'is-collapsed':''}`} aria-label="首次配置清单">
  <header className="guide-checklist-heading"><div><strong>首次配置</strong><span>{done} / 5 已完成{skipped?` · ${skipped} 项稍后`:''}</span><Tag>本地演练</Tag></div><Space size={4} wrap><Button size="small" type="text" onClick={g.replay}>功能导览</Button>{g.state.active?<Button size="small" type="text" onClick={g.pause}>暂停引导</Button>:remaining&&<Button size="small" type="primary" onClick={()=>g.start(remaining.id)}>继续配置</Button>}{!full&&<Button type="text" size="small" aria-label={collapsed?'展开配置清单':'收起配置清单'} icon={collapsed?<DownOutlined/>:<UpOutlined/>} onClick={()=>g.patch({collapsed:!collapsed})}/>}</Space></header>
  {!collapsed&&<><p className="guide-boundary">选择已有资源或去对应页面新建。进度按配置重新检查；业务数据仍限本次会话，刷新后可能需要重新准备。</p>
  <div className="guide-checklist-rows">{g.rows.map((row,i)=><div className={`guide-checklist-row guide-status-${row.status}`} key={row.id} data-guide-step={row.id}>
   <span className="guide-step-index">{row.status==='done'?<CheckOutlined/>:i+1}</span><div className="guide-step-content"><div className="guide-step-title"><strong>{row.title}</strong><span>{row.status==='done'?'演练已完成':row.status==='skipped'?'稍后配置':'待完成'}</span></div><p title={row.detail}>{row.detail}</p></div>
   <ResourceChoice step={row.id}/><div className="guide-step-actions"><Button size="small" onClick={()=>g.start(row.id)}>{row.status==='done'?'查看':'去配置'}<ArrowRightOutlined/></Button>{row.status==='skipped'?<Button size="small" type="text" onClick={()=>g.restore(row.id)}>恢复此项</Button>:row.status!=='done'&&<Button size="small" type="text" onClick={()=>g.skip(row.id)}>稍后</Button>}</div>
  </div>)}</div>{done===5&&<p className="guide-complete" role="status"><CheckOutlined/> 本地配置流程已走通；真实模型效果仍待服务接入。</p>}{!remaining&&done<5&&<p className="guide-boundary">其余项目已跳过，并未通过验证。可随时恢复；调试和发布仍检查必要依赖。</p>}</>}
  {g.storageError&&<Alert type="warning" title={g.storageError}/>}</section>;
}

export function OnboardingPageTip(){
 const c=useConsole(),g=useOnboarding(),help=helpForPage(c),tipKey=`page:${c.page}`;
 const tipHidden=g.state.hiddenTips.includes(tipKey),current=g.rows.find(r=>r.id===g.state.current)!;
 const inStep=g.state.active&&stepPages[g.state.current].includes(c.page);
 if(!help||c.page==='00')return null;
 return (<div className={`onboarding-page-tip ${tipHidden?'is-hidden':''}`} aria-label="页面操作引导">
   {tipHidden?<Button type="text" size="small" icon={<QuestionCircleOutlined/>} onClick={()=>g.patch({hiddenTips:g.state.hiddenTips.filter(k=>k!==tipKey)})}>查看操作引导</Button>:<><div className="guide-tip-copy"><strong>{inStep?`${onboardingOrder.indexOf(current.id)+1} / 5 · ${current.title}`:help[0].title}</strong><span>{inStep?current.detail:help[0].description}</span></div><div className="guide-tip-actions">{inStep&&<ResourceChoice step={current.id}/>}<Button size="small" type="text" onClick={()=>{g.setTour('page');}}>操作说明</Button>{inStep&&<>{current.id==='model'&&<ModelProbe/>}<Button size="small" onClick={()=>c.go('01')}>配置清单</Button><Button size="small" type="text" onClick={()=>g.skip(current.id)}>稍后</Button><Button size="small" type="primary" disabled={current.status==='pending'} onClick={g.next}>继续下一步</Button></>}<Button type="text" size="small" aria-label="收起页面引导" icon={<CloseOutlined/>} onClick={()=>g.patch({hiddenTips:[...g.state.hiddenTips,tipKey]})}/></div></>}
  </div>);
}

/** 页面级提示不会自动提交、采集或导航；继续前保留页面本身的未保存确认。 */
export function OnboardingFrame({children}:{children:ReactNode}){
 const c=useConsole(),g=useOnboarding(),[pageTourStep,setPageTourStep]=useState(0);
 const help=helpForPage(c);
 useEffect(()=>setPageTourStep(0),[g.tour,c.page]);
 const firstVisit=c.page==='01'&&g.state.intro==='new'&&window.parent===window&&c.scenario==='normal';
 const intro:TourProps['steps']=[
  {title:'从一条可用的配置开始',description:'这份引导串起模型、知识、智能体、试聊、发布。可以使用已有配置，不会重置你的主题或业务配置。',target:visibleTarget('.page-header')},
  {title:'配置模型',description:'选厂商与接入方案，再检查模型连接。当前只做本地演练，保存成功不等于真实服务可用。',target:visibleTarget('[data-menu-key="models"]')},
  {title:'准备知识',description:'导入资料并确认索引；普通对话可以稍后配置知识。索引失败时会留在当前步骤。',target:visibleTarget('[data-menu-key="knowledge"]')},
  {title:'创建智能体',description:'从模板或已有角色开始，配置 Prompt、人格、能力、声音与资源关联。',target:visibleTarget('[data-menu-key="agents"]')},
  {title:'先试聊，再发布',description:'在对话调试中完成一轮模拟回应，再发布当前配置。试聊中断或配置变化都需要重新检查。',target:visibleTarget('.home-agent-grid')},
 ].map((s,i)=>({...s,placement:c.device==='mobile'?'bottom':'right',nextButtonProps:{children:i===4?'打开配置清单':'下一步'},prevButtonProps:{children:'上一步'}}));
 const closeTour=()=>{if(g.tour==='intro')g.patch({intro:'paused'});g.setTour(null);};
 const contextual:TourProps['steps']=help?.map((s,i)=>({...s,target:visibleTarget(s.selector),placement:'bottom',nextButtonProps:{children:i===help.length-1?'知道了':'下一步'},prevButtonProps:{children:'上一步'}}));
 return <>
  {children}
  <Modal title="开始使用 Agent Admin UI" open={firstVisit&&!g.tour} onCancel={()=>g.patch({intro:'paused'})} width={440} footer={<Space wrap><Button onClick={()=>g.patch({intro:'paused'})}>暂时跳过</Button><Button onClick={()=>{g.patch({intro:'done',active:true});}}>直接配置</Button><Button type="primary" onClick={()=>{g.patch({intro:'paused',tourStep:0});g.setTour('intro');}}>开始导览</Button></Space>}><p>先了解入口，再用同一组模型、知识和智能体完成对话调试。</p><p className="muted">已有配置保持不变。当前引导只验证本地演练，不连接真实服务。</p></Modal>
  <Tour className={`tinybot-onboarding-tour ${c.device==='mobile'?'guide-mobile-tour':''}`} open={g.tour==='intro'&&c.page==='01'||g.tour==='page'&&!!help} current={g.tour==='intro'?g.state.tourStep:pageTourStep} steps={g.tour==='intro'?intro:contextual} disabledInteraction onChange={step=>g.tour==='intro'?g.patch({tourStep:step}):setPageTourStep(step)} onClose={closeTour} onFinish={()=>{if(g.tour==='intro')g.patch({intro:'done',active:true,collapsed:false});g.setTour(null);}} styles={{section:{maxWidth:c.device==='mobile'?'calc(100vw - 32px)':360}}}/>
 </>;
}
