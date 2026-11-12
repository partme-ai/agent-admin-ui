// 布局与刻度算法改编自 TinyClaw ui/Compare.jsx，MIT 许可见 reference/TinyClaw-LICENSE。
export function CanvasRuler({length,vertical=false}:{length:number;vertical?:boolean}){
 const ticks=Array.from({length:Math.ceil(length/10)+1},(_,i)=>i*10);
 return <svg role="img" className={`canvas-ruler ${vertical?'vertical':'horizontal'}`} width={vertical?24:length} height={vertical?length:24} aria-label={vertical?'纵向标尺，画布像素':'横向标尺，画布像素'}>
 {ticks.map(value=><g key={value}>{vertical?<line x1={value%100===0?10:value%50===0?15:19} x2={24} y1={value} y2={value}/>:<line x1={value} x2={value} y1={value%100===0?10:value%50===0?15:19} y2={24}/>} {value%100===0&&(vertical?<text transform={`translate(8 ${value+3}) rotate(-90)`}>{value}</text>:<text x={value+4} y={10}>{value}</text>)}</g>)}
 </svg>;
}
