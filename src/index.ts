import { BaseElement, OsmChange, OsmNode, OsmWay } from '@map-colonies/node-osm-elements';
import { Feature, Geometry } from 'geojson';
import { Actions, OsmLine, OsmPoint, OsmPolygon, Tags } from './models';
import { createChangeFromNode, createNodeFromPoint } from './node';
import { createChangeFromWay, createWay } from './way';

interface GetChangeCreate<T1 extends Feature<Geometry, Tags>> {
  action: Actions.CREATE,
  feature: T1
}

interface GetChangeModify<T1 extends Feature<Geometry, Tags>, T2 extends BaseElement> {
  action: Actions.MODIFY,
  feature: T1,
  oldElement: T2
}

interface GetChangeDelete<T2 extends BaseElement,> {
  action: Actions.DELETE,
  oldElement: T2
}

type GetChangeArgs<T1 extends Feature<Geometry, Tags>, T2 extends BaseElement> = GetChangeCreate<T1> | GetChangeModify<T1, T2> | GetChangeDelete<T2>


export const getChangeFromLine = (args: GetChangeArgs<OsmLine, OsmWay>): OsmChange => {
  if (args.action === Actions.DELETE) {
    return createChangeFromWay(Actions.DELETE, args.oldElement, [])
  }
  const element = args.action !== Actions.CREATE ? args.oldElement : undefined;
  const [way, orphandedNodes] = createWay(args.feature, element);
  return createChangeFromWay(args.action, way, orphandedNodes);
};

export const getChangeFromPolygon = (args: GetChangeArgs<OsmPolygon, OsmWay>): OsmChange => {
  if (args.action === Actions.DELETE) {
    return createChangeFromWay(Actions.DELETE, args.oldElement, [])
  }
  const element = args.action !== Actions.CREATE ? args.oldElement : undefined;
  const [way, orphandedNodes] = createWay(args.feature, element);
  return createChangeFromWay(args.action, way, orphandedNodes);
};

export const getChangeFromPoint = (args: GetChangeArgs<OsmPoint, OsmNode>): OsmChange => {
  if (args.action === Actions.DELETE) {
    return createChangeFromNode(Actions.DELETE, args.oldElement)
  }
  const element = args.action !== Actions.CREATE ? args.oldElement : undefined;
  const node = createNodeFromPoint(args.feature, element);
  return createChangeFromNode(args.action, node);
};
