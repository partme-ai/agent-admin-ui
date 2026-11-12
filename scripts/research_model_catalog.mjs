// 只读取参考仓库的注册表与预设；不执行参考项目代码。
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const base='/Users/wandl/workspaces/workspace-agent-fabric/research';
const repos=['opencode','openclaw','openhuman','picoclaw','ZCode','zeroclaw','nullclaw','nanoclaw','microclaw','cc-switch'];
const records=[], sources=new Map();
const read=(repo,file)=>fs.readFileSync(path.join(base,repo,file),'utf8');
function add(repo,file,line,id,name,level,protocol='',endpoints=[],models=[]){
 records.push({repo,file,line,id,name:name||id,level,protocol,endpoints:[...new Set(endpoints)],models:[...new Set(models)]});
 sources.set(repo+'/'+file,read(repo,file));
}
function strings(node){const out=[];function walk(n){if(ts.isStringLiteralLike(n))out.push(n.text);ts.forEachChild(n,walk);}walk(node);return out;}
function ast(repo,file,fn){const text=read(repo,file),source=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true);function walk(n){fn(n,source);ts.forEachChild(n,walk);}walk(source);}
function prop(n,key){return n.properties?.find(p=>p.name?.getText().replace(/['"]/g,'')===key)?.initializer;}
function value(n){return n&&ts.isStringLiteralLike(n)?n.text:'';}
// cc-switch 的顶层预设对象，排除内层模型对象和接口声明。
for(const file of fs.readdirSync(path.join(base,'cc-switch/src/config')).filter(f=>/ProviderPresets\.ts$/.test(f))){
 ast('cc-switch','src/config/'+file,(n,s)=>{if(!ts.isObjectLiteralExpression(n))return;
  const name=value(prop(n,'name'));if(!name||!['settingsConfig','providerType','websiteUrl'].some(k=>prop(n,k)))return;
  const all=strings(n), endpoints=prop(n,'settingsConfig')?strings(prop(n,'settingsConfig')).filter(x=>/^https?:/.test(x)):[];
  const protocol=all.filter(x=>/^(openai|anthropic|gemini|@ai-sdk|claude)/.test(x)&&x.length<65).slice(0,8).join(', ');
  add('cc-switch','src/config/'+file,s.getLineAndCharacterOfPosition(n.getStart()).line+1,name,name,prop(n,'settingsConfig')||prop(n,'providerType')?'preset':'configuration',protocol,endpoints,[]);
 });
}
// OpenCode 的真实内置模块注册，动态 NPM 不视为本地已经实现。
ast('opencode','packages/core/src/provider.ts',(n,s)=>{if(!ts.isArrayLiteralExpression(n)||n.elements.length!==2)return;const id=value(n.elements[0]);if(!id.startsWith('@opencode/ai/providers/'))return;
 add('opencode','packages/core/src/provider.ts',s.getLineAndCharacterOfPosition(n.getStart()).line+1,id.replace('@opencode/ai/providers/',''),'','adapter',id,[],[]);
});
// 注册的提供方插件覆盖需要额外设置、认证或发现的服务。
const pluginFile='packages/core/src/plugin/provider.ts';
const pluginText=read('opencode',pluginFile);
const imports=new Map([...pluginText.matchAll(/import \{ (\w+) \} from "(.+)"/g)].map(m=>[m[1],m[2]]));
ast('opencode',pluginFile,(n,s)=>{if(!ts.isVariableDeclaration(n)||n.name.getText()!=='ProviderPlugins'||!n.initializer)return;
 for(const e of n.initializer.elements||[]){const filename=imports.get(e.getText());if(!filename||['PromptCacheKeyPlugin','DynamicProviderPlugin'].includes(e.getText()))continue;
  add('opencode',pluginFile,s.getLineAndCharacterOfPosition(e.getStart()).line+1,filename.split('/').pop().replace('.js',''),'','plugin');
 }
});
// OpenClaw 插件声明与注册入口同时存在；保留非语言模型类别。
for(const folder of fs.readdirSync(path.join(base,'openclaw/extensions'))){
 const file=`extensions/${folder}/openclaw.plugin.json`, absolute=path.join(base,'openclaw',file);if(!fs.existsSync(absolute))continue;
 const j=JSON.parse(read('openclaw',file));if(!j.providers?.length)continue;
 for(const id of j.providers){
  const data=j.modelCatalog?.providers?.[id]||{};
  add('openclaw',file,1,id,id,fs.existsSync(path.join(base,'openclaw',`extensions/${folder}/index.ts`))?'plugin':'declaration',data.api||j.categories?.join(', ')||'',data.baseUrl?[data.baseUrl]:[],(data.models||[]).map(m=>m.id));
 }
}
const zfile='config/provider/zcode-builtin.json';const zj=JSON.parse(read('ZCode',zfile));
for(const t of zj.config.providerConfigRules.templateRules){const c=t.config;add('ZCode',zfile,read('ZCode',zfile).slice(0,read('ZCode',zfile).indexOf(`"templateId": "${t.templateId}"`)).split('\n').length,t.templateId,t.templateNameMap?.['zh-CN'],'preset',c.api?.type||'',c.api?.baseUrl?[c.api.baseUrl]:[],c.builtinModelIds||[]);}
function blocks(repo,file,regex,consume){const text=read(repo,file);for(const m of text.matchAll(regex))consume(m,text.slice(0,m.index).split('\n').length);}
blocks('picoclaw','pkg/providers/provider_metadata.go',/\n\t"([^"]+)": \{([\s\S]*?)\n\t\},/g,(m,line)=>{
 const body=m[2],str=k=>body.match(new RegExp(k+':\\s*"([^"]*)"'))?.[1]||'';
 add('picoclaw','pkg/providers/provider_metadata.go',line,m[1],str('DisplayName'),'registry',str('DefaultAuthMethod'),str('DefaultAPIBase')?[str('DefaultAPIBase')]:[],[...(body.match(/CommonModels:[\s\S]*?\{([\s\S]*?)\}/)||[]).slice(1)].flatMap(x=>[...x.matchAll(/"([^"]+)"/g)].map(x=>x[1])));
});
blocks('openhuman','src/openhuman/config/schema/cloud_providers.rs',/BuiltinCloudProvider \{\s*slug: "([^"]+)",([\s\S]*?)\n    \}/g,(m,line)=>add('openhuman','src/openhuman/config/schema/cloud_providers.rs',line,m[1],m[2].match(/label: "([^"]+)"/)?.[1],'preset',m[2].match(/auth_style: AuthStyle::(\w+)/)?.[1], [m[2].match(/endpoint: "([^"]+)"/)?.[1]].filter(Boolean)));
blocks('microclaw','crates/microclaw-engine/src/setup/presets.rs',/ProviderPreset \{\s*id: "([^"]+)",([\s\S]*?)\n    \}/g,(m,line)=>add('microclaw','crates/microclaw-engine/src/setup/presets.rs',line,m[1],m[2].match(/label: "([^"]+)"/)?.[1],'preset',m[2].match(/protocol: ProviderProtocol::(\w+)/)?.[1], [m[2].match(/default_base_url:\s*"([^"]*)"/)?.[1]].filter(Boolean),[...(m[2].match(/models: &[\s\S]*?\[([\s\S]*?)\]/)||[]).slice(1)].flatMap(x=>[...x.matchAll(/"([^"]+)"/g)].map(x=>x[1]))));
blocks('nullclaw','src/providers/factory.zig',/\.\{ \.name = "([^"]+)", \.url = "([^"]+)", \.display = "([^"]+)"([^\n]*)/g,(m,line)=>add('nullclaw','src/providers/factory.zig',line,m[1],m[3],'compat',m[4].trim(),[m[2]]));
for(const id of ['anthropic','openai','azure','openrouter','ollama','gemini','vertex','claude_cli','codex_cli','gemini_cli','openai_codex'])add('nullclaw','src/providers/factory.zig',1,id,id,id.includes('cli')?'runtime':'adapter');
const slots=read('zeroclaw','crates/zeroclaw-config/src/providers.rs');
for(const m of slots.matchAll(/\((\w+), "([^"]+)", (\w+ModelProviderConfig)\)/g)){
 const factory=read('zeroclaw','crates/zeroclaw-providers/src/factory.rs'), start=factory.search(new RegExp('impl (?:CompatFamilySpec|FamilyProviderFactory) for (?:[\\w:]+::)?'+m[3]+'\\b'));
 const impl=start<0?'':factory.slice(start,factory.indexOf('\nimpl ',start+6)<0?undefined:factory.indexOf('\nimpl ',start+6));
 add('zeroclaw','crates/zeroclaw-config/src/providers.rs',slots.slice(0,m.index).split('\n').length,m[2],m[2],impl?'factory':'registry',impl.includes('CompatFamilySpec')?'OpenAI compatible':'specialized / see factory', [...impl.matchAll(/https?:\/\/[^"\s]+/g)].map(x=>x[0]));
}
// NanoClaw 当前核心只注册 Claude；扩展指南或未安装 skill 不当成核心实现。
add('nanoclaw','container/agent-runner/src/providers/index.ts',5,'claude','Claude Agent SDK','runtime','external agent runtime');
for(const [id,file] of [['claude-code','src/openhuman/inference/provider/claude_code/mod.rs'],['claude-agent-sdk','src/openhuman/inference/provider/claude_agent_sdk/mod.rs'],['openai-codex','src/openhuman/inference/provider/openai_codex.rs']])add('openhuman',file,1,id,id,'runtime');
const crypto=await import('node:crypto');
const output={observedAt:'2026-11-05',scope:'Local checked-out model-provider registrations and preset variants; no live provider acceptance; external catalogs not enumerated as native implementations.',repositories:repos.map(repo=>({repo,root:path.join(base,repo),head:execFileSync('git',['rev-parse','HEAD'],{cwd:path.join(base,repo),encoding:'utf8'}).trim(),licenseFiles:fs.readdirSync(path.join(base,repo)).filter(f=>/^LICEN[SC]E|^COPYING/.test(f))})),sources:[...sources].map(([file,text])=>({file,sha256:crypto.createHash('sha256').update(text).digest('hex')})),records};
fs.writeFileSync('reference/model_integrations.source.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(Object.fromEntries(repos.map(repo=>[repo,records.filter(r=>r.repo===repo).length]))));
