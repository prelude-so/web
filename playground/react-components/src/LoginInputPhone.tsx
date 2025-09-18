import { useState } from "react";
import { LoginStatus } from "./login-types";
import { PrldSessionClient } from "@prelude.so/js-sdk";

interface ILoginInputPhoneProps {
  client: PrldSessionClient;
  setStatus: (value: LoginStatus) => void;
}

export default function LoginInputPhone(props: ILoginInputPhoneProps) {
  const { client } = props;
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async () => {
    try {
      setIsLoading(true);
      await client.startOTPLogin({ identifier: { type: "phone_number", value: phone } });
      props.setStatus(LoginStatus.WAIT_CODE);
    } catch (err) {
      props.setStatus(LoginStatus.WAIT_PHONE);
      console.error(err);
    } finally {
      setPhone("");
      setIsLoading(false);
    }
  };

  return (
    <>
      <h4>Phone Login</h4>
      <div style={{ marginBottom: "15px" }}>
        <label style={{ marginRight: "15px" }}>Phone Number</label>
        <input
          type="text"
          placeholder="Enter phone number"
          disabled={isLoading}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </div>
      <button type="submit" onClick={submit} disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit"}
      </button>
    </>
  );
}
