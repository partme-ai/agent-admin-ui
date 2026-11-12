import {useState,type ReactNode} from 'react';
import {Button,Checkbox,Input,Select,Switch} from 'antd';
import {DownOutlined,UpOutlined,FilePdfOutlined,FileWordOutlined,FilePptOutlined,FileExcelOutlined,FileOutlined,FileMarkdownOutlined,PictureOutlined,AudioOutlined} from '@ant-design/icons';
import {parserReferenceGroups} from '../knowledge_editor_reference';
import {ocrLanguages,parserDefinitions,parserModels,parserOptions,readParserSettings,selectParserEngine,updateParserSettings,type ParserRule,type ParserSettings} from '../knowledge_parser';

const icons={pdf:<FilePdfOutlined/>,word:<FileWordOutlined/>,ppt:<FilePptOutlined/>,excel:<FileExcelOutlined/>,file:<FileOutlined/>,code:<FileMarkdownOutlined/>,image:<PictureOutlined/>,audio:<AudioOutlined/>};
export function KnowledgeParserSettings({rules,onChange}:{rules:ParserRule[];onChange:(rules:ParserRule[])=>void}){
 const [expanded,setExpanded]=useState<Record<string,boolean>>({});
 return <div className="kb-parser-list">{parserReferenceGroups.map(({label,types,icon,defaultEngine})=>{
  const key=types[0],rule=rules.find(r=>r.file_types.includes(key)),engine=rule?.engine||defaultEngine,definition=parserDefinitions[engine],settings=readParserSettings(rules,types,engine),models=parserModels(engine,types),options=parserOptions(types);
  const hasConfig=!!(definition?.remote||definition?.note),isOpen=expanded[key]??!!rule?.engine;
  const update=(patch:Partial<ParserSettings>)=>onChange(updateParserSettings(rules,types,engine,patch));
  const field=(name:string,control:ReactNode)=> <label className="kb-parser-field"><span>{name}</span>{control}</label>;
  return <section className="kb-parser-entry" key={key} aria-label={`${label}解析配置`}>
   <div className="kb-setting-row"><div className="kb-setting-info"><label>{icons[icon as keyof typeof icons]} {label}</label><p className="kb-file-types">{types.map(t=><code key={t}>.{t}</code>)}</p></div><div className="kb-setting-control">
    <Select aria-label={`${label}解析引擎`} value={rule?.engine||''} onChange={value=>{onChange(selectParserEngine(rules,types,value));setExpanded(current=>({...current,[key]:true}));}} options={[{value:'',label:`${parserDefinitions[defaultEngine].label} (默认)`},...options,...(rule?.engine&&!options.some(o=>o.value===rule.engine)?[{value:rule.engine,label:`${rule.engine}（已有配置）`}]:[])]}/>
    {hasConfig&&<Button size="small" type="link" className="kb-parser-config-toggle" aria-label={`${label}${isOpen?'收起':'展开'}配置`} aria-expanded={isOpen} icon={isOpen?<UpOutlined/>:<DownOutlined/>} onClick={()=>setExpanded(current=>({...current,[key]:!isOpen}))}>{isOpen?'收起配置':'配置引擎'}</Button>}
    {label==='Excel 表格'&&rule?.engine==='builtin'&&<Checkbox checked={rule.xlsx_first_row_as_header!==false} onChange={e=>onChange(selectParserEngine(rules,types,engine).map(r=>r.file_types.includes(key)?{...r,xlsx_first_row_as_header:e.target.checked}:r))}>第一行作为表头</Checkbox>}
   </div></div>
   {hasConfig&&isOpen&&<div className="kb-parser-config">
    <div className="kb-parser-config-heading"><strong>{definition.label}</strong><small>{definition.remote?'服务连接配置':'宿主能力配置'} · 未接入</small></div>
    {definition.note&&<p className="kb-parser-note">{definition.note}</p>}
    {definition.remote&&<>
     {field('API 地址',<Input aria-label={`${label} API 地址`} placeholder={definition.apiHost} value={settings.apiHost||''} onChange={e=>update({apiHost:e.target.value})}/>)}
     {field('API 密钥引用',<Select aria-label={`${label} API 密钥引用`} mode="tags" tokenSeparators={[',','，']} placeholder="填写凭据名称，回车或逗号确认" value={settings.credentialRefs||[]} onChange={values=>update({credentialRefs:values.map(v=>v.trim()).filter(Boolean)})} options={[]}/>)}
     <p className="kb-parser-note">仅保存凭据名称，密钥由宿主管理。当前不校验密钥、不请求服务。{definition.keyUrl&&<> <a href={definition.keyUrl} target="_blank" rel="noreferrer">获取密钥 ↗</a></>}</p>
    </>}
    {models.length>0&&field('解析模型',<Select aria-label={`${label}解析模型`} value={settings.modelId} onChange={value=>update({modelId:value})} options={models.map(value=>({value,label:value}))}/>)}
    {engine==='doc2x'&&<>
     {field('公式等级',<Select aria-label="Doc2x 公式等级" disabled={settings.modelId!=='v3-2026'} value={settings.formulaLevel} onChange={value=>update({formulaLevel:value})} options={[0,1,2].map(value=>({value,label:String(value)}))}/>)}
     {field('跨页表格合并',<Switch aria-label="Doc2x 跨页表格合并" disabled={settings.modelId!=='v3-2026'} checked={settings.mergeCrossPageForms} onChange={value=>update({mergeCrossPageForms:value})}/>)}
     {settings.modelId==='v2'&&<p className="kb-parser-note">公式等级和跨页表格合并仅用于 v3-2026，原有设置仍保留。</p>}
    </>}
    {engine==='tesseract'&&field('识别语言',<Select aria-label="Tesseract 识别语言" mode="multiple" showSearch optionFilterProp="label" maxTagCount="responsive" value={settings.langs} onChange={value=>update({langs:value})} options={ocrLanguages} placeholder="选择识别语言"/>)}
   </div>}
  </section>;
 })}<p className="kb-parser-note">文档处理与图片 OCR 按类型分别设置。Office、电子书和文本保留原有解析器；更多格式需经服务能力验证后开放。</p></div>;
}
