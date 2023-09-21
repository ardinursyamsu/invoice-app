import { Account } from "@prisma/client";
import { prisma } from "~/db.server";

export async function createAccount(
  account: Pick<Account, "id" | "name" | "type">
) {
  return prisma.account.create({ data: account });
}

export async function getAccounts() {
  return prisma.account.findMany();
}

export async function getAccountsWithSubAccounts() {
  return prisma.account.findMany({ include: { subAccounts: true } });
}

export async function getAccountsByType(type: string) {
  return prisma.account.findMany({ where: { type: type } });
}

export async function getAccountById(accountId: string) {
  return prisma.account.findFirstOrThrow({ where: { id: accountId } });
}
