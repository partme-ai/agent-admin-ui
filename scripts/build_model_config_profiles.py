"""生成本地交互表单描述；既有源码快照不等同实服务认证目录。"""
from pathlib import Path
import json,re
p=Path(__file__).resolve().parent.parent
cards=json.loads((p/'reference/model_directory.json').read_text()); raw=json.loads((p/'reference/model_integrations.source.json').read_text())['records']; profiles=[]
def field(id,label,required=True,**kw):return dict(id=id,label=label,required=required,**kw)
def models(id,region=None):
 c=next(x for x in cards if x['id']==id)
 records=[raw[i] for i in c['records'] if raw[i]['models']]
 if region=='国际':records=[r for r in records if any(s in ' '.join(r['endpoints']) for s in ['.ai/','.io/','-intl','api.z.ai'])]
 if region=='中国':records=[r for r in records if not any(s in ' '.join(r['endpoints']) for s in ['-intl','api.z.ai'])]
 return list(dict.fromkeys(m for r in records for m in r['models']))
def scheme(region,plan,protocol,endpoint,auth=None,fields=None,modelLabel='模型 ID',m=None,role='LLM',source='reference/model_integrations.source.json'):
 return dict(region=region,plan=plan,protocol=protocol,endpoint=endpoint,auth=auth or ['api_key'],fields=fields or [],models=m or [],modelLabel=modelLabel,role=role,source=source)
