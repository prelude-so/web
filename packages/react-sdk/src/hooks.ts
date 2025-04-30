import { useContext } from "react";
import { PrldSessionContext, PrldSessionContextValue } from "./context";

export const usePrldSession = () => {
  const value = useContext<PrldSessionContextValue>(PrldSessionContext);

  return value;
};
