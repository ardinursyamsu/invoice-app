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

export async function getSubAccountById(id: string) {
  return prisma.subAccount.findUnique({ where: { id: id } });
}

export async function updateSubAccount(id: string, name: string, accountId: string) {
  return prisma.subAccount.update({ where: { id: id }, data: { name: name, accountId: accountId } });
}

