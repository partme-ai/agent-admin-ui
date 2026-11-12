import {classifyColorFamily,type ColorFamily} from './color_family.ts';
import type {SystemThemeColors} from './system_theme.ts';
export type ThemeFilterTarget='primary'|'sidebar';
/** 与自定义色卡共用同一分类，禁止为主题目录另设阈值。 */
export function themeColorFamily(hex:string):ColorFamily{return classifyColorFamily(hex);}
/** 主色与侧栏为独立筛选依据。 */
export function themeFilterFamily(colors:Pick<SystemThemeColors,'primary'|'sidebar'>,target:ThemeFilterTarget):ColorFamily{return themeColorFamily(colors[target]);}
