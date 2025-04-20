import { AccessoryConfig } from '../../ExternalPlatformConfig.js';

const DEFAULT_POLLING_INTERVAL = 2 * 1000; // 2 Seconds
const DEFAULT_VERBOSE_LOGGING = false;

interface BaseDeviceConfiguration {
  name: string;
  pollingInterval?: number;
  verbose?: boolean;
}

interface DeviceViaRoomConfigurationProps extends BaseDeviceConfiguration {
  room?: string;
}

interface DeviceViaIpConfigurationProps extends BaseDeviceConfiguration {
  ip?: string;
  port?: number;
}

export class DeviceConfiguration {
  readonly type: 'room' | 'ip' | 'discovered';
  readonly name: string;

  readonly room?: string;
  readonly ip?: string;
  readonly port?: number;

  readonly pollingInterval: number;
  readonly verboseLogging: boolean;

  constructor(props: {
    type: 'room' | 'ip' | 'discovered';
    name?: string;
    room?: string;
    ip?: string;
    port?: number;
    pollingInterval?: number;
    verboseLogging?: boolean;
  }) {
    this.type = props.type;
    this.name = props.name || 'default';
    this.verboseLogging = props.verboseLogging ?? DEFAULT_VERBOSE_LOGGING;
    this.pollingInterval = props.pollingInterval ?? DEFAULT_POLLING_INTERVAL;

    if (props.type === 'room') {
      this.room = props.room;
    }
    if (props.type === 'ip') {
      this.ip = props.ip;
      this.port = props.port;
    }
  }

  static createForRoom(props: DeviceViaRoomConfigurationProps) {
    return new DeviceConfiguration({ ...props, type: 'room' });
  }

  static createForIp(props: DeviceViaIpConfigurationProps) {
    return new DeviceConfiguration({ ...props, type: 'ip' });
  }

  static fromAccessoryConfiguration(props: {
    accessoryConfig: AccessoryConfig;
  }): DeviceConfiguration | undefined {
    if (props.accessoryConfig?.ip) {
      return DeviceConfiguration.createForIp({
        name: props.accessoryConfig.name ?? '',
        ip: props.accessoryConfig.ip,
        port: props.accessoryConfig.port,
        pollingInterval: props.accessoryConfig.pollingInterval,
      });
    } else if (props.accessoryConfig?.room) {
      return DeviceConfiguration.createForRoom({
        name: props.accessoryConfig.name ?? '',
        room: props.accessoryConfig.room,
        pollingInterval: props.accessoryConfig.pollingInterval,
      });
    }
    return undefined;
  }

  static create({
    name,
    verboseLogging,
    pollingInterval,
  }: {
    name?: string;
    verboseLogging?: boolean;
    pollingInterval?: number;
  }) {
    return new DeviceConfiguration({
      name,
      verboseLogging,
      pollingInterval,
      type: 'discovered',
    });
  }
}
