import { Position } from 'geojson';

export {};
declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchPositionOrder: (positions: Position[]) => CustomMatcherResult;
      toHaveChangeActionLengths: (createLength: number, modifyLength: number, deleteLength: number) => CustomMatcherResult;
    }
  }
}
