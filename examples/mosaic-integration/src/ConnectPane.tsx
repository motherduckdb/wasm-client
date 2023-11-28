import { useCallback, useState } from "react";
import "./ConnectPane.css";

export function ConnectPane({
  connected,
  connect,
}: {
  connected: boolean;
  connect: (token: string) => void;
}) {
  const [token, setToken] = useState<string | null>(null);

  const handleTokenInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value)
  }, []);

  const handleConnectButtonClick = useCallback(() => {
    if (token) {
      connect(token);
    }
  }, [connect, token]);

  return (
    <div id="connect-pane">
      <div id="token-input-row">
        <input
          id="token-input"
          type="password"
          placeholder="Paste MotherDuck Service Token Here"
          onChange={handleTokenInputChange}
        />
      </div>
      <div id="connect-button-row">
        <button
          id="connect-button"
          disabled={connected || !token}
          onClick={handleConnectButtonClick}
        >
          Connect
        </button>
      </div>
    </div>
  );
}
