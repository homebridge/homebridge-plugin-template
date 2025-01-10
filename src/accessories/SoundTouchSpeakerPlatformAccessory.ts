import { SoundTouchDevice } from '../devices/SoundTouch/SoundTouchDevice.js';
import { PlatformAccessory, type Service } from 'homebridge';
import { SoundTouchHomebridgePlatform } from '../platform.js';
import {
  getServiceName,
  ServiceType,
  SoundTouchSpeakerCharacteristic,
} from './services/SoundTouchSpeakerCharacteristic.js';
import { SoundTouchSpeakerInformationCharacteristic } from './services/SoundTouchSpeakerInformationCharacteristic.js';
import { FormattedLogger } from '../utils/FormattedLogger.js';
import { VolumeMode } from '../SoundTouchHomeBridgePlatformConfig.js';
import { SoundTouchSpeakerMuteCharacteristic } from './services/SoundTouchSpeakerMuteCharacteristic.js';
import { SoundTouchSpeakerVolumeCharacteristic } from './services/SoundTouchSpeakerVolumeCharacteristic.js';
import { SoundTouchSpeakerTargetMediaCharacteristic } from './services/SoundTouchSpeakerTargetMediaCharacteristic.js';
import { SoundTouchSpeakerCurrentMediaCharacteristic } from './services/SoundTouchSpeakerCurrentMediaCharacteristic.js';
import { SoundTouchSpeakerOnCharacteristic } from './services/SoundTouchSpeakerOnCharacteristic.js';

export class SoundTouchSpeakerPlatformAccessory extends SoundTouchSpeakerCharacteristic {
  private readonly speakerCharacteristics: SoundTouchSpeakerCharacteristic[];

  constructor({
    speakerCharacteristics,
    ...props
  }: {
    accessory: PlatformAccessory;
    device: SoundTouchDevice;
    platform: SoundTouchHomebridgePlatform;
    speakerCharacteristics: SoundTouchSpeakerCharacteristic[];
  }) {
    super({ log: props.platform.log, ...props });
    this.speakerCharacteristics = speakerCharacteristics;
  }

  async init(): Promise<void> {
    for (const speakerCharacteristic of this.speakerCharacteristics) {
      if (speakerCharacteristic.init) {
        await speakerCharacteristic.init();
      }
    }

    if (this.device.pollingInterval !== undefined) {
      this._refreshDeviceServices().then(() => {
        //no-op
      });
    }

    if (this.device.verbose) {
      this.log.info(`Device ready`);
    }
  }

  async refresh(): Promise<void> {
    for (const speakerCharacteristic of this.speakerCharacteristics) {
      if (speakerCharacteristic.refresh) {
        await speakerCharacteristic.refresh();
      }
    }
  }

