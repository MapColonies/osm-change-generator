import { OsmChange, OsmNode } from '@map-colonies/node-osm-elements';
import { ALTITUDE_TAG, DEFAULT_ID } from './constants';
import { createEmptyChange, extractCoordinateValues } from './helpers';
import { Actions, CreateNodeArgs, FlattenedGeoJSONPoint } from './models';

export const createNode = (args: CreateNodeArgs): OsmNode => {
  const { lat, lon, id, tags, version } = args;
  return { id: id ?? DEFAULT_ID, lon, lat, version: version ?? 0, type: 'node', tags };
};

export const createNodeFromPoint = (point: FlattenedGeoJSONPoint, oldNode?: OsmNode): OsmNode => {
  const [lon, lat, alt] = extractCoordinateValues(point.geometry.coordinates);

  const node = createNode({ lon, lat, tags: alt !== undefined ? { ...point.properties, [ALTITUDE_TAG]: alt.toString() } : point.properties });

  if (oldNode) {
    node.id = oldNode.id;
    node.version = oldNode.version;
  }

  return node;
};

export const createChangeFromNode = (action: Actions, node: OsmNode): OsmChange => {
  const change = createEmptyChange();

  change[action]?.push(node);

  return change;
};
