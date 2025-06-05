export interface PrldIdentifier {
  type: "phone_number" | "email_address";
  value: string;
}

export type PrldProfile = Record<string, string>;

export interface PrldUser {
  accessToken: string;
  profile: PrldProfile;
}

export interface StartOTPLoginEndpointOptions {
  identifier: PrldIdentifier;
}

export interface ErrorResponse {
  ok: false;
  json: { code: string };
}

export interface APIResponse<T> {
  ok: true;
  json: T;
}

export interface RefreshTokenEndpointResponse {
  access_token: string;
  expires_at: number;
}
