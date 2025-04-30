export default class Config {
  sdkKey: string;
  timeout = 2000;

  constructor(sdkKey: string, timeout = 2000) {
    this.sdkKey = sdkKey;
    this.timeout = timeout;
  }
}
