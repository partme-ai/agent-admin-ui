import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {pages,pathFor,navItems} from '../src/catalog.ts';
import {shellGroups,shellEntries} from '../src/shell_layout.ts';
import {resolvePage,initialStore} from '../src/state.ts';
import {defaultSystemBrand,readSystemBrand,systemBrandKey} from '../src/system_brand.ts';
import {onboardingOrder} from '../src/onboarding.ts';
const removed=['12','13','14','15','25','26','31','34','45','56','61','62','63'];
test('通用管理导航、预览与搜索目录没有设备和本地模型入口',()=>{
 assert.deepEqual(shellGroups[0].items.map(x=>x.key),['home','models','knowledge','agents','resources','system']);
 for(const item of shellEntries())assert.ok(!/^(devices|models\/local)(\/|$)/.test(item.key),item.key);
 for(const id of removed)assert.ok(!pages.some(p=>p.id===id),id);
 assert.ok(!navItems.some(n=>n.key==='devices'));
 for(const page of pages)assert.equal(resolvePage(pathFor(page.id)),page.id);
 for(const path of ['devices','devices/x','devices/x/control','devices/gallery','devices/reports','firmware','firmware/plans/x','models/local/ollama','models/local/environments','models/local/catalog','expressions'])assert.equal(resolvePage('/w/demo/'+path),'404',path);
});
test('移除专用页面源码，通用调试仍保留',()=>{
 for(const path of ['pages/Devices.tsx','pages/DeviceWorkspace.tsx','pages/DeviceBinding.tsx','pages/RoleDeviceBinding.tsx','pages/LocalModels.tsx','pages/CharacterLab.tsx','pages/CharacterEditor.tsx','pages/RobotScreen.tsx'])assert.equal(existsSync(new URL('../src/'+path,import.meta.url)),false,path);
 const main=readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8');
 assert.ok(main.includes("'02':Chat"));assert.ok(!/LocalModels|DeviceGallery|OllamaSettings|CharacterLab/.test(main));
});
test('默认品牌为 Agent Admin UI，旧默认可升级，自定义标识保持',()=>{
 assert.equal(defaultSystemBrand().name,'Agent Admin UI');assert.equal(defaultSystemBrand().slogan,'智能体管理控制台');
 const old=JSON.stringify({schema_version:1,name:'TinyBot',slogan:'机器人控制中心',logo:''});
 assert.equal(readSystemBrand({getItem:key=>key===systemBrandKey?old:null}).settings.name,'Agent Admin UI');
 const custom={schema_version:1,name:'星河',slogan:'我的工作空间',logo:''};
 assert.deepEqual(readSystemBrand({getItem:()=>JSON.stringify(custom)}).settings,custom);
});
test('引导在发布结束，示例数据不再填充物理设备',()=>{
 assert.deepEqual(onboardingOrder,['model','knowledge','agent','trial','publish']);
 const store=initialStore();assert.ok(!JSON.stringify(store).includes('TinyBot ESP32'));
 assert.ok(!store.agents.some(a=>/设备管家/.test(a.name)));
});

test('关联检查包含知识、技能与记忆时仍返回统一检查结果',async()=>{
 const {initialProduct}=await import('../src/product_state.ts');
 const {simulateAgentTurn}=await import('../src/agent_linkage.ts');
 const store=initialStore(),p=initialProduct(),agent=store.agents[0];
 const run=simulateAgentTurn(agent,'检查关联资源，并说明本轮采用的知识、技能和记忆。',{store,skills:p.skills,host:'web',station:p.station});
 assert.equal(run.blocked,false);assert.match(run.text,/关联检查完成/);assert.match(run.text,/模型.*知识.*技能.*独立记忆/);
});
