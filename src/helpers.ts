import { OsmChange } from '@map-colonies/node-osm-elements';
import { Feature, LineString, Polygon, Position } from 'geojson';
import { ALTITUDE_COORDINATE_INDEX, generatorName } from './constants';
import { Tags } from './models';

const extractAltitudeSafely = (coordinates: Position): number | undefined =>
  coordinates.length === ALTITUDE_COORDINATE_INDEX + 1 ? coordinates[ALTITUDE_COORDINATE_INDEX] : undefined;

export const createEmptyChange = (): OsmChange => ({
  type: 'osmchange',
  generator: generatorName,
  version: '0.6',
  create: [],
  modify: [],
  delete: [],
});

export const isFeatureCoordinatesClosed = (coordinates: Position[]): boolean => {
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  return first[0] === last[0] && first[1] === last[1];
};

export const extractCoordinates = (feature: Feature<Polygon | LineString, Tags>): Position[] =>
  feature.geometry.type === 'Polygon' ? feature.geometry.coordinates[0] : feature.geometry.coordinates;

export const replaceChangeGenerator = (change: OsmChange, generatorValue: string): OsmChange => {
  change.generator = generatorValue;
  return change;
};

export const extractCoordinateValues = (coordinates: Position): [number, number, number | undefined] => [
  coordinates[0],
  coordinates[1],
  extractAltitudeSafely(coordinates),
];
