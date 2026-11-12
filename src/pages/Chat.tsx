import {createArtifact,devicePresets} from '../station';
import {simulateAgentTurn,settleAgentTurn,resolveTrialAgent,completedTrialCheck,hasCurrentAgentCheck,type AgentTurn} from '../agent_linkage';
import {AgentTurnReview} from './AgentLinkageReview';
import {roleConfigFingerprint} from '../role_profile';
import {trialCharacterDraft} from '../grok_customizer';
import {normalizeCharacter} from '../character_config';
import {CharacterEditor} from './CharacterEditor';
import {VoiceActivity} from '../voice_activity';
import {useMicrophoneCapture} from '../use_microphone_capture';
import {MicrophoneInput} from './MicrophoneInput';
import {cloneRoleProfile} from '../role_profile';
import {roleUsesVoice,roleVoiceIssue,roleHasVoiceOverride} from '../role_loadout';
import {RoleConfigSummary} from './RoleConfigSummary';
import {cloneAgentRuntime} from '../feature_state';
import {useState,useRef,useEffect} from 'react';
import {Button,Input,InputNumber,Form,Switch,Select,Tooltip,Drawer,Alert} from 'antd';
import {AudioOutlined,StopOutlined,ReloadOutlined,MessageOutlined,SendOutlined,SoundOutlined,HistoryOutlined,ArrowRightOutlined,RobotOutlined} from '@ant-design/icons';
import type {Agent,Conversation} from '../state';
import {canUseConnection} from '../capability';
import {useConsole} from '../context';
import {PageHeader,Nothing} from '../components';
import {initialTrialState,transitionTrial,isCurrentTrialTurn,trialDeviceProfiles,trialPhaseLabel,buildTrialReply,type TrialEvent} from '../robot_trial';
import {expressionForDialogue} from '../robot_expressions';
import {RobotScreen} from './RobotScreen';
import {VoicePicker} from './VoicePicker';
import {ttsModels,voicesForModel,retainCompatibleVoice,voiceKey} from '../voice_catalog';
import './robot_trial.css';