  private async _refreshDeviceServices(): Promise<void> {
    while (true) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.device.pollingInterval)
      );

      await this.refresh();
    }
  }

  static async createAccessory(props: {
    platform: SoundTouchHomebridgePlatform;
    accessory: PlatformAccessory;
    device: SoundTouchDevice;
    defaultCharacteristics: SoundTouchSpeakerCharacteristic[];
  }): Promise<SoundTouchSpeakerPlatformAccessory> {
    const service = SoundTouchSpeakerPlatformAccessory.ensureAccessoryService({
      serviceType: ServiceType.ON_OFF,
      service: props.platform.Service.Switch,
      ...props,
    });

    const characteristics = [
      await SoundTouchSpeakerOnCharacteristic.create({
        service,
        ...props,
      }),
      ...props.defaultCharacteristics,
    ];

    return new SoundTouchSpeakerPlatformAccessory({
      speakerCharacteristics: [...characteristics],
      ...props,
    });
  }

  static async createAccessoryWithVolumeControl(props: {
    platform: SoundTouchHomebridgePlatform;
    accessory: PlatformAccessory;
    device: SoundTouchDevice;
    defaultCharacteristics: SoundTouchSpeakerCharacteristic[];
  }): Promise<SoundTouchSpeakerPlatformAccessory> {
    const lightBulbService =
      SoundTouchSpeakerPlatformAccessory.ensureAccessoryService({
        serviceType: ServiceType.LIGHT_BULB,
        service: props.platform.Service.Lightbulb,
        ...props,
      });

    const characteristics = [
      await SoundTouchSpeakerOnCharacteristic.create({
        service: lightBulbService,
        ...props,
      }),
      await SoundTouchSpeakerVolumeCharacteristic.create({
        service: lightBulbService,
        speakerType: VolumeMode.lightbulb,
        ...props,
      }),
      ...props.defaultCharacteristics,
    ];

    return new SoundTouchSpeakerPlatformAccessory({
      speakerCharacteristics: [...characteristics],
      ...props,
    });
  }

  static async createAccessoryAsSpeaker(props: {
    platform: SoundTouchHomebridgePlatform;
    accessory: PlatformAccessory;
    device: SoundTouchDevice;
    defaultCharacteristics: SoundTouchSpeakerCharacteristic[];
  }): Promise<SoundTouchSpeakerPlatformAccessory> {
    const service = SoundTouchSpeakerPlatformAccessory.ensureAccessoryService({
      serviceType: ServiceType.SMART_SPEAKER,
      service: props.platform.Service.SmartSpeaker,
      ...props,
    });

    const characteristics = [
      await SoundTouchSpeakerOnCharacteristic.create({
        service,
        ...props,
      }),
      await SoundTouchSpeakerMuteCharacteristic.create({
        service,
        ...props,
      }),
      await SoundTouchSpeakerVolumeCharacteristic.create({
        service,
        speakerType: VolumeMode.speaker,
        ...props,
      }),
      await SoundTouchSpeakerTargetMediaCharacteristic.create({
        service,
        ...props,
      }),
      await SoundTouchSpeakerCurrentMediaCharacteristic.create({
        service,
        ...props,
      }),
      ...props.defaultCharacteristics,
    ];

    return new SoundTouchSpeakerPlatformAccessory({
      speakerCharacteristics: [...characteristics],
      ...props,
    });
  }

  static async create(props: {
    platform: SoundTouchHomebridgePlatform;
    accessory: PlatformAccessory;
    device: SoundTouchDevice;
  }): Promise<SoundTouchSpeakerPlatformAccessory> {
    const speakerType = props.device.volumeSettings.mode;
    const log = FormattedLogger.create(props.platform.log, props.device);

    log.debug('creating as a %s', speakerType);

    const defaultCharacteristics: SoundTouchSpeakerCharacteristic[] = [
      await SoundTouchSpeakerInformationCharacteristic.create(props),
    ];

    let accessory: SoundTouchSpeakerPlatformAccessory;

    switch (speakerType) {
      case VolumeMode.none:
        accessory = await SoundTouchSpeakerPlatformAccessory.createAccessory({
          defaultCharacteristics,
          ...props,
        });
        break;
      case VolumeMode.speaker:
        accessory =
          await SoundTouchSpeakerPlatformAccessory.createAccessoryAsSpeaker({
            defaultCharacteristics,
            ...props,
          });
        break;
      case VolumeMode.lightbulb:
        accessory =
          await SoundTouchSpeakerPlatformAccessory.createAccessoryWithVolumeControl(
            { defaultCharacteristics, ...props }
          );
        break;
      default:
        throw new Error('Unhandled volume mode type');
    }

    await accessory.init();

    return accessory;
  }

  private static ensureAccessoryService({
    device,
    accessory,
    serviceType,
    service,
  }: {
    serviceType: ServiceType;
    accessory: PlatformAccessory;
    device: SoundTouchDevice;
    service: typeof Service;
  }) {
    const serviceName = getServiceName({
      device,
      serviceType,
    });

    let accessoryService = accessory.getService(serviceName);

    if (!accessoryService) {
      accessoryService = accessory.addService(
        service,
        serviceName,
        serviceType
      );
    }
    return accessoryService;
  }
}
