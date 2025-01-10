import {
  Characteristic,
  CharacteristicValue,
  PlatformAccessory,
  Service,
} from 'homebridge';
import { SoundTouchDevice } from '../../devices/SoundTouch/SoundTouchDevice.js';
import { SoundTouchHomebridgePlatform } from '../../platform.js';
import { KeyValue } from '../../devices/SoundTouch/api/index.js';
import { SoundTouchSpeakerCharacteristic } from './SoundTouchSpeakerCharacteristic.js';

export class SoundTouchSpeakerOnCharacteristic extends SoundTouchSpeakerCharacteristic {
  private readonly service: Service;

  private characteristic: Characteristic;

  constructor({
    service,
    ...props
  }: {
    device: SoundTouchDevice;
    service: Service;
    platform: SoundTouchHomebridgePlatform;
    accessory: PlatformAccessory;
  }) {
    super(props);

    this.service = service;
    this.characteristic = this.service.getCharacteristic(
      this.platform.Characteristic.On
    );

    this.characteristic
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this));
  }

  async init(): Promise<void> {
    this.log.debug('initialising on status');
    await this.refresh();
  }

  async refresh(): Promise<void> {
    const isOn = await SoundTouchDevice.deviceIsOn(this.device);

    if (isOn !== this.characteristic.value) {
      this.characteristic.updateValue(isOn);
    }
  }

  async setOn(value: CharacteristicValue): Promise<void> {
    const desiredPowerStatus = value as boolean;

    try {
      if (
        desiredPowerStatus &&
        this.characteristic.value !== desiredPowerStatus
      ) {
        await this.device.api.pressKey(KeyValue.power);
      } else if (
        !desiredPowerStatus &&
        this.characteristic.value !== desiredPowerStatus
      ) {
        await this.device.api.pressKey(KeyValue.power);
      }
    } catch (e: unknown) {
      this.log.error('error setting on status', e);
      throw new this.platform.api.hap.HapStatusError(
        this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE
      );
    } finally {
      //give it time before trying to change.
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  async getOn(): Promise<CharacteristicValue> {
    const isOn = await SoundTouchDevice.deviceIsOn(this.device);

    return isOn;
  }

  static async create(props: {
    accessory: PlatformAccessory;
    device: SoundTouchDevice;
    platform: SoundTouchHomebridgePlatform;
    service: Service;
  }): Promise<SoundTouchSpeakerOnCharacteristic> {
    return new SoundTouchSpeakerOnCharacteristic(props);
  }
}
