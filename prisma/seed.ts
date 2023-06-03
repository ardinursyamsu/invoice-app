import { PrismaClient } from "@prisma/client";
import {
  ACT_ACCOUNT_PAYABLE,
  ACT_ACCOUNT_RECEIVABLE,
  ACT_CASH,
  ACT_COGS,
  ACT_FIXED_ASSET,
  ACT_INVENTORY,
  ACT_LOAN,
  ACT_OTHER_EXPENSES,
  ACT_PAID_IN_CAPITAL,
  ACT_RETAINED_EARNINGS,
  ACT_SALES,
  SUB_ACCOUNT_PAYABLE,
  SUB_ACCOUNT_RECEIVABLE,
  SUB_CASH,
  SUB_COGS,
  SUB_FIXED_ASSET,
  SUB_INVENTORY,
  SUB_LOAN,
  SUB_NAME_DEFAULT,
  SUB_OTHER_EXPENSES,
  SUB_PAID_IN_CAPITAL,
  SUB_RETAINED_EARNINGS,
  SUB_SALES,
} from "assets/helper/constants";

const prisma = new PrismaClient();

async function seed() {
  const accounts = [
    { id: ACT_INVENTORY, name: "Inventory", type: "asset" },
    { id: ACT_CASH, name: "Cash", type: "asset" },
    { id: ACT_ACCOUNT_RECEIVABLE, name: "Account Receivable", type: "asset" },
    { id: ACT_FIXED_ASSET, name: "Fixed Asset", type: "asset" },
    { id: ACT_ACCOUNT_PAYABLE, name: "Account Payable", type: "liability" },
    { id: ACT_LOAN, name: "Loan", type: "liability" },
    { id: ACT_PAID_IN_CAPITAL, name: "Paid-in Capital", type: "equity" },
    { id: ACT_RETAINED_EARNINGS, name: "Retained Earnings", type: "equity" },
    { id: ACT_SALES, name: "Sales", type: "income" },
    { id: ACT_COGS, name: "Cost of Good Sold", type: "expense" },
    { id: ACT_OTHER_EXPENSES, name: "Other Expenses", type: "expense" },
  ];

  const subAccountsDefault = [
    { id: SUB_INVENTORY, name: SUB_NAME_DEFAULT, accountId: ACT_INVENTORY },
    { id: SUB_CASH, name: SUB_NAME_DEFAULT, accountId: ACT_CASH },
    {
      id: SUB_ACCOUNT_RECEIVABLE,
      name: SUB_NAME_DEFAULT,
      accountId: ACT_ACCOUNT_RECEIVABLE,
    },
    { id: SUB_FIXED_ASSET, name: SUB_NAME_DEFAULT, accountId: ACT_FIXED_ASSET },
    {
      id: SUB_ACCOUNT_PAYABLE,
      name: SUB_NAME_DEFAULT,
      accountId: ACT_ACCOUNT_PAYABLE,
    },
    { id: SUB_LOAN, name: SUB_NAME_DEFAULT, accountId: ACT_LOAN },
    {
      id: SUB_PAID_IN_CAPITAL,
      name: SUB_NAME_DEFAULT,
      accountId: ACT_PAID_IN_CAPITAL,
    },
    {
      id: SUB_RETAINED_EARNINGS,
      name: SUB_NAME_DEFAULT,
      accountId: ACT_RETAINED_EARNINGS,
    },
    { id: SUB_SALES, name: SUB_NAME_DEFAULT, accountId: ACT_SALES },
    { id: SUB_COGS, name: SUB_NAME_DEFAULT, accountId: ACT_COGS },
    {
      id: SUB_OTHER_EXPENSES,
      name: SUB_NAME_DEFAULT,
      accountId: ACT_OTHER_EXPENSES,
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
