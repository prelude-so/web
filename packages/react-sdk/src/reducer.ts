import { PrldUser } from "@prelude.so/js-sdk";
import { PrldSessionState } from "./state";

type Action =
  | { type: "START_OTP_LOGIN" }
  | { type: "OTP_CHECK_COMPLETE" }
  | { type: "RETRY_OTP" }
  | { type: "INITIALISED"; user: PrldUser }
  | { type: "REFRESH_COMPLETE"; user: PrldUser }
  | { type: "LOGOUT_COMPLETE" }
  | { type: "ERROR"; error: Error };

export const reducer = (state: PrldSessionState, action: Action): PrldSessionState => {
  switch (action.type) {
    case "START_OTP_LOGIN":
    case "RETRY_OTP":
      return {
        ...state,
        isLoading: true,
      };
    case "OTP_CHECK_COMPLETE":
      return {
        ...state,
        isLoading: false,
        error: undefined,
      };
    case "INITIALISED":
    case "REFRESH_COMPLETE":
      return {
        ...state,
        isAuthenticated: !!action.user,
        user: action.user,
      };
    case "LOGOUT_COMPLETE":
      return {
        ...state,
        isAuthenticated: false,
        user: undefined,
      };
    case "ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.error,
      };
  }
};
