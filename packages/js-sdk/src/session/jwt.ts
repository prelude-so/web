interface JwtHeader {
  typ?: string;
  alg?: string;
  kid?: string;
}

interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string[] | string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;

  cc: Record<string, string>;
  sid: string;
  [propName: string]: unknown;
}

interface JWT {
  encoded: { header: string; payload: string; signature: string };
  header: JwtHeader;
  claims: JwtPayload;
}

export function encodeB64(input: string) {
  return btoa(input);
}

// https://stackoverflow.com/questions/30106476/
export function decodeB64(input: string) {
  return decodeURIComponent(
    atob(input)
      .split("")
      .map((c) => {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );
}

export function urlEncodeB64(input: string) {
  const b64Chars: Record<string, string> = { "+": "-", "/": "_", "=": "" };
  return encodeB64(input).replace(/[+/=]/g, (m: string) => b64Chars[m]);
}

export function urlDecodeB64(input: string) {
  return decodeB64(input.replace(/_/g, "/").replace(/-/g, "+"));
}

export function decode(token: string): JWT {
  const parts = (token || "").split(".");
  const [header, payload, signature] = parts;

  if (parts.length !== 3 || !header || !payload || !signature) {
    throw new Error("JWT could not be decoded");
  }

  const payloadJSON = JSON.parse(urlDecodeB64(payload));
  const claims = {} as JwtPayload;

  Object.keys(payloadJSON).forEach((k) => {
    claims[k] = payloadJSON[k];
  });

  const decodedToken = {
    encoded: { header, payload, signature },
    header: JSON.parse(urlDecodeB64(header)),
    claims,
  };

  return decodedToken;
}
