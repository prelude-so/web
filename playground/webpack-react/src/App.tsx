import { dispatchSignals } from "@prelude.so/js-sdk/signals/slim";
import { preStyle, Session } from "@prelude.so/react-components";
import { useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [dispatchId, setDispatchId] = useState<string>("");
  const handleDIspatch = async () => {
    if (process.env.PRELUDE_SDK_KEY) {
      const newDispatchId = await dispatchSignals(process.env.PRELUDE_SDK_KEY);
      setDispatchId(newDispatchId);
    }
  };

  return (
    <div>
      <h1>{`Prelude's web SDK Playground`}</h1>
      {process.env.PRELUDE_SDK_KEY ?
        <>
          <button type="button" onClick={handleDIspatch}>
            Dispatch
          </button>
          {dispatchId && <pre style={preStyle}>{dispatchId}</pre>}
        </>
      : <p>You need to set PRELUDE_SDK_KEY to dispatch signals.</p>}
      <h2>Session</h2>
      {process.env.PRELUDE_SESSION_DOMAIN ?
        <Session
          options={{
            domain: process.env.PRELUDE_SESSION_DOMAIN,
            sdkKey: process.env.PRELUDE_SDK_KEY,
          }}
        />
      : <p>You need to set PRELUDE_SESSION_DOMAIN to use the session SDK.</p>}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(<App />);
