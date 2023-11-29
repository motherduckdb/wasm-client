import { useCallback, useEffect, useState } from 'react';
import './ChartsPane.css';
import { markTypes, primes } from './plots';

type Plot = {
  loadData(): Promise<void>;
  render(): Element;
};

const plotMap: Record<string, Plot> = {
  'Mark Types': markTypes,
  'Primes': primes,
};
const plotNames = Object.keys(plotMap);

export function ChartsPane() {
  const [plotPane, setPlotPane] = useState<HTMLDivElement | null>(null);
  const [plotName, setPlotName] = useState<string>(plotNames[0]);
  const handlePlotNameChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setPlotName(e.target.value);
    },
    []
  );
  useEffect(() => {
    (async () => {
      if (plotPane) {
        const plot = plotMap[plotName];
        await plot.loadData();
        plotPane.innerHTML = '';
        plotPane.appendChild(plot.render());
      }
    })();
  }, [plotPane, plotName]);
  return (
    <div id="charts-pane">
      <div id="selector-pane">
        <select
          id="plot-selector"
          value={plotName}
          onChange={handlePlotNameChange}
        >
          {plotNames.map((plotName) => (
            <option key={plotName}>{plotName}</option>
          ))}
        </select>
      </div>
      <div id="plot-pane" ref={setPlotPane}></div>
    </div>
  );
}
