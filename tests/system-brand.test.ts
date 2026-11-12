import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultSystemBrand,parseSystemBrand,readSystemBrand,writeSystemBrand,systemBrandKey,validateBrandLogo} from '../src/system_brand.ts';
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
test('默认标识保持现状，空配置不写入存储',()=>{
 assert.deepEqual(defaultSystemBrand(),{schema_version:1,name:'Agent Admin UI',slogan:'智能体管理控制台',logo:''});
 assert.deepEqual(readSystemBrand({getItem:()=>null}).settings,defaultSystemBrand());
 const a=defaultSystemBrand();a.name='另一个名字';assert.equal(defaultSystemBrand().name,'Agent Admin UI');
});
test('名称口号规范化、合法Logo保留；空白、超长、未知版本拒绝',()=>{
 const settings={...defaultSystemBrand(),name:' 星河 ',slogan:' 一起探索 ',logo:png};
 assert.deepEqual(parseSystemBrand(JSON.stringify(settings)),{...settings,name:'星河',slogan:'一起探索'});
 for(const patch of [{name:' '},{slogan:''},{name:'字'.repeat(25)},{slogan:'字'.repeat(49)},{schema_version:2}])assert.throws(()=>parseSystemBrand(JSON.stringify({...settings,...patch})));
 for(const raw of ['null','[]','{}','broken'])assert.throws(()=>parseSystemBrand(raw));
});
test('只接收受限本地图片，拒绝远程、SVG、伪造格式及超限内容',()=>{
 assert.doesNotThrow(()=>validateBrandLogo(png));assert.doesNotThrow(()=>validateBrandLogo(''));
 for(const logo of ['https://example.com/logo.png','javascript:alert(1)','data:image/svg+xml;base64,PHN2Zy8+','data:image/jpeg;base64,iVBORw0KGgo=','data:image/png;base64,!!!!','data:image/png;base64,'+Buffer.alloc(256*1024+1).toString('base64')])assert.throws(()=>validateBrandLogo(logo));
});
test('保存、恢复仅操作标识键，损坏值和其他配置不被覆盖',()=>{
 const map=new Map([['tinybot.system-theme.v1','theme'],['tinybot.character-presets.v1','robot']]);const accesses:string[]=[];
 const storage={getItem:(key:string)=>{accesses.push(key);return map.get(key)||null;},setItem:(key:string,value:string)=>{accesses.push(key);map.set(key,value);}};
 const settings={...defaultSystemBrand(),name:'星河',logo:png};writeSystemBrand(storage,settings);assert.deepEqual(readSystemBrand(storage).settings,settings);
 writeSystemBrand(storage,defaultSystemBrand());assert.equal(map.get('tinybot.system-theme.v1'),'theme');assert.equal(map.get('tinybot.character-presets.v1'),'robot');assert.ok(accesses.every(key=>key===systemBrandKey));
 map.set(systemBrandKey,'corrupt');const result=readSystemBrand(storage);assert.ok(result.error);assert.equal(result.settings.name,'Agent Admin UI');assert.equal(map.get(systemBrandKey),'corrupt');
});
test('存储拒绝和不合法配置不会报告保存成功',()=>{
 const storage={setItem:()=>{throw Error('quota');}};assert.throws(()=>writeSystemBrand(storage,defaultSystemBrand()),/quota/);
 let writes=0;assert.throws(()=>writeSystemBrand({setItem:()=>{writes++;}},{...defaultSystemBrand(),name:''}));assert.equal(writes,0);
 assert.ok(readSystemBrand({getItem:()=>{throw Error('denied');}}).error);
});
