import { Device, IosProjectInfo } from '../types';
export declare function promptForSchemeSelection(project: IosProjectInfo): Promise<string>;
export declare function promptForConfigurationSelection(project: IosProjectInfo): Promise<string>;
export declare function promptForDeviceSelection(availableDevices: Device[]): Promise<Device | undefined>;
//# sourceMappingURL=prompts.d.ts.map