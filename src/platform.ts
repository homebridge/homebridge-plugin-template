import {
  API,
  Characteristic,
  DynamicPlatformPlugin,
  Logging,
  LogLevel,
  PlatformAccessory,
  Service,
} from 'homebridge';
import { ExternalPlatformConfig } from './ExternalPlatformConfig.js';
import { SoundTouchDevice } from './devices/SoundTouch/SoundTouchDevice.js';
import { SoundTouchSpeakerPlatformAccessory } from './accessories/SoundTouchSpeakerPlatformAccessory.js';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';
import { Logger } from './utils/FormattedLogger.js';
import { PlatformConfiguration } from './PlatformConfiguration.js';

export class SoundTouchHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly service: typeof Service;
  public readonly characteristic: typeof Characteristic;
  public readonly configuration: PlatformConfiguration;
  public readonly logger: Logger;
  public readonly api: API;

  private readonly _accessories: Map<string, PlatformAccessory> = new Map();
  private readonly _discoveredCacheUUIDs: string[] = [];

  constructor(
    homebridgeLogger: Logging,
    homebridgeConfig: ExternalPlatformConfig,
    homebridgeApi: API
  ) {
    this.api = homebridgeApi;
    this.service = this.api.hap.Service;
    this.characteristic = this.api.hap.Characteristic;

    this.configuration =
      PlatformConfiguration.fromExternalConfiguration(homebridgeConfig);

    this.logger = Logger.forHomebridgeLogger({
      logger: homebridgeLogger,
      level: this.configuration.verbose ? LogLevel.DEBUG : LogLevel.INFO,
    });

    this.logger.info('Finished initializing platform:', this.configuration.toJson());

    this.api.on('didFinishLaunching', async () => {
      this.logger.debug('Started didFinishLaunching callback');
      await this.discoverDevices();
      this.logger.debug('Finished didFinishLaunching callback');
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.logger.info('Loading accessory from cache:', accessory.displayName);

    // add the restored accessory to the _accessories cache, so we can track if it has already been registered
    this._accessories.set(accessory.UUID, accessory);
  }

  async searchDevices(): Promise<SoundTouchDevice[]> {
    if (this.configuration.discoverAllAccessories) {
      return SoundTouchDevice.discoverAllAccessories({
        config: this.configuration,
        logger: this.logger,
      });
    }

    return Promise.all(
      this.configuration.accessories.map((accessoryConfig) =>
        SoundTouchDevice.fromConfiguredAccessory({
          accessoryConfig,
          logger: this.logger,
        })
      )
    );
  }

  async discoverDevices() {
    this.logger.debug('searching for devices', this.configuration);

    const accessories = await this.searchDevices();

    this.logger.debug('loaded devices', accessories);

    for (const device of accessories) {
      const uuid = this.api.hap.uuid.generate(device.id);

      // see if an accessory with the same uuid has already been registered and restored from
      // the cached devices we stored in the `configureAccessory` method above
      const existingAccessory = this._accessories.get(uuid);

      if (existingAccessory) {
        // the accessory already exists
        this.logger.info(
          'Restoring existing accessory from cache:',
          existingAccessory.displayName
        );

        await SoundTouchSpeakerPlatformAccessory.create({
          platform: this,
          accessory: existingAccessory,
          device,
        });
      } else {
        this.logger.info('Adding new accessory:', device.name);

        const accessory = new this.api.platformAccessory(device.name, uuid);

        accessory.context.device = device;

        await SoundTouchSpeakerPlatformAccessory.create({
          platform: this,
          accessory,
          device,
        });

        // link the accessory to your platform
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
          accessory,
        ]);
      }

      // push into _discoveredCacheUUIDs
      this._discoveredCacheUUIDs.push(uuid);
    }

    for (const [uuid, accessory] of this._accessories) {
      if (!this._discoveredCacheUUIDs.includes(uuid)) {
        this.logger.info(
          'Removing existing accessory from cache:',
          accessory.displayName
        );
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
          accessory,
        ]);
      }
    }
  }

}
