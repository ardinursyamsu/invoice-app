import { Account, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const accounts= [
    { id: "inventory", name: "Inventory", type: "asset" },
    { id: "cash", name: "Cash", type: "asset" },
    { id: "account-receivable", name: "Account Receivable", type: "asset" },
    { id: "fixed-asset", name: "Fixed Asset", type: "asset" },
    { id: "account-payable", name: "Account Payable", type: "liability" },
    { id: "loan", name: "Loan", type: "liability" },
    { id: "paid-in-capital", name: "Paid-in Capital", type: "equity" },
    { id: "retained-earnings", name: "Retained Earnings", type: "equity" },
    { id: "sales", name: "sales", type: "income" },
    { id: "cost-of-good-sold", name: "Cost of Good Sold", type: "expense" },
    { id: "other-expenses", name: "Other Expenses", type: "expense" },
  ];

  const subAccountsDefault = [
    { id: "inventory-default", name: "Inventory", accountId: "inventory" },
    { id: "cash-default", name: "Cash", accountId: "cash" },
    { id: "account-receivable", name: "Account Receivable", accountId: "account-receivable" },
    { id: "fixed-asset", name: "Fixed Asset", accountId: "fixed-asset" },
    { id: "account-payable", name: "Account Payable", accountId: "account-payable" },
    { id: "loan", name: "Loan", type: "liability" },
    { id: "paid-in-capital", name: "Paid-in Capital", accountId: "equity" },
    { id: "retained-earnings", name: "Retained Earnings", accountId: "equity" },
    { id: "sales", name: "sales", accountId: "income" },
    { id: "cost-of-good-sold", name: "Cost of Good Sold", accountId: "expense" },
    { id: "other-expenses", name: "Other Expenses", accountId: "expense" },
  ];
  
  for (const account in accounts){
    await prisma.account.create({ data: {id: account.id, name: account.name, accountId: account.accountId}});
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
