import { SoundTouchSpeakerCharacteristic } from './SoundTouchSpeakerCharacteristic.js';
import { PlatformAccessory } from 'homebridge';
import { SoundTouchDevice } from '../../devices/SoundTouch/SoundTouchDevice.js';
import { SoundTouchHomebridgePlatform } from '../../platform.js';

export class SoundTouchSpeakerInformationCharacteristic extends SoundTouchSpeakerCharacteristic {
  constructor(props: {
    device: SoundTouchDevice;
    accessory: PlatformAccessory;
    platform: SoundTouchHomebridgePlatform;
  }) {
    super(props);
  }

  async init(): Promise<void> {
    this.log.debug('initialising info');

    const informationService = this.accessory.getService(
      this.platform.Service.AccessoryInformation
    );
    if (!informationService) {
      throw new Error('No information service found');
    }
    informationService
      .setCharacteristic(
        this.platform.Characteristic.Name,
        `${this.device.name} Speaker`
      )
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Bose')
      .setCharacteristic(this.platform.Characteristic.Model, this.device.model)
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        this.device.id
      );
    if (this.device.version) {
      informationService.setCharacteristic(
        this.platform.Characteristic.FirmwareRevision,
        this.device.version
      );
    }
  }

  static async create(props: {
    accessory: PlatformAccessory;
    device: SoundTouchDevice;
    platform: SoundTouchHomebridgePlatform;
  }): Promise<SoundTouchSpeakerInformationCharacteristic> {
    return new SoundTouchSpeakerInformationCharacteristic(props);
  }
}
