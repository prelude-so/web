import "../../utils";

export default class Device {
  constructor(
    public fontsDigest: string | null = null,
    public hostname: string | null = null,
    public localeCurrent: string | null = null,
    public localePreferred: string[] | null = null,
    public osRelease: string | null = null,
    public osType: string | null = null,
    public platform: string | null = null,
    public systemName: string | null = null,
    public systemVersion: string | null = null,
    public timeZoneCurrent: string | null = null,
  ) {}

  static async collect(uaData?: UADataValues): Promise<Device> {
    const d = new Device();
    const n = window.navigator;

    d.fontsDigest = await getSystemFonts().sha256();
    d.hostname = window.location.origin;
    d.localeCurrent = n.language;
    d.localePreferred = n.languages.slice();
    d.osRelease = uaData?.platformVersion ?? null;
    d.osType = this.getOSType(uaData);
    d.platform = "web";
    d.systemName = (uaData?.fullVersionList || [])[0]?.brand ?? null;
    d.systemVersion = (uaData?.fullVersionList || [])[0]?.version ?? null;
    d.timeZoneCurrent = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return d;
  }

  private static getOSType(uaData?: UADataValues): string {
    let osType: string;
    if (uaData?.platform) {
      osType = uaData.platform;
    } else {
      const userAgent = window.navigator.userAgent;
      osType =
        /win(dows|16|32|64|95|98|nt)|wow64/gi.test(userAgent) ? Devices.WINDOWS
        : /android/gi.test(userAgent) ? Devices.ANDROID
        : /cros/gi.test(userAgent) ? Devices.CHROME_OS
        : /linux/gi.test(userAgent) ? Devices.LINUX
        : /ipad/gi.test(userAgent) ? Devices.IPAD
        : /iphone/gi.test(userAgent) ? Devices.IPHONE
        : /ios/gi.test(userAgent) ? Devices.IOS
        : /mac/gi.test(userAgent) ? Devices.MACOS
        : Devices.UNKNOWN;
    }
    return osType;
  }
}

function getSystemFonts(): string {
  const { body } = document;
  const el = document.createElement("div");
  body.appendChild(el);
  try {
    const systemFonts = String([
      Array.from(
        SYSTEM_FONTS.reduce((acc, font) => {
          el.setAttribute("style", `font: ${font} !important`);
          return acc.add(getComputedStyle(el).fontFamily);
        }, new Set()),
      ),
    ]);
    const geckoPlatform = GeckoFonts[systemFonts];
    return GeckoFonts[systemFonts] ? `${systemFonts}:${geckoPlatform}` : systemFonts;
  } catch {
    return "";
  } finally {
    body.removeChild(el);
  }
}

const enum Devices {
  ANDROID = "Android",
  CHROME_OS = "Chrome OS",
  IOS = "iOS",
  IPAD = "iPad",
  IPHONE = "iPhone",
  LINUX = "Linux",
  MACOS = "MacOS",
  WINDOWS = "Windows",
  UNKNOWN = "Unknown",
}

const SYSTEM_FONTS = ["caption", "icon", "menu", "message-box", "small-caption", "status-bar"];

const GeckoFonts: Record<string, string> = {
  "-apple-system": Devices.MACOS,
  "Segoe UI": Devices.WINDOWS,
  "Tahoma": Devices.WINDOWS,
  "Yu Gothic UI": Devices.WINDOWS,
  "Microsoft JhengHei UI": Devices.WINDOWS,
  "Microsoft YaHei UI": Devices.WINDOWS,
  "Meiryo UI": Devices.WINDOWS,
  "Cantarell": Devices.LINUX,
  "Ubuntu": Devices.LINUX,
  "Sans": Devices.LINUX,
  "sans-serif": Devices.LINUX,
  "Fira Sans": Devices.LINUX,
  "Roboto": Devices.ANDROID,
};
