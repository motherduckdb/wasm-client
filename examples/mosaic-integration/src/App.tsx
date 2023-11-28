import { coordinator, wasmConnector } from '@uwdata/vgplot';
import { useCallback, useState } from 'react';
import './App.css';
import { ChartsPane } from './ChartsPane';
import { ConnectPane } from './ConnectPane';
import { Header } from './Header';

export function App() {
  const [connected, setConnected] = useState<boolean>(false);
  const connect = useCallback(async (token: string) => {
    token;
    coordinator().databaseConnector(await wasmConnector());
    setConnected(true);
  }, []);

  return (
    <>
      <Header />
      <div id="content-pane">
        {!connected ? <ConnectPane connect={connect} /> : <ChartsPane />}
      </div>
    </>
  );
}
