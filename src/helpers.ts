import { OsmChange } from '@map-colonies/node-osm-elements';
import { Feature, LineString, Polygon, Position } from 'geojson';
import { generatorName } from './constants';
import { Tags } from './models';

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
