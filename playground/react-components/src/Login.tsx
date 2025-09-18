import { useState } from "react";
import { LoginStatus } from "./login-types";
import LoginInputCode from "./LoginInputCode";
import LoginInputPhone from "./LoginInputPhone";
import { PrldSessionClient, PrldUser } from "@prelude.so/js-sdk";

export default function Login(props: { client: PrldSessionClient; onSuccess: (user: PrldUser) => void }) {
  const { client, onSuccess } = props;
  const [status, setStatus] = useState(LoginStatus.WAIT_PHONE);

  let component;
  switch (status) {
    case LoginStatus.WAIT_PHONE:
      component = <LoginInputPhone client={client} setStatus={setStatus} />;
      break;
    case LoginStatus.WAIT_CODE:
      component = <LoginInputCode client={client} onSuccess={onSuccess} />;
      break;
    default:
      component = null;
  }

  return component;
}
