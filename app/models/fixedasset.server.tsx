import { FixedAsset } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "~/db.server";
import { createSubAccount } from "./subaccount.server";
import { ACT_FIXED_ASSET } from "assets/helper/constants";

export async function createFixedAsset(
  fixedAsset: Pick<
    FixedAsset,
    | "id"
    | "name"
    | "subAccountId"
    | "acquisitionDate"
    | "description"
    | "acquisitionCost"
    | "depreciationType"
    | "depreciationRate"
    | "depreciationValue"
  >
) {
  // depreciation rate shouldn't be more than 100% or less than 0%
  const depreciationRate = !! fixedAsset.depreciationRate ? fixedAsset.depreciationRate : 0.0;
  if (depreciationRate > new Decimal(100)) {
    fixedAsset.depreciationRate = new Decimal(100);
  } else if (depreciationRate < new Decimal(0)) {
    fixedAsset.depreciationRate = new Decimal(0);
  }
  const { id, name } = fixedAsset;

  await createSubAccount({ id, name, accountId: ACT_FIXED_ASSET });
  return prisma.fixedAsset.create({ data: fixedAsset });
}
