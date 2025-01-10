import { SoundTouchSpeakerCharacteristic } from './SoundTouchSpeakerCharacteristic.js';
import {
  Characteristic,
  CharacteristicValue,
  Nullable,
  PlatformAccessory,
  Service,
} from 'homebridge';
import { SoundTouchDevice } from '../../devices/SoundTouch/SoundTouchDevice.js';
import { SoundTouchHomebridgePlatform } from '../../platform.js';
import { KeyValue } from '../../devices/SoundTouch/api/index.js';

export class SoundTouchSpeakerMuteCharacteristic extends SoundTouchSpeakerCharacteristic {
  private service: Service;
  private characteristic: Characteristic;

  constructor({
    service,
    ...props
  }: {
    accessory: PlatformAccessory;
    device: SoundTouchDevice;
    service: Service;
    platform: SoundTouchHomebridgePlatform;
  }) {
    super(props);
    this.service = service;

    this.characteristic = this.service.getCharacteristic(
      this.platform.Characteristic.Mute
    );
    this.characteristic
      .onSet(this.setMute.bind(this))
      .onGet(this.getMute.bind(this));
  }

  async init(): Promise<void> {
    this.log.debug('initialising mute');
    await this.refresh();
  }

  async refresh(): Promise<void> {
    const volume = await this.device.api.getVolume();
    if (volume) {
      this.characteristic.updateValue(volume.isMuted);
    }
  }

  async getMute(): Promise<Nullable<CharacteristicValue>> {
    this.log.debug('getting mute status');
    const isOn = await SoundTouchDevice.deviceIsOn(this.device);

    if (isOn) {
      const volume = await this.device.api.getVolume();
      return !volume?.isMuted;
    }
    return false;
  }

  async setMute(value: CharacteristicValue): Promise<void> {
    const mute = value as boolean;
    const isOn = await SoundTouchDevice.deviceIsOn(this.device);

    if (isOn) {
      const volume = await this.device.api.getVolume();
      if (volume) {
        if ((mute && !volume.isMuted) || (!mute && volume.isMuted)) {
          this.log.debug(
            'pressing mute. required: %s. actual: %s',
            mute,
            volume.isMuted
          );
          await this.device.api.pressKey(KeyValue.mute);
        }
      }
    } else if (mute) {
      await this.device.api.pressKey(KeyValue.power);
    }
  }

  static async create(props: {
    accessory: PlatformAccessory;
    device: SoundTouchDevice;
    platform: SoundTouchHomebridgePlatform;
    service: Service;
  }) {
    return new SoundTouchSpeakerMuteCharacteristic(props);
  }
}
