import * as vg from '@uwdata/vgplot';
import { useEffect, useState } from 'react';
import './ChartsPane.css';

export function ChartsPane() {
  const [plotPane, setPlotPane] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    (async () => {
      await vg
        .coordinator()
        .exec(
          'create or replace table primes as select * from (values (1,2), (2,3), (3,5), (4,7)) t(i, p);'
        );
      if (plotPane) {
        plotPane.innerHTML = '';
        plotPane.appendChild(
          vg.plot(
            vg.barY(vg.from('primes'), { x: 'i', y: 'p', fill: 'steelblue' })
          )
        );
      }
    })();
  }, [plotPane]);
  return (
    <div id="charts-pane">
      <div id="plot-pane" ref={setPlotPane}></div>
    </div>
  );
}
