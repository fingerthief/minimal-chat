/**
 * This is an implementation of a metro resolveRequest option which will remap react-native imports
 * to different npm packages based on the platform requested.  This allows a single metro instance/config
 * to produce bundles for multiple out of tree platforms at a time.
 *
 * @param platformImplementations
 * A map of platform to npm package that implements that platform
 *
 * Ex:
 * {
 *    windows: 'react-native-windows'
 *    macos: 'react-native-macos'
 * }
 */
import type { CustomResolver } from 'metro-resolver';
export declare function reactNativePlatformResolver(platformImplementations: {
    [platform: string]: string;
}): CustomResolver;
//# sourceMappingURL=metroPlatformResolver.d.ts.map