import { ConfigT } from 'metro-config';
import type { Config } from '@react-native-community/cli-types';
export type { Config };
export type ConfigLoadingContext = Pick<Config, 'root' | 'reactNativePath' | 'platforms'>;
declare global {
    var __REACT_NATIVE_METRO_CONFIG_LOADED: boolean;
}
export interface ConfigOptionsT {
    maxWorkers?: number;
    port?: number;
    projectRoot?: string;
    resetCache?: boolean;
    watchFolders?: string[];
    sourceExts?: string[];
    reporter?: any;
    config?: string;
}
/**
 * Load Metro config.
 *
 * Allows the CLI to override select values in `metro.config.js` based on
 * dynamic user options in `ctx`.
 */
export default function loadMetroConfig(ctx: ConfigLoadingContext, options?: ConfigOptionsT): Promise<ConfigT>;
//# sourceMappingURL=loadMetroConfig.d.ts.map