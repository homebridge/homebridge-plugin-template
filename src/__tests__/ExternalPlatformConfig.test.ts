import { flattenAccessoryConfiguration } from '../ExternalPlatformConfig';

describe('calculateResultingAccessoryConfiguration', () => {
  test('it merges accessory and global configurations', () => {
    const result = flattenAccessoryConfiguration({
      globalConfig: {
        verbose: true,
        pollingInterval: 5000,
      },
      accessory: {
        verbose: false,
        pollingInterval: 2000,
      },
    });
    expect(result).toEqual({
      verbose: false,
      pollingInterval: 2000,
    });
  });
  test('it ignores undefined values in the global config', () => {
    const result = flattenAccessoryConfiguration({
      globalConfig: {
        verbose: undefined,
        pollingInterval: undefined,
      },
      accessory: {
        verbose: false,
        pollingInterval: 2000,
      },
    });
    expect(result).toEqual({
      verbose: false,
      pollingInterval: 2000,
    });
  });
  test('it ignores undefined values in the accessory config', () => {
    const result = flattenAccessoryConfiguration({
      globalConfig: {
        verbose: true,
        pollingInterval: 5000,
      },
      accessory: {
        verbose: undefined,
        pollingInterval: undefined,
      },
    });
    expect(result).toEqual({
      verbose: true,
      pollingInterval: 5000,
    });
  });
  test('it ignores undefined value for global config', () => {
    const result = flattenAccessoryConfiguration({
      globalConfig: undefined,
      accessory: {
        verbose: true,
        pollingInterval: 5000,
      },
    });
    expect(result).toEqual({
      verbose: true,
      pollingInterval: 5000,
    });
  });
  test('it returns undefined when no config is specified', () => {
    const result = flattenAccessoryConfiguration({
      globalConfig: undefined,
      accessory: undefined,
    });
    expect(result).toEqual(undefined);
  });
});
