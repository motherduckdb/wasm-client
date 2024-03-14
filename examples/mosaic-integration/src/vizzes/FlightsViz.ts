import * as vg from '@uwdata/vgplot';
import { Viz } from '../Viz';

// From https://uwdata.github.io/mosaic/examples/flights-200k.html
// and https://uwdata.github.io/mosaic/examples/flights-10m.html

// Depends on the mosaic_examples share. Attaches this by running the following:
// ATTACH 'md:_share/mosaic_examples/b01cfda8-239e-4148-a228-054b94cdc3b4';

export type FlightsTableName = 'flights_200k' | 'flights_10m';

const flights200KVizTableName = 'flights_200k_viz';
const flights10MVizTableName = 'flights_10m_viz';

export class FlightsViz implements Viz {
  private flightsTableName: FlightsTableName;
  private vizTable: string | null = null;
  constructor(flightsTableName: FlightsTableName = 'flights_200k') {
    this.flightsTableName = flightsTableName;
  }
  async initialize() {
    const rawTable = `mosaic_examples.main.${this.flightsTableName}`;
    if (this.flightsTableName === 'flights_10m') {
      await vg.coordinator().exec(`
      create temp view if not exists ${flights10MVizTableName} as
      select GREATEST(-60, LEAST(ARR_DELAY, 180))::DOUBLE AS delay, DISTANCE AS distance, DEP_TIME AS time
      from ${rawTable}
      `);
      this.vizTable = flights10MVizTableName;
    } else {
      await vg.coordinator().exec(`
      create temp view if not exists ${flights200KVizTableName} as
      select *
      from ${rawTable}
      `);
      this.vizTable = flights200KVizTableName;
    }
  }
  render(): Element {
    const $brush = vg.Selection.crossfilter();
    return vg.vconcat(
      vg.plot(
        vg.rectY(vg.from(this.vizTable, { filterBy: $brush }), {
          x: vg.bin('delay'),
          y: vg.count(),
          fill: 'steelblue',
          inset: 0.5,
        }),
        vg.intervalX({ as: $brush }),
        vg.xDomain(vg.Fixed),
        vg.yTickFormat('s'),
        vg.width(600),
        vg.height(200)
      ),
      vg.plot(
        vg.rectY(vg.from(this.vizTable, { filterBy: $brush }), {
          x: vg.bin('time'),
          y: vg.count(),
          fill: 'steelblue',
          inset: 0.5,
        }),
        vg.intervalX({ as: $brush }),
        vg.xDomain(vg.Fixed),
        vg.yTickFormat('s'),
        vg.width(600),
        vg.height(200)
      ),
      vg.plot(
        vg.rectY(vg.from(this.vizTable, { filterBy: $brush }), {
          x: vg.bin('distance'),
          y: vg.count(),
          fill: 'steelblue',
          inset: 0.5,
        }),
        vg.intervalX({ as: $brush }),
        vg.xDomain(vg.Fixed),
        vg.yTickFormat('s'),
        vg.width(600),
        vg.height(200)
      )
    );
  }
}
