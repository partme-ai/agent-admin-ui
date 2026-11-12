import {filterThemeColorTone,type ThemeColorTone} from '../theme_palette_rules';
import {colorFamilies,sortColorsLightToDark,type ColorFamily} from '../color_family';
import {useEffect,useState} from 'react';
import {Button,ColorPicker,Empty,Input,Radio,Select} from 'antd';
import {BgColorsOutlined,CheckOutlined,SearchOutlined} from '@ant-design/icons';
import {characterPalettes,characterPaletteLabels} from '../character_palettes';
import {characterColorSwatches,characterSwatchPalettes,findCharacterSwatches,characterSwatchValue,characterSwatchLabel} from '../character_swatches';
import {resolveCharacterColor,characterEyeColor} from '../character_colors';
import './character_palette.css';

type CharacterPaletteProps={value:string;onChange:(id:string)=>void;usage?:'character'|'theme';title?:string;initialPalette?:string;themeTarget?:'primary'|'background'|'sidebar'};
/** 三端共用命名色谱：单选目录仅浏览，点击色块才修改当前目标。 */
export function CharacterPalette({value,onChange,usage='character',title='身体颜色',initialPalette='all',themeTarget='sidebar'}:CharacterPaletteProps){
 const [tone,setTone]=useState<ThemeColorTone>(themeTarget==='primary'?'dark':themeTarget==='background'?'light':'all');
 useEffect(()=>{setTone(themeTarget==='primary'?'dark':themeTarget==='background'?'light':'all');},[themeTarget]);
 const catalogs=characterSwatchPalettes.filter(p=>usage!=='theme'||p.id!=='morandi');
 const [paletteId,setPaletteId]=useState(()=>catalogs.some(p=>p.id===initialPalette)?initialPalette:'all');
 const [query,setQuery]=useState(''),[group,setGroup]=useState('all'),[sourceId,setSourceId]=useState('all'),[family,setFamily]=useState<ColorFamily|'all'>('all');
 const universalFamily=usage==='theme'&&paletteId!=='traditional';
 const palette=characterSwatchPalettes.find(p=>p.id===paletteId)!,sourcePalette=characterPalettes.find(p=>p.id===paletteId),filtered=findCharacterSwatches(paletteId,query,group,sourceId,universalFamily?family:'all'),colors=usage==='theme'?sortColorsLightToDark(filterThemeColorTone(filtered,tone)):filtered,color=resolveCharacterColor(value);
 const scopeCount=findCharacterSwatches(paletteId,'','all',sourceId).length;
 const sources=[...new Map((sourcePalette?.colors||[]).filter(c=>c.sourceId).map(c=>[c.sourceId!,c.sourceName!])).entries()];
 const groups=[...new Set((sourcePalette?.colors||[]).filter(c=>sourceId==='all'||c.sourceId===sourceId).map(c=>c.group))],selected=characterColorSwatches.find(s=>s.hex.toLowerCase()===color[2].toLowerCase());
 const familyOptions=[{value:'all',label:'全部色系'},...(universalFamily?colorFamilies.map(f=>({value:f.id,label:`${f.name} · ${findCharacterSwatches(paletteId,'','all',sourceId,f.id).length}`})):groups.map(value=>({value,label:`${value} · ${findCharacterSwatches(paletteId,'',value,sourceId).length}`})))];
 const selectedName=usage==='theme'&&selected?characterSwatchLabel(selected,paletteId):color[1];
 const description=paletteId==='morandi'?'低饱和灰调，柔和自然。':sourcePalette?.description;
 const selectPalette=(id:string)=>{setPaletteId(id);setQuery('');setGroup('all');setSourceId('all');setFamily('all');};
 return <section className="studio-section character-palette" data-usage={usage} aria-label={usage==='theme'?'主题选色':'身体配色'}>
  <div className="studio-section-heading"><strong>{title}</strong><span className="palette-selected"><i style={{background:color[2]}}/>{color[2].toLowerCase()==='#000000'?'黑色':selectedName}</span></div>
  <Radio.Group className="palette-catalogs" aria-label={usage==='theme'?'主题色库':'配色目录'} value={paletteId} onChange={e=>selectPalette(e.target.value)} optionType="button" options={catalogs.map(p=>({value:p.id,label:<><span>{p.name}</span><small>{p.count}</small></>}))}/>
  {description&&<p className="palette-note">{description}</p>}
  <div className="palette-filters"><Input aria-label={usage==='theme'?'搜索主题颜色':'搜索身体颜色'} prefix={<SearchOutlined/>} placeholder="搜索色名、色值或编号" allowClear value={query} onChange={e=>setQuery(e.target.value)}/>{usage==='theme'&&<Select className="palette-family-select" aria-label="筛选主题色系" value={universalFamily?family:group} onChange={value=>universalFamily?setFamily(value as ColorFamily|'all'):setGroup(value)} options={familyOptions}/>}</div>
  {usage==='theme'&&<Radio.Group className="palette-tone-filter" aria-label="主题颜色深浅" optionType="button" value={tone} onChange={e=>setTone(e.target.value)} options={[{value:'all',label:`全部 ${filtered.length}`},{value:'dark',label:`深色 ${filterThemeColorTone(filtered,'dark').length}`},{value:'light',label:`浅色 ${filterThemeColorTone(filtered,'light').length}`}]} />}
  {sources.length>1&&<Radio.Group className="palette-filter-groups" aria-label="配色来源" value={sourceId} onChange={e=>{setSourceId(e.target.value);setGroup('all');setFamily('all');}} optionType="button" options={[{value:'all',label:'全部来源'},...sources.map(([value,label])=>({value,label}))]}/>}

  {groups.length>1&&(usage==='character'||paletteId==='gugong')&&<Radio.Group className="palette-filter-groups" aria-label={paletteId==='gugong'?'配色节气':'配色色系'} value={group} onChange={e=>setGroup(e.target.value)} optionType="button" options={[{value:'all',label:paletteId==='gugong'?'全部节气':'全部色系'},...groups.map(value=>({value,label:value}))]}/>}
  <div className="palette-grid" role="region" aria-label={`${palette.name}色块`} tabIndex={0} key={`${paletteId}-${sourceId}-${query}-${group}-${family}`}>
   {colors.map(c=>{const names=[...new Set(c.members.map(m=>m.name))],name=characterSwatchLabel(c,paletteId),active=color[2].toLowerCase()===c.hex.toLowerCase(),sources=new Set(c.members.map(m=>m.sourceId||m.paletteId)).size;return <button type="button" key={c.hex.toLowerCase()} className="palette-color" aria-label={`${usage==='theme'?'主题':'机器人'}颜色 ${name} ${c.hex}`} title={c.members.map(m=>[m.name,m.sourceName||characterPaletteLabels[m.paletteId]||m.paletteName,...(m.aliases||[]),m.code,m.group,m.hex.toUpperCase(),m.reference==='curated'?'TinyBot 设计近似参考':''].filter(Boolean).join(' · ')).join('\n')} aria-pressed={active} onClick={()=>onChange(characterSwatchValue(c,value,paletteId,sourceId))}><span className="palette-chip" style={{background:c.hex,color:characterEyeColor(c.id)}}>{active&&<CheckOutlined/>}</span><span className="palette-name">{name}</span>{c.members.length>1?<small className="palette-code">{names.length>1?`${names.length} 个名称`:`${sources} 个来源`}</small>:(c.code||c.reference==='curated'&&c.members.some(m=>m.paletteId==='pantone'))&&<small className="palette-code">{c.code||'近似参考'}</small>}</button>;})}
   {!colors.length&&<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有找到这个颜色"/>}
  </div>
  <div className="palette-footer"><div className="studio-color-controls"><ColorPicker value={color[2]} format="hex" disabledAlpha disabledFormat placement="bottomRight" onChange={color=>onChange(color.toHexString())}><Button size="small" aria-label={usage==='theme'?'自定义主题颜色':'自定义身体颜色'} icon={<BgColorsOutlined/>}>自定义颜色</Button></ColorPicker><span className="studio-color-value">{color[2].toUpperCase()}</span></div><span className="palette-count" aria-live="polite">{colors.length} / {scopeCount} 色</span></div>
  {selected&&(selected.members.length>1||selected.members.some(m=>m.sourceName))&&<div className="palette-alias-details" role="group" aria-label="色名与来源"><strong>色名与来源</strong><ul>{selected.members.map(m=><li key={m.id}><span>{m.name}</span><small>{m.sourceName||characterPaletteLabels[m.paletteId]||m.paletteName}{m.sourceId==='traditional742'&&m.code?` · ${m.code}`:''}</small></li>)}</ul></div>}
 </section>;
}
