import { Loader } from '../types';
declare function runSudo(command: string): Promise<void>;
declare function installCocoaPods(loader: Loader): Promise<import("ora").Ora>;
declare function installPods({ directory, loader, }: {
    directory: string;
    loader?: Loader;
}): Promise<void>;
export { runSudo, installCocoaPods };
export default installPods;
//# sourceMappingURL=installPods.d.ts.map