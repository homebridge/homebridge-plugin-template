import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
} from "homebridge";

import { PLATFORM_NAME, PLUGIN_NAME } from "./settings";
import { VenstarExplorerMiniPlatformAccessory } from "./platformAccessory";
import { findDevices } from "./discover";

export class VenstarExplorerMiniHomebridgePlatform
  implements DynamicPlatformPlugin
{
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic =
    this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API
  ) {
    this.log.debug("Finished initializing platform:", this.config.name);

    this.api.on("didFinishLaunching", () => {
      log.debug("Executed didFinishLaunching callback");
      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info("Loading accessory from cache:", accessory.displayName);

    this.accessories.push(accessory);
  }

  async discoverDevices() {
    const devices = [await findDevices()];

    for (const device of devices) {
      const uuid = this.api.hap.uuid.generate(device.exampleUniqueId);

      const existingAccessory = this.accessories.find(
        (accessory) => accessory.UUID === uuid
      );

      if (existingAccessory) {
        this.log.info(
          "Restoring existing accessory from cache:",
          device.exampleUniqueId,
          device.uri
        );
        new VenstarExplorerMiniPlatformAccessory(
          this,
          existingAccessory,
          device.uri
        );
      } else {
        this.log.info(
          "Adding new accessory:",
          device.exampleUniqueId,
          device.uri
        );

        const accessory = new this.api.platformAccessory(
          device.exampleDisplayName,
          uuid
        );

        accessory.context.device = device;

        new VenstarExplorerMiniPlatformAccessory(this, accessory, device.uri);

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
          accessory,
        ]);
      }
    }
  }
}
