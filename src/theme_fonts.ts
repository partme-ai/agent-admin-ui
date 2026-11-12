/** 所有可选字体均使用应用自带网页字库，不依赖平台已安装字体。 */
/** 可商用网页字体按用途分组，不修改原始字体文件。 */
export const themeWebFontOptions=[
 {value:'alibaba',label:'阿里巴巴普惠体 3.0',family:'"Alibaba PuHuiTi 3.0", "Noto Sans SC", sans-serif',group:'界面阅读'},
 {value:'misans',label:'小米 MiSans',family:'"MiSans VF", "Noto Sans SC", sans-serif',group:'界面阅读'},
 {value:'noto_sans',label:'Noto 黑体（简中）',family:'"Noto Sans SC", sans-serif',group:'界面阅读'},
 {value:'noto_serif',label:'Noto 宋体（简中）',family:'"Noto Serif SC", "Noto Sans SC", serif',group:'界面阅读'},
 {value:'wenkai',label:'霞鹜文楷 · 轻便版',family:'"LXGW WenKai Lite", "Noto Sans SC", serif',group:'界面阅读'},
 {value:'wenkai_mono',label:'霞鹜文楷等宽 · 轻便版',family:'"LXGW WenKai Mono Lite", "Noto Sans SC", monospace',group:'界面阅读'},
 {value:'smiley',label:'得意黑',family:'"Smiley Sans", "Noto Sans SC", sans-serif',group:'艺术手写'},
 {value:'zcool_xiaowei',label:'站酷小薇体',family:'"ZCOOL XiaoWei", "Noto Serif SC", serif',group:'艺术手写'},
 {value:'zcool_kuaile',label:'站酷快乐体',family:'"ZCOOL KuaiLe", "Noto Sans SC", sans-serif',group:'艺术手写'},
 {value:'mashan',label:'马善政楷书',family:'"Ma Shan Zheng", "Noto Sans SC", serif',group:'艺术手写'},
 {value:'longcang',label:'龙藏体',family:'"Long Cang", "Noto Sans SC", serif',group:'艺术手写'},
 {"value": "zcool_huangyou", "label": "站酷庆科黄油体", "family": "\"ZCOOL QingKe HuangYou\", \"Noto Sans SC\", sans-serif", "group": "标题展示"},
 {"value": "zhimang", "label": "志莽行书", "family": "\"Zhi Mang Xing\", \"Noto Sans SC\", sans-serif", "group": "艺术手写"},
 {"value": "liujian", "label": "刘建毛草", "family": "\"Liu Jian Mao Cao\", \"Noto Sans SC\", sans-serif", "group": "艺术手写"},
 {"value": "huninn", "label": "jf open 粉圆（繁中）", "family": "\"Huninn\", \"Noto Sans SC\", sans-serif", "group": "圆体与楷书"},
 {"value": "chocolate_sans", "label": "Chocolate Classical Sans（繁中）", "family": "\"Chocolate Classical Sans\", \"Noto Sans SC\", sans-serif", "group": "界面阅读"},
 {"value": "iansui", "label": "芫荽（繁中）", "family": "\"Iansui\", \"Noto Sans SC\", sans-serif", "group": "圆体与楷书"},
 {"value": "chiron_hei", "label": "昭源黑体（香港）", "family": "\"Chiron Hei HK\", \"Noto Sans SC\", sans-serif", "group": "界面阅读"},
 {"value": "inter", "label": "Inter", "family": "\"Inter\", \"Noto Sans SC\", sans-serif", "group": "拉丁与等宽"},
 {"value": "roboto", "label": "Roboto", "family": "\"Roboto\", \"Noto Sans SC\", sans-serif", "group": "拉丁与等宽"},
 {"value": "jetbrains_mono", "label": "JetBrains Mono", "family": "\"JetBrains Mono\", \"Noto Sans SC\", monospace", "group": "拉丁与等宽"},
 {"value": "fira_code", "label": "Fira Code", "family": "\"Fira Code\", \"Noto Sans SC\", monospace", "group": "拉丁与等宽"},
 {"value": "source_code", "label": "Source Code Pro", "family": "\"Source Code Pro\", \"Noto Sans SC\", monospace", "group": "拉丁与等宽"},
 {"value": "noto_sans_tc", "label": "Noto 黑体（繁中）", "family": "\"Noto Sans TC\", \"Noto Sans SC\", sans-serif", "group": "界面阅读"},
 {"value": "noto_serif_tc", "label": "Noto 宋体（繁中）", "family": "\"Noto Serif TC\", \"Noto Sans SC\", sans-serif", "group": "界面阅读"},
 {"value": "wenkai_tc", "label": "霞鹜文楷（繁中）", "family": "\"LXGW WenKai TC\", \"Noto Sans SC\", sans-serif", "group": "圆体与楷书"},
 {"value": "wenkai_mono_tc", "label": "霞鹜文楷等宽（繁中）", "family": "\"LXGW WenKai Mono TC\", \"Noto Sans SC\", monospace", "group": "圆体与楷书"},
 {"value": "chenyu", "label": "辰宇落雁体（繁中）", "family": "\"ChenYuluoyan\", \"Noto Sans SC\", sans-serif", "group": "艺术手写"},
 {"value": "wenkai_screen", "label": "霞鹜文楷 · 屏幕版", "family": "\"LXGW WenKai Screen\", \"Noto Sans SC\", sans-serif", "group": "圆体与楷书"},
 {"value": "wenkai_gb_screen", "label": "霞鹜文楷 · GB屏幕版", "family": "\"LXGW WenKai GB Screen\", \"Noto Sans SC\", sans-serif", "group": "圆体与楷书"}
] as const;
export const themeFontOptions=themeWebFontOptions;
export const themeFontGroups=['界面阅读','圆体与楷书','艺术手写','标题展示','拉丁与等宽'] as const;
/** 旧ID仅用于读取兼容，不出现在新选项中，也不自动重写存储。圆体作近似映射。 */
export const legacyThemeFonts={system:'alibaba',sans:'noto_sans',serif:'noto_serif',kai:'wenkai',rounded:'zcool_kuaile',mono:'wenkai_mono'} as const;
export const themeFontValues=[...themeFontOptions.map(f=>f.value),...Object.keys(legacyThemeFonts)] as const;
export type WebThemeFontFamily=typeof themeFontOptions[number]['value'];
export type ThemeFontFamily=WebThemeFontFamily|keyof typeof legacyThemeFonts;
/** 缺失配置使用统一网页默认，旧标识回显对应字库，不修改调用方配置。 */
export function resolveThemeFontId(value?:ThemeFontFamily):WebThemeFontFamily{
 if(value&&value in legacyThemeFonts)return legacyThemeFonts[value as keyof typeof legacyThemeFonts];
 return themeFontOptions.find(f=>f.value===value)?.value||'alibaba';
}
/** antd与外壳共用的网页字体链，缺字优先回退随包Noto，最后保留浏览器通用兜底。 */
export function themeFontFamily(value?:ThemeFontFamily):string{return themeFontOptions.find(f=>f.value===resolveThemeFontId(value))!.family;}

/** 独立代码字体仅允许已随包提供的等宽网页字库。 */
export const codeFontOptions=themeFontOptions.filter(f=>['wenkai_mono','wenkai_mono_tc','jetbrains_mono','fira_code','source_code'].includes(f.value));
export function codeFontFamily(value?:ThemeFontFamily){return (codeFontOptions.find(f=>f.value===value)||codeFontOptions.find(f=>f.value==='jetbrains_mono')!).family;}
