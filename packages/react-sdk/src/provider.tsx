import {
  PrldIdentifier,
  PrldSessionClient,
  PrldSessionClientOptions,
  UnauthorizedError,
} from "@prelude.so/js-sdk";
import { ReactNode, useCallback, useEffect, useReducer, useRef, useState } from "react";

import { PrldSessionContext } from "./context";
import { reducer } from "./reducer";
import { initialSessionState } from "./state";

interface PrldSessionProviderProps {
  children: ReactNode;
  clientOptions: PrldSessionClientOptions;
}

export const PrldSessionProvider = ({ children, clientOptions }: PrldSessionProviderProps) => {
  const [client] = useState<PrldSessionClient>(() => new PrldSessionClient(clientOptions));

  const [state, dispatch] = useReducer(reducer, initialSessionState);
  const didInitialise = useRef(false);

  useEffect(() => {
    if (didInitialise.current) {
      return;
    }
    didInitialise.current = true;

    const refresh = async () => {
      try {
        const user = await client.getUser();
        dispatch({ type: "INITIALISED", user });
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          dispatch({ type: "ERROR", error });
          return;
        }
        throw error;
      }
    };

    refresh();
  }, [client]);

  const getUser = useCallback(async () => {
    try {
      const user = await client.getUser();
      dispatch({ type: "GET_USER_COMPLETE", user });
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        dispatch({ type: "ERROR", error });
        return;
      }
      throw error;
    }
  }, [client]);

  const startOTPLogin = useCallback(
    async (identifier: PrldIdentifier) => {
      try {
        dispatch({ type: "START_OTP_LOGIN" });
        await client.startOTPLogin({ identifier });
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          dispatch({ type: "ERROR", error });
          return;
        }
        throw error;
      }
    },
    [client],
  );

  const checkOTP = useCallback(
    async (code: string) => {
      try {
        await client.checkOTP(code);
        dispatch({ type: "OTP_CHECK_COMPLETE" });
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          dispatch({ type: "ERROR", error });
          return;
        }
        throw error;
      }
    },
    [client],
  );

  const retryOTP = useCallback(async () => {
    try {
      dispatch({ type: "RETRY_OTP" });
      await client.retryOTP();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        dispatch({ type: "ERROR", error });
        return;
      }
      throw error;
    }
  }, [client]);

  const refresh = useCallback(async () => {
    try {
      const { user } = await client.refresh();
      dispatch({ type: "REFRESH_COMPLETE", user });
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        dispatch({ type: "ERROR", error });
        return;
      }
      throw error;
    }
  }, [client]);

  const logout = useCallback(async () => {
    try {
      await client.logout();
      dispatch({ type: "LOGOUT_COMPLETE" });
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        dispatch({ type: "ERROR", error });
        return;
      }
      throw error;
    }
  }, [client]);

  return (
    <PrldSessionContext.Provider
      value={{
        ...state,
        startOTPLogin,
        checkOTP,
        retryOTP,
        refresh,
        getUser,
        logout,
      }}
    >
      {children}
    </PrldSessionContext.Provider>
  );
};
