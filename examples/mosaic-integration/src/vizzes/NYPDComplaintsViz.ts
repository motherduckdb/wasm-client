import * as vg from '@uwdata/vgplot';
import { Viz } from '../Viz';

// Requires the MotherDuck sample_data database to be present.
// It is automatically shared to all new MotherDuck accounts, but if you've detached it you can get it back with the following:
// ATTACH 'md:_share/sample_data/23b0d623-1361-421d-ae77-62d701d471e6';
// More details: https://motherduck.com/docs/sample-data-queries/attach-sample-database/

export class NYPDComplaintsViz implements Viz {
  async initialize() {
    // Materialize the data for the viz into a local temp table.
    await vg.coordinator().exec(
      `create or replace temp table complaints as 
        select year(created_date)::int as Year, count(*)::int as Complaints
        from sample_data.nyc.service_requests
        where Year < 2023
        and agency_name = 'New York City Police Department'
        group by 1
        order by 1;`
    );
    await vg.coordinator().exec(
      `create or replace temp table complaints_details as
        select year(created_date)::int as Year, complaint_type as Type, count(*)::int as Complaints
        from sample_data.nyc.service_requests
        where Year < 2023
        and agency_name = 'New York City Police Department'
        group by 1, 2
        order by 1, 3 desc;`
    );
  }

  render(): Element {
    const $yearSelection = vg.Selection.single();
    return (
      vg.vconcat(
        vg.plot(
          vg.barY(vg.from('complaints'), {
            x: 'Year',
            y: 'Complaints',
            fill: 'steelblue',
          }),
          vg.highlight({ by: $yearSelection }),
          vg.toggleX({ as: $yearSelection }),
          vg.xTickFormat('d'),
          vg.yGrid(true),
          vg.yTickFormat('s'),
        ),
        vg.table({
          from: 'complaints_details',
          filterBy: $yearSelection,
          width: {
            Year: 80,
            Type: 400,
            Complaints: 100
          },
          height: 400,
        })
      )
    );
  }
}