def pair(region,plan,base,m):return [scheme(region,plan,'openai-chat',base+'/v1',m=m),scheme(region,plan,'anthropic-messages',base+'/anthropic',m=m)]
for c in cards:
 id=c['id'];ms=models(id);ss=[];params=[field('temperature','温度',False,type='number',placeholder='0.7'),field('maxTokens','最大输出 Token',False,type='number',placeholder='4096')];support='designed'
 if id in ['bailian','qwen']:
  params+=[field('thinking','思考模式',False,options=['按模型默认','开启','关闭'])]
  for region,code in [('中国（北京）','cn-beijing'),('新加坡','ap-southeast-1'),('美国（弗吉尼亚）','us-east-1')]:
   for proto,path in [('openai-chat','compatible-mode/v1'),('anthropic-messages','apps/anthropic')]:
    if code=='us-east-1' and proto=='anthropic-messages':continue
    ss.append(scheme(region,'按量付费',proto,'https://{workspaceId}.'+code+'.maas.aliyuncs.com/'+path,fields=[field('workspaceId','Workspace ID',placeholder='填写百炼工作空间 ID')],m=models('bailian'),source='https://www.alibabacloud.com/help/en/model-studio/more-tools'))
  for region,base in [('中国（北京）','https://dashscope.aliyuncs.com'),('新加坡','https://dashscope-intl.aliyuncs.com'),('美国（弗吉尼亚）','https://dashscope-us.aliyuncs.com')]:
   for proto,path in [('openai-chat','compatible-mode/v1'),('anthropic-messages','apps/anthropic')]:
    if region=='美国（弗吉尼亚）' and proto=='anthropic-messages':continue
    ss.append(scheme(region,'DashScope 兼容接入',proto,base+'/'+path,m=models('bailian')))
  for region,base in [('中国（北京）','https://coding.dashscope.aliyuncs.com'),('新加坡','https://coding-intl.dashscope.aliyuncs.com')]:
   for proto,path in [('openai-chat','v1'),('anthropic-messages','apps/anthropic')]:ss.append(scheme(region,'Coding Plan',proto,base+'/'+path,['plan_key'],m=models('bailian')))
  for plan in ['Token Plan 个人版','Token Plan 团队版']:
   for proto,path in [('openai-chat','compatible-mode/v1'),('anthropic-messages','apps/anthropic')]:ss.append(scheme('新加坡',plan,proto,'https://token-plan.ap-southeast-1.maas.aliyuncs.com/'+path,['plan_key'],m=models('bailian'),source='https://www.alibabacloud.com/help/en/model-studio/more-tools'))
 elif id=='glm':
  for region,base in [('中国','https://open.bigmodel.cn'),('国际','https://api.z.ai')]:
   mm=models(id,region)
   ss += [scheme(region,'标准 API','openai-chat',base+'/api/paas/v4',m=mm),scheme(region,'Coding Plan','openai-chat',base+'/api/coding/paas/v4',['plan_key'],m=mm),scheme(region,'Coding Plan','anthropic-messages',base+'/api/anthropic',['plan_key'],m=mm)]
  params+=[field('thinking','思考模式',False,options=['按模型默认','开启','关闭'])]
 elif id=='kimi':
  for region,base in [('中国','https://api.moonshot.cn'),('国际','https://api.moonshot.ai')]:ss.append(scheme(region,'标准 API','openai-chat',base+'/v1',m=models(id,region)))
  ss+=[scheme('中国','标准 API','anthropic-messages','https://api.moonshot.cn/anthropic',m=ms),scheme('中国','Kimi Coding','openai-chat','https://api.kimi.com/coding/v1',['plan_key'],m=ms)]
 elif id=='minimax':
  for region,base in [('中国','https://api.minimaxi.com'),('国际','https://api.minimax.io')]:
   ss+=pair(region,'标准 API',base,ms)
   ss.append(scheme(region,'标准 API','minimax-tts',base+'/v1',fields=[field('voiceId','音色 ID',placeholder='选择的系统音色或个人音色 ID')],m=['speech-2.8-turbo','speech-2.8-hd','speech-2.6-turbo','speech-2.6-hd'],role='TTS'))
   ss.append(scheme(region,'标准 API','minimax-asr',base+'/v1',m=['asr-1.0'],role='ASR'))
 elif id=='deepseek':ss=[scheme('中国','标准 API','openai-chat','https://api.deepseek.com/v1',m=ms),scheme('中国','标准 API','anthropic-messages','https://api.deepseek.com/anthropic',m=ms)];params+=[field('thinking','推理模式',False,options=['按模型默认','开启','关闭'])]
 elif id=='volcengine':
  ss=[scheme('中国（北京）','按量付费','openai-chat','https://ark.cn-beijing.volces.com/api/v3',modelLabel='Model ID / 推理接入点 ID',m=ms),scheme('中国（北京）','Coding Plan','openai-chat','https://ark.cn-beijing.volces.com/api/coding/v3',['plan_key'],m=ms)]
  params+=[field('thinking','深度思考',False,options=['按模型默认','开启','关闭'])]
 elif id=='baidu':ss=[scheme('中国','标准 API','openai-chat','https://qianfan.baidubce.com/v2',m=ms),scheme('中国','Coding Plan','anthropic-messages','https://qianfan.baidubce.com/anthropic/coding',['plan_key'],m=ms)]
 elif id=='tencent':ss=[scheme('中国','混元标准 API','openai-chat','https://api.hunyuan.cloud.tencent.com/v1',m=ms),scheme('中国','TokenHub','openai-chat','https://tokenhub.tencentmaas.com/v1',m=ms),scheme('中国','Token Plan','openai-chat','https://api.lkeap.cloud.tencent.com/plan/v3',['plan_key'],m=ms)]
 elif id=='xiaomi':
  ss=pair('中国','标准 API','https://api.xiaomimimo.com',ms)
  ss += [scheme('中国','Token Plan','openai-chat','https://token-plan-cn.xiaomimimo.com/v1',['plan_key'],m=ms),scheme('中国','Token Plan','anthropic-messages','https://token-plan-cn.xiaomimimo.com/anthropic',['plan_key'],m=ms)]
 elif id=='stepfun':
  for region,base in [('中国','https://api.stepfun.com'),('国际','https://api.stepfun.ai')]:
   ss.append(scheme(region,'标准 API','openai-chat',base+'/v1',m=ms))
   ss.append(scheme(region,'Step Plan','openai-chat',base+'/step_plan/v1',['plan_key'],m=ms))
 elif id=='bailing':ss=pair('中国','标准 API','https://api.tbox.cn',ms)
 elif id=='longcat':ss=[scheme('官方服务','标准 API','openai-chat','https://api.longcat.chat/openai/v1',m=ms),scheme('官方服务','标准 API','anthropic-messages','https://api.longcat.chat/anthropic',m=ms)]
 elif id in ['baichuan','yi']:
  ss=[scheme('中国','标准 API','openai-chat','https://api.baichuan-ai.com/v1' if id=='baichuan' else 'https://api.lingyiwanwu.com/v1',m=ms)]
 elif id=='azure':
  for region in ['全球 Azure','Azure 中国']:
   host='openai.azure.com' if region=='全球 Azure' else 'openai.azure.cn'
   for proto in ([] if region=='Azure 中国' else ['openai-chat','openai-responses']):
    ss.append(scheme(region,'Azure OpenAI v1',proto,'https://{resourceName}.'+host+'/openai/v1',['api_key','managed'],[field('resourceName','Azure 资源名称',placeholder='例如 tinybot-ai')],modelLabel='部署名称',source='https://learn.microsoft.com/en-us/azure/foundry/openai/api-version-lifecycle'))
   ss.append(scheme(region,'旧版部署接口','azure-deployment','https://{resourceName}.'+host+'/openai/deployments/{deploymentName}',['api_key','managed'],[field('resourceName','Azure 资源名称'),field('deploymentName','部署名称'),field('apiVersion','API Version',placeholder='使用资源支持的版本')],modelLabel='部署名称'))
 elif id=='bedrock':
  for region in ['us-east-1','us-west-2','ap-northeast-1','eu-central-1']:
   ss.append(scheme(region,'按量推理','bedrock-converse',f'https://bedrock-runtime.{region}.amazonaws.com',['iam','bedrock_key','managed'],[field('modelArn','推理配置文件 ARN',False,placeholder='跨区域推理时按资源配置填写')],modelLabel='Model ID / 推理配置文件 ID',m=ms))
 elif id=='google':ss=[scheme('Google AI Studio','标准 API','gemini-native','https://generativelanguage.googleapis.com/v1beta',m=ms),scheme('Google AI Studio','兼容接入','openai-chat','https://generativelanguage.googleapis.com/v1beta/openai',m=ms)]
 elif id=='vertex':
  for region in ['global','us-central1','asia-northeast1']:
   ss.append(scheme(region,'按量付费','vertex-gemini',('https://aiplatform.googleapis.com' if region=='global' else 'https://'+region+'-aiplatform.googleapis.com')+'/v1/projects/{projectId}/locations/'+region,['managed'],[field('projectId','Google Cloud 项目 ID')],m=ms))
 elif id=='openai':ss=[scheme('全球','标准 API',proto,'https://api.openai.com/v1',fields=[field('organization','Organization ID',False),field('project','Project ID',False)],m=ms) for proto in ['openai-responses','openai-chat']];params+=[field('reasoningEffort','推理强度',False,options=['按模型默认','低','中','高'])]
 elif id=='anthropic':ss=[scheme('全球','标准 API','anthropic-messages','https://api.anthropic.com/v1',fields=[field('anthropicWorkspaceId','Anthropic Workspace ID',False,help='非工作空间专属密钥使用时需按实际要求配置')],m=ms)];params+=[field('thinkingBudget','思考预算 Token',False,type='number')]
 elif id=='openrouter':ss=[scheme('全球','按量付费','openai-chat','https://openrouter.ai/api/v1',fields=[field('siteUrl','应用站点（HTTP-Referer）',False),field('appTitle','应用名称（X-Title）',False)],m=ms)]
 elif id=='siliconflow':ss=[scheme(region,'标准 API','openai-chat',base,m=ms) for region,base in [('中国','https://api.siliconflow.cn/v1'),('国际','https://api.siliconflow.com/v1')]]
 elif id=='modelscope':ss=[scheme('中国','推理 API','openai-chat','https://api-inference.modelscope.cn/v1',['access_token'],m=ms)]
 elif id in ['ollama','lmstudio','vllm','llamacpp','sglang','osaurus']:
  port={'ollama':11434,'lmstudio':1234,'vllm':8000,'llamacpp':8080,'sglang':30000,'osaurus':1337}[id]
  ss=[scheme('本地 / 局域网','自部署','ollama-native' if id=='ollama' else 'openai-chat',f'http://127.0.0.1:{port}'+('' if id=='ollama' else '/v1'),['none','api_key'],modelLabel='已加载模型 ID',m=ms)]
  params=[field('contextWindow','上下文长度',False,type='number'),field('keepAlive','模型保活时间',False,placeholder='例如 5m')]
 elif id=='kat':ss=[scheme('中国','推理接入点','openai-chat','https://vanchin.streamlake.ai/api/gateway/v1/endpoints/{endpointId}/openai',fields=[field('endpointId','推理接入点 ID')],m=ms),scheme('中国','推理接入点','anthropic-messages','https://vanchin.streamlake.ai/api/gateway/v1/endpoints/{endpointId}/claude-code-proxy',fields=[field('endpointId','推理接入点 ID')],m=ms)]
 elif id in ['stepfun','longcat','bailing','baichuan','yi','xai','mistral','cohere','meta','nvidia','huggingface','byteplus','litellm','newapi','shengsuanyun','compshare']:
  # 本地源中有地址的方案逐项保留；套餐/区域未知时明确保持未标注。
  support='reference'
 else:support='runtime' if c['kind']=='工具运行时' else 'planned' if not c['records'] else 'reference'
 if not ss and support=='reference':
  seen=set()
  for i in c['records']:
   r=raw[i]
   for endpoint in r['endpoints']:
    if not re.match(r'https?://',endpoint) or endpoint in seen:continue
    seen.add(endpoint)
    proto='anthropic-messages' if 'anthropic' in endpoint or 'anthropic' in r['protocol'].lower() else 'openai-chat' if 'openai' in r['protocol'].lower() or r['level']=='compat' or endpoint.endswith(('/v1','/v2','/v3')) else 'custom-http'
    ss.append(scheme('来源预设','来源预设 · '+r['id'],proto,endpoint,fields=[],m=r['models'],source=r['repo']+'/'+r['file']+':'+str(r['line'])))
  if not ss:ss=[scheme('自定义','手动接入','custom-http','',m=ms)]
 for i,s in enumerate(ss):
  # 模型范围按区域/套餐的明确源条目取全量；缺少对应目录时要求手动填写，不借用其他套餐。
  exact=None
  if id in ['bailian','qwen']:
   if s['plan'] in ['按量付费','DashScope 兼容接入']:
    exact=('picoclaw','qwen-us') if s['region']=='美国（弗吉尼亚）' else ('ZCode','qwen-alibaba-model-studio-cn' if s['region']=='中国（北京）' else 'qwen-alibaba-model-studio-intl')
   elif s['plan']=='Coding Plan':exact=('picoclaw','alibaba-coding') if s['region']=='新加坡' else ('none','none')
   else:exact=('openclaw','qwen-token-plan')
  elif id=='glm':exact=('ZCode',('bigmodel' if s['region']=='中国' else 'zai')+('-api' if s['plan']=='Coding Plan' else '-standard-api'))
  elif id=='volcengine':exact=('openclaw','volcengine-plan' if s['plan']=='Coding Plan' else 'volcengine')
  elif id=='tencent':exact=('openclaw','tencent-tokenplan' if s['plan']=='Token Plan' else 'tencent-tokenhub') if s['plan']!='混元标准 API' else ('microclaw','tencent')
  elif id=='xiaomi' and s['plan']=='Token Plan':exact=('openclaw','xiaomi-token-plan')
  elif id=='baidu' and s['plan']=='Coding Plan':exact=('none','none')
  elif id=='kimi' and s['plan']=='Kimi Coding':exact=('openclaw','kimi-coding')
  elif id=='stepfun' and s['plan']=='Step Plan':exact=('openclaw','stepfun-plan')
  if exact:
   record=next((r for r in raw if r['repo']==exact[0] and r['id']==exact[1]),None)
   s['models']=record['models'] if record else []
   s['modelSource']=exact[0]+'/'+exact[1] if record else '当前无范围明确的目录快照'
  s['id']=id+':'+str(i)
  if id=='xiaomi' and s['protocol']=='openai-chat':s['authHint']='MiMo 兼容接口使用 api-key 请求头，由对应适配器处理。'
  if id=='google' and s['protocol']=='gemini-native':s['authHint']='Gemini 原生接口使用 Google API Key，与 OpenAI 兼容接口分开处理。'
  if id=='bedrock':s['authHint']='Access Key 使用 AWS 签名；Bedrock API Key 使用 Bearer Token；宿主身份使用部署环境的凭据链。'
 profiles.append(dict(id=id,name=c['name'],kind=c['kind'],support=support,schemes=ss,parameters=params))
