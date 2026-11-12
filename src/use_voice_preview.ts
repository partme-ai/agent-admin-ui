import {useEffect,useSyncExternalStore} from 'react';
import {VoicePreviewPlayer} from './voice_preview';
const player=new VoicePreviewPlayer(url=>{const audio=new Audio(url);audio.preload='none';audio.hidden=true;audio.dataset.voicePreview='official';document.body.append(audio);return audio;});
/** 关闭、切换模型或改变列表后释放音频，离开页面也不会残留声音。 */
export function useVoicePreview(scope:string){
 const state=useSyncExternalStore(player.subscribe,player.getSnapshot);
 useEffect(()=>{player.stop();return player.stop;},[scope]);
 return {state,toggle:player.toggle,stop:player.stop};
}
