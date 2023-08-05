import execa from 'execa';
type Options = {
    preferYarn?: boolean;
    silent?: boolean;
    root: string;
};
export declare function init(options: Options): execa.ExecaChildProcess<string>;
export declare function install(packageNames: Array<string>, options: Options): execa.ExecaChildProcess<string>;
export declare function installDev(packageNames: Array<string>, options: Options): execa.ExecaChildProcess<string>;
export declare function uninstall(packageNames: Array<string>, options: Options): execa.ExecaChildProcess<string>;
export declare function installAll(options: Options): execa.ExecaChildProcess<string>;
export {};
//# sourceMappingURL=packageManager.d.ts.map