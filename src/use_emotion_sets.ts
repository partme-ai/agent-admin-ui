import {useEffect,useState} from 'react';
import {defaultEmotionSet,readEmotionSets,writeEmotionSets,type EmotionSet} from './emotion_sets';
export function useEmotionSets(){
 const [sets,setSets]=useState<EmotionSet[]>([defaultEmotionSet]),[error,setError]=useState('');
 useEffect(()=>{const read=()=>{try{setSets([defaultEmotionSet,...readEmotionSets(localStorage)]);setError('');}catch{setError('本机套装无法读取，原始数据已保留；可导出草稿备份。');}};read();window.addEventListener('storage',read);window.addEventListener('tinybot-emotion-sets',read);return()=>{window.removeEventListener('storage',read);window.removeEventListener('tinybot-emotion-sets',read);};},[]);
 const save=(list:EmotionSet[])=>{writeEmotionSets(localStorage,list);setSets([defaultEmotionSet,...list]);window.dispatchEvent(new Event('tinybot-emotion-sets'));};
 return {sets,error,save};
}