# 既有语音、知识入口：不以聊天参数替代相应资源配置。
extras=[('FunASR','ASR','http://127.0.0.1:10095','asr',[]),('Silero VAD','VAD','http://127.0.0.1:8000','vad',[field('resourcePath','VAD 模型资源路径')]),('Vosk','ASR','http://127.0.0.1:2700','asr',[field('resourcePath','语音识别资源路径')]),('Sherpa-ONNX','ASR','http://127.0.0.1:8000','asr',[field('resourcePath','ONNX 模型资源路径')]),('Azure Speech','TTS','','azure-speech',[field('speechRegion','Speech 资源区域')]),('阿里云语音','TTS','https://dashscope.aliyuncs.com','tts',[field('voiceId','音色 ID')]),('Edge TTS','TTS','','tts',[field('voiceId','音色 ID')]),('Embedding / Rerank','Embedding','','embedding',[field('dimensions','向量维数',False,type='number')]),('RAGFlow','RAG','','rag',[field('datasetId','知识集 ID')]),('mem0','记忆','','memory',[field('memorySpace','记忆空间 ID')]),('PowerMem','记忆','','memory',[field('memorySpace','记忆空间 ID')]),('意图路由','意图','','intent',[])]
for name,role,url,proto,fields in extras:
 ss=[scheme('自定义','自部署 / 服务连接',proto,url,['none','api_key'],fields,modelLabel='模型 / 资源 ID',role=role)];ss[0]['id']='cap:'+name+':0'
 profiles.append(dict(id='cap:'+name,name=name,kind='语音与知识',support='reference',schemes=ss,parameters=[]))
(p/'reference/model_config_profiles.json').write_text(json.dumps(profiles,ensure_ascii=False,indent=2)+'\n')
print('profiles',len(profiles),'schemes',sum(len(x['schemes']) for x in profiles))
