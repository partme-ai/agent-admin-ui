import type {Doc} from './state.ts';
/** 将问答保存为现有资料记录，继续复用智能体关联与本地检索。反例不参与召回。 */
export function saveFaqDocument(faq:NonNullable<Doc['faq']>,knowledge:string,id:string,old?:Doc):Doc{
 const clean={...faq,question:faq.question.trim(),similarQuestions:faq.similarQuestions.map(s=>s.trim()).filter(Boolean),negativeQuestions:faq.negativeQuestions.map(s=>s.trim()).filter(Boolean),answers:faq.answers.map(s=>s.trim()).filter(Boolean)};
 if(!clean.question||!clean.answers.length)throw new Error('标准问和答案不能为空');
 const text=[clean.question,...clean.similarQuestions,...clean.answers].join('\n\n');
 return {...old,id,knowledge,name:clean.question,faq:clean,text,size:`${new TextEncoder().encode(text).length} B`,format:'faq',status:clean.enabled?'已索引':'已停用',chunks:[text]};
}
