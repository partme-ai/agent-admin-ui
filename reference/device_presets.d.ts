export type Preset={id:string;name:string;width:number;height:number};
export const DEVICE_PRESETS:Record<'web'|'desktop'|'tablet'|'phone',Preset[]>;
export function resolveDeviceViewport(deviceId:'web'|'desktop'|'tablet'|'phone',presetId:string,rotated?:boolean):Preset;
