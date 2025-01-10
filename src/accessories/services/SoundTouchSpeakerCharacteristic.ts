import { SoundTouchDevice } from '../../devices/SoundTouch/SoundTouchDevice.js';
import { SoundTouchHomebridgePlatform } from '../../platform.js';
import { PlatformAccessory } from 'homebridge';
import { FormattedLogger } from '../../utils/FormattedLogger.js';

export enum ServiceType {
  'ON_OFF' = 'ON',
  'SMART_SPEAKER' = 'SMART SPEAKER',
  'SPEAKER' = 'SPEAKER',
  'LIGHT_BULB' = 'LIGHT BULB',
}

export abstract class SoundTouchSpeakerCharacteristic {
  protected platform: SoundTouchHomebridgePlatform;
  protected accessory: PlatformAccessory;
  protected device: SoundTouchDevice;
  protected log: FormattedLogger;

  protected constructor({
    accessory,
    platform,
    device,
  }: {
    accessory: PlatformAccessory;
    device: SoundTouchDevice;
    platform: SoundTouchHomebridgePlatform;
  }) {
    this.accessory = accessory;
    this.platform = platform;
    this.device = device;
    this.log = FormattedLogger.create(platform.log, device);
  }

  init(): Promise<void> {
    return Promise.resolve();
  }
  refresh(): Promise<void> {
    return Promise.resolve();
  }
}

export function getServiceName({
  serviceType,
  device,
}: {
  serviceType: ServiceType;
  device: SoundTouchDevice;
}) {
  return `${device.name} ${serviceType} Service`;
}
