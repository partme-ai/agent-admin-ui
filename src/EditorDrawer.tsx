import {Button,Drawer,Space,type ButtonProps,type DrawerProps} from 'antd';
import type {ReactNode} from 'react';
import './editor_drawer.css';

type Props=Omit<DrawerProps,'onClose'|'footer'|'size'|'width'|'placement'|'push'>&{
 onCancel?:()=>void;onOk?:()=>void;okText?:ReactNode;cancelText?:ReactNode;
 okButtonProps?:ButtonProps;footer?:ReactNode;width?:number|string;
};
/** 编辑表单共用侧向进入、固定操作区和响应式宽度；关闭行为由原业务表单负责。 */
export function EditorDrawer({className='',onCancel,onOk,okText='保存',cancelText='取消',okButtonProps,footer,width=640,styles,...props}:Props){
 const size=typeof width==='number'?`min(${width}px, 100vw)`:width;
 const actions=footer===undefined?<Space wrap>{onCancel&&<Button onClick={onCancel}>{onOk?cancelText:'关闭'}</Button>}{onOk&&<Button type="primary" onClick={onOk} {...okButtonProps}>{okText}</Button>}</Space>:footer;
 return <Drawer {...props} className={`editor-drawer ${className}`} placement="right" size={size} push={false} maskClosable={props.maskClosable??false} onClose={onCancel} footer={actions} styles={styles}/>;
}
