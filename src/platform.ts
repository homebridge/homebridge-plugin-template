import type {
    API,
    Characteristic,
    DynamicPlatformPlugin,
    Logging,
    PlatformAccessory,
    Service,
} from 'homebridge';
import {
    AccessoryConfig,
    GlobalConfig,
    SoundTouchHomeBridgePlatformConfig,
} from './SoundTouchHomeBridgePlatformConfig.js';
import {SoundTouchDevice} from './devices/SoundTouch/SoundTouchDevice.js';
import {SoundTouchSpeakerPlatformAccessory} from './accessories/SoundTouchSpeakerPlatformAccessory.js';
import {PLATFORM_NAME, PLUGIN_NAME} from './settings.js';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class SoundTouchHomebridgePlatform implements DynamicPlatformPlugin {
    public readonly Service: typeof Service;
    public readonly Characteristic: typeof Characteristic;

    public readonly accessories: Map<string, PlatformAccessory> = new Map();
    public readonly discoveredCacheUUIDs: string[] = [];

    constructor(
        public readonly log: Logging,
        public readonly config: SoundTouchHomeBridgePlatformConfig,
        public readonly api: API
    ) {
        this.Service = api.hap.Service;
        this.Characteristic = api.hap.Characteristic;
        this.log.debug('Finished initializing platform:', this.config.name);

        this.api.on('didFinishLaunching', async () => {
            log.debug('Executed didFinishLaunching callback');
            await this.discoverDevices();
        });
    }

    configureAccessory(accessory: PlatformAccessory) {
        this.log.info('Loading accessory from cache:', accessory.displayName);

        // add the restored accessory to the accessories cache, so we can track if it has already been registered
        this.accessories.set(accessory.UUID, accessory);
    }

    async discoverDevices() {
        if (this.config?.global?.verbose) {
            this.log.debug('searching for devices', this.config);
        }

        const accessories = await this.searchDevices();

        if (this.config?.global?.verbose) {
            this.log.debug('loaded devices', accessories);
        }

        for (const device of accessories) {
            const uuid = this.api.hap.uuid.generate(device.id);

            // see if an accessory with the same uuid has already been registered and restored from
            // the cached devices we stored in the `configureAccessory` method above
            const existingAccessory = this.accessories.get(uuid);

            if (existingAccessory) {
                // the accessory already exists
                this.log.info(
                    'Restoring existing accessory from cache:',
                    existingAccessory.displayName
                );

                await SoundTouchSpeakerPlatformAccessory.create({
                    platform: this,
                    accessory: existingAccessory,
                    device,
                });

            } else {
                this.log.info('Adding new accessory:', device.name);

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

            // push into discoveredCacheUUIDs
            this.discoveredCacheUUIDs.push(uuid);
        }

        for (const [uuid, accessory] of this.accessories) {
            if (!this.discoveredCacheUUIDs.includes(uuid)) {
                this.log.info(
                    'Removing existing accessory from cache:',
                    accessory.displayName
                );
                this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
                    accessory,
                ]);
            }
        }
    }

    protected async searchDevices(): Promise<SoundTouchDevice[]> {
        const accessoryConfigs: AccessoryConfig[] = this.config.accessories || [];
        const globalConfig: GlobalConfig = this.config.global || {};
        if (this.config.discoverAllAccessories === true) {
            return SoundTouchDevice.searchAllDevices(
                globalConfig,
                accessoryConfigs,
                this.log
            );
        }
        return Promise.all(
            accessoryConfigs.map((ac) =>
                SoundTouchDevice.deviceFromConfig(globalConfig, ac, this.log)
            )
        );
    }
}
