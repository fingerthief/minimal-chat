import { IOSProjectInfo } from '@react-native-community/cli-types';
export type BuildFlags = {
    mode: string;
    packager: boolean;
    verbose: boolean;
    xcconfig?: string;
    buildFolder?: string;
    port: number;
    terminal: string | undefined;
    interactive?: boolean;
    destination?: string;
    extraParams?: string[];
};
export declare function buildProject(xcodeProject: IOSProjectInfo, udid: string | undefined, scheme: string, args: BuildFlags): Promise<string>;
//# sourceMappingURL=buildProject.d.ts.map