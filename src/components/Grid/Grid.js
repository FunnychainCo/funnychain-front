import React from "react";
import {
  CellMeasurer,
  CellMeasurerCache,
  createMasonryCellPositioner,
  Masonry
} from "react-virtualized";
import tiles from "./testData/testData";

// Default sizes help Masonry decide how many images to batch-measure
const cache = new CellMeasurerCache({
  defaultHeight: 230,
  defaultWidth: 230,
  fixedWidth: true
});

// Our masonry layout will use 3 columns with a 10px gutter between
const cellPositioner = createMasonryCellPositioner({
  cellMeasurerCache: cache,
  columnCount: 3,
  columnWidth: 230,
  spacer: 25
});

function cellRenderer({ index, key, parent, style }) {
  const tile = tiles[index];

  return (
    <CellMeasurer cache={cache} index={index} key={key} parent={parent}>
      <div className="cell" style={{ ...style }}>
        <img
          src={tile.img}
          style={{ width: tile.width, height: tile.height }}
        />
      </div>
    </CellMeasurer>
  );
}

const Grid = () => (
  <Masonry
    cellCount={tiles.length}
    cellMeasurerCache={cache}
    cellPositioner={cellPositioner}
    cellRenderer={cellRenderer}
    autoHeight={true}
    height={2000}
    width={1000}
    style={{ padding: "1em" }}
  />
);

export default Grid;
