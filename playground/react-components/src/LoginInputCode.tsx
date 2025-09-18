import { useState } from "react";
import { PrldSessionClient, PrldUser } from "@prelude.so/js-sdk";

export default function LoginInputCode(props: {
  client: PrldSessionClient;
  onSuccess: (user: PrldUser) => void;
}) {
  const { client, onSuccess } = props;
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async () => {
    try {
      setIsLoading(true);
      await client.checkOTP(code);
      const { user } = await client.refresh();
      onSuccess(user);
    } catch (err) {
      console.error(err);
    } finally {
      setCode("");
      setIsLoading(false);
    }
  };

  return (
    <>
      <h4>Enter OTP</h4>
      <div style={{ marginBottom: "15px" }}>
        <label style={{ marginRight: "15px" }}>OTP Code</label>
        <input
          type="text"
          placeholder="code"
          disabled={isLoading}
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
      </div>
      <button type="submit" onClick={submit} disabled={isLoading}>
        Submit
      </button>
    </>
  );
}
