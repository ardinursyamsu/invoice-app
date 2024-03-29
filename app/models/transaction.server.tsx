import { Prisma, Transaction } from "@prisma/client";
import { prisma } from "~/db.server";

export async function createTransaction(
  transaction: Pick<
    Transaction,
    "trxTime" | "orderId" | "sourceTrx" | "controlTrx" | "accountId" | "subAccountId" | "type" | "unitPrice" | "quantity" | "amount" | "userId"
  >
) {
  return prisma.transaction.create({ data: transaction });
}

export async function getLastOrderId() {
  const ids = await prisma.transaction.findMany({
    select: { orderId: true },
    orderBy: { orderId: "desc" },
  });

  const lastId = ids.length === 0 ? 0 : ids[0];

  return lastId;
}

export async function getAllTransactionsWithAccount() {
  return await prisma.transaction.findMany({
    include: { account: true, subAccount: true },
  });
}

export async function getTransactionsByAccount(accountId: string) {
  let credit = await prisma.transaction.aggregate({
    where: { accountId: accountId, type: "cr" },
    _sum: { amount: true },
  });

  let debit = await prisma.transaction.aggregate({
    where: { accountId: accountId, type: "db" },
    _sum: { amount: true },
  });

  if (credit._sum.amount == null) {
    credit._sum.amount = new Prisma.Decimal(0);
  }
  if (debit._sum.amount == null) {
    debit._sum.amount = new Prisma.Decimal(0);
  }

  let accountType = await prisma.account.findFirst({
    select: { type: true },
    where: { id: accountId },
  });

  if (accountType == null) {
    accountType = { type: "" };
  }

  let amount = 0;

  switch (accountType.type) {
    case "asset":
      amount = Number(debit._sum.amount) - Number(credit._sum.amount);
      break;
    case "liability":
      amount = Number(credit._sum.amount) - Number(debit._sum.amount);
      break;
    case "equity":
      amount = Number(credit._sum.amount) - Number(debit._sum.amount);
      break;
    case "income":
      amount = Number(credit._sum.amount) - Number(debit._sum.amount);
      break;
    case "expense":
      amount = Number(debit._sum.amount) - Number(credit._sum.amount);
      break;
  }

  return { account: accountId, type: accountType, amount: amount };
}

export async function getSubAccountNetAmount(subAccountId: string) {
  let subAccount = await prisma.subAccount.findFirst({
    where: { id: subAccountId },
    include: { account: true },
  });

  const accountType = subAccount?.account.type;

  const accountId = subAccount?.account.id;

  let credit = await prisma.transaction.aggregate({
    where: { subAccountId: subAccountId, type: "cr" },
    _sum: { amount: true },
  });

  let debit = await prisma.transaction.aggregate({
    where: { subAccountId: subAccountId, type: "db" },
    _sum: { amount: true },
  });

  if (credit._sum.amount == null) {
    credit._sum.amount = new Prisma.Decimal(0);
  }
  if (debit._sum.amount == null) {
    debit._sum.amount = new Prisma.Decimal(0);
  }

  let amount = 0;
  switch (accountType) {
    case "asset":
      amount = Number(debit._sum.amount) - Number(credit._sum.amount);
      break;
    case "liability":
      amount = Number(credit._sum.amount) - Number(debit._sum.amount);
      break;
    case "equity":
      amount = Number(credit._sum.amount) - Number(debit._sum.amount);
      break;
    case "income":
      amount = Number(credit._sum.amount) - Number(debit._sum.amount);
      break;
    case "expense":
      amount = Number(credit._sum.amount) - Number(debit._sum.amount);
      break;
  }

  return { subAccountId, accountId, accountType, amount };
}

export async function getQuantityInventoryItem(subAccountId: string) {
  let credit = await prisma.transaction.aggregate({
    where: { subAccountId: subAccountId, type: "cr" },
    //    _count: { amount: true },
    _sum: { amount: true, quantity: true },
  });

  let debit = await prisma.transaction.aggregate({
    where: { subAccountId: subAccountId, type: "db" },
    //    _count: { amount: true },
    _sum: { amount: true, quantity: true },
  });

  const qty_cr = !!credit._sum.quantity ? credit._sum.quantity : 0;
  const qty_db = !!debit._sum.quantity ? debit._sum.quantity : 0;
  const quantity = Number(qty_db) - Number(qty_cr);

  const sum_cr = !!credit._sum.amount ? credit._sum.amount : 0;
  const sum_db = !!debit._sum.amount ? debit._sum.amount : 0;

  let avgPrice = (Number(sum_db) - Number(sum_cr)) / quantity;
  avgPrice = (!!avgPrice && avgPrice) || 0;

  return { subAccountId, quantity, avgPrice };
}

export async function getAllTransaction() {
  return await prisma.transaction.findMany();
}

export async function getAllTransactionBySource(sourceTrx: string) {
  return await prisma.transaction.findMany({
    where: { sourceTrx: sourceTrx },
    distinct: ["orderId"],
  });
}

export async function getTransactionsByOrderIdAndTransactionSource(sourceTrx: string, orderId: number) {
  return await prisma.transaction.findMany({
    where: { orderId: orderId, sourceTrx: sourceTrx },
  });
}

export async function getInventoryTransactionList(inventoryId: string) {
  return await prisma.transaction.findMany({
    where: { subAccountId: inventoryId },
    distinct: ["orderId"],
  });
}

export async function deleteTransactionsByOrderIdAndTransactionSource(trxSource: string, orderId: number) {
  return await prisma.transaction.deleteMany({
    where: { orderId: orderId, sourceTrx: trxSource },
  });
}
