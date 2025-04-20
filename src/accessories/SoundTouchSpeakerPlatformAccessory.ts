import { SoundTouchDevice } from '../devices/SoundTouch/SoundTouchDevice.js';
import { PlatformAccessory, type Service } from 'homebridge';
import { SoundTouchHomebridgePlatform } from '../platform.js';
import {
  getServiceName,
  ServiceType,
  SoundTouchSpeakerCharacteristic,
} from './services/SoundTouchSpeakerCharacteristic.js';
import { SoundTouchSpeakerInformationCharacteristic } from './services/SoundTouchSpeakerInformationCharacteristic.js';
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
    super(props);
    this.speakerCharacteristics = speakerCharacteristics;
  }

  async init(): Promise<void> {
    for (const speakerCharacteristic of this.speakerCharacteristics) {
      if (speakerCharacteristic.init) {
        await speakerCharacteristic.init();
      }
    }

    if (this.device.configuration.pollingInterval !== undefined) {
      this._refreshDeviceServices().then(() => {
        //no-op
      });
    }

    this.log.info(`Device ready`);
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
        setTimeout(resolve, this.device.configuration.pollingInterval)
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
      service: props.platform.service.Switch,
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

  static async create(props: {
    platform: SoundTouchHomebridgePlatform;
    accessory: PlatformAccessory;
    device: SoundTouchDevice;
  }): Promise<SoundTouchSpeakerPlatformAccessory> {
    const defaultCharacteristics: SoundTouchSpeakerCharacteristic[] = [
      await SoundTouchSpeakerInformationCharacteristic.create(props),
    ];

    const accessory = await SoundTouchSpeakerPlatformAccessory.createAccessory({
      defaultCharacteristics,
      ...props,
    });

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
