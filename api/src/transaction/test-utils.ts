import { expect } from "vitest";
import { AssetLayers } from "./types";

export function compareAssetLayers({
  expected,
  received,
}: {
  expected: AssetLayers;
  received: AssetLayers;
}) {
  expect(received.length).toEqual(expected.length);
  expected.forEach((v, i) => {
    expect(received[i].length).toEqual(expected[i].length);
    Object.keys(expected[i]).forEach((assetId) => {
      expect(received[i][assetId].fraction).toBeCloseTo(
        expected[i][assetId].fraction,
        10
      );
    });
  });
}
