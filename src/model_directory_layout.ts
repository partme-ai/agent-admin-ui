/** 模型目录按容器宽度和可用高度排版，缺少高度时默认四行，窄屏每页至少十二项，避免过度分页。 */
export function modelDirectoryLayout(width:number,availableHeight=528,cardHeight=122):{columns:number;rows:number;pageSize:number}{
 const columns=Math.max(1,Math.floor((Math.max(0,width)+10)/238));
 const rows=Math.max(Math.ceil(12/columns),Math.min(8,Math.floor((Math.max(0,availableHeight)+10)/(Math.max(1,cardHeight)+10))));
 return {columns,rows,pageSize:columns*rows};
}