type Message=Conversation['messages'][number];
export function ChatPanel({agentId,agentOverride,embedded=false,onTrialComplete,onApplyConfig,deviceId}:{onApplyConfig?:(a:Agent)=>void;deviceId?:string;agentId?:string;agentOverride?:Agent;embedded?:boolean;onTrialComplete?:(tested:Agent,run:AgentTurn)=>void}){
 const c=useConsole();
 const latestEnvironment=useRef({store:c.store,skills:c.product.skills,host:c.host,station:c.product.station});latestEnvironment.current={store:c.store,skills:c.product.skills,host:c.host,station:c.product.station};
 const continuous=useRef(false),vad=useRef<VoiceActivity|null>(null);
 const voiceCallbacks=useRef({start:()=>{},end:(_duration:number)=>{}});
 const [voiceState,setVoiceState]=useState<'off'|'waiting'|'speech'|'response'>('off');
 const [utterances,setUtterances]=useState(0);
 const microphone=useMicrophoneCapture((pcm,rate)=>{if(continuous.current)vad.current?.push(pcm,rate);}),capture=microphone.capture;
 const capturing=capture.phase==='recording',requesting=capture.phase==='requesting';
 const restored=c.store.conversations.find(x=>x.id===c.selected);
 const initialAgent=agentOverride?.id||agentId||restored?.agent||c.store.agents.find(a=>a.id===c.selected)?.id||c.store.agents.find(a=>a.id===c.store.defaultAgentId&&a.published)?.id||c.store.agents.find(a=>a.published)?.id||'';
 const initialSource=agentOverride||resolveTrialAgent(c.store.agents.find(a=>a.id===initialAgent),!!deviceId);
 const initialRuntime=initialSource?.runtime||c.store.voiceDefaults;
 const initialTts=ttsModels.find(m=>m.id===initialRuntime?.ttsModel)||ttsModels[0];
 const [character,setCharacter]=useState(()=>normalizeCharacter(initialSource?.profile?.appearance)),[characterDraft,setCharacterDraft]=useState(()=>normalizeCharacter(initialSource?.profile?.appearance)),[characterOpen,setCharacterOpen]=useState(false);
 const [agent,setAgent]=useState(initialAgent);
 const [profileId,setProfileId]=useState(restored?.deviceProfile||(deviceId&&c.store.bots.find(b=>b.id===deviceId)?.kind.includes('Pi')||c.selected==='pi'?'pi-wide':c.selected==='esp32-round'?'esp32-round':'esp32-square'));
 const [ttsId,setTtsId]=useState(restored?.ttsModel||(restored?.voice&&['warm','clear','bright'].includes(restored.voice)?'local:system':initialTts.id));
 const [voiceId,setVoiceId]=useState(()=>restored?.voice?(restored.ttsModel?restored.voice:voiceKey('local',restored.voice)):initialRuntime?.voice||voicesForModel(initialTts,c.store.voiceAssets)[0]?.key||'');
 const [trial,setTrial]=useState(initialTrialState);
 const stateRef=useRef(trial);
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const ownSpeech=useRef(false);
 const ownUtterance=useRef<SpeechSynthesisUtterance|null>(null),audioCompletion=useRef<(()=>void)|null>(null);
 const conversationId=useRef(restored?.id||crypto.randomUUID());
 const [messages,setMessages]=useState<Message[]>(restored?.messages||[]);
 const messagesRef=useRef(messages);messagesRef.current=messages;
 const [runs,setRuns]=useState<AgentTurn[]>(restored?.runs||[]),[candidate,setCandidate]=useState<Agent|null>(null),[exercise,setExercise]=useState('');
 const runsRef=useRef(runs);runsRef.current=runs;
 const pendingRun=useRef<AgentTurn|null>(null),pendingAgent=useRef<Agent|null>(null);
 const sessionMeta=useRef({profileId,ttsId,voiceId});sessionMeta.current={profileId,ttsId,voiceId};
 function updateRun(run:AgentTurn){runsRef.current=[...runsRef.current.filter(r=>r.id!==run.id),run];setRuns(runsRef.current);}
 function persistConversation(tested:Agent,allRuns:AgentTurn[],allMessages:Message[]){if(!allMessages.length)return;const {versions,publishedConfig,...config}=tested;const record:Conversation={id:conversationId.current,agent:tested.id,device:deviceId||restored?.device,date:new Date().toLocaleDateString('sv-SE'),deviceProfile:sessionMeta.current.profileId,ttsModel:sessionMeta.current.ttsId,voice:sessionMeta.current.voiceId,title:allMessages.find(m=>m.role==='user')?.text.slice(0,40)||'智能体调试',messages:structuredClone(allMessages),summary:allMessages.filter(m=>m.role==='assistant').at(-1)?.text.slice(0,100)||'未完成回应',runs:structuredClone(allRuns),config:structuredClone(config)};c.setStore(s=>({...s,conversations:[record,...s.conversations.filter(x=>x.id!==record.id)]}));}
 function interruptPending(update=true){const run=pendingRun.current,tested=pendingAgent.current;if(!run||run.status!=='running')return;const next=settleAgentTurn(run,false).run;runsRef.current=[...runsRef.current.filter(x=>x.id!==run.id),next];if(update)setRuns(runsRef.current);if(tested)persistConversation(tested,runsRef.current,messagesRef.current);pendingRun.current=null;}

 const [draft,setDraft]=useState('');
 const [dialogueExpression,setDialogueExpression]=useState('talking');
 const [expression,setExpression]=useState<string|null>(null);
 const [textOpen,setTextOpen]=useState(false);
 const [recordsOpen,setRecordsOpen]=useState(false);
 const [sound,setSound]=useState(false);
 const [subtitle,setSubtitle]=useState(restored?.messages.at(-1)?.text||cloneRoleProfile(initialSource?.profile).greeting);
 const [speaker,setSpeaker]=useState('');
 const source=agentOverride||c.store.agents.find(a=>a.id===agent);
 const [debugKnowledge,setDebugKnowledge]=useState<string[]|null>(null),[debugRuntime,setDebugRuntime]=useState<ReturnType<typeof cloneAgentRuntime>|null>(null),[parametersOpen,setParametersOpen]=useState(false);
 const baseAgent=agentOverride||resolveTrialAgent(source,!!deviceId);
 const a=baseAgent?{...baseAgent,knowledge:debugKnowledge||baseAgent.knowledge,runtime:debugRuntime||baseAgent.runtime}:undefined;
 useEffect(()=>{setCharacter(normalizeCharacter(a?.profile?.appearance));},[a?.id,JSON.stringify(a?.profile?.appearance)]);
 const profile=trialDeviceProfiles.find(p=>p.id===profileId)||trialDeviceProfiles[0];
 const ttsModel=ttsModels.find(m=>m.id===ttsId)||ttsModels[0];
 const voices=voicesForModel(ttsModel,c.store.voiceAssets);
 const voice=voices.find(v=>v.key===voiceId);
 const voiceName=a&&!roleUsesVoice(a)?'文字与屏幕':voice?.name||'尚未选择音色';
 const recordsRef=useRef<HTMLDivElement>(null);
 const listening=trial.phase==='listening';
 const running=trial.phase==='thinking'||trial.phase==='speaking';
 const model=a&&c.store.connections.find(m=>m.id===a.model);
 const workflow=a&&c.store.workflows.find(w=>w.id===a.workflowId);
 const vadEnabled=!!a&&!cloneRoleProfile(a.profile).disabledAbilities.includes('VAD');
 const voiceEnabled=!!a&&roleUsesVoice(a),voiceIssue=a?roleVoiceIssue({...a,runtime:{...cloneAgentRuntime(a.runtime),ttsModel:ttsId,voice:voiceId}},c.store.voiceAssets,c.store.connections):'';
 const callable=!voiceIssue&&!!a&&(!deviceId||!!source?.published)&&(workflow?workflow.enabled&&workflow.status==='演示可用':!!model&&canUseConnection(model));
 const dispatch=(event:TrialEvent)=>{if(['stop','reset','submit'].includes(event.type))interruptPending();const next=transitionTrial(stateRef.current,event);stateRef.current=next;setTrial(next);return next;};
 function cancelAudio(){
  const completion=audioCompletion.current;audioCompletion.current=null;
  if(ownUtterance.current){ownUtterance.current.onend=null;ownUtterance.current.onerror=null;ownUtterance.current=null;}
  if(ownSpeech.current&&'speechSynthesis' in window)window.speechSynthesis.cancel();ownSpeech.current=false;return completion;
 }
 function clearPlayback(){timers.current.forEach(clearTimeout);timers.current=[];cancelAudio();}
 useEffect(()=>()=>{interruptPending(false);continuous.current=false;vad.current?.reset();clearPlayback();stateRef.current=transitionTrial(stateRef.current,{type:'reset'});},[]);
 useEffect(()=>{recordsRef.current?.scrollTo({top:recordsRef.current.scrollHeight,behavior:'smooth'});},[messages]);
 function reset(){setCandidate(null);setExpression(null);continuous.current=false;vad.current?.reset();setVoiceState('off');setUtterances(0);dispatch({type:'reset'});microphone.reset();clearPlayback();conversationId.current=crypto.randomUUID();setMessages([]);messagesRef.current=[];setRuns([]);runsRef.current=[];setDraft('');setSubtitle(cloneRoleProfile(a?.profile).greeting);setSpeaker('');}
 useEffect(()=>{if(!agentOverride?.runtime)return;reset();setTtsId(agentOverride.runtime.ttsModel);setVoiceId(agentOverride.runtime.voice);},[agentOverride?.runtime?.ttsModel,agentOverride?.runtime?.voice]);
 useEffect(()=>{if(continuous.current)reset();},[a?.runtime?.vadSpeech,a?.runtime?.vadSilence,a?.runtime?.silenceMs,vadEnabled]);
 function stop(){continuous.current=false;vad.current?.reset();setVoiceState('off');dispatch({type:'stop'});microphone.stop();clearPlayback();setSubtitle('已停止，准备好后我们再聊。');setSpeaker('');}
 function startListening(){
  if(!vadEnabled||!callable)return;setExpression(null);
  dispatch({type:'stop'});clearPlayback();continuous.current=true;setVoiceState('waiting');
  const runtime=cloneAgentRuntime(a?.runtime);
  vad.current=new VoiceActivity({speech:runtime.vadSpeech,silence:runtime.vadSilence,silenceMs:runtime.silenceMs},event=>{
   if(!continuous.current)return;
   if(event.type==='start')voiceCallbacks.current.start();else voiceCallbacks.current.end(event.durationMs);
  });
  setSubtitle('请允许使用麦克风，音频只在本机处理。');setSpeaker('你');microphone.start();
 }
 function finishCapture(){stop();setSubtitle('连续试聊已结束，麦克风已释放。');}
 voiceCallbacks.current={start:()=>{
  dispatch({type:'listen'});clearPlayback();setVoiceState('speech');setSubtitle('正在听你说话…');setSpeaker('你');
 },end:duration=>{
  if(!callable){stop();return;}
  setUtterances(n=>n+1);setVoiceState('response');submit(`语音片段 · ${(duration/1000).toFixed(1)}秒（未接入识别）`,true);
 }};
 useEffect(()=>{
  if(capture.phase==='recording'){dispatch({type:'listen'});setSubtitle('我在听，说完后会自动回应。');setSpeaker('你');}
  else if(capture.phase==='error'){continuous.current=false;vad.current?.reset();setVoiceState('off');dispatch({type:'stop'});clearPlayback();setSubtitle('采集已中断，请检查下方提示后重试。');setSpeaker('');}
 },[capture.phase]);
 function submit(text:string,fromVoice=false){
  if(!a||!text.trim()||!callable)return;setDialogueExpression(fromVoice?'talking':expressionForDialogue(text));setExpression(null);
  if(!fromVoice){continuous.current=false;vad.current?.reset();setVoiceState('off');microphone.stop();}
  const next=dispatch({type:'submit'});clearPlayback();const turn=next.turn;
  const tested:Agent={...a,profile:{...cloneRoleProfile(a.profile),appearance:character},runtime:{...cloneAgentRuntime(a.runtime),ttsModel:ttsModel.id,voice:voiceId}};
  const run=simulateAgentTurn(tested,text.trim(),{store:c.store,skills:c.product.skills,host:c.host,station:c.product.station},messagesRef.current);
  if(fromVoice&&!run.blocked){run.text='已收到这一轮语音。本次只验证采集、VAD与资源关联，尚未接入语音识别和模型。你可以继续说话，也可以插话。';run.citation=false;}
  pendingRun.current=run;pendingAgent.current=tested;updateRun(run);setCandidate(null);
  const reply={text:run.text,citation:run.citation};
  setMessages(m=>[...m,{role:'user',text:text.trim()}]);setDraft('');setSubtitle(text.trim());setSpeaker('你');
  timers.current.push(setTimeout(()=>{
   if(!isCurrentTrialTurn(stateRef.current,turn,'thinking'))return;
   dispatch({type:'respond',turn});setSpeaker(a.name.split(' · ')[0]);setMessages(m=>[...m,{role:'assistant',text:''}]);
   let cursor=0,textDone=false,audioDone=true;
   const finish=()=>{if(textDone&&audioDone&&isCurrentTrialTurn(stateRef.current,turn,'speaking')){dispatch({type:'finish',turn});if(continuous.current){setVoiceState('waiting');dispatch({type:'listen'});}const settled=settleAgentTurn(run,true),completed=settled.run;updateRun(completed);pendingRun.current=null;
     if(settled.check){if(settled.memoryWrite)c.setStore(s=>{const all=s.roleMemories[a.id]||[];return {...s,roleMemories:{...s.roleMemories,[a.id]:all.some(m=>m.content===run.memoryWrite!.content)?all:[...all,{id:crypto.randomUUID(),subject:run.memoryWrite!.subject,content:run.memoryWrite!.content,source:'本地调试 · 明确记忆请求',updated:new Date().toLocaleDateString('sv-SE')}]}};});setCandidate(tested);const current=latestEnvironment.current.store.agents.find(x=>x.id===tested.id),check=current&&completedTrialCheck(current,completed,latestEnvironment.current);if(check&&!deviceId){c.setProduct(p=>({...p,agentChecks:{...p.agentChecks,[tested.id]:check}}));c.setStore(s=>({...s,roleTrials:{...s.roleTrials,[tested.id]:check.config}}));}onTrialComplete?.(tested,completed);}
     persistConversation(tested,runsRef.current,messagesRef.current);}};
   const failed=()=>{if(!isCurrentTrialTurn(stateRef.current,turn,'speaking'))return;stop();setSubtitle('本机声音未能完成播放，请检查后重试。');setSpeaker('');};
   const reveal=()=>{
    if(!isCurrentTrialTurn(stateRef.current,turn,'speaking'))return;
    cursor=Math.min(cursor+3,reply.text.length);const shown=reply.text.slice(0,cursor);setSubtitle(shown);setMessages(m=>m.map((v,i)=>i===m.length-1?{...v,text:shown,citation:cursor===reply.text.length&&reply.citation}:v));
    if(cursor<reply.text.length)timers.current.push(setTimeout(reveal,voice?.voiceId==='bright'?45:65));
    else {textDone=true;timers.current.push(setTimeout(finish,600));}
   };
   reveal();
   if(sound&&voiceEnabled&&ttsModel.providerId==='local'&&(!voice||!('speechSynthesis' in window))){failed();return;}
   if(sound&&voiceEnabled&&ttsModel.providerId==='local'&&voice&&'speechSynthesis' in window){
    const localVoice=window.speechSynthesis.getVoices().find(v=>v.localService&&v.lang.startsWith('zh'));
    if(localVoice){try{const utterance=new SpeechSynthesisUtterance(reply.text);utterance.voice=localVoice;utterance.lang=localVoice.lang;const runtime=cloneAgentRuntime(a.runtime);utterance.rate=Math.max(.1,Math.min(10,voice.rate*runtime.rate));utterance.pitch=Math.max(0,Math.min(2,voice.pitch*Math.pow(2,runtime.pitch/12)));utterance.volume=Math.max(0,Math.min(1,runtime.volume));audioDone=false;ownSpeech.current=true;const ended=()=>{if(!isCurrentTrialTurn(stateRef.current,turn,'speaking'))return;ownSpeech.current=false;ownUtterance.current=null;audioCompletion.current=null;audioDone=true;finish();};ownUtterance.current=utterance;audioCompletion.current=ended;utterance.onend=ended;utterance.onerror=failed;try{window.speechSynthesis.speak(utterance);}catch{failed();return;}timers.current.push(setTimeout(()=>{if(isCurrentTrialTurn(stateRef.current,turn,'speaking')&&!audioDone){failed();}},30000));}catch{failed();}}else{failed();}
   }
  },700));
 }
 function changeTts(id:string){clearPlayback();reset();setSound(false);setTtsId(id);const target=ttsModels.find(m=>m.id===id)!;setVoiceId(retainCompatibleVoice(voiceId,voicesForModel(target,c.store.voiceAssets)));}
 function toggleSound(){
  if(ttsModel.providerId!=='local')return;
  if(sound){const complete=cancelAudio();setSound(false);complete?.();return;}
  if(!('speechSynthesis' in window)||!window.speechSynthesis.getVoices().some(v=>v.localService&&v.lang.startsWith('zh'))){c.notify('当前浏览器没有可用的本地中文音色，仍可查看屏幕与字幕效果。');return;}
  setSound(true);
 }
 if(!a)return <Nothing title="先创建一个智能体，再开始机器人试聊" action={<Button onClick={()=>c.go('04','new')}>创建智能体</Button>}/>;
 const citationDoc=c.store.docs.find(d=>d.id===runs.at(-1)?.references[0]?.id);
 function openCharacterSelection(){setCharacterDraft(trialCharacterDraft(character));setCharacterOpen(true);}
 const records=<div className="robot-records" ref={recordsRef}>{!messages.length?<div className="robot-records-empty"><MessageOutlined/><strong>还没有开始对话</strong><p>和机器人打个招呼吧</p></div>:messages.map((m,i)=><div key={i} className={`robot-record ${m.role}`}><small>{m.role==='user'?'你':a.name.split(' · ')[0]}</small><p>{m.text||'正在回应…'}</p>{m.citation&&<button className="robot-citation" disabled={!citationDoc} onClick={()=>citationDoc&&c.go('10',citationDoc.id)}>{citationDoc?'查看知识来源':'来源不可用'} <ArrowRightOutlined/></button>}</div>)}</div>;
 return <div className={`robot-trial ${embedded?'robot-trial-embedded':''}`}>
  <div className="robot-trial-config" aria-label="试聊配置">
   <label className="trial-device-field"><span>适配设备</span><Select aria-label="适配设备" value={profile.id} onChange={v=>{reset();setProfileId(v);}} options={trialDeviceProfiles.map(p=>({value:p.id,label:p.name}))}/></label>
   <label><span>智能体</span><Select aria-label="试聊智能体" disabled={!!agentOverride} value={a.id} onChange={v=>{reset();setAgent(v);setDebugKnowledge(null);setDebugRuntime(null);const selected=resolveTrialAgent(c.store.agents.find(x=>x.id===v),!!deviceId);setSubtitle(cloneRoleProfile(selected?.profile).greeting);const runtime=selected?.runtime;const model=ttsModels.find(x=>x.id===runtime?.ttsModel)||ttsModels[0];setTtsId(model.id);setVoiceId(runtime?.voice||voicesForModel(model,c.store.voiceAssets)[0]?.key||'');}} options={(agentOverride?[agentOverride]:c.store.agents.filter(x=>!deviceId||x.published)).map(x=>({value:x.id,label:x.name+(deviceId?'':x.published?' · 当前草稿':' · 未发布')}))}/></label>
   <label><span>语音模型</span><Select aria-label="语音合成模型" disabled={!!agentOverride||!voiceEnabled} value={ttsModel.id} onChange={changeTts} options={['MiniMax','OpenAI','即梦','本机系统'].map(provider=>({label:provider,options:ttsModels.filter(m=>m.provider===provider).map(m=>({value:m.id,label:`${m.provider} · ${m.displayName||m.modelId}${m.legacy?'（兼容）':''}`}))}))}/></label><label><span>音色</span><VoicePicker disabled={!!agentOverride||!voiceEnabled} model={ttsModel} voices={voices} value={voiceId} onChange={v=>{reset();setVoiceId(v);}}/></label>
   <label><span>知识库</span><Select aria-label="试聊知识库" mode="multiple" maxTagCount="responsive" value={a.knowledge} options={c.store.knowledge.map(k=>({value:k.id,label:k.name}))} onChange={ids=>{reset();setDebugKnowledge(ids);}} placeholder="不使用知识库"/></label>
   <label><span>调试参数</span><Button onClick={()=>setParametersOpen(true)}>VAD、上下文与语音参数</Button></label>
  </div>
  {agentOverride&&<p className="muted small-text">{deviceId?'使用当前设备覆盖配置；人物面板管理智能体版本。':'使用当前角色草稿的模型与音色；更换配置请返回人物面板，修改后需重新试聊。'}</p>}
  <div className="linkage-quick-actions"><Button onClick={()=>c.go('66',a.id)}>会话产物</Button><Button disabled={!messages.some(m=>m.role==='assistant')} onClick={()=>{try{const artifact=createArtifact(a.id,conversationId.current,`${a.name}-调试记录.md`,messages.map(m=>`${m.role==='user'?'用户':'智能体'}：${m.text}`).join('\n\n'));c.setProduct(p=>({...p,station:{...p.station,artifacts:[artifact,...p.station.artifacts]}}));c.notify('调试记录已保存到会话产物');}catch(e){c.notify((e as Error).message);}}}>保存对话为产物</Button><Button disabled={!callable||running} onClick={()=>submit('验证关联')}>验证全部关联</Button><Select aria-label="选择关联演练" value={exercise||undefined} placeholder="选择技能、MCP、命令或钩子" onChange={setExercise} options={[...(a.runtime?.stationTools||[]).map(id=>({value:`/builtin ${id}`,label:`工具 · ${c.product.station.tools.find(t=>t.id===id)?.name||id}`})),...cloneRoleProfile(a.profile).skills.map(id=>({value:`/skill ${id}`,label:`技能 · ${c.product.skills.find(s=>s.id===id)?.name||id}`})),...Object.entries(cloneRoleProfile(a.profile).connectionTools).flatMap(([id,tools])=>tools.map(tool=>({value:`/tool ${id} ${tool}`,label:`MCP · ${c.store.extensions.find(e=>e.id===id)?.name||id} / ${tool}`}))),...cloneRoleProfile(a.profile).commands.filter(x=>x.enabled).map(x=>({value:x.name,label:`命令 · ${x.name}`})),...[...new Set(cloneRoleProfile(a.profile).hooks.filter(x=>x.enabled).map(x=>x.event))].map(event=>({value:`/event ${event}`,label:`钩子 · ${event}`}))]}/><Button disabled={!callable||running||!exercise} onClick={()=>submit(exercise)}>运行选中演练</Button><Button disabled={!callable||running} onClick={()=>submit('你记得我哪些偏好？')}>检查独立记忆</Button></div>
  {candidate&&onApplyConfig&&agentOverride&&roleConfigFingerprint(candidate)!==roleConfigFingerprint(agentOverride)&&<Alert type="info" title="本轮使用了临时调试配置" description="应用到草稿后，保存并重新调试，再发布这份配置。" action={<Button onClick={()=>onApplyConfig(candidate)}>应用调试配置到草稿</Button>}/>}
  {!deviceId&&!embedded&&<div className="role-section-heading"><span className="muted small-text">{hasCurrentAgentCheck(a,{store:c.store,skills:c.product.skills,host:c.host,station:c.product.station},c.product.agentChecks[a.id])?'当前配置已完成模拟调试，可返回发布':'使用当前草稿调试；临时参数不会覆盖已保存配置'}</span><Button onClick={()=>c.go('04',a.id)}>返回人物面板</Button></div>}
  <AgentTurnReview run={runs.at(-1)}/>
  <RoleConfigSummary agent={{...a,profile:{...cloneRoleProfile(a.profile),appearance:character},runtime:{...cloneAgentRuntime(a.runtime),ttsModel:ttsId,voice:voiceId}}} label={deviceId?'本次调试 · 当前设备配置':agentOverride?'本次试聊 · 当前草稿':JSON.stringify(character)!==JSON.stringify(normalizeCharacter(a.profile?.appearance))?'本次试聊 · 临时形象':roleHasVoiceOverride(a,ttsId,voiceId)?'本次试聊 · 临时声音':'本次调试 · 当前草稿'}/>
  {!vadEnabled&&<p className="muted small-text">角色未启用语音活动检测，请在人物面板启用 VAD 后使用连续语音；仍可进行文字测试。</p>}
  {!voiceEnabled&&<p className="muted small-text">语音合成未启用，本次使用文字与机器人屏幕；已保留原声音配置。</p>}
  {!callable&&<Alert type="warning" showIcon title={voiceIssue||'这个智能体还未准备好'} description={voiceIssue?'音色需要与当前提供方和模型匹配。':'请检查模型或外部连接，准备好后再试聊。'} action={voice?<Button onClick={()=>c.go('04',a.id)}>检查配置</Button>:undefined}/>}
  <div className="robot-trial-layout">
   <section className="robot-stage-card" aria-label="机器人试聊区域">
    <div className="robot-stage-heading"><div><RobotOutlined/><strong>{profile.shortName}</strong><span>{profile.width} × {profile.height}</span></div><div className="expression-toolbar"><Button className="character-trigger" aria-label="选择机器人形象" onClick={openCharacterSelection}>形象与表情</Button><span className={`trial-phase phase-${trial.phase}`} role="status">{requesting?'等待麦克风授权':continuous.current?(voiceState==='speech'?'正在聆听':voiceState==='response'?trialPhaseLabel[trial.phase]:'等待你说话'):trialPhaseLabel[trial.phase]}</span></div></div>
    <div className="robot-stage"><RobotScreen appearance={character} expression={expression} dialogueExpression={dialogueExpression} profile={profile} phase={trial.phase} subtitle={subtitle} speaker={speaker||a.name.split(' · ')[0]} voiceName={voiceName}/></div>
    <div className="robot-trial-controls">
     <MicrophoneInput capture={capture}/>
     {continuous.current&&<div className="voice-turn-status" role="status"><span>{voiceState==='speech'?'正在听 · 停顿后自动收句':voiceState==='response'?'模拟回应 · 可以直接插话':'连续倾听 · 请开始说话'}</span><small>{utterances?`已收句 ${utterances} 次 · `:''}识别与回答为模拟</small></div>}
     {capture.phase==='error'&&<Alert className="microphone-error" showIcon type="warning" title={capture.message}/>}
     <div className="robot-main-actions"><Tooltip title={ttsModel.providerId==='local'?(sound?'关闭本机声音':'开启本机声音'):'配置语音服务后可播报'}><Button className="robot-sound-button" disabled={!voiceEnabled||ttsModel.providerId!=='local'} aria-label={sound?'关闭本机声音':'开启本机声音'} aria-pressed={sound} icon={<SoundOutlined/>} onClick={toggleSound}/></Tooltip><Button aria-label={requesting?'取消授权等待':capturing?'结束连续试聊':running?'打断并说话':capture.phase==='error'?'重试采集':'开始连续试聊'} className={`robot-mic-button ${capturing?'is-listening':''}`} type="primary" size="large" icon={requesting||capturing?<StopOutlined/>:<AudioOutlined/>} disabled={(!callable||!vadEnabled)&&!capturing&&!requesting} onClick={()=>requesting||capturing?finishCapture():startListening()}>{requesting?'取消授权等待':capturing?'结束连续试聊':running?'打断并说话':capture.phase==='error'?'重试采集':'开始连续试聊'}</Button><Tooltip title="停止采集或本次回应"><Button aria-label="停止回应" icon={<StopOutlined/>} disabled={!running&&!capturing&&!requesting} onClick={stop}/></Tooltip></div>
     <div className="robot-secondary-actions"><Button type="text" icon={<MessageOutlined/>} onClick={()=>setTextOpen(!textOpen)} aria-expanded={textOpen}>文字测试</Button><Button type="text" className="mobile-record-trigger" icon={<HistoryOutlined/>} onClick={()=>setRecordsOpen(true)}>对话记录{messages.length>0?` · ${messages.length}`:''}</Button><Button type="text" icon={<ReloadOutlined/>} onClick={reset}>重新开始</Button></div>
     {textOpen&&<form className="robot-text-input" onSubmit={e=>{e.preventDefault();submit(draft);}}><Input aria-label="试聊文字" autoFocus placeholder="输入你想对机器人说的话…" value={draft} onChange={e=>setDraft(e.target.value)}/><Button type="primary" aria-label="发送试聊文字" htmlType="submit" disabled={!draft.trim()||!callable} icon={<SendOutlined/>}/></form>}
    </div>
   </section>
   <aside className="robot-records-card"><header><strong>本次对话</strong><span>{messages.length?`${Math.ceil(messages.length/2)} 轮对话`:'等待开始'}</span></header>{records}<footer><span>{a.name.split(' · ')[0]} · v{a.revision}</span><span>{voiceName}</span></footer></aside>
  </div>
  <Drawer title="调试参数" open={parametersOpen} onClose={()=>setParametersOpen(false)} size={c.device==='mobile'?'100%':480} footer={<div className="product-footer"><Button onClick={()=>{reset();setDebugRuntime(null);}}>恢复智能体参数</Button><Button type="primary" onClick={()=>setParametersOpen(false)}>完成</Button></div>}><Form layout="vertical"><p className="muted small-text">仅用于本次调试，不修改智能体或设备配置。修改时结束当前采集与回应。</p>{(['silenceMs','idleSeconds','volume','rate','topP'] as const).map(key=><Form.Item key={key} label={{silenceMs:'停顿收句（毫秒）',idleSeconds:'会话空闲时长（秒）',volume:'播报音量',rate:'语速',topP:'采样 Top P'}[key]}><InputNumber aria-label={`调试${key}`} min={key==='silenceMs'?300:key==='idleSeconds'?10:key==='rate'?.5:0} max={key==='silenceMs'?3000:key==='idleSeconds'?600:key==='rate'?2:1} step={key==='silenceMs'?100:key==='idleSeconds'?10:.1} value={cloneAgentRuntime(a.runtime)[key]} onChange={v=>{reset();setDebugRuntime({...cloneAgentRuntime(a.runtime),[key]:v??0});}}/></Form.Item>)}<Form.Item label="对话语言"><Select aria-label="调试对话语言" value={cloneAgentRuntime(a.runtime).language} onChange={language=>{reset();setDebugRuntime({...cloneAgentRuntime(a.runtime),language});}} options={['普通话','English','粤语'].map(value=>({value,label:value}))}/></Form.Item></Form></Drawer>
  <Drawer className="character-drawer character-studio-drawer" title="选择机器人形象" open={characterOpen} onClose={()=>setCharacterOpen(false)} placement="right" size={c.device==='mobile'?'100%':820} destroyOnHidden footer={<><span>仅覆盖本次试聊；角色形象请在人物面板保存。</span><Button type="primary" onClick={()=>{if(capturing||requesting||running)stop();setCharacter(structuredClone(characterDraft));setCharacterOpen(false);}}>应用到本次试聊</Button></>}><CharacterEditor value={characterDraft} onChange={setCharacterDraft}/></Drawer>
  <Drawer title="本次对话" open={recordsOpen} onClose={()=>setRecordsOpen(false)} placement="bottom" size="70vh">{records}</Drawer>
 </div>;
}
export function Chat(){const c=useConsole();
 return <><div className="robot-chat-header"><PageHeader title="智能体调试" desc="模拟设备对话，检查知识、语音与表情配置" actions={<Button aria-label="试聊记录" icon={<HistoryOutlined/>} onClick={()=>c.go('24')}><span className="trial-history-label">试聊记录</span></Button>}/></div><ChatPanel key={c.selected||'default'}/></>;
}
