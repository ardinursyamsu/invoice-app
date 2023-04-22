import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { formatter } from "assets/helper/helper";
import Body from "assets/layouts/body";
import { getAccountsByType } from "~/models/account.server";
import { getTransactionsByAccount } from "~/models/transaction.server";

// get the total amount per account
const displaySummary = (trxs: any, id: string) => {
  const ret = trxs.find((trx: any) => trx.account == id)?.amount || 0;
  return ret;
};

const totalAccount = (transactions: any, accounts: any) => {
  var ret = 0;
  accounts.forEach((account: any) => {
    ret += displaySummary(transactions, account.id);
  });

  return ret;
};

export const loader = async () => {
  const assets = await getAccountsByType("asset");
  const liabilities = await getAccountsByType("liability");
  const income = await getAccountsByType("income");
  const expenses = await getAccountsByType("expense");
  const equities = await getAccountsByType("equity");

  // transactions query total amount of each account transaction
  const transactions: any = new Array();
  for (const account of assets) {
    const transaction = await getTransactionsByAccount(account.id);
    transactions.push(transaction);
  }
  for (const account of liabilities) {
    const transaction = await getTransactionsByAccount(account.id);
    transactions.push(transaction);
  }
  for (const account of equities) {
    const transaction = await getTransactionsByAccount(account.id);
    transactions.push(transaction);
  }
  for (const account of income) {
    const transaction = await getTransactionsByAccount(account.id);
    transactions.push(transaction);
  }
  for (const account of expenses) {
    const transaction = await getTransactionsByAccount(account.id);
    transactions.push(transaction);
  }

  //console.log(totalAccount(transactions, equities));

  return json({
    assets,
    liabilities,
    income,
    expenses,
    equities,
    transactions,
  });
};

export default function Index() {
  const { assets, liabilities, income, expenses, equities, transactions } =
    useLoaderData<typeof loader>();

  const suspense =
    totalAccount(transactions, assets) -
    (totalAccount(transactions, liabilities) +
      totalAccount(transactions, equities));

  console.log("suspense", suspense);
  return (
    <Body>
      <div className="container">
        <div className="row">
          {/* ==============================Right column==============================*/}
          <div className="col">
            <div className="card border-secondary mb-3 shadow-sm">
              <div className="card-header bg-dark text-white">
                <div className="row">
                  <div className="col">Assets</div>
                  <div className="col text-end mx-1">
                    {formatter.format(totalAccount(transactions, assets))}
                  </div>
                </div>
              </div>
              {/* get all account under assets */}
              {assets.map((asset: any) => (
                <div key={asset.id} className="row mx-2 my-1">
                  <div className="col">{asset.name}</div>
                  <div className="col text-end">
                    {formatter.format(displaySummary(transactions, asset.id))}
                  </div>
                </div>
              ))}
            </div>

            <div className="card border-secondary mb-3 shadow-sm">
              <div className="card-header bg-dark text-white">
                <div className="row">
                  <div className="col">Liabilities </div>
                  <div className="col text-end mx-1">
                    {formatter.format(totalAccount(transactions, liabilities))}
                  </div>
                </div>
              </div>
              {/* get all account under liabilities */}
              {liabilities.map((liability: any) => (
                <div className="row mx-2 my-1">
                  <div className="col">{liability.name}</div>
                  <div className="col text-end">
                    {formatter.format(
                      displaySummary(transactions, liability.id)
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="card border-secondary mb-3 shadow-sm">
              <div className="card-header bg-dark text-white">
                <div className="row">
                  <div className="col">Equities</div>
                  <div className="col text-end mx-1">
                    {formatter.format(totalAccount(transactions, equities) + suspense)}
                  </div>
                </div>
              </div>
              {/* get all account under equities */}
              {equities.map((equity: any) => (
                <div className="row mx-2 my-1">
                  <div className="col">{equity.name}</div>
                  <div className="col text-end">
                    {formatter.format(displaySummary(transactions, equity.id))}
                  </div>
                </div>
              ))}
              <div className="row mx-2 my-1">
                {!!suspense && (
                  <>
                    <div className="col">
                      <i>Suspense</i>
                    </div>
                    <div className="col text-end">
                      <i>{formatter.format(suspense)}</i>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ==============================Right column==============================*/}
          <div className="col">
            <div className="card border-secondary mb-3 shadow-sm">
              <div className="card-header bg-dark text-white">
                <div className="row">
                  <div className="col">Income</div>
                  <div className="col text-end mx-1">
                    {formatter.format(totalAccount(transactions, income))}
                  </div>
                </div>
              </div>
              {/* Every sales & expense goes here */}
              {income.map((earning: any) => (
                <div className="row mx-2 my-1">
                  <div className="col">{earning.name}</div>
                  <div className="col text-end">
                    {formatter.format(displaySummary(transactions, earning.id))}
                  </div>
                </div>
              ))}
            </div>

            <div className="card border-secondary mb-3 shadow-sm">
              <div className="card-header bg-dark text-white">
                <div className="row">
                  <div className="col">Expenses</div>
                  <div className="col text-end mx-1">
                    {formatter.format(totalAccount(transactions, expenses))}
                  </div>
                </div>
              </div>
              {/* Calculated Gross profit */}
              {expenses.map((expense: any) => (
                <div className="row mx-2 my-1">
                  <div className="col">{expense.name}</div>
                  <div className="col text-end">
                    {formatter.format(displaySummary(transactions, expense.id))}
                  </div>
                </div>
              ))}
            </div>

            <div className="card border-secondary mb-3 shadow-sm">
              <div className="card-header bg-dark text-white">Net Income</div>
              {/* Calculated net profit */}
              <div className="row mx-2 my-1">
                <div className="col">
                  <b>Total Earnings</b>
                </div>
                <div className="col text-end">
                  <b>
                    {formatter.format(
                      totalAccount(transactions, income) -
                        totalAccount(transactions, expenses)
                    )}
                  </b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Body>
  );
}
