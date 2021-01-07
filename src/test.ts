/* eslint-disable @typescript-eslint/no-magic-numbers */
import { OsmWay } from "@map-colonies/node-osm-elements";
import { Feature, Polygon } from "geojson";
import { Actions } from "./models";
import { createChangeFromLineOrPolygon } from ".";

const feature: Feature<Polygon, {}> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [35.200434, 31.7697903],
        [35.3002677, 31.7696671],
        [35.200611, 31.7694414],
        [35.2007129, 31.7696922],
        [36.200611, 31.7694414],
        [35.200434, 31.7697903],
      ],
    ],
  },
};

const osm: OsmWay = {
  id: 1,
  type: 'way',
  version: 1,
  nodes: [
    { id: 2, lon: 35.200434, lat: 31.7697903, type: 'node', version: 1 },
    { id: 3, lon: 35.2002677, lat: 31.7696671, type: 'node', version: 1 },
    { id: 4, lon: 35.200611, lat: 31.7694414, type: 'node', version: 1 },
    { id: 5, lon: 35.2007129, lat: 31.7696922, type: 'node', version: 1 },
    { id: 2, lon: 35.200434, lat: 31.7697903, type: 'node', version: 1 },
  ],
};

const change = createChangeFromLineOrPolygon(Actions.MODIFY, feature, osm);

console.log(JSON.stringify(change));
