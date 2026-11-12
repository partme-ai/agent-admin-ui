export type Preset={id:string;name:string;width:number;height:number};
export const DEVICE_PRESETS:Record<'desktop'|'tablet'|'phone',Preset[]>;
export function resolveDeviceViewport(deviceId:'desktop'|'tablet'|'phone',presetId:string,rotated?:boolean):Preset;
