import snapshot from '../reference/model_directory.json' with {type:'json'};
import source from '../reference/model_integrations.source.json' with {type:'json'};
export type ModelProviderCard={id:string;name:string;kind:string;domestic:boolean;roles:string[];records:number[];models:string[];phase:string};
export const modelDirectory:ModelProviderCard[]=snapshot;
export const integrationRecords=source.records;
export function filterModelDirectory(query:string,kind:string,domestic=false):ModelProviderCard[]{return modelDirectory.filter(p=>(kind==='全部'||p.kind===kind)&&(!domestic||p.domestic)&&(p.name+' '+p.id+' '+p.models.join(' ')+' '+p.records.map(i=>integrationRecords[i].repo+' '+integrationRecords[i].id+' '+integrationRecords[i].name).join(' ')).toLowerCase().includes(query.toLowerCase()));}
/** 仅预填明确的参考方案；未知来源不回退成另一个提供方。 */
export function resolveModelPreset(selection:string){
 if(!/^source:\d+$/.test(selection))return undefined;
 const index=Number(selection.slice(7)),record=integrationRecords[index],card=modelDirectory.find(p=>p.records.includes(index));
 if(!record||!card||card.kind==='工具运行时'||record.level==='configuration')return undefined;
 return {name:card.name,models:record.models.length?record.models:[''],endpoint:record.endpoints[0]||'',source:record};
}
