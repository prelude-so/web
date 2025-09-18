import { PrldSessionClient, PrldSessionClientOptions, PrldUser } from "@prelude.so/js-sdk";
import { useEffect, useState } from "react";
import Login from "./Login";
import { preStyle } from "./style";

export function Session(props: { options: PrldSessionClientOptions }) {
  const { options } = props;
  const client = new PrldSessionClient(options);
  const [user, setUser] = useState<PrldUser>();

  useEffect(() => {
    const fetchUser = async () => {
      const { user } = await client.refresh();
      setUser(user);
    };

    void fetchUser();
  }, []);

  return (
    <div>
      {user ?
        <>
          <pre style={preStyle}>{JSON.stringify(user, null, 2)}</pre>
          <div>
            <button
              style={{ marginRight: "20px" }}
              type="button"
              onClick={async () => {
                try {
                  const { user } = await client.refresh();
                  setUser(user);
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              Refresh
            </button>
            <button
              style={{ marginRight: "20px" }}
              type="button"
              onClick={async () => {
                try {
                  const profile = await client.getProfile();
                  if (user) {
                    if (profile) {
                      setUser({ ...user, profile });
                    } else {
                      setUser({ ...user, profile: {} });
                    }
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              Get Profile from cache
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await client.logout();
                  setUser(undefined);
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              Logout
            </button>
          </div>
        </>
      : <>
          <Login client={client} onSuccess={setUser} />
        </>
      }
    </div>
  );
}
