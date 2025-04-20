import {
  flattenAccessoryConfiguration,
  ExternalPlatformConfig,
} from './ExternalPlatformConfig.js';
import { DeviceConfiguration } from './devices/SoundTouch/SoundTouchDeviceConfiguration.js';
import { PLATFORM_NAME } from './settings.js';

const DEFAULT_POLLING_INTERVAL = 2 * 1000; // 2 seconds
const DEFAULT_DISCOVER_ALL_ACCESSORIES = false;
const DEFAULT_VERBOSE = false;

export class PlatformConfiguration {
  name: string;
  discoverAllAccessories: boolean;
  accessories: DeviceConfiguration[];
  pollingInterval: number;
  verbose: boolean;

  constructor(props: {
    name: string;
    discoverAllAccessories: boolean;
    accessories: DeviceConfiguration[] | undefined;
    pollingInterval: number;
    verbose: boolean;
  }) {
    this.name = props.name;
    this.discoverAllAccessories = props.discoverAllAccessories;
    this.accessories = props?.accessories ?? [];
    this.pollingInterval = props.pollingInterval;
    this.verbose = props.verbose;
  }

  toJson(){
    return JSON.stringify(this, null, 2);
  }

  static fromExternalConfiguration(props: ExternalPlatformConfig) {
    return new PlatformConfiguration({
      discoverAllAccessories:
        props.discoverAllAccessories ?? DEFAULT_DISCOVER_ALL_ACCESSORIES,
      verbose: DEFAULT_VERBOSE,
      pollingInterval: DEFAULT_POLLING_INTERVAL,
      accessories:
        props.accessories
          ?.map((accessory) => {
            const resultingConfig = flattenAccessoryConfiguration({
              accessory,
              globalConfig: props.global,
            });
            return resultingConfig
              ? DeviceConfiguration.fromAccessoryConfiguration({
                  accessoryConfig: resultingConfig,
                })
              : DeviceConfiguration.create({
                  name: accessory?.name,
                  verboseLogging: props.global?.verbose,
                  pollingInterval: props.global?.pollingInterval,
                });
          })
          ?.filter((d) => !!d) ?? [],
      name: props.name ?? PLATFORM_NAME,
    });
  }
}
