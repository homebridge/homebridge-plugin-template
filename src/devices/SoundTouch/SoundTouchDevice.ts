import {
  AccessoryConfig,
  GlobalConfig,
  isVerboseInConfigs,
} from '../../SoundTouchHomeBridgePlatformConfig.js';

import { BaseDevice } from 'homebridge-base-platform';
import type { Logging } from 'homebridge';
import { apiNotFoundWithName } from '../../errors.js';
import {
  API,
  APIDiscovery,
  Info,
  SourceStatus,
} from './api/index.js';

interface SoundTouchSpeakerPlatformAccessoryProps {
  api: API;
  model: string;
  verbose: boolean;
  pollingInterval?: number | undefined;
  version?: string | undefined;
  id: string;
  name: string;
}

export class SoundTouchDevice implements BaseDevice {
  api: API;
  model: string;
  verbose: boolean;
  pollingInterval?: number | undefined;
  version?: string | undefined;
  id: string;
  name: string;

  constructor(props: SoundTouchSpeakerPlatformAccessoryProps) {
    this.api = props.api;
    this.model = props.model;
    this.verbose = props.verbose;
    this.pollingInterval = props.pollingInterval;
    this.version = props.version;
    this.id = props.id;
    this.name = props.name;
  }

  static async searchAllDevices(
    globalConfig: GlobalConfig,
    accessoryConfigs: AccessoryConfig[],
    log: Logging
  ): Promise<SoundTouchDevice[]> {
    const apis = await APIDiscovery.search();
    const resolved = await Promise.all(
      apis.map(async (api) => {
        const info = await api.getInfo();
        if (!info) {
          return Promise.resolve(undefined);
        }
        const accessoryConfig = accessoryConfigs.find(
          (ac) =>
            ac.room === info.name ||
            info.networkInfo.some((i) => i.ipAddress === ac.ip)
        );
        return SoundTouchDevice._deviceFromApi(
          api,
          info,
          globalConfig,
          accessoryConfig || {},
          log
        );
      })
    );
    return resolved.filter((s): s is SoundTouchDevice => !!s);
  }

  static async deviceFromConfig(
    globalConfig: GlobalConfig,
    accessoryConfig: AccessoryConfig,
    log: Logging
  ): Promise<SoundTouchDevice> {
    let api;
    if (accessoryConfig.ip) {
      api = new API(accessoryConfig.ip, accessoryConfig.port);
    } else if (accessoryConfig.room) {
      api = await APIDiscovery.find(accessoryConfig.room);
      if (!api) {
        throw apiNotFoundWithName(accessoryConfig.name || '(undefined)');
      }
    }
    if (!api) {
      throw new Error('Could not find a device');
    }
    const info = await api.getInfo();
    if (!info) {
      throw new Error('Could not find device info');
    }
    return SoundTouchDevice._deviceFromApi(
      api,
      info,
      globalConfig,
      accessoryConfig,
      log
    );
  }

  private static async _deviceFromApi(
    api: API,
    info: Info,
    globalConfig: GlobalConfig,
    accessoryConfig: AccessoryConfig,
    log: Logging
  ): Promise<SoundTouchDevice> {
    const displayName = accessoryConfig.name || info.name;
    const isVerbose = isVerboseInConfigs(globalConfig, accessoryConfig);
    const pollingInterval =
      accessoryConfig.pollingInterval || globalConfig.pollingInterval;
    if (isVerbose) {
      log(`[${displayName}] Found device`);
    }
    const component = info.components.find(
      (c) => c.serialNumber.toLowerCase() === info.deviceId.toLowerCase()
    );

    return new SoundTouchDevice({
      api: api,
      name: displayName,
      id: info.deviceId,
      model: info.type,
      version: component ? component.softwareVersion : undefined,
      verbose: isVerbose,
      pollingInterval: pollingInterval
    });
  }

  static async deviceIsOn(device: SoundTouchDevice): Promise<boolean> {
    try {
      const source = await device.api.getSource();
      switch (source) {
        case SourceStatus.standBy:
          return false;
        case SourceStatus.invalid:
          return true;
        default:
          return true;
      }
    } catch {
      return false;
    }
  }
}
