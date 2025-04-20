import { BaseDevice } from 'homebridge-base-platform';
import { apiNotFoundWithName } from '../../errors.js';
import {
  API as SoundTouchApi,
  APIDiscovery as SoundTouchDiscovery,
  Info,
  SourceStatus,
  NetworkInfo,
} from './api/index.js';
import { DeviceConfiguration } from './SoundTouchDeviceConfiguration.js';
import { Logger } from '../../utils/FormattedLogger.js';
import { PlatformConfiguration } from '../../PlatformConfiguration.js';
import { flattenAccessoryConfiguration } from '../../ExternalPlatformConfig.js';

interface SoundTouchSpeakerPlatformAccessoryProps {
  api: SoundTouchApi;
  model: string;
  configuration: DeviceConfiguration;
  version?: string | undefined;
  id: string;
  name: string;
}

export class SoundTouchDevice implements BaseDevice {
  api: SoundTouchApi;
  model: string;
  configuration: DeviceConfiguration;
  version?: string | undefined;
  id: string;
  name: string;

  constructor(props: SoundTouchSpeakerPlatformAccessoryProps) {
    this.api = props.api;
    this.model = props.model;
    this.version = props.version;
    this.id = props.id;
    this.name = props.name;
    this.configuration = props.configuration;
  }

  static getOrCreateDeviceConfiguration({
    config,
    networkInfo,
    name,
    logger,
  }: {
    networkInfo: NetworkInfo[];
    name: string;
    config: PlatformConfiguration;
    logger: Logger;
  }) {
    const matchedConfig = config.accessories.find(
      (ac) => ac.room === name || networkInfo.some((i) => i.ipAddress === ac.ip)
    );

    if (matchedConfig) {
      logger.debug('found matching config', matchedConfig);

      const resultingAccessoryConfig = flattenAccessoryConfiguration({
        globalConfig: config,
        accessory: matchedConfig,
      });

      const deviceConfig = resultingAccessoryConfig
        ? DeviceConfiguration.fromAccessoryConfiguration({
            accessoryConfig: resultingAccessoryConfig,
          })
        : DeviceConfiguration.create({
            name,
            verboseLogging: config.verbose,
            pollingInterval: config.pollingInterval,
          });

      if (deviceConfig) {
        return deviceConfig;
      }
      logger.debug(
        'could not create device config for accessory',
        deviceConfig
      );
    }

    logger.debug('creating default config', {
      name,
    });

    return DeviceConfiguration.create({
      name,
      verboseLogging: config.verbose,
      pollingInterval: config.pollingInterval,
    });
  }

  static async discoverAllAccessories({
    config,
    logger,
  }: {
    config: PlatformConfiguration;
    logger: Logger;
  }): Promise<SoundTouchDevice[]> {
    const soundtouchApiInstances = await SoundTouchDiscovery.search();

    const devices: SoundTouchDevice[] = [];

    for (const api of soundtouchApiInstances) {
      try {
        const info = await api.getInfo();

        if (!info) {
          continue;
        }

        const accessoryConfig = SoundTouchDevice.getOrCreateDeviceConfiguration(
          {
            config,
            logger,
            ...info,
          }
        );

        const device = await SoundTouchDevice.fromDiscoveredAccessory({
          api,
          info,
          accessoryConfig,
          logger,
        });

        if (!device) continue;

        devices.push(device);
      } catch (e) {
        logger.error('Error while creating soundtouch device', e);
      }
    }

    return devices;
  }

  static async fromConfiguredAccessory({
    accessoryConfig,
    logger,
  }: {
    accessoryConfig: DeviceConfiguration;
    logger: Logger;
  }): Promise<SoundTouchDevice> {
    let api;
    if (accessoryConfig.ip) {
      api = new SoundTouchApi(accessoryConfig.ip, accessoryConfig.port);
    } else if (accessoryConfig.room) {
      api = await SoundTouchDiscovery.find(accessoryConfig.room);
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
    return SoundTouchDevice.fromDiscoveredAccessory({
      api,
      info,
      accessoryConfig,
      logger,
    });
  }

  static async fromDiscoveredAccessory({
    api,
    info,
    accessoryConfig,
    logger,
  }: {
    api: SoundTouchApi;
    info: Info;
    accessoryConfig: DeviceConfiguration;
    logger: Logger;
  }): Promise<SoundTouchDevice> {
    const displayName = accessoryConfig.name || info.name;

    logger.info(`[${displayName}] Found device`);

    const component = info.components.find(
      (c) => c.serialNumber.toLowerCase() === info.deviceId.toLowerCase()
    );

    return new SoundTouchDevice({
      api: api,
      name: displayName,
      id: info.deviceId,
      model: info.type,
      version: component ? component.softwareVersion : undefined,
      configuration: accessoryConfig,
    });
  }

  static async deviceIsOn(device: SoundTouchDevice): Promise<boolean> {
    try {
      const source = await device.api.getSource();

      if (!source) {
        return false;
      }

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
