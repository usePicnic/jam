import { test } from "vitest";
import { AssetStore } from "core/src/transaction/types";
import { findSlots } from "core/src/simulation/find-slots";
import { getProvider } from "core/src/utils/get-provider";

test("findSlots", async () => {
  const assetStore = new AssetStore();
  const provider = await getProvider({ chainId: 137 });

  console.log(
    await findSlots({
      asset: assetStore.getAssetById("9b09afe5-c740-4cd7-a247-4fe4950a7f33"),
      provider,
    })
  );
}, 60000);
