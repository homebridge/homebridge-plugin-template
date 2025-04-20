import { Logging, LogLevel } from 'homebridge';
import { SoundTouchDevice } from '../devices/SoundTouch/SoundTouchDevice.js';

const logLevelSeverityMap = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.ERROR]: 1,
  [LogLevel.WARN]: 3,
  [LogLevel.SUCCESS]: 3, // WARNING AND SUCCESS are the same severity
  [LogLevel.INFO]: 5,
};

export class Logger implements Partial<Logging> {
  readonly homebridgeLogger: Logging;
  readonly requiredLogLevel: LogLevel;

  constructor({
    homebridgeLogger,
    level,
  }: {
    homebridgeLogger: Logging;
    level: LogLevel;
  }) {
    this.homebridgeLogger = homebridgeLogger;
    this.requiredLogLevel = level;
  }

  static excludeLog(level: LogLevel, requiredlevel: LogLevel) {
    return (
      (logLevelSeverityMap[level] &= logLevelSeverityMap[requiredlevel]) === 0
    );
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(level: LogLevel, message: string, ...parameters: any[]): void {
    if (Logger.excludeLog(level, this.requiredLogLevel)) return;
    this.homebridgeLogger.log(level, message, ...parameters);
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(message: string, ...parameters: any[]): void {
    this.log(LogLevel.INFO, message, ...parameters);
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  success(message: string, ...parameters: any[]): void {
    this.log(LogLevel.SUCCESS, message, ...parameters);
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message: string, ...parameters: any[]): void {
    this.log(LogLevel.WARN, message, ...parameters);
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(message: string, ...parameters: any[]): void {
    this.log(LogLevel.ERROR, message, ...parameters);
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(message: string, ...parameters: any[]): void {
    this.log(LogLevel.DEBUG, message, ...parameters);
  }

  static forHomebridgeLogger({
    logger,
    level,
  }: {
    logger: Logging;
    level: LogLevel;
  }): Logger {
    return new Logger({ homebridgeLogger: logger, level });
  }
}

export class DeviceLogger extends Logger {
  readonly device: SoundTouchDevice;

  constructor({
    homebridgeLogger,
    level,
    device,
  }: {
    homebridgeLogger: Logging;
    level: LogLevel;
    device: SoundTouchDevice;
  }) {
    super({ homebridgeLogger, level });
    this.device = device;
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(level: LogLevel, message: string, ...parameters: any[]): void {
    const formattedMsg = `[${this.device.name}] - ${message}`;

    super.log(level, formattedMsg, ...parameters);
  }

  static fromLogger({
    logger,
    device,
  }: {
    logger: Logger;
    device: SoundTouchDevice;
  }): DeviceLogger {
    return new DeviceLogger({
      homebridgeLogger: logger.homebridgeLogger,
      level: logger.requiredLogLevel,
      device,
    });
  }
}
