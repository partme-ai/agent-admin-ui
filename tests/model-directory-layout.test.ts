import test from 'node:test';
import assert from 'node:assert/strict';
import {modelDirectoryLayout} from '../src/model_directory_layout.ts';

test('模型目录按宽度增加列数，窄屏至少十二项，分页保持完整行',()=>{
 for(const [width,columns] of [[343,1],[639,2],[745,3],[1018,4],[1670,7],[2310,9]]){
  const layout=modelDirectoryLayout(width);
  assert.equal(layout.columns,columns);assert.equal(layout.pageSize,Math.max(Math.ceil(12/columns),4)*columns);
 }
});
test('目录最后一页不足一页时仍保留所有条目，改变宽度后页码可收敛',()=>{
 const rows=Array.from({length:187},(_,i)=>i);
 for(const width of [343,639,1018,1670]){
  const {pageSize}=modelDirectoryLayout(width),pages=Math.ceil(rows.length/pageSize);
  const displayed=Array.from({length:pages},(_,page)=>rows.slice(page*pageSize,(page+1)*pageSize)).flat();
  assert.deepEqual(displayed,rows);
 }
 assert.equal(modelDirectoryLayout(0).columns,1);
});

test('每页数量随可见高度调整，触控卡片使用实际高度且始终保留分页',()=>{
 assert.equal(modelDirectoryLayout(1670,836,122).pageSize,42);
 assert.equal(modelDirectoryLayout(1670,660,122).pageSize,35);
 assert.equal(modelDirectoryLayout(343,400,135).pageSize,12);
 assert.equal(modelDirectoryLayout(343,0,135).rows,12);
 assert.equal(modelDirectoryLayout(1670,5000,122).rows,8);
});
