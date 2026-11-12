import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {decodeQrPixels,releaseCamera,cameraError} from '../src/qr_reader.ts';
import {createOffer,offerPayload,parseOffer} from '../src/terminal_interconnect.ts';
const require=createRequire(import.meta.url),{QrCode,Ecc}=require('@rc-component/qrcode/lib/libs/qrcodegen.js');
test('Antd同源编码器生成的实际像素可以本地解码为配对信息',()=>{
 const o=createOffer({name:'二维码图片验收',target:'server',endpoint:'https://server.tinybot.test'}),payload=offerPayload(o),q=QrCode.encodeText(payload,Ecc.MEDIUM),matrix=q.getModules(),scale=4,border=4,size=(matrix.length+border*2)*scale,data=new Uint8ClampedArray(size*size*4).fill(255);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const row=Math.floor(y/scale)-border,col=Math.floor(x/scale)-border;if(matrix[row]?.[col]){const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=0;}}
 assert.equal(decodeQrPixels(data,size,size),payload);assert.deepEqual(parseOffer(decodeQrPixels(data,size,size)!),o);
});
test('无二维码不产生识别，停止释放全部相机轨道，授权异常可理解',()=>{
 assert.equal(decodeQrPixels(new Uint8ClampedArray(100*100*4).fill(255),100,100),null);
 let stopped=0;releaseCamera({getTracks:()=>[{stop:()=>stopped++},{stop:()=>stopped++}]} as any);assert.equal(stopped,2);
 assert.match(cameraError({name:'NotAllowedError'}),/权限被拒绝/);assert.match(cameraError({name:'NotFoundError'}),/没有找到相机/);
});
