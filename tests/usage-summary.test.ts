import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeUsage} from '../src/usage_summary.ts';
import {initialStore} from '../src/state.ts';

test('使用统计明确区分内置示例与本次会话，不推测真实计费',()=>{
 const store=initialStore();store.conversations.push({id:'local1',agent:'a1',date:'2026-11-05',title:'本次试聊',messages:[{role:'user',text:'你好'},{role:'assistant',text:'你好'}],summary:'问候'});
 const value=summarizeUsage(store,{agent:'a1',source:'session',start:'2026-11-05',end:'2026-11-05'});
 assert.equal(value.conversations.length,1);assert.equal(value.messages,2);assert.equal(value.sampleRecords,0);assert.equal(value.rows[0].conversations,1);
 assert.equal(value.tokenUsage,null);assert.equal(value.cost,null);
});
test('统计筛选不会把其他角色或日期缺失的记录带入当前区间',()=>{
 const store=initialStore();store.conversations.push({id:'undated',agent:'a1',title:'日期未记录',messages:[],summary:''});
 assert.equal(summarizeUsage(store,{agent:'a2',source:'all',start:'2026-11-05',end:''}).conversations.length,0);
 const value=summarizeUsage(store,{agent:'a1',source:'all',start:'2026-11-01',end:''});assert.deepEqual(value.conversations.map(x=>x.id),['sample-chat-1']);
 assert.equal(summarizeUsage(store,{agent:'',source:'sample',start:'',end:''}).sampleRecords,1);
});
