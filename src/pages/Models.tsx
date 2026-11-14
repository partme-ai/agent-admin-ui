import {Button} from 'antd';
import {useConsole} from '../context';
import {EditorDrawer} from '../EditorDrawer';
import {CustomConnectionEditor} from './ProviderManager';
import {ModelConnectionEditor} from './ModelConnectionEditor';
import {ProviderSettings} from './ProviderSettings';
import {VoicePipelineSettings} from './VoicePipelineSettings';
import {resolveModelService} from '../model_services';
export function Models(){const c=useConsole();return <ProviderSettings key={c.selected||'text'}/>;}
export function ConnectionEditor(){const c=useConsole(),custom=c.selected.startsWith('custom:')||c.store.connections.some(x=>x.id===c.selected&&x.customProviderId),formId='route-model-connection',service=resolveModelService(c.selected,c.store.connections);return <><ProviderSettings/><EditorDrawer className={custom?'':'sectioned-editor model-connection-drawer'} title={c.store.connections.some(x=>x.id===c.selected)?'编辑模型连接':'添加模型连接'} width={1080} open onCancel={()=>c.go('06',service.key)} footer={<><Button onClick={()=>c.go('06',service.key)}>取消</Button><Button type="primary" htmlType="submit" form={formId}>保存连接</Button></>}>{custom?<CustomConnectionEditor embedded formId={formId} onSaved={id=>c.go('06',id)}/>:<ModelConnectionEditor sectioned formId={formId} onSaved={id=>c.go('06',id)}/>}</EditorDrawer></>;}
export function VoicePipeline(){return <VoicePipelineSettings/>;}
