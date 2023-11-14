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

  console.log(
    await findSlots({
      asset: assetStore.getAssetById("03f36f17-bbc2-4d8d-b0b2-9ce0f534d708"),
      provider,
    })
  );

  console.log(
    await findSlots({
      asset: assetStore.getAssetById("33b90e57-ded7-4da9-92c9-6d3ed0f1c53d"),
      provider,
    })
  );
}, 60000);
