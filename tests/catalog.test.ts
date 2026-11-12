import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pages,navItems,pathFor} from '../src/catalog.ts';
import {resolvePage} from '../src/state.ts';

test('正式规划中的页面均有原型入口，旧 35 个 ID 不漂移',()=>{
 const authority=JSON.parse(readFileSync(new URL('../reference/console/registry.json',import.meta.url),'utf8'));
 assert.deepEqual(pages.map(p=>'CON-P'+p.id),authority.pages.map((p:{id:string})=>p.id));
 assert.equal(new Set(pages.map(p=>p.path)).size,pages.length);
});
test('每个页面能恢复合法路由并归属唯一主导航',()=>{
 for(const page of pages){assert.equal(resolvePage(pathFor(page.id)),page.id);assert.ok(navItems.some(nav=>nav.key===page.nav));}
 assert.equal(navItems.length,12);
});
