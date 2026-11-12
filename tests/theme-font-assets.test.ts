import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {themeWebFontOptions} from '../src/theme_fonts.ts';

test('免费中文字库由本地原文件提供，来源校验与许可随包保留',()=>{
 const root=new URL('../public/fonts/',import.meta.url);
 const manifest=JSON.parse(readFileSync(new URL('manifest.json',root),'utf8'));
 for(const record of manifest.files){
  const data=readFileSync(new URL(record.file,root));
  assert.equal(data.length,record.bytes,record.file);
  assert.equal(createHash('sha256').update(data).digest('hex'),record.sha256,record.file);
  if(/\.(woff2|ttf)$/.test(record.file))assert.ok(['wOF2','00010000','OTTO'].includes(data.subarray(0,4).toString('ascii'))||data.subarray(0,4).toString('hex')==='00010000',record.file);
 }
 const css=readFileSync(new URL('theme-fonts.css',root),'utf8');
 assert.doesNotMatch(css,/https?:\/\//);
 for(const [,file] of css.matchAll(/url\("\.\/([^"]+)"\)/g))assert.ok(existsSync(new URL(file,root)),file);
 for(const font of themeWebFontOptions)assert.ok(css.includes(font.family.split(',')[0]),font.label);
 const notice=readFileSync(new URL('NOTICE.html',root),'utf8');
 assert.match(notice,/小米 MiSans/);assert.match(notice,/阿里巴巴普惠体/);
 for(const [,file] of notice.matchAll(/href="(licenses\/[^"]+)"/g))assert.ok(existsSync(new URL(file,root)),file);
 assert.ok(existsSync(new URL('licenses/MiSans-license.pdf',root)));
});

test('字体选择提供至少30款实际网页字库，含中文圆体、书写及拉丁等宽分组',()=>{
 assert.ok(themeWebFontOptions.length>=30,'需要扩充实际字体，不能仅增加系统字体别名');
 const values=new Set<string>(themeWebFontOptions.map(font=>font.value));
 for(const id of ['huninn','iansui','zcool_huangyou','zhimang','liujian','chenyu','wenkai_screen','inter','jetbrains_mono'])assert.ok(values.has(id),id);
 const root=new URL('../public/fonts/',import.meta.url);
 const catalog=JSON.parse(readFileSync(new URL('expanded-catalog.json',root),'utf8'));
 assert.ok(catalog.length>=19);
 for(const font of catalog){
  assert.ok(existsSync(new URL(font.file,root)),font.label);
  assert.match(readFileSync(new URL(font.license_file,root),'utf8'),/SIL OPEN FONT LICENSE Version 1.1/);
 }
});
