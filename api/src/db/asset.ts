import mongoose from "mongoose";

const LogoSchema = new mongoose.Schema({
  logoUri: { type: String, required: true },
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  color: { type: String, required: true },
});

const AssetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  networkName: { type: String, required: true },
  active: { type: Boolean, required: true },
  address: { type: String, required: true },
  color: { type: String, required: true },
  decimals: { type: Number, required: true },

  rawLogoUri: { type: String, required: true },
  symbol: { type: String, required: true },
  type: { type: String, required: true },
  visible: { type: Boolean, required: true },

  logos: [LogoSchema],
});

export const AssetModel = mongoose.model("Asset", AssetSchema);

export const getAssets = () => AssetModel.find({});
