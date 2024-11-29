import * as vg from '@uwdata/vgplot';
import { Viz } from '../Viz';

export class FourSquareViz implements Viz {
  async initialize() {
    await vg.coordinator().exec(`INSTALL spatial`);
    await vg.coordinator().exec(`LOAD spatial`);
    await vg.coordinator().exec(`
    CREATE TABLE IF NOT EXISTS fsq_places_by_year_nyc AS
      WITH dates_location AS
        (
          SELECT
            date_created::TIMESTAMP AS date_created,
            date_closed::TIMESTAMP AS date_closed,
            ST_Transform(ST_Point(latitude, longitude), 'EPSG:4326', 'ESRI:102718') AS location,
            list_any_value(fsq_category_labels) as label
            FROM foursquare_places
            WHERE locality='New York'
        )
        SELECT
          YEAR(date_created) AS created,
          YEAR(date_closed) AS closed,
          ST_X(location) AS x,
          ST_Y(location) AS y,
          label,
          level1_category_name,
          level2_category_name
        FROM dates_location dl
        JOIN foursquare_categories cat
        ON dl.label = cat.category_label
    `);
    await vg.coordinator().exec(`
    CREATE TEMP TABLE IF NOT EXISTS fsq_places AS
      SELECT * FROM fsq_places_by_year_nyc
      WHERE
        x > 900000
        AND x < 1100000
        AND y > 100000
        AND y < 400000
    `);
  }

  render(): Element {
    const $range = vg.Selection.crossfilter();
    const $domain = vg.Param.array([
      "Arts and Entertainment",
      "Business and Professional Services",
      "Community and Government",
      "Dining and Drinking",
      "Event",
      "Health and Medicine",
      "Landmarks and Outdoors",
      "Retail",
      "Sports and Recreation",
      "Travel and Transportation",
    ]);
    // const $highlight = vg.Selection.intersect();

    return vg.vconcat(
      vg.hconcat(
        vg.plot(
          vg.raster(
            vg.from("fsq_places", { filterBy: $range }),
            { x: "x", y: "y", bandwidth: 0 }
          ),
          vg.text(
            [{ label: "Places of interest in NYC" }],
            {
              dx: 10,
              dy: 10,
              text: "label",
              fill: "black",
              fontSize: "1.2em",
              frameAnchor: "top-left"
            }
          ),
          // vg.intervalXY({as: $range}),
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
        vg.vspace(10),
        vg.plot(
          vg.barX(
            vg.from("fsq_places", {filterBy: $range}),
            {
              x: vg.count(),
              y: "level1_category_name",
              fill: "level1_category_name",
            }
          ),
          // vg.toggleY({as: $range}),
          // vg.toggleY({as: $highlight}),
          // vg.highlight({by: $highlight}),
          vg.colorDomain(vg.Fixed),
          vg.yLabel("Level 1 category"),
          vg.xTickFormat("s"),
          vg.xLabel("count"),
          vg.yDomain($domain),
          vg.colorDomain($domain),
          vg.width(680),
          vg.height(550),
          vg.marginTop(5),
          vg.marginLeft(220),
          vg.marginBottom(35)
        )
      ),
      vg.hspace(10),
      vg.plot(
        vg.rectY(
          vg.from("fsq_places"),
          { x: vg.bin("created"), y: vg.count(), fill: "steelblue", inset: 0.5 }
        ),
        vg.intervalX({ as: $range }),
        vg.yTickFormat("s"),
        vg.xLabel("Year created →"),
        vg.width(680),
        vg.height(100)
      ),
      vg.hspace(10),
      vg.plot(
        vg.rectY(
          vg.from("fsq_places"),
          { x: vg.bin("closed"), y: vg.count(), fill: "steelblue", inset: 0.5 }
        ),
        vg.yDomain([0, 10000]),
        vg.intervalX({ as: $range }),
        vg.yTickFormat("s"),
        vg.xLabel("Year closed →"),
        vg.width(680),
        vg.height(100)
      )
    );
  }
}
