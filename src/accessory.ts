import { PlatformAccessory } from 'homebridge';
import { MitsubishHeavyAirconPlatform } from './platform';
import { MHACWIFI1 } from './accessories/device';
import { Aircon } from "./accessories/aircon"
import { Fan } from "./accessories/fan"
import { Dehumidifier } from "./accessories/dehumidifier"


const MANUFACTURER = "Mitsubishi Heavy Industries";
const MODEL = "MH-AC-WIFI-1";


type MHACConfig = {
  name: string;
  ip : string;
  username: string;
  password: string;
  mac: string;
}

export class MHACAccessory {

  // private tempService: Service;
  private device: MHACWIFI1;

  private aircon: Aircon;
  private fan: Fan;
  private dehumidifier: Dehumidifier;

  constructor(
    private readonly platform: MitsubishHeavyAirconPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly config: MHACConfig,
  ) {
    let context = accessory.context;
    let Characteristic = platform.Characteristic
    this.device = new MHACWIFI1(this.platform.log, this.config.ip, config.username, config.password);
    this.device.on("refresh", this.updateHomeBridgeState.bind(this));

    // set accessory information
    accessory.getService(platform.Service.AccessoryInformation)!
      .setCharacteristic(Characteristic.Manufacturer, MANUFACTURER)
      .setCharacteristic(Characteristic.Model, MODEL)
      .setCharacteristic(Characteristic.SerialNumber, config.mac);

      this.aircon = new Aircon(platform, accessory, this.device);
      this.fan = new Fan(platform, accessory, this.device);
      this.dehumidifier = new Dehumidifier(platform, accessory, this.device);


    // Create the outdoor temperature service
    /*
    this.tempService = accessory.getService(platform.Service.TemperatureSensor) ||
                       accessory.addService(platform.Service.TemperatureSensor, accessory.context.device.name + " Temperature");
    this.tempService.setCharacteristic(Characteristic.Name, "Outside");
    this.tempService.getCharacteristic(Characteristic.CurrentTemperature)
        .onGet(this.tempGetCurrentTemperature.bind(this));
    */
  }

  async updateHomeBridgeState() {
    this.aircon.updateHomeBridgeState()
    this.fan.updateHomeBridgeState()
    this.dehumidifier.updateHomeBridgeState()

    // this.syncCharacteristic(this.tempService, 'TemperatureSensor', 'CurrentTemperature', this.tempGetCurrentTemperature());
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  tempGetCurrentTemperature(): number {
    return this.device.get.outdoorTemperature();
  }
}
