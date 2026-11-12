import type {CSSProperties} from 'react';
import type {SystemThemeColors} from '../system_theme';
/** 缩略图呈现完整系统的颜色角色，避免单一色块冒充成套主题。 */
export function ThemeThumbnail({colors}:{colors:SystemThemeColors}){
 const style={'--sample-bg':colors.bg,'--sample-surface':colors.surface,'--sample-sidebar':colors.sidebar,'--sample-primary':colors.primary,'--sample-line':colors.line,'--sample-muted':colors.muted,'--sample-text':colors.text} as CSSProperties;
 return <div className="theme-thumbnail" style={style} aria-hidden="true"><div className="theme-thumb-side"><i/><b/><b/><b/><b/></div><div className="theme-thumb-main"><div className="theme-thumb-header"><span/><i/></div><div className="theme-thumb-title"/><div className="theme-thumb-stats"><i/><i/><i/></div><div className="theme-thumb-table"><div><b/><em/></div><span/><span/><span/></div></div></div>;
}
