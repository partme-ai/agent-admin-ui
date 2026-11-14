import {useRef,type ReactNode} from 'react';
import {Menu,Select} from 'antd';
import {Icon} from './components';
import {resolveEditorSection,type EditorSectionItem} from './editor_sections';
/** 共用配置导航和独立内容滚动；表单与草稿始终归调用方管理。 */
export function EditorSections({items,activeKey,onChange,label,children}:{items:EditorSectionItem[];activeKey:string;onChange:(key:string)=>void;label:string;children:ReactNode}){
 const body=useRef<HTMLDivElement>(null),active=items.find(s=>s.key===resolveEditorSection(items,activeKey));
 const change=(key:string)=>{onChange(key);body.current?.scrollTo({top:0});};
 if(items.length<2)return <>{children}</>;
 return <div className="editor-sections"><aside className="editor-sections-sidebar"><Menu aria-label={label+'导航'} mode="inline" selectedKeys={[active?.key||'']} onClick={({key})=>change(key)} items={items.map(s=>({key:s.key,label:s.label,icon:<Icon name={s.icon}/>}))}/></aside><div className="editor-sections-main"><div className="editor-sections-mobile"><Select aria-label={label+'分区'} value={active?.key} onChange={change} options={items.map(s=>({value:s.key,label:s.label}))}/></div><div className="editor-sections-content" ref={body}><header><h2>{active?.label}</h2><p>{active?.description}</p></header>{children}</div></div></div>;
}
