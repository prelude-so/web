export default class Hardware {
  constructor(
    public architecture: string | null = null,
    public cpuCount: number | null = null,
    public displayPhysicalResolution: DisplayResolution | null = null,
    public displayPhysicalScale: number | null = null,
    public displayResolution: DisplayResolution | null = null,
    public displayScale: number | null = null,
    public manufacturer: string | null = null,
    public memorySize: number | null = null,
    public model: string | null = null,
  ) {}

  static collect(uaData?: UADataValues): Hardware {
    const h = new Hardware();

    h.architecture = uaData?.architecture ?? this.getArchitectureFallback();
    if (navigator.hardwareConcurrency) {
      h.cpuCount = navigator.hardwareConcurrency;
    }
    h.displayPhysicalResolution = {
      width: window.screen.width,
      height: window.screen.height,
    };
    h.displayPhysicalScale = window.devicePixelRatio;
    h.displayResolution = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    h.displayScale = window.devicePixelRatio;
    h.manufacturer = (uaData?.fullVersionList || []).map((item) => item.brand).concatenateAll() ?? null;
    if ("deviceMemory" in navigator) {
      // @ts-ignore: deviceMemory is not in standard navigator type
      h.memorySize = BigInt(navigator.deviceMemory * 1024 * 1024 * 1024); // GB to bytes
    }
    h.model = (uaData?.fullVersionList || []).map((i) => i.brand + "-" + i.version).concatenateAll() ?? null;
    return h;
  }

  private static getArchitectureFallback(): string | null {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("arm") || ua.includes("aarch64")) {
      return "arm";
    } else if (ua.includes("x86_64") || ua.includes("x64") || ua.includes("wow64")) {
      return "x86_64";
    } else if (ua.includes("x86") || ua.includes("i386") || ua.includes("i686")) {
      return "x86";
    } else {
      return null;
    }
  }
}

interface DisplayResolution {
  width: number;
  height: number;
}
