import { useCallback, useEffect, useState } from 'react';
import './ConnectPane.css';

const motherDuckUrl = 'https://app.motherduck.com';

const appName = 'WASM Client Library Example: Mosaic Integration';

export function ConnectPane({ connect }: { connect: (token: string) => void }) {
  const [token, setToken] = useState<string | null>(null);
  const [tokenInClipboard, setTokenInClipboard] = useState<boolean>(false);

  const handleTokenInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setToken(event.target.value);
    },
    []
  );

  const handleGetTokenButtonClick = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('tokenInClipboard', 'y');
    window.location.href = `${motherDuckUrl}/token-request?appName=${encodeURIComponent(
      appName
    )}&returnTo=${encodeURIComponent(url.toString())}`;
  }, []);

  const handleConnectButtonClick = useCallback(() => {
    if (token) {
      const url = new URL(window.location.href);
      if (url.searchParams.get('tokenInClipboard')) {
        url.searchParams.delete('tokenInClipboard');
        history.pushState({}, '', url);
      }
      connect(token);
    }
  }, [connect, token]);

  useEffect(() => {
    async function attemptConnect() {
      const url = new URL(window.location.href);
      if (url.searchParams.get('tokenInClipboard')) {
        // This only works in Chrome. User has to manually paste in other browsers (Firefox, Safari).
        if (navigator.clipboard.readText) {
          const token = await navigator.clipboard.readText();
          if (token) {
            url.searchParams.delete('tokenInClipboard');
            history.pushState({}, '', url);
            connect(token);
            return;
          }
        }
        setTokenInClipboard(true);
      }
    }
    attemptConnect();
  }, [connect]);

  const setTextInputRef = useCallback((element: HTMLInputElement | null) => {
    if (element) {
      element.focus();
    }
  }, []);

  return (
    <div id="connect-pane">
      <div
        id="token-in-clipboard-note"
        style={{ visibility: tokenInClipboard ? 'visible' : 'hidden' }}
      >
        Your token is in the clipboard. Paste it and click Connect.
      </div>
      <div id="token-input-row">
        <input
          ref={setTextInputRef}
          id="token-input"
          type="password"
          placeholder="Paste MotherDuck Service Token Here"
          onChange={handleTokenInputChange}
        />
      </div>
      <div id="connect-button-row">
        <button id="get-token-button" onClick={handleGetTokenButtonClick}>
          Get Token
        </button>
        <button
          id="connect-button"
          disabled={!token}
          onClick={handleConnectButtonClick}
        >
          Connect
        </button>
      </div>
    </div>
  );
}
