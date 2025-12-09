import { BaseElement, OsmChange, OsmNode, OsmWay } from '@map-colonies/node-osm-elements';
import { Feature, Geometry } from 'geojson';
import { replaceChangeGenerator } from './helpers';
import { Actions, FlattenedGeoJSONLine, FlattenedGeoJSONPoint, FlattenedGeoJSONPolygon, Tags } from './models';
import { createChangeFromNode, createNodeFromPoint } from './node';
import { createChangeFromWay, createWay } from './way';

export { FlattenedGeoJSONPoint, FlattenedGeoJSONLine, FlattenedGeoJSONPolygon, Tags, Actions };

export interface GetChangeOptions {
  shouldHandleLOD2?: boolean;
  shouldHandlePrecision?: boolean;
  maxTagKeyLength?: number;
  maxTagValueLength?: number;
}

export interface GetChangeCreate<T1 extends Feature<Geometry, Tags>> {
  action: Actions.CREATE;
  feature: T1;
  generatorValue?: string;
  options?: GetChangeOptions;
}

export interface GetChangeModify<T1 extends Feature<Geometry, Tags>, T2 extends BaseElement> {
  action: Actions.MODIFY;
  feature: T1;
  oldElement: T2;
  generatorValue?: string;
  options?: GetChangeOptions;
}

export interface GetChangeDelete<T2 extends BaseElement> {
  action: Actions.DELETE;
  oldElement: T2;
  generatorValue?: string;
}

export type GetChangeArgs<T1 extends Feature<Geometry, Tags>, T2 extends BaseElement> =
  | GetChangeCreate<T1>
  | GetChangeModify<T1, T2>
  | GetChangeDelete<T2>;

export const getChangeFromLine = (args: GetChangeArgs<FlattenedGeoJSONLine, OsmWay>): OsmChange => {
  let change: OsmChange;

  if (args.action === Actions.DELETE) {
    change = createChangeFromWay(Actions.DELETE, args.oldElement, []);
  } else {
    const element = args.action !== Actions.CREATE ? args.oldElement : undefined;
    const [way, orphanNodes] = createWay(args.feature, element, args.options);
    change = createChangeFromWay(args.action, way, orphanNodes);
  }

  return args.generatorValue !== undefined ? replaceChangeGenerator(change, args.generatorValue) : change;
};

export const getChangeFromPolygon = (args: GetChangeArgs<FlattenedGeoJSONPolygon, OsmWay>): OsmChange => {
  let change: OsmChange;

  if (args.action === Actions.DELETE) {
    change = createChangeFromWay(Actions.DELETE, args.oldElement, []);
  } else {
    const element = args.action !== Actions.CREATE ? args.oldElement : undefined;
    const [way, orphanNodes] = createWay(args.feature, element, args.options);
    change = createChangeFromWay(args.action, way, orphanNodes);
  }

  return args.generatorValue !== undefined ? replaceChangeGenerator(change, args.generatorValue) : change;
};

export const getChangeFromPoint = (args: GetChangeArgs<FlattenedGeoJSONPoint, OsmNode>): OsmChange => {
  let change: OsmChange;

  if (args.action === Actions.DELETE) {
    change = createChangeFromNode(Actions.DELETE, args.oldElement);
  } else {
    const element = args.action !== Actions.CREATE ? args.oldElement : undefined;
    const node = createNodeFromPoint(args.feature, element, args.options);
    change = createChangeFromNode(args.action, node);
  }

  return args.generatorValue !== undefined ? replaceChangeGenerator(change, args.generatorValue) : change;
};
