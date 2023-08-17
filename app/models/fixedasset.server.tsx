import { FixedAsset } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "~/db.server";
import { createSubAccount } from "./subaccount.server";
import {
  ACCELERATED_DEPRECIATION,
  ACT_FIXED_ASSET,
  TRX_DEBIT,
  TRX_SOURCE_PAYMENT,
} from "assets/helper/constants";
import { createTransaction, getLastOrderId } from "./transaction.server";

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
    | "depreciation"
  >
) {
  // Sanitize
  fixedAsset.acquisitionCost = !!fixedAsset.acquisitionCost
    ? new Decimal(fixedAsset.acquisitionCost.replaceAll(",", ""))
    : new Decimal(0);
  fixedAsset.depreciation = !!fixedAsset.depreciation
    ? new Decimal(fixedAsset.depreciation.replaceAll(",", ""))
    : new Decimal(0);
  fixedAsset.depreciationType = !!fixedAsset.depreciation
    ? parseInt(fixedAsset.depreciation)
    : -1;
  fixedAsset.acquisitionDate = !!fixedAsset.acquisitionDate
    ? new Date(fixedAsset.acquisitionDate)
    : new Date();

  // depreciation rate shouldn't be more than 100% or less than  0%
  if (fixedAsset.depreciationType == ACCELERATED_DEPRECIATION) {
    const depreciation = !!fixedAsset.depreciation
      ? fixedAsset.depreciation
      : 0.0;
    if (depreciation > new Decimal(100)) {
      fixedAsset.depreciation = new Decimal(100);
    } else if (depreciation < new Decimal(0)) {
      fixedAsset.depreciation = new Decimal(0);
    }
  } else {
    // for straight line depreciation
    const depreciation = !!fixedAsset.depreciation
      ? fixedAsset.depreciation
      : 0.0;
    // if depreciation is bigger than acquisitioncost, use acquisition cost as depreciation
    if (depreciation > fixedAsset.acquisitionCost) {
      fixedAsset.depreciation = fixedAsset.acquisitionCost;
    }
  }

  const { id, name } = fixedAsset;

  var order = await getLastOrderId();
  var orderId = 0;
  if (typeof order == "number") {
    orderId = orderId;
  }
  const transactionData = {
    trxTime: new Date(fixedAsset.acquisitionDate),
    orderId: orderId,
    sourceTrx: TRX_SOURCE_PAYMENT,
    controlTrx: 1,
    accountId: ACT_FIXED_ASSET,
    subAccountId: id,
    type: TRX_DEBIT,
    unitPrice: fixedAsset.acquisitionCost,
    quantity: 1,
    amount: fixedAsset.acquisitionCost,
    userId: "system",
  };

  await createSubAccount({ id, name, accountId: ACT_FIXED_ASSET });

  await createTransaction(transactionData);

  return prisma.fixedAsset.create({ data: fixedAsset });
}

export async function getAllFixedAsset() {
  return prisma.fixedAsset.findMany();
}
