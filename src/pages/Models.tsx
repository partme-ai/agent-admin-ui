import {useConsole} from '../context';
import {CustomConnectionEditor} from './ProviderManager';
import {ModelConnectionEditor} from './ModelConnectionEditor';
import {ProviderSettings} from './ProviderSettings';
import {VoicePipelineSettings} from './VoicePipelineSettings';
export function Models(){return <ProviderSettings/>;}
export function ConnectionEditor(){const c=useConsole();return c.selected.startsWith('custom:')||c.store.connections.some(x=>x.id===c.selected&&x.customProviderId)?<CustomConnectionEditor/>:<ModelConnectionEditor/>;}
export function VoicePipeline(){return <VoicePipelineSettings/>;}
