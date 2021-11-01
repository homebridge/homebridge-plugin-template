import { Service, PlatformAccessory } from "homebridge";
import { VenstarExplorerMiniHomebridgePlatform } from "./platform";
import { VenstarAPI } from "./venstarApi";

export class VenstarExplorerMiniPlatformAccessory {
  private service: Service;
  private API: VenstarAPI;

  constructor(
    private readonly platform: VenstarExplorerMiniHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly uri: string
  ) {
    // set accessory information
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, "Venstar")
      .setCharacteristic(this.platform.Characteristic.Model, "T2000")
      .setCharacteristic(this.platform.Characteristic.SerialNumber, "UNO");
    this.API = new VenstarAPI(uri);

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service =
      this.accessory.getService(this.platform.Service.Thermostat) ||
      this.accessory.addService(this.platform.Service.Thermostat);

    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.context.device.exampleDisplayName
    );

    this.service
      .getCharacteristic(
        this.platform.Characteristic.CurrentHeatingCoolingState
      )
      .onGet(this.handleCurrentHeatingCoolingStateGet.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
      .onGet(this.handleTargetHeatingCoolingStateGet.bind(this))
      .onSet(this.handleTargetHeatingCoolingStateSet.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.handleCurrentTemperatureGet.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.TargetTemperature)
      .onGet(this.handleTargetTemperatureGet.bind(this))
      .onSet(this.handleTargetTemperatureSet.bind(this));

    this.service
      .getCharacteristic(
        this.platform.Characteristic.CoolingThresholdTemperature
      )
      .onGet(this.handleCoolingTemperatureGet.bind(this))
      .onSet(this.handleCoolingTemperatureSet.bind(this));

    this.service
      .getCharacteristic(
        this.platform.Characteristic.HeatingThresholdTemperature
      )
      .onGet(this.handleHeatingTemperatureGet.bind(this))
      .onSet(this.handleHeatingTemperatureSet.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
      .onGet(this.handleTemperatureDisplayUnitsGet.bind(this));

    // Fan Service
    const fanService =
      this.accessory.getService("Fan") ||
      this.accessory.addService(
        this.platform.Service.Fanv2,
        "Fan",
        "YourUniqueIdentifier-2"
      );

    // create handlers for required characteristics
    fanService
      .getCharacteristic(this.platform.Characteristic.Active)
      .onGet(this.handleFanActiveGet.bind(this))
      .onSet(this.handleFanActiveSet.bind(this));
  }

  async handleFanActiveGet() {
    const test = await this.API.getInfo();
    return test.fanstate;
  }
  async handleFanActiveSet(value) {
    const fanValue = value ? 1 : 0;
    await this.API.setControl("fan=" + fanValue);
    return value;
  }

  async handleCurrentHeatingCoolingStateGet() {
    const test = await this.API.getInfo();
    return test.state;
  }

  async handleTargetHeatingCoolingStateGet() {
    const test = await this.API.getInfo();
    return test.mode;
  }

  async handleTargetHeatingCoolingStateSet(value) {
    await this.API.setControl("mode=" + value);
  }

  async handleCurrentTemperatureGet() {
    const test = await this.API.getInfo();
    return test.spacetemp;
  }

  async handleTargetTemperatureGet() {
    const test = await this.API.getInfo();

    let targetTemp;
    switch (test.mode) {
      case 2:
        targetTemp = test.cooltemp;
        break;
      case 1:
        targetTemp = test.heattemp;
        break;
      default:
        targetTemp = (test.heattemp + test.cooltemp) / 2;
        break;
    }

    return targetTemp;
  }

  async handleTargetTemperatureSet(value) {
    const test = await this.API.getInfo();

    let tempMode;
    if (test.mode == 2) {
      tempMode = "cooltemp";
    } else {
      tempMode = "heattemp";
    }

    value = value.toFixed(2).toString();
    this.API.setControl(tempMode + "=" + value);
  }

  async handleCoolingTemperatureGet() {
    const test = await this.API.getInfo();
    return test.cooltemp;
  }

  async handleCoolingTemperatureSet(value) {
    value = value.toFixed(2).toString();
    this.API.setControl("cooltemp=" + value);
  }

  async handleHeatingTemperatureGet() {
    const test = await this.API.getInfo();
    return test.heattemp;
  }

  async handleHeatingTemperatureSet(value) {
    value = value.toFixed(2).toString();
    this.API.setControl("heattemp=" + value);
  }

  async handleTemperatureDisplayUnitsGet() {
    const info = await this.API.getInfo();

    return info.tempunits == 0
      ? this.platform.Characteristic.TemperatureDisplayUnits.FAHRENHEIT
      : this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS;
  }
}
