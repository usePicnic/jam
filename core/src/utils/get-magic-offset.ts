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
      throw new Error(`Magic replacer ${magicReplacer} not found in data`);
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
export const MAGIC_REPLACERS = [
  "0x7fa9b53d120de9cd66856522bcf6d4a7797019996b607a7c9da51787beed38d1",
  "0x7f797936f1e9ca0b2ab9736276d6a755468ef28a6cefe78c0c0c3b1903f97a5f",
  "0xfc0d91281483a7a397ba61666b1e04aa7acf6184ba30abb79f710518a2784b4b",
  "0x7c64a1f239cac64bfe5283f735285083081ccd2394caa9163d2c00390393a747",
  "0x3a990135692b8be55f7d89aeda2bb2944ebb6cd7f6b6ab354d0bdcf4751f3a4f",
  "0xa8bb1dba73e4bb1561e14cda98be96dea6277e89ea6ee2ca76201c8bd69d9d97",
  "0x92f1c43fc97e8dbe6db3d91d0f71dfbb4034553dc28b3b6235ed42100487c262",
  "0x0532dd70200e52e46a61c0ae308bdf60b4e677095b8b72f5d7aaa12ae73a668c",
  "0x4dd1ada11d578103575e96f04e40edd9eb17cfdb33284c85d0a6614cdb94d851",
  "0xfe346da99ff561a26ac0d4f880438f3170b34f6d430b346d42c0e1ee41393e2b",
];

export const FRACTION_MULTIPLIER = 1000000;
