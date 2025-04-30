import Platform from "./platform";

export default class Application {
  constructor(
    public name: string,
    public version: string,
    public platform: Platform,
  ) {}

  static async collect(): Promise<Application> {
    return new Application("js-sdk", "1.0.0", await Platform.collect());
  }
}
