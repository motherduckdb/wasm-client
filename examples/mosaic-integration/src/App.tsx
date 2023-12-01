import { coordinator } from '@uwdata/vgplot';
import { useCallback, useState } from 'react';
import './App.css';
import { ConnectPane } from './ConnectPane';
import { Header } from './Header';
import { VizzesPane } from './VizzesPane';
import { mdConnector } from './mdConnector';

export function App() {
  const [connected, setConnected] = useState<boolean>(false);
  const connect = useCallback(async (token: string) => {
    coordinator().databaseConnector(mdConnector(token));
    setConnected(true);
  }, []);

  return (
    <>
      <Header />
      <div id="content-pane">
        {!connected ? <ConnectPane connect={connect} /> : <VizzesPane />}
      </div>
    </>
  );
}
