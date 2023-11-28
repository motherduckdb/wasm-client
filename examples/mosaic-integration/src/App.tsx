import { useState } from 'react';
import './App.css';
import { ConnectPane } from './ConnectPane';
import { Header } from './Header';

export function App() {
  const [token, setToken] = useState<string | null>(null);

  return (
    <>
      <Header />
      <div id="content-pane">
        {!token ? (
          <ConnectPane connected={!!token} connect={setToken} />
        ) : (
          'Content goes here'
        )}
      </div>
    </>
  );
}
