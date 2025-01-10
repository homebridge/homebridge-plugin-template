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
import { KeyValue, PlayStatus } from '../../devices/SoundTouch/api/index.js';

export class SoundTouchSpeakerPresetsCharacteristic extends SoundTouchSpeakerCharacteristic {
  private service: Service;
  private characteristic: Characteristic;
  private presetName: string;

  constructor({
    presetName,
    service,
    ...props
  }: {
    presetName: string;
    accessory: PlatformAccessory;
    device: SoundTouchDevice;
    platform: SoundTouchHomebridgePlatform;
    service: Service;
  }) {
    super(props);
    this.presetName = presetName;
    this.service = service;

    this.characteristic = this.service.getCharacteristic(
      this.platform.Characteristic.TargetMediaState
    );
    this.characteristic.onGet(this.getMedia.bind(this));
    this.characteristic.onSet(this.setMedia.bind(this));
  }

  async init(): Promise<void> {
    this.log.debug('initialising target media state');
    await this.refresh();
  }

  async refresh(): Promise<void> {
    const nowPlaying = await this.device.api.getNowPlaying();

    if (!nowPlaying?.playStatus) {
      return;
    }
    const current = this.convertPlayState(nowPlaying.playStatus);
    if (this.characteristic.value !== current) {
      this.log.debug(
        'new target media status: %s - %s',
        current,
        nowPlaying?.playStatus
      );
      this.characteristic.updateValue(current);
    }
  }

  async getMedia(): Promise<Nullable<CharacteristicValue>> {
    this.log.debug('getting target media status');
    const nowPlaying = await this.device.api.getNowPlaying();
    return nowPlaying?.playStatus
      ? this.convertPlayState(nowPlaying.playStatus)
      : this.platform.Characteristic.TargetMediaState.STOP;
  }

  async setMedia(value: CharacteristicValue): Promise<void> {
    this.log.debug('setting target media status');
    const number = value as number;
    const desired = this.convertTargetMediaState(number);
    const nowPlaying = await this.device.api.getNowPlaying();
    if (nowPlaying && nowPlaying.playStatus !== desired) {
      switch (desired) {
        case PlayStatus.play:
          await this.device.api.pressKey(KeyValue.playPause);
          break;
        case PlayStatus.stop:
          await this.device.api.pressKey(KeyValue.stop);
          break;
        case PlayStatus.pause:
          await this.device.api.pressKey(KeyValue.pause);
          break;
      }
    }
  }

  private convertPlayState(status: PlayStatus): 0 | 1 | 2 {
    switch (status) {
      case PlayStatus.play:
        return this.platform.Characteristic.TargetMediaState.PLAY;
      case PlayStatus.stop:
        return this.platform.Characteristic.TargetMediaState.STOP;
      case PlayStatus.pause:
        return this.platform.Characteristic.TargetMediaState.PAUSE;
      default:
        return this.platform.Characteristic.TargetMediaState.STOP;
    }
  }

  private convertTargetMediaState(value: number) {
    switch (value) {
      case 0:
        return PlayStatus.play;
      case 1:
        return PlayStatus.pause;
      case 2:
        return PlayStatus.stop;
      default:
        throw new Error(`Unknown target media state - ${value}`);
    }
  }

  static async create(props: {
    presetName: string;
    accessory: PlatformAccessory;
    device: SoundTouchDevice;
    platform: SoundTouchHomebridgePlatform;
    service: Service;
  }) {
    return new SoundTouchSpeakerPresetsCharacteristic(props);
  }
}
