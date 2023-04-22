import { Prisma, Transaction } from "@prisma/client";
import { prisma } from "~/db.server";

export async function createTransaction(
  transaction: Pick<
    Transaction,
    | "trxTime"
    | "ref"
    | "accountId"
    | "subAccountId"
    | "amount"
    | "type"
    | "userId"
  >
) {
  return prisma.transaction.create({ data: transaction });
}

export async function getLastRefId() {
  const ids = await prisma.transaction.findMany({
    select: { ref: true },
    orderBy: { ref: "desc" },
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
      amount = Number(credit._sum.amount) - Number(debit._sum.amount);
      break;
  }

  return { account: accountId, type: accountType, amount: amount };
}

export async function getSubAccountNetAmount(subAccountId: string){
  let subAccount = await prisma.subAccount.findFirst({
    where: { id: subAccountId }, include:{account: true}
  });

  const accountType = subAccount?.account.type

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
  };

  return ({ subAccountId, accountId, accountType, amount})
}