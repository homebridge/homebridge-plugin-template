import { describe, expect, test } from '@jest/globals';
import { Logger } from '../FormattedLogger';
import { LogLevel } from 'homebridge';

describe('FormattedLogger', () => {
  describe('excludeLog', () => {
    const testLevels = [
      {
        level: LogLevel.DEBUG,
        requiredLevel: LogLevel.DEBUG,
        outcome: false,
      },
      {
        level: LogLevel.ERROR,
        requiredLevel: LogLevel.DEBUG,
        outcome: false,
      },
      {
        level: LogLevel.WARN,
        requiredLevel: LogLevel.DEBUG,
        outcome: false,
      },
      {
        level: LogLevel.SUCCESS,
        requiredLevel: LogLevel.DEBUG,
        outcome: false,
      },
      {
        level: LogLevel.INFO,
        requiredLevel: LogLevel.DEBUG,
        outcome: false,
      },

      {
        level: LogLevel.DEBUG,
        requiredLevel: LogLevel.INFO,
        outcome: true,
      },
      {
        level: LogLevel.ERROR,
        requiredLevel: LogLevel.INFO,
        outcome: true,
      },
      {
        level: LogLevel.WARN,
        requiredLevel: LogLevel.INFO,
        outcome: true,
      },
      {
        level: LogLevel.SUCCESS,
        requiredLevel: LogLevel.INFO,
        outcome: true,
      },
      {
        level: LogLevel.INFO,
        requiredLevel: LogLevel.INFO,
        outcome: true,
      },
    ];

    testLevels.forEach((c) => {
      test(`returns ${c.outcome} when the request log level is '${c.level}' and the required log level is '${c.requiredLevel}'`, () => {
        const result = Logger.excludeLog(LogLevel.DEBUG, LogLevel.INFO);
        expect(result).toBe(true);
      });
    });
  });
});
