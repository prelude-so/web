import { core } from "../core";
import Application from "./families/application";
import Device from "./families/device";
import Hardware from "./families/hardware";
import Network from "./families/network";

export default class Signals {
  constructor(
    public dispatchId: string,
    public application: Application,
    public device: Device,
    public hardware: Hardware,
    public network: Network,
  ) {}

  static async collect(): Promise<Signals> {
    const n = window.navigator;
    const uaData = await n.userAgentData?.getHighEntropyValues([
      "architecture",
      "bitness",
      "formFactor",
      "fullVersionList",
      "model",
      "platform",
      "platformVersion",
      "wow64",
    ]);

    const s = new Signals(
      await core.getDispatchId(),
      await Application.collect(),
      await Device.collect(uaData),
      Hardware.collect(uaData),
      Network.collect(),
    );
    return s;
  }
}
