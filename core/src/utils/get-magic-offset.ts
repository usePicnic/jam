export function getMagicOffsets({
  data,
  magicReplacers,
}: {
  data: string;
  magicReplacers: string[];
}): { data: string; offsets: number[] } {
  let updatedData = data;
  const offsets: number[] = [];

  for (const magicReplacer of magicReplacers) {
    const magicReplacerWithout0x = magicReplacer.substring(2);
    const indexOf = updatedData.indexOf(magicReplacerWithout0x);

    if (indexOf === -1) {
      // Handle the error case according to your requirement
      continue;
    }

    const before = updatedData.substring(0, indexOf);
    const after = updatedData.substring(indexOf + 64);
    const zeroReplacer = "0".repeat(64);

    updatedData = before + zeroReplacer + after;
    offsets.push(indexOf / 2 - 1);
  }

  return {
    data: updatedData,
    offsets: offsets,
  };
}

export const MAGIC_REPLACER_0 =
  "0x22e876a8f23cf658879db6745b42ab3e944e526ad8e0eb1cad27a4cac1d0621f";
export const MAGIC_REPLACER_1 =
  "0xefda6e4e83cdb7f85cc1224007eaec8516b2c28011282b93b03063709a6e641a";
export const FRACTION_MULTIPLIER = 1000000;
