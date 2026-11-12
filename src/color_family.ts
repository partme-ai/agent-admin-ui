/** 跨色库的展示色系；原始色名、上游分类及颜色ID保持独立。 */
export const colorFamilies=[
 {id:'red',name:'红色系'},{id:'orange',name:'橙色系'},{id:'yellow',name:'黄色系'},
 {id:'green',name:'绿色系'},{id:'cyan',name:'青色系'},{id:'blue',name:'蓝色系'},
 {id:'purple',name:'紫色系'},{id:'pink',name:'粉色系'},{id:'brown',name:'棕色系'},{id:'neutral',name:'黑白灰'}
] as const;
export type ColorFamily=typeof colorFamilies[number]['id'];
/** 将sRGB线性化后计算相对亮度，用于色卡由浅到深展示。 */
export function colorBrightness(hex:string):number{
 if(!/^#[\da-f]{6}$/i.test(hex))throw Error('颜色必须为六位HEX。');
 const [r,g,b]=[1,3,5].map(i=>{const c=parseInt(hex.slice(i,i+2),16)/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});
 return .2126*r+.7152*g+.0722*b;
}
/** 只排序展示副本，保留颜色对象、配置ID以及同亮度颜色的来源顺序。 */
export function sortColorsLightToDark<T extends {hex:string}>(colors:readonly T[]):T[]{
 return [...colors].sort((a,b)=>colorBrightness(b.hex)-colorBrightness(a.hex));
}
/** 按HEX色相、明度与色差近似分类，供无统一上游色系的目录筛选；不作为色彩标准。 */
export function classifyColorFamily(hex:string):ColorFamily{
 if(!/^#[\da-f]{6}$/i.test(hex))throw Error('颜色必须为六位HEX。');
 const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
 if(d<=.07||d/max<=.1)return 'neutral';
 let hue=(max===r?(g-b)/d:max===g?(b-r)/d+2:(r-g)/d+4)*60;if(hue<0)hue+=360;
 const lightness=(max+min)/2;
 if(hue>=12&&hue<50&&lightness<.48&&max<.8)return 'brown';
 if((hue>=315&&hue<345)||((hue<15||hue>=345)&&lightness>=.64))return 'pink';
 if(hue<15||hue>=345)return 'red';
 if(hue<45)return 'orange';if(hue<70)return 'yellow';if(hue<165)return 'green';if(hue<195)return 'cyan';if(hue<260)return 'blue';if(hue<315)return 'purple';return 'pink';
}
