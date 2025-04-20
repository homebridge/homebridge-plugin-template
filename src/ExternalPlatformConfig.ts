import type { PlatformConfig } from 'homebridge';

interface BasePlatformConfig extends PlatformConfig {
  readonly global?: BaseGlobalConfig;
}

interface BaseGlobalConfig {
  readonly verbose?: boolean;
}

interface GlobalConfig extends BaseGlobalConfig {
  readonly pollingInterval?: number;
}

export interface AccessoryConfig extends GlobalConfig {
  readonly name?: string;
  readonly room?: string;
  readonly ip?: string;
  readonly port?: number;
}

export interface ExternalPlatformConfig extends BasePlatformConfig {
  readonly discoverAllAccessories?: boolean;
  readonly accessories?: AccessoryConfig[];
  readonly global?: GlobalConfig;
}

export function flattenAccessoryConfiguration(props: {
  accessory?: AccessoryConfig;
  globalConfig?: GlobalConfig;
}): AccessoryConfig | undefined {
  const configs = [];

  if (props.globalConfig) {
    configs.push(props.globalConfig);
  }

  if (props.accessory) {
    configs.push(props.accessory);
  }

  if (configs.length === 0) {
    return undefined;
  }

  return configs.reduce((acc, config) => {
    Object.entries(config).forEach(([key, value]) => {
      if (value !== undefined) {
        // @ts-expect-error only overwriting non-undefined values
        acc[key] = value;
      }
    });
    return acc;
  }, {} as AccessoryConfig);
}
