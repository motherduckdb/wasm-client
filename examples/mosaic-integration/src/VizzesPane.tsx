import { useCallback, useEffect, useState } from 'react';
import { Viz } from './Viz';
import './VizzesPane.css';
import { MarkTypesViz, NYPDComplaintsViz, GaiaStarCatalogViz, EarthquakeViz, SeattleWeatherViz } from './vizzes';
import { FlightsViz } from './vizzes/FlightsViz';
import { FourSquareViz } from './vizzes/FourSquareViz';
import { NYCRidesViz } from './vizzes/NYCRides';

const vizMap: Record<string, Viz> = {
  'Mark Types': new MarkTypesViz(),
  'NYPD Complaints': new NYPDComplaintsViz(),
  'Earthquakes': new EarthquakeViz(),
  'Seattle Weather': new SeattleWeatherViz(),
  'Flights 200K': new FlightsViz('flights_200k'),
  'Flights 10M': new FlightsViz('flights_10m'),
  'Gaia Star Catalog': new GaiaStarCatalogViz(),
  'NYC Rides': new NYCRidesViz(),
  'Foursquare Places': new FourSquareViz(),
};
const vizNames = Object.keys(vizMap);

type HelpType = 'sample_data' | 'mosaic_examples';

export function VizzesPane() {
  const [showHelp, setShowHelp] = useState<HelpType | null>(null);
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
        setShowHelp(null);
        vizPane.innerHTML = 'Loading, please wait…';
        try {
          await viz.initialize();
          vizPane.innerHTML = '';
          vizPane.appendChild(viz.render());
        } catch (e) {
          const errorString = String(e);
          vizPane.innerHTML = errorString;
          if (/Catalog "sample_data" does not exist!/.test(errorString)) {
            setShowHelp('sample_data');
          } else if (/Catalog "mosaic_examples" does not exist!/.test(errorString)) {
            setShowHelp('mosaic_examples');
          }
        }
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
      {showHelp === 'sample_data' ? (
        <div id="help-pane">
          <div>This example requires the <span className="code">sample_data</span> share.</div>
          <div>To attach it to your account, run:</div>
          <pre>ATTACH 'md:_share/sample_data/23b0d623-1361-421d-ae77-62d701d471e6';</pre>
        </div>
      ) : null}
      {showHelp === 'mosaic_examples' ? (
        <div id="help-pane">
          <div>This example requires the <span className="code">mosaic_examples</span> share.</div>
          <div>To attach it to your account, run:</div>
          <pre>ATTACH 'md:_share/mosaic_examples/b01cfda8-239e-4148-a228-054b94cdc3b4';</pre>
        </div>
      ) : null}
    </div>
  );
}
