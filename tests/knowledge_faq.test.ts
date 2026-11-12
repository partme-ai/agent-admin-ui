import {test} from 'node:test';
import assert from 'node:assert/strict';
import {saveFaqDocument} from '../src/knowledge_faq.ts';
test('FAQ retains identity and excludes negative questions from local indexed text',()=>{
 const faq={question:' 如何绑定？ ',similarQuestions:['怎么绑定',''],negativeQuestions:['解除绑定'],answers:[' 打开设备详情 '],enabled:true};
 const doc=saveFaqDocument(faq,'k','d');
 assert.equal(doc.name,'如何绑定？');assert.equal(doc.status,'已索引');assert.ok(doc.text.includes('怎么绑定'));assert.ok(!doc.text.includes('解除绑定'));assert.deepEqual(doc.faq?.negativeQuestions,['解除绑定']);assert.equal(faq.question,' 如何绑定？ ');
 const disabled=saveFaqDocument({...doc.faq!,enabled:false},'k','d',doc);assert.equal(disabled.status,'已停用');assert.equal(disabled.id,doc.id);
 assert.throws(()=>saveFaqDocument({...faq,answers:[' ']},'k','d'),/不能为空/);
});
