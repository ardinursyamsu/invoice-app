import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { TRX_SOURCE_TRANSACTION } from "assets/helper/constants";
import {
  displayCapitalFirst,
  displayDate,
  formatter,
} from "assets/helper/helper";
import Body from "assets/layouts/body";
import TransactionNavbar from "assets/layouts/customnavbar/transaction-navbar";
import { getAllTransactionBySource } from "~/models/transaction.server";

export const loader = async () => {
  const transactions = await getAllTransactionBySource(TRX_SOURCE_TRANSACTION);

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
                <th className="text-center col-2" scope="col">
                  Date
                </th>
                <th className="text-center col-2" scope="col">
                  Ref ID
                </th>
                <th className="text-center col-2" scope="col">
                  Account
                </th>
                <th className="text-center col-2" scope="col">
                  Sub-Account
                </th>
                <th className="text-center col-1" scope="col">
                  User
                </th>
                <th className="text-center col-2" scope="col">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction: any, idx: number) => (
                <tr className="h-2" key={idx + 1}>
                  <td className="text-center" scope="row">
                    {idx + 1}
                  </td>
                  <td className="text-start">
                    {displayDate(transaction.trxTime.toString())}
                  </td>
                  <td className="text-center">
                    <Link
                      to={
                        transaction.orderId +
                        "-" +
                        transaction.sourceTrx.toUpperCase()
                      }
                    >
                      {
                        transaction.orderId +
                        "-" +
                        transaction.sourceTrx.toUpperCase()
                      }
                    </Link>
                  </td>
                  <td className="text-center">
                    {displayCapitalFirst(transaction.accountId)}
                  </td>
                  <td className="text-center">
                    {displayCapitalFirst(transaction.subAccountId)}
                  </td>
                  <td className="text-center">
                    {displayCapitalFirst(transaction.userId)}
                  </td>
                  <td className="text-end">
                    {transaction.type.toString().toUpperCase() +
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
