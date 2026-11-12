import {useEffect,useState} from 'react';
import {Icon} from './components';
import './system_brand.css';
/** 图片失效只回退显示，不重写用户保存的系统标识。 */
export function BrandLogo({logo}:{logo:string}){const [failed,setFailed]=useState(false);useEffect(()=>setFailed(false),[logo]);return logo&&!failed?<img className="system-brand-image" src={logo} alt="" draggable={false} onError={()=>setFailed(true)}/>:<Icon name="home"/>;}
