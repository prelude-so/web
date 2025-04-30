export {};

declare global {
  interface String {
    sha256(): Promise<string>;
  }
  /* eslint-disable @typescript-eslint/no-unused-vars */
  interface Array<T extends String> {
    concatenateAll(): string;
  }
}

String.prototype.sha256 = async function (): Promise<string> {
  return await sha256(this.toString());
};

Array.prototype.concatenateAll = function (): string {
  return this.sort().join("::");
};

async function sha256(input: string): Promise<string> {
  try {
    if (!crypto || !crypto.subtle) {
      return "sha256-crypto-api-not-available";
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");

    return hashHex;
  } catch {
    return "sha256-calculation-error";
  }
}
