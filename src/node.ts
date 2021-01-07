import { OsmChange, OsmNode } from '@map-colonies/node-osm-elements';
import { DEFAULT_ID } from './constants';
import { createEmptyChange } from './helpers';
import { Actions, CreateNodeArgs, OsmPoint } from './models';

export const createNode = (args: CreateNodeArgs): OsmNode => {
  const { lat, lon, id, tags, version } = args;
  return { id: id ?? DEFAULT_ID, lon, lat, version: version ?? 0, type: 'node', tags };
};

export const createNodeFromPoint = (point: OsmPoint, oldNode?: OsmNode): OsmNode => {
  const [lon, lat] = point.geometry.coordinates;
  const node = createNode({ lon, lat, tags: point.properties });

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
