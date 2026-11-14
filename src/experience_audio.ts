/** 将当前录音的单声道 PCM 封装为 WAV；只供浏览器试听和本地请求预览。 */
export function experienceWav(chunks:readonly Int16Array[],sampleRate:number){
 if(!Number.isInteger(sampleRate)||sampleRate<8000||sampleRate>192000)throw new Error('录音采样率无效，请重试');
 const count=chunks.reduce((n,c)=>n+c.length,0);
 if(!count)throw new Error('没有录到声音，请重试');
 if(count>sampleRate*60)throw new Error('录音最长 60 秒');
 const bytes=new Uint8Array(44+count*2),view=new DataView(bytes.buffer);
 const text=(offset:number,value:string)=>{for(let i=0;i<value.length;i++)bytes[offset+i]=value.charCodeAt(i);};
 text(0,'RIFF');view.setUint32(4,36+count*2,true);text(8,'WAVE');text(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);text(36,'data');view.setUint32(40,count*2,true);
 let offset=44;for(const chunk of chunks)for(const sample of chunk){view.setInt16(offset,sample,true);offset+=2;}
 return bytes;
}
