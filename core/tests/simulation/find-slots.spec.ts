import { test } from "vitest";
import { AssetStore } from "core/src/transaction/types";
import { findSlots } from "core/src/simulation/find-slots";
import { getProvider } from "core/src/utils/get-provider";

test("findSlots", async () => {
  const assetStore = new AssetStore();
  const provider = await getProvider({ chainId: 137 });

  console.log(
    await findSlots({
      asset: assetStore.getAssetById("371b83f1-3301-4c69-b3ad-8d199c6d1774"),
      provider,
    })
  );

  console.log(
    await findSlots({
      asset: assetStore.getAssetById("46062b41-6661-4eae-bc11-4d4ec07b062f"),
      provider,
    })
  );
}, 60000);
