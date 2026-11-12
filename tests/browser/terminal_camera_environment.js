/* 仅供浏览器故障注入：不是实体相机，不进入正常构建。刷新页面即恢复原生API。 */
window.__cameraTest={mode:'deny',streams:[],pending:[],canvas:document.createElement('canvas'),qr:null};
__cameraTest.canvas.width=640;__cameraTest.canvas.height=480;
__cameraTest.paint=()=>{const t=__cameraTest,c=t.canvas,ctx=c.getContext('2d');ctx.fillStyle=t.qr?'white':'#172033';ctx.fillRect(0,0,c.width,c.height);if(t.qr)ctx.drawImage(t.qr,160,80,320,320);ctx.fillStyle='#999';ctx.fillRect(Date.now()%100,0,1,1);};
__cameraTest.ticker=setInterval(__cameraTest.paint,60);
__cameraTest.make=()=>{const s=__cameraTest.canvas.captureStream(15);__cameraTest.streams.push(s);return s;};
navigator.mediaDevices.getUserMedia=async()=>{const t=__cameraTest;if(t.mode==='deny')throw new DOMException('test denied','NotAllowedError');if(t.mode==='pending')return new Promise(resolve=>t.pending.push(resolve));return t.make();};
