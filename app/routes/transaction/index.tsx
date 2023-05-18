import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { formatter } from "assets/helper/helper";
import Body from "assets/layouts/body";
import TransactionNavbar from "assets/layouts/customnavbar/transaction-navbar";
import { getAllTransaction } from "~/models/transaction.server";

export const loader = async () => {
  const transactions = await getAllTransaction();

  return json({ transactions });
};

export default function TransactionIndex() {
  const { transactions } = useLoaderData<typeof loader>();
  return (
    <Body>
      <TransactionNavbar />
      <div className="d-flex justify-content-center">
        <div className="self-align-center col-10">
          <table className="table table-bordered">
            <thead>
              <tr className="bg-dark text-white">
                <th className="text-center col-1" scope="col">
                  #
                </th>
                <th className="text-start col-3" scope="col">
                  Date
                </th>
                <th className="text-center col-1" scope="col">
                  Ref ID
                </th>
                <th className="text-center col-2" scope="col">
                  Account
                </th>
                <th className="text-center col-2" scope="col">
                  Sub-account
                </th>
                <th className="text-center col-1" scope="col">
                  User
                </th>
                <th className="text-end col-2" scope="col">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction: any) => (
                <tr className="h-2" key={transaction.id}>
                  <td className="text-center" scope="row">{transaction.id}</td>
                  <td className="text-start">{transaction.trxTime}</td>
                  <td className="text-center">
                    {transaction.ref + "-" + transaction.transaction}
                  </td>
                  <td className="text-center">{transaction.accountId}</td>
                  <td className="text-center">{transaction.subAccountId}</td>
                  <td className="text-center">{transaction.userId}</td>
                  <td className="text-end">
                    {transaction.type +
                      " - " +
                      formatter.format(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Body>
  );
}
