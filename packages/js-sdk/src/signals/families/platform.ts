export default class Platform {
  constructor(
    public connectionType: string | null = null,
    public cookiesEnabled: boolean | null = null,
    public doNotTrack: string | null = null,
    public indexedDbEnabled: boolean | null = null,
    public localStorageEnabled: boolean | null = null,
    public maybeHeadless: boolean | null = null,
    public mediaCapabilities: string | null = null,
    public multiTouchDevice: boolean | null = null,
    public pluginsDigest: string | null = null,
    public rtt: number | null = null,
    public userAgent: string | null = null,
    public webGlEnabled: boolean | null = null,
  ) {}

  static async collect(): Promise<Platform> {
    const p = new Platform();
    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      p.connectionType = connection.type;
      p.rtt = connection.rtt;
    }

    p.cookiesEnabled = navigator.cookieEnabled;
    p.doNotTrack = navigator.doNotTrack;
    p.indexedDbEnabled = await Platform.indexedDbEnabled();
    p.localStorageEnabled = Platform.localStorageEnabled();
    p.maybeHeadless = await Platform.maybeHeadless();
    p.mediaCapabilities = await Platform.getMediaCapabilities();
    p.multiTouchDevice = navigator.maxTouchPoints > 1;

    const plugins = Platform.getPlugins();
    if (plugins) {
      p.pluginsDigest = await plugins.sha256();
    }

    p.userAgent = navigator.userAgent;
    p.webGlEnabled = !!Platform.getWebGLContext();

    return p;
  }

  static getWebGLContext(): RenderingContext | null {
    const gl = document.createElement("canvas");
    let c: RenderingContext | null = null;

    gl.addEventListener("webglCreateContextError", () => (c = null));

    for (const type of ["webgl", "experimental-webgl"]) {
      try {
        c = gl.getContext(type);
      } catch {
        // Ignore errors
      }
      if (c) break;
    }
    return c;
  }

  static getPlugins(): string | null {
    const rawPlugins: PluginArray = navigator.plugins;
    if (!rawPlugins) {
      return null;
    }

    const plugins: string[] = [];

    // TODO fix deprecated should not ignore as rawPlugins is not iterable in some browsers
    // https://developer.mozilla.org/en-US/docs/Web/API/PluginArray
    // @ts-ignore
    for (const plugin of rawPlugins) {
      if (!plugin) continue;

      plugins.push(plugin.name.toLowerCase());
    }

    return plugins.concatenateAll();
  }

  static async indexedDbEnabled(): Promise<boolean> {
    try {
      await window.indexedDB.databases();
      return true;
    } catch {
      return false;
    }
  }

  static localStorageEnabled(): boolean {
    try {
      return !!window.localStorage;
    } catch {
      return false;
    }
  }

  static async getMediaCapabilities() {
    const codecs = [
      "audio/ogg; codecs=vorbis",
      "audio/ogg; codecs=flac",
      'audio/mp4; codecs="mp4a.40.2"',
      'audio/mpeg; codecs="mp3"',
      'video/mp4; codecs="avc1.42E01E"',
    ];

    const decodingInfo = codecs.map(async (codec) => {
      const config: MediaDecodingConfiguration = {
        type: "file" as MediaDecodingType,
        video:
          !/^video/.test(codec) ?
            undefined
          : {
              contentType: codec,
              width: 1920,
              height: 1080,
              bitrate: 120000,
              framerate: 60,
            },
        audio:
          !/^audio/.test(codec) ?
            undefined
          : {
              contentType: codec,
              channels: "2",
              bitrate: 300000,
              samplerate: 5200,
            },
      };

      try {
        return {
          codec,
          ...(await navigator.mediaCapabilities.decodingInfo(config)),
        };
      } catch {
        return null;
      }
    });

    const capabilities = await Promise.all(decodingInfo)
      .then((data) => {
        return data
          .filter((d) => d != null)
          .map((d) => d.codec + ":" + d.supported)
          .concatenateAll()
          .sha256();
      })
      .catch();

    return capabilities;
  }

  static async maybeHeadless(): Promise<boolean> {
    const userAgent = navigator.userAgent.toLowerCase();
    const uaHeadless =
      userAgent.includes("headless") ||
      userAgent.includes("phantomjs") ||
      userAgent.includes("selenium") ||
      userAgent.includes("puppeteer") ||
      userAgent.includes("htmlunit") ||
      userAgent.includes("jsdom");

    let webDriver = false;
    if ("webdriver" in navigator) {
      webDriver = navigator.webdriver;
    }
    let headlessPermission = false;
    if ("Notification" in window) {
      const permissionStatus = await navigator.permissions.query({ name: "notifications" });
      if (Notification.permission === "denied" && permissionStatus.state === "prompt") {
        headlessPermission = true;
      }
    }

    return uaHeadless || webDriver || headlessPermission;
  }
}
