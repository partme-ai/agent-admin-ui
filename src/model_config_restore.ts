import {configProfiles,configInitial,configProfile,type ModelConfigDraft} from './model_config.ts';
import {integrationRecords,modelDirectory} from './model_directory.ts';
import type {Connection} from './state.ts';
import {schemeAcceptsCategory} from './model_categories.ts';
/** 旧连接保持原模型与地址；只用明确的目录身份恢复新表单。 */
export function restoreModelConfig(selection:string,saved?:Connection):ModelConfigDraft{
 const index=/^source:\d+$/.test(selection)?Number(selection.slice(7)):-1;
 const source=integrationRecords[index];
 const aliases:Record<string,string>={'智谱 GLM':'glm','豆包':'volcengine','Gemini':'google','LM Studio':'lmstudio','OpenAI Compatible':'openai-compatible'};
 const providerId=saved?.config?.providerId||aliases[saved?.provider||selection]||configProfiles.find(p=>p.name===(saved?.provider||selection)||p.id===selection)?.id||modelDirectory.find(p=>p.records.includes(index))?.id||'bailian';
 const draft=configInitial(providerId),profile=configProfile(providerId);
 if(!profile)return draft;
 const stored=saved?.config;
 const endpoint=saved?.endpoint||source?.endpoints[0];
 const scheme=profile.schemes.find(s=>s.id===stored?.schemeId)||profile.schemes.find(s=>s.endpoint===endpoint&&s.role===(saved?.role||'LLM'))||profile.schemes.find(s=>s.endpoint===endpoint)||profile.schemes.find(s=>(s.role||'LLM')===(saved?.role||'LLM'))||profile.schemes[0];
 if(!scheme)return draft;
 const model=saved?.model||'';
 return {...draft,schemeId:scheme.id,auth:stored?.auth&&scheme.auth.includes(stored.auth)?stored.auth:scheme.auth[0],name:saved?.name||draft.name,role:saved?.role&&schemeAcceptsCategory(scheme,saved.role)?saved.role:scheme.role||'LLM',model,modelMode:stored?.modelMode|| (model?(scheme.models.includes(model)?'catalog':'manual'):(scheme.models.length?'catalog':'manual')),endpoint:stored?.endpointTemplate||endpoint||scheme.endpoint,fields:{...stored?.fields},parameters:{...stored?.parameters},credentialRef:stored?.credentialRef||'',enabled:saved?.enabled!==false};
}
