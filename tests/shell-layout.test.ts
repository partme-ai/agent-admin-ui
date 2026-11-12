import test from 'node:test';
import assert from 'node:assert/strict';
import {shellGroups,shellEntries,shellOwner,shellSelection,shellTarget,shellAncestors,terminalEntry} from '../src/shell_layout.ts';
import {pages,pathFor} from '../src/catalog.ts';
import {resolvePage} from '../src/state.ts';
test('移除重复远程控制后的主入口顺序一致，所有深层叶子可到达',()=>{
 assert.deepEqual(shellGroups.flatMap(g=>g.items.map(i=>i.label)),['工作台','设备(Bot)','模型','知识库','智能体','资源','系统']);
 for(const {node} of shellEntries())assert.equal(resolvePage(pathFor(node.page,node.item)),node.page);
 const keys=shellEntries().map(x=>x.key);assert.equal(new Set(keys).size,keys.length);
 for(const scope of ['models','agents','devices'])for(const view of ['usage','analysis','cost'])assert.ok(keys.includes(`${scope}/${scope}-reports/${view}`));
});
test('旧角色、设备、形象、主题链接继续恢复；主题归系统',()=>{
 assert.equal(pathFor('04','a2'),'/w/demo/agents/a2/edit');assert.equal(shellOwner('04','agents'),'agents');
 assert.equal(shellOwner('13','devices'),'devices');assert.equal(shellOwner('02','chat'),'agents');
 assert.equal(shellOwner('30','settings','theme'),'system');assert.equal(shellOwner('34','voices'),'resources');
 assert.equal(pages.slice(0,35).length,35);
});
test('多级Menu选中对应视图并打开完整祖先，不把默认页与显式子视图混淆',()=>{
 assert.equal(shellSelection('39','cost','models'),'models/models-reports/cost');
 assert.deepEqual(shellAncestors('39','cost','models'),['models','models/models-reports']);
 assert.equal(shellSelection('04','a2','agents'),'agents/mine');
 assert.equal(shellSelection('13','b1','devices'),'devices/mine');
 assert.equal(shellSelection('30','theme','system'),'system/theme');
 assert.equal(shellSelection('30','','system'),'system/configuration/general');
 assert.equal(shellTarget('system/audit/operations')?.item,'operations');
 assert.equal(shellTarget('unknown/key'),undefined);
});

test('终端互联由快捷入口承接，与物理Bot列表分离，旧远程链接仍可恢复',()=>{
 assert.deepEqual(terminalEntry,{page:'30',item:'terminals',label:'终端互联'});
 assert.equal(shellTarget('remote'),undefined);
 assert.equal(shellOwner('30','settings','terminals'),'terminals');
 assert.equal(shellOwner('30','settings','remote'),'terminals');
 assert.equal(shellSelection('30','terminals','terminals'),'terminals');
 assert.deepEqual(shellAncestors('30','terminals','terminals'),[]);
 assert.equal(shellEntries().some(x=>x.node.label==='远程控制'),false);
 assert.equal(resolvePage(pathFor(terminalEntry.page)+'?item='+terminalEntry.item),'30');
 assert.equal(resolvePage('/w/demo/settings/general?item=remote'),'30');
 assert.equal(shellTarget('devices/mine')?.page,'12');
});

test('常规合并进系统设置，旧常规链接选中新入口且保留主题和终端互联',()=>{
 const system=shellGroups[0].items.find(n=>n.key==='system')!;
 assert.equal(system.children!.some(n=>n.label==='常规'),false);
 assert.deepEqual(system.children!.slice(0,2).map(n=>n.label),['基础信息','系统主题']);
 assert.equal(shellTarget('system/general'),undefined);
 assert.equal(shellTarget('system/configuration/general')?.page,'52');
 assert.equal(shellOwner('30','settings'),'system');
 assert.equal(shellSelection('30','','system'),'system/configuration/general');
 assert.equal(shellSelection('52','general','system'),'system/configuration/general');
 assert.equal(shellSelection('30','appearance','system'),'system/theme');
 assert.deepEqual(shellAncestors('30','','system'),['system','system/configuration']);
 assert.equal(resolvePage('/w/demo/settings/general'),'30');
});
