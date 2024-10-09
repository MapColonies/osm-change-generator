import { Position } from 'geojson';

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchPositionOrder: (positions: Position[]) => CustomMatcherResult;
      toMatchPositionOrder3D: (positions: Position[]) => CustomMatcherResult;
      toHaveChangeActionLengths: (createLength: number, modifyLength: number, deleteLength: number) => CustomMatcherResult;
    }
  }
}
