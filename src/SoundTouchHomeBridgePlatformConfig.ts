import type { PlatformConfig } from 'homebridge';

interface BasePlatformConfig extends PlatformConfig {
  readonly global?: BaseGlobalConfig;
}

interface BaseGlobalConfig {
  readonly verbose?: boolean;
}

export function isVerboseInConfigs(...configs: BaseGlobalConfig[]): boolean {
  let isVerbose = false;
  for (const config of configs) {
    if (config && config.verbose !== undefined) {
      isVerbose = config.verbose;
    }
  }
  return isVerbose;
}

export interface GlobalConfig extends BaseGlobalConfig {
  readonly pollingInterval?: number;
}

export interface AccessoryConfig extends GlobalConfig {
  readonly name?: string;
  readonly room?: string;
  readonly ip?: string;
  readonly port?: number;
}

export interface SoundTouchHomeBridgePlatformConfig extends BasePlatformConfig {
  readonly discoverAllAccessories?: boolean;
  readonly accessories?: AccessoryConfig[];
  readonly global?: GlobalConfig;
}
