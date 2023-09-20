import { SubAccount } from "@prisma/client";
import { prisma } from "~/db.server";

export async function createSubAccount(subaccount: Pick<SubAccount, "id" | "name" | "accountId">) {
  return prisma.subAccount.create({ data: subaccount });
}

export async function getSubAccounts() {
  return prisma.subAccount.findMany();
}

export async function getSubAccountsByAccount(account: string) {
  return prisma.subAccount.findMany({ where: { accountId: account } });
}
