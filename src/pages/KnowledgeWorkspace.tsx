import {useState} from 'react';
import {Button,Card,Dropdown,Input,Modal,Segmented,Select,Space,Tag,Tabs} from 'antd';
import {BookOutlined,MoreOutlined,PlusOutlined,StarFilled,StarOutlined,PushpinOutlined,SearchOutlined} from '@ant-design/icons';
import {useConsole} from '../context';
import {Nothing,PageHeader,Status} from '../components';
import {KnowledgeEditor,KnowledgeConfigurationButton} from './KnowledgeEditor';
import {KnowledgeFaq} from './KnowledgeFaq';
import {KnowledgeSettings} from './KnowledgeTools';
import {KnowledgeDocuments} from './KnowledgeDocuments';
import {KnowledgeWiki,KnowledgeGallery,KnowledgeSources,KnowledgeActivity,KnowledgeSharing} from './KnowledgeViews';
import {emptyKnowledgeWorkspace,removeKnowledge} from '../knowledge_workspace';
import type {Knowledge} from '../state';
import './knowledge_workspace.css';

export function KnowledgeWorkspaceList(){
 const c=useConsole(),[q,setQ]=useState(''),[filter,setFilter]=useState('all'),[sort,setSort]=useState('updated'),[open,setOpen]=useState(false),[edit,setEdit]=useState<Knowledge>();
 const meta=c.product.knowledgeWorkspaces,shared=new Set(c.product.sharedSpaces.filter(s=>s.members.some(m=>m.userId==='u1')).flatMap(s=>s.knowledgeIds));
 const scoped=c.store.knowledge.filter(k=>k.scope!=='public'),counts={all:scoped.length,favorites:scoped.filter(k=>meta[k.id]?.favorite).length,recent:scoped.filter(k=>meta[k.id]?.visited).length,mine:scoped.filter(k=>(k.scope||'private')==='private').length,shared:scoped.filter(k=>k.scope==='workspace'||shared.has(k.id)).length};
 const items=scoped.filter(k=>(k.name+k.desc).toLocaleLowerCase().includes(q.toLocaleLowerCase())&&(filter==='all'||filter==='favorites'&&meta[k.id]?.favorite||filter==='recent'&&meta[k.id]?.visited||filter==='mine'&&(k.scope||'private')==='private'||filter==='shared'&&(shared.has(k.id)||k.scope==='workspace'))).sort((a,b)=>Number(!!meta[b.id]?.pinned)-Number(!!meta[a.id]?.pinned)||(sort==='name'?a.name.localeCompare(b.name,'zh-CN'):sort==='count'?c.store.docs.filter(d=>d.knowledge===b.id).length-c.store.docs.filter(d=>d.knowledge===a.id).length:(meta[b.id]?.visited||'').localeCompare(meta[a.id]?.visited||'')));
 function flag(id:string,key:'favorite'|'pinned'){c.setProduct(p=>({...p,knowledgeWorkspaces:{...p.knowledgeWorkspaces,[id]:{...emptyKnowledgeWorkspace(),...p.knowledgeWorkspaces[id],[key]:!p.knowledgeWorkspaces[id]?.[key]}}}));}
 function openKb(k:Knowledge){c.setProduct(p=>({...p,knowledgeWorkspaces:{...p.knowledgeWorkspaces,[k.id]:{...emptyKnowledgeWorkspace(),...p.knowledgeWorkspaces[k.id],visited:new Date().toISOString()}}}));c.go('09',k.id);}
 function duplicate(k:Knowledge){const id=crypto.randomUUID();c.setStore(s=>({...s,knowledge:[...s.knowledge,{...structuredClone(k),id,name:k.name+' · 副本',scope:'private',count:0}],docs:[...s.docs,...s.docs.filter(d=>d.knowledge===k.id).map(d=>({...structuredClone(d),id:crypto.randomUUID(),knowledge:id,status:d.text?'待索引':'待服务解析'}))]}));const old=meta[k.id];if(old)c.setProduct(p=>({...p,knowledgeWorkspaces:{...p.knowledgeWorkspaces,[id]:{...emptyKnowledgeWorkspace(),folders:[...old.folders]}}}));c.notify('已复制配置与资料；副本需重新索引，不继承共享和智能体关联');}
 function remove(k:Knowledge){c.confirm('删除知识库',`删除“${k.name}”及其资料、Wiki 和共享关联？`,()=>{try{const result=removeKnowledge(c.store,c.product.sharedSpaces,k.id,Object.values(c.product.deviceConfigs).flatMap(d=>d.knowledge||[]));c.setStore(result.store);c.setProduct(p=>{const workspaces={...p.knowledgeWorkspaces};delete workspaces[k.id];return {...p,sharedSpaces:result.spaces,knowledgeWorkspaces:workspaces};});}catch(e){c.notify((e as Error).message);}});}
 return <><PageHeader title="知识库管理" desc="管理和组织文档型、问答型知识库" actions={<Space wrap><Select aria-label="知识库排序" value={sort} onChange={setSort} options={[{value:'updated',label:'最近访问'},{value:'name',label:'名称排序'},{value:'count',label:'资料数量'}]}/><Button type="primary" icon={<PlusOutlined/>} onClick={()=>setOpen(true)}>新建知识库</Button></Space>}/>
 <div className="kw-toolbar"><Segmented value={filter} onChange={setFilter} options={Object.entries({all:'全部',favorites:'收藏',recent:'最近',mine:'本空间',shared:'共享'}).map(([value,label])=>({value,label:`${label} ${counts[value as keyof typeof counts]}`}))}/><Input allowClear prefix={<SearchOutlined/>} value={q} onChange={e=>setQ(e.target.value)} placeholder="搜索知识库" aria-label="搜索知识库"/></div>
 <div className="kw-library-grid">{items.map(k=>{const docs=c.store.docs.filter(d=>d.knowledge===k.id);return <Card size="small" key={k.id} className="kw-library-card"><div className="kw-card-title"><span className="kw-library-icon" style={{color:k.color}}><BookOutlined/></span><button className="kw-title-button" onClick={()=>openKb(k)}>{k.name}</button><Button type="text" aria-label={`收藏 ${k.name}`} icon={meta[k.id]?.favorite?<StarFilled/>:<StarOutlined/>} onClick={()=>flag(k.id,'favorite')}/><Dropdown trigger={['click']} menu={{items:[{key:'pin',label:meta[k.id]?.pinned?'取消置顶':'置顶',icon:<PushpinOutlined/>},{key:'copy',label:'复制知识库'},{key:'edit',label:'设置'},{key:'delete',label:'删除',danger:true}],onClick:({key})=>key==='pin'?flag(k.id,'pinned'):key==='copy'?duplicate(k):key==='edit'?setEdit(k):remove(k)}}><Button type="text" icon={<MoreOutlined/>} aria-label={`更多 ${k.name}`}/></Dropdown></div><p className="kw-card-description">{k.desc||'暂无描述'}</p><div className="kw-card-footer"><Space size={4}><Tag>{k.kind==='faq'?'问答':'文档'}</Tag>{meta[k.id]?.pinned&&<PushpinOutlined/>}<span>{docs.length} 条资料</span></Space><Status text={docs.some(d=>d.status==='已索引')?'可检索':'待添加资料'}/></div></Card>;})}</div>
 {!items.length&&<Nothing title={q?'没有匹配的知识库':filter==='favorites'?'还没有收藏知识库':'暂无知识库'} action={<Button onClick={()=>q?setQ(''):setOpen(true)}>{q?'清除搜索':'新建知识库'}</Button>}/>}
 <KnowledgeEditor open={open||!!edit} knowledge={edit} onClose={()=>{setOpen(false);setEdit(undefined);}} onCreated={id=>c.go('09',id)}/></>;
}

export function KnowledgeWorkspaceDetail(){
 const c=useConsole(),k=c.store.knowledge.find(k=>k.id===c.selected),[tab,setTab]=useState('documents');
 if(!k)return <Nothing title="知识库不存在" action={<Button onClick={()=>c.go('08')}>返回知识库</Button>}/>;
 const docs=c.store.docs.filter(d=>d.knowledge===k.id),wk=c.product.knowledgeWorkspaces[k.id]||emptyKnowledgeWorkspace();
 return <><PageHeader title={k.name} desc={k.desc} actions={<Space wrap><Select aria-label="切换知识库" value={k.id} onChange={id=>{setTab('documents');c.go('09',id);}} options={c.store.knowledge.map(k=>({value:k.id,label:k.name}))}/><Button onClick={()=>c.go('11',k.id)}>检索测试</Button><KnowledgeConfigurationButton knowledge={k}/></Space>}/>
 <Tabs className="kw-detail-tabs" activeKey={tab} onChange={setTab} items={[
 {key:'documents',label:`${k.kind==='faq'?'问答':'文档'} ${docs.length}`,children:k.kind==='faq'?<KnowledgeFaq knowledge={k}/>:<KnowledgeDocuments key={k.id} knowledge={k}/>},
 {key:'wiki',label:`Wiki ${wk.wiki.length}`,children:<KnowledgeWiki key={k.id} knowledge={k}/>},
 {key:'graph',label:'关系图谱',children:<KnowledgeWiki key={k.id+'graph'} knowledge={k} graph/>},
 {key:'gallery',label:`图库 ${wk.images.length}`,children:<KnowledgeGallery key={k.id} knowledge={k}/>},
 {key:'sources',label:'数据源',children:<KnowledgeSources key={k.id} knowledge={k}/>},
 {key:'sharing',label:'共享',children:<KnowledgeSharing knowledge={k}/>},
 {key:'agents',label:'关联智能体',children:<div className="kw-library-grid">{c.store.agents.filter(a=>a.knowledge.includes(k.id)).map(a=><Card size="small" key={a.id} title={a.name}><p>{a.desc}</p><Button onClick={()=>c.go('04',a.id)}>配置智能体</Button><Button onClick={()=>c.go('02',a.id)}>机器人试聊</Button></Card>)}{!c.store.agents.some(a=>a.knowledge.includes(k.id))&&<Nothing title="尚未关联智能体" action={<Button onClick={()=>c.go('03')}>选择智能体</Button>}/>}</div>},
 {key:'activity',label:'活动',children:<KnowledgeActivity knowledge={k}/>},
 {key:'settings',label:'检索设置',children:<KnowledgeSettings knowledge={k}/>}
 ]}/></>;
}
