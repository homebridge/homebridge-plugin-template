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
import { PlayStatus } from '../../devices/SoundTouch/api/index.js';

export class SoundTouchSpeakerCurrentMediaCharacteristic extends SoundTouchSpeakerCharacteristic {
  private service: Service;
  private characteristic: Characteristic;

  constructor({
    service,
    ...props
  }: {
    accessory: PlatformAccessory;
    device: SoundTouchDevice;
    platform: SoundTouchHomebridgePlatform;
    service: Service;
  }) {
    super(props);
    this.service = service;
    this.characteristic = this.service.getCharacteristic(
      this.platform.Characteristic.CurrentMediaState
    );
    this.characteristic.onGet(this.getMedia.bind(this));
  }

  init: () => Promise<void> = async () => {
    this.log.debug('initialising current media state');
    await this.refresh();
  };

  refresh: () => Promise<void> = async (): Promise<void> => {
    const nowPlaying = await this.device.api.getNowPlaying();

    if (!nowPlaying?.playStatus) {
      return;
    }
    const current = this.convertPlayState(nowPlaying.playStatus);
    if (this.characteristic.value !== current) {
      this.log.debug(
        'new current media status: %s - %s',
        current,
        nowPlaying?.playStatus
      );
      this.characteristic.updateValue(current);
    }
  };

  async getMedia(): Promise<Nullable<CharacteristicValue>> {
    this.log.debug('getting current media status');
    const nowPlaying = await this.device.api.getNowPlaying();
    return nowPlaying?.playStatus
      ? this.convertPlayState(nowPlaying.playStatus)
      : this.platform.Characteristic.CurrentMediaState.STOP;
  }

  private convertPlayState(status: PlayStatus): 0 | 1 | 2 | 3 | 4 | 5 {
    switch (status) {
      case PlayStatus.play:
        return this.platform.Characteristic.CurrentMediaState.PLAY;
      case PlayStatus.buffering:
        return this.platform.Characteristic.CurrentMediaState.LOADING;
      case PlayStatus.stop:
        return this.platform.Characteristic.CurrentMediaState.STOP;
      case PlayStatus.pause:
        return this.platform.Characteristic.CurrentMediaState.PAUSE;
      default:
        return this.platform.Characteristic.CurrentMediaState.STOP;
    }
  }

  static async create(props: {
    accessory: PlatformAccessory;
    device: SoundTouchDevice;
    platform: SoundTouchHomebridgePlatform;
    service: Service;
  }) {
    return new SoundTouchSpeakerCurrentMediaCharacteristic(props);
  }
}
