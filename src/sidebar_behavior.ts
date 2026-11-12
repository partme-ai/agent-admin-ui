/** 桌面侧栏仅由明确的点击切换，悬停不改变展开状态。 */
export type SidebarState={collapsed:boolean};
export type SidebarAction={type:'toggle'};
/** 点击在完整导航与图标列之间切换，状态不受悬停或菜单分组影响。 */
export function sidebarReducer(state:SidebarState,_action:SidebarAction):SidebarState{
 return {collapsed:!state.collapsed};
}
