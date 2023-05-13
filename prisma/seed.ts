import { Account, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const accounts = [
    { id: "inventory", name: "Inventory", type: "asset" },
    { id: "cash", name: "Cash", type: "asset" },
    { id: "account-receivable", name: "Account Receivable", type: "asset" },
    { id: "fixed-asset", name: "Fixed Asset", type: "asset" },
    { id: "account-payable", name: "Account Payable", type: "liability" },
    { id: "loan", name: "Loan", type: "liability" },
    { id: "paid-in-capital", name: "Paid-in Capital", type: "equity" },
    { id: "retained-earnings", name: "Retained Earnings", type: "equity" },
    { id: "sales", name: "Sales", type: "income" },
    { id: "cost-of-good-sold", name: "Cost of Good Sold", type: "expense" },
    { id: "other-expenses", name: "Other Expenses", type: "expense" },
  ];

  const subAccountsDefault = [
    { id: "inventory-default", name: "default", accountId: "inventory" },
    { id: "cash-default", name: "default", accountId: "cash" },
    {
      id: "account-receivable-default",
      name: "default",
      accountId: "account-receivable",
    },
    { id: "fixed-asset-default", name: "default", accountId: "fixed-asset" },
    {
      id: "account-payable-default",
      name: "default",
      accountId: "account-payable",
    },
    { id: "loan-default", name: "default", accountId: "loan" },
    {
      id: "paid-in-capital-default",
      name: "default",
      accountId: "paid-in-capital",
    },
    {
      id: "retained-earnings-default",
      name: "default",
      accountId: "retained-earnings",
    },
    { id: "sales-default", name: "default", accountId: "sales" },
    {
      id: "cost-of-good-sold-default",
      name: "default",
      accountId: "cost-of-good-sold",
    },
    {
      id: "other-expenses-default",
      name: "default",
      accountId: "other-expenses",
    },
  ];

  for (const account of accounts) {
    await prisma.account.create({ data: account });
  }

  for (const subAccount of subAccountsDefault) {
    await prisma.subAccount.create({ data: subAccount });
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
