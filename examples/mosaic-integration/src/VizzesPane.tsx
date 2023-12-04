import { useCallback, useEffect, useState } from 'react';
import { Viz } from './Viz';
import './VizzesPane.css';
import { MarkTypesViz, NYPDComplaintsViz } from './vizzes';
import { FlightsViz } from './vizzes/FlightsViz';

const vizMap: Record<string, Viz> = {
  'Mark Types': new MarkTypesViz(),
  'NYPD Complaints': new NYPDComplaintsViz(),
  'Flights 200K': new FlightsViz('flights_200k'),
  'Flights 10M': new FlightsViz('flights_10m'),
};
const vizNames = Object.keys(vizMap);

export function VizzesPane() {
  const [vizPane, setVizPane] = useState<HTMLDivElement | null>(null);
  const [currentVizName, setCurrentVizName] = useState<string>(vizNames[0]);
  const handleCurrentVizNameChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCurrentVizName(e.target.value);
    },
    []
  );
  useEffect(() => {
    (async () => {
      if (vizPane) {
        const viz = vizMap[currentVizName];
        vizPane.innerHTML = 'Loading, please wait…';
        await viz.initialize();
        vizPane.innerHTML = '';
        vizPane.appendChild(viz.render());
      }
    })();
  }, [currentVizName, vizPane]);
  return (
    <div id="vizzes-pane">
      <div id="selector-pane">
        <select
          id="viz-selector"
          value={currentVizName}
          onChange={handleCurrentVizNameChange}
        >
          {vizNames.map((vizName) => (
            <option key={vizName}>{vizName}</option>
          ))}
        </select>
      </div>
      <div id="viz-pane" ref={setVizPane}></div>
    </div>
  );
}
