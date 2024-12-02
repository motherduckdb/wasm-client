import * as vg from '@uwdata/vgplot';
import { Viz } from '../Viz';

export class NYCRidesViz implements Viz {
  async initialize() {
    await vg.coordinator().exec(`INSTALL spatial`);
    await vg.coordinator().exec(`LOAD spatial`);
    await vg.coordinator().exec(
      `CREATE TABLE IF NOT EXISTS trips AS
        WITH rides AS (
          SELECT
            pickup_datetime::TIMESTAMP AS datetime,
            ST_Transform(ST_Point(pickup_latitude, pickup_longitude), 'EPSG:4326', 'ESRI:102718') AS pick,
            ST_Transform(ST_Point(dropoff_latitude, dropoff_longitude), 'EPSG:4326', 'ESRI:102718') AS drop
            from 'https://idl.uw.edu/mosaic-datasets/data/nyc-rides-2010.parquet'
        )
        SELECT
          (HOUR(datetime) + MINUTE(datetime)/60) AS time,
          ST_X(pick) AS px, ST_Y(pick) AS py,
          ST_X(drop) AS dx, ST_Y(drop) AS dy
        FROM rides`
    );
  }

  render(): Element {
    const $filter = vg.Selection.crossfilter();

    return vg.vconcat(
      vg.hconcat(
        vg.plot(
          vg.raster(
            vg.from("trips", { filterBy: $filter }),
            { x: "px", y: "py", bandwidth: 0 }
          ),
          vg.intervalXY({ as: $filter }),
          vg.text(
            [{ label: "Taxi Pickups" }],
            {
              dx: 10,
              dy: 10,
              text: "label",
              fill: "black",
              fontSize: "1.2em",
              frameAnchor: "top-left"
            }
          ),
          vg.width(335),
          vg.height(550),
          vg.margin(0),
          vg.xAxis(null),
          vg.yAxis(null),
          vg.xDomain([975000, 1005000]),
          vg.yDomain([190000, 240000]),
          vg.colorScale("symlog"),
          vg.colorScheme("blues")
        ),
        vg.hspace(10),
        vg.plot(
          vg.raster(
            vg.from("trips", { filterBy: $filter }),
            { x: "dx", y: "dy", bandwidth: 0 }
          ),
          vg.intervalXY({ as: $filter }),
          vg.text(
            [{ label: "Taxi Dropoffs" }],
            {
              dx: 10,
              dy: 10,
              text: "label",
              fill: "black",
              fontSize: "1.2em",
              frameAnchor: "top-left"
            }
          ),
          vg.width(335),
          vg.height(550),
          vg.margin(0),
          vg.xAxis(null),
          vg.yAxis(null),
          vg.xDomain([975000, 1005000]),
          vg.yDomain([190000, 240000]),
          vg.colorScale("symlog"),
          vg.colorScheme("oranges")
        )
      ),
      vg.vspace(10),
      vg.plot(
        vg.rectY(
          vg.from("trips"),
          { x: vg.bin("time"), y: vg.count(), fill: "steelblue", inset: 0.5 }
        ),
        vg.intervalX({ as: $filter }),
        vg.yTickFormat("s"),
        vg.xLabel("Pickup Hour →"),
        vg.width(680),
        vg.height(100)
      )
    );
  }
}
