"""将源码快照投影成产品目录；别名只影响导航，原始记录不合并。"""
import json,re
from pathlib import Path
p=Path(__file__).resolve().parent.parent
source=json.loads((p/'reference/model_integrations.source.json').read_text())
# id / 名称 / 分类 / 国内 / 精确前缀或名称别名
rules=[
 ('deepseek','DeepSeek','官方模型',True,r'deepseek'),('glm','智谱 GLM / Z.AI','官方模型',True,r'zhipu|zai|z\.ai|bigmodel|glm'),
 ('kimi','Kimi / 月之暗面','官方模型',True,r'kimi|moonshot'),('minimax','MiniMax','官方模型',True,r'minimax|minimaxi'),
 ('bailian','阿里云 · 百炼','模型平台',True,r'bailian|aliyun-bailian|alibaba|qwen-alibaba|dashscope|modelstudio'),
 ('qwen','通义千问','官方模型',True,r'qwen'),('baidu','百度云 · 千帆','模型平台',True,r'baidu|qianfan'),
 ('volcengine','字节 · 火山方舟','模型平台',True,r'volcengine|doubao|火山|ark'),('tencent','腾讯 · 混元 / TokenHub','模型平台',True,r'tencent|hunyuan'),
 ('xiaomi','小米 · MiMo','官方模型',True,r'xiaomi'),('stepfun','阶跃星辰','官方模型',True,r'stepfun'),
 ('siliconflow','硅基流动','模型平台',True,r'siliconflow'),('modelscope','魔搭 ModelScope','模型平台',True,r'modelscope'),
 ('longcat','美团 · LongCat','官方模型',True,r'longcat'),('bailing','蚂蚁 · 百灵','官方模型',True,r'bailing'),
 ('baichuan','百川智能','官方模型',True,r'baichuan'),('yi','零一万物 · Yi','官方模型',True,r'yi'),
 ('kat','快手 · KAT','官方模型',True,r'kat-coder'),('compshare','优刻得 · Compshare','模型平台',True,r'compshare'),
 ('shengsuanyun','胜算云','模型平台',True,r'shengsuan|胜算'),
 ('openai','OpenAI','官方模型',False,r'openai(?:$|/| official)'),('anthropic','Anthropic','官方模型',False,r'anthropic|claude official'),
 ('google','Google Gemini','官方模型',False,r'google$|google/|google official|gemini$|gemini native'),('xai','xAI','官方模型',False,r'xai'),
 ('mistral','Mistral','官方模型',False,r'mistral'),('cohere','Cohere','官方模型',False,r'cohere'),('meta','Meta','官方模型',False,r'meta(?:$|/)'),
 ('openrouter','OpenRouter','模型平台',False,r'openrouter'),('azure','Azure / Microsoft Foundry','模型平台',False,r'azure|microsoft-foundry'),
 ('bedrock','Amazon Bedrock','模型平台',False,r'bedrock|amazon-bedrock|aws bedrock'),('vertex','Google Vertex AI','模型平台',False,r'google-vertex|anthropic-vertex|vertex'),
 ('nvidia','NVIDIA NIM','模型平台',False,r'nvidia'),('huggingface','Hugging Face','模型平台',False,r'huggingface'),('byteplus','BytePlus','模型平台',False,r'byteplus'),
 ('ollama','Ollama','本地服务',False,r'ollama$|hailo_ollama'),('lmstudio','LM Studio','本地服务',False,r'lmstudio|lm studio|lm-studio'),
 ('vllm','vLLM','本地服务',False,r'vllm'),('llamacpp','llama.cpp','本地服务',False,r'llamacpp|llama\.cpp|llama-cpp'),
 ('sglang','SGLang','本地服务',False,r'sglang'),('osaurus','Osaurus','本地服务',False,r'osaurus'),('apple','Apple Foundation Models','本地服务',False,r'apple-fm'),
 ('litellm','LiteLLM','模型平台',False,r'litellm'),('newapi','NewAPI','模型平台',True,r'newapi'),
 ('opencode','OpenCode Zen / Go','模型平台',False,r'opencode|openCode go'),
 ('runtime','外部 Agent / CLI','工具运行时',False,r'claude|codex|openai.codex|gemini.cli|google-gemini-cli|grok_cli|copilot|github-copilot|kilocli|oh my|claude desktop')]
items={i:{'id':i,'name':n,'kind':k,'domestic':cn,'roles':['LLM'],'records':[],'models':[],'phase':'P0' if cn and i in ['deepseek','glm','kimi','minimax','bailian','qwen','volcengine'] else 'P1'} for i,n,k,cn,_ in rules}
for idx,r in enumerate(source['records']):
 label=r['id'].lower();name=r['name'].lower()
 if label.startswith(('openai-compatible','anthropic-compatible')): key=None
 elif r['level']=='runtime' or re.search(r'(?:cli|codex|copilot|claude desktop|oh my)',label): key='runtime'
 else:
  key=next((i for i,n,k,cn,pattern in rules if re.match('(?:'+pattern+')(?:$|[ /_(-])',label) or re.match('(?:'+pattern+')(?:$|[ /_(-])',name)),None)
 if not key:
  key=re.sub(r'[^a-z0-9]+','-',label).strip('-') or 'service-'+str(idx)
  if key not in items: items[key]={'id':key,'name':r['name'],'kind':'兼容服务','domestic':False,'roles':[],'records':[],'models':[],'phase':'P2'}
 card=items[key];card['records'].append(idx);card['models']+=r['models']
for c in items.values():
 c['models']=list(dict.fromkeys(c['models']));c['roles']=['待核实'] if not c['roles'] else c['roles']
 if c['id']=='runtime':c['roles']=['外部运行时'];c['phase']='P2'
# 国内主流整合目标：参考仓库无明确注册证据的项目保留为规划，不能标成已实现。
for id,name in [('huawei','华为云 · 盘古 / ModelArts'),('spark','讯飞 · 星火'),('sensenova','商汤 · 日日新')]:
 items[id]={'id':id,'name':name,'kind':'模型平台' if id=='huawei' else '官方模型','domestic':True,'roles':['待核实'],'records':[],'models':[],'phase':'P1'}
items={k:v for k,v in items.items() if v['records'] or k in ['huawei','spark','sensenova','bailing']}
(p/'reference/model_directory.json').write_text(json.dumps(list(items.values()),ensure_ascii=False,indent=2)+'\n')
print('families',len(items),'records',sum(len(c['records']) for c in items.values()))
