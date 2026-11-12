/** 解析配置目录。参考 Cherry Studio f2c9357 的处理器与参数；不包含解析执行代码。 */
export type ParserSettings={apiHost?:string;credentialRefs?:string[];modelId?:string;langs?:string[];formulaLevel?:number;mergeCrossPageForms?:boolean};
export type ParserRule={file_types:string[];engine:string;xlsx_first_row_as_header?:boolean;engine_options?:Record<string,ParserSettings>;[key:string]:unknown};
type ParserDefinition={label:string;types:readonly string[];remote?:boolean;apiHost?:string;keyUrl?:string;models?:readonly string[];note?:string};
const images=['jpg','jpeg','png','gif','bmp','tif','tiff','webp'];
const office=['docx','doc','pptx','ppt','xlsx','xls'];
export const parserDefinitions:Record<string,ParserDefinition>={
 builtin:{label:'内置',types:['pdf',...office,'epub','mhtml','csv','md','markdown','txt','json',...images,'mp3','wav','m4a','flac','ogg']},
 simple:{label:'Simple',types:['csv','md','markdown','txt','json']},
 anydoc:{label:'anydoc',types:[...office,'epub']},
 markitdown:{label:'MarkItDown',types:office},
 mineru:{label:'MinerU',types:['pdf'],remote:true,apiHost:'https://mineru.net',keyUrl:'https://mineru.net/apiManage',models:['pipeline']},
 paddleocr_vl:{label:'PaddleOCR-VL',types:['pdf',...images],remote:true,apiHost:'https://paddleocr.aistudio-app.com/',keyUrl:'https://aistudio.baidu.com/paddleocr/',models:['PaddleOCR-VL-1.6','PaddleOCR-VL-1.5','PaddleOCR-VL','PP-StructureV3']},
 'local-document':{label:'本地文档解析',types:['pdf'],note:'文本 PDF 使用 anydoc，扫描 PDF 使用本地 PaddleOCR。需宿主部署解析器和 OCR 模型；Web、Tablet 不直接运行 Cherry 的 Electron 模块。'},
 paddleocr:{label:'PaddleOCR',types:['pdf',...images],remote:true,apiHost:'https://paddleocr.aistudio-app.com/',keyUrl:'https://aistudio.baidu.com/paddleocr/'},
 doc2x:{label:'Doc2x',types:['pdf'],remote:true,apiHost:'https://v2.doc2x.noedgeai.com',keyUrl:'https://open.noedgeai.com/apiKeys',models:['v3-2026','v2']},
 mistral:{label:'Mistral',types:['pdf',...images],remote:true,apiHost:'https://api.mistral.ai',keyUrl:'https://mistral.ai/api-keys',models:['mistral-ocr-latest']},
 'open-mineru':{label:'Open MinerU',types:['pdf'],remote:true,apiHost:'http://127.0.0.1:8000',note:'自部署 MinerU 服务；未配置鉴权时可不填密钥引用。手机或 Pad 的 localhost 指向自身，请填写可访问的服务地址。'},
 system:{label:'System OCR',types:images,note:'Cherry 原实现仅支持 macOS / Windows 原生 OCR。Web、Android Tablet、iPad 需连接支持此能力的 Desktop / Server；当前不执行系统 OCR。'},
 'local-paddleocr':{label:'本地 PaddleOCR',types:images,note:'需宿主部署本地 OCR 模型。Cherry 的原生实现不支持 Intel Mac；TinyBot 各宿主的适配仍待验证。'},
 tesseract:{label:'Tesseract OCR',types:images,note:'选择需要识别的语言，可多选。后续由宿主加载对应语言包；当前不下载、不执行 OCR。'}
};
export const ocrLanguages=[
 ['eng','英语 · English'],['chi_sim','简体中文 · Chinese (Simplified)'],['chi_tra','繁体中文 · Chinese (Traditional)'],['jpn','日语 · Japanese'],['kor','韩语 · Korean'],['fra','法语 · French'],['deu','德语 · German'],['ita','意大利语 · Italian'],['spa','西班牙语 · Spanish'],['por','葡萄牙语'],['rus','俄语'],['ara','阿拉伯语'],['hin','印地语'],['tha','泰语'],['vie','越南语'],['ind','印尼语'],['msa','马来语'],['tur','土耳其语'],['nld','荷兰语'],['pol','波兰语'],['ukr','乌克兰语'],['swe','瑞典语'],['dan','丹麦语'],['fin','芬兰语'],['nor','挪威语'],['ces','捷克语'],['ell','希腊语'],['heb','希伯来语'],['hun','匈牙利语'],['ron','罗马尼亚语'],['bul','保加利亚语'],['ben','孟加拉语'],['tam','泰米尔语'],['tel','泰卢固语'],['urd','乌尔都语'],['fas','波斯语'],['swa','斯瓦希里语'],['afr','南非荷兰语'],['cat','加泰罗尼亚语'],['hrv','克罗地亚语'],['slk','斯洛伐克语'],['slv','斯洛文尼亚语']
].map(([value,label])=>({value,label}));
export function parserOptions(types:string[]){return Object.entries(parserDefinitions).filter(([,d])=>types.every(t=>d.types.includes(t))).map(([value,d])=>({value,label:d.label}));}
export function parserModels(engine:string,types:string[]){return engine==='paddleocr'?(types.includes('pdf')?['PaddleOCR-VL-1.6','PaddleOCR-VL-1.5','PaddleOCR-VL','PP-StructureV3']:['PP-OCRv6','PP-OCRv5']):parserDefinitions[engine]?.models||[];}
export function readParserSettings(rules:ParserRule[],types:string[],engine:string):ParserSettings{
 const definition=parserDefinitions[engine],rule=rules.find(r=>r.file_types.includes(types[0]));
 return {...(definition?.remote?{apiHost:definition.apiHost,credentialRefs:[]}:{}),...(parserModels(engine,types).length?{modelId:parserModels(engine,types)[0]}:{}),...(engine==='doc2x'?{formulaLevel:0,mergeCrossPageForms:false}:{}),...(engine==='tesseract'?{langs:['eng','chi_sim','chi_tra']}:{}),...rule?.engine_options?.[engine]};
}
/** 拆分旧规则中的其他文件类型，避免更改 PDF 时覆盖原先合并的 Word 配置。 */
export function selectParserEngine(rules:ParserRule[],types:string[],engine:string):ParserRule[]{
 const previous=rules.find(r=>r.file_types.includes(types[0]));
 const rest=rules.flatMap(r=>{const keep=r.file_types.filter(t=>!types.includes(t));return keep.length?[{...r,file_types:keep}]:[];});
 return [...rest,{...previous,file_types:[...types],engine}];
}
export function updateParserSettings(rules:ParserRule[],types:string[],engine:string,patch:Partial<ParserSettings>):ParserRule[]{
 const next=selectParserEngine(rules,types,engine);
 return next.map(r=>r.file_types.includes(types[0])?{...r,engine_options:{...r.engine_options,[engine]:{...readParserSettings(next,types,engine),...patch}}}:r);
}
export function validateParserRules(rules:ParserRule[]):string[]{
 const errors:string[]=[];
 for(const r of rules){const d=parserDefinitions[r.engine];if(!d)continue;
  if(!r.file_types.length||r.file_types.some(t=>!d.types.includes(t))){errors.push(`${d.label} 不支持所选文件类型`);continue;}
  const settings=readParserSettings([r],r.file_types,r.engine);
  if(d.remote){try{const url=new URL(settings.apiHost||'');if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error();}catch{errors.push(`${d.label} 请填写不含账号密码的 HTTP / HTTPS 服务地址`);}}
  const models=parserModels(r.engine,r.file_types);if(models.length&&!models.includes(settings.modelId||''))errors.push(`${d.label} 请选择对应的解析模型`);
  if(r.engine==='tesseract'&&(!settings.langs?.length||settings.langs.some(l=>!ocrLanguages.some(x=>x.value===l))))errors.push('Tesseract 请至少选择一种支持的语言');
  if(r.engine==='doc2x'&&settings.modelId==='v3-2026'&&![0,1,2].includes(settings.formulaLevel??0))errors.push('Doc2x 公式等级须为 0、1 或 2');
 }
 return errors;
}
