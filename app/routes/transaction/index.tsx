import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { ACT_CASH, TRX_SOURCE_TRANSACTION } from "assets/helper/constants";
import { displayCapitalFirst, displayDate, formatter } from "assets/helper/helper";
import Body from "assets/layouts/body";
import TransactionNavbar from "assets/layouts/customnavbar/transaction-navbar";
import { getAllTransactionBySource, getTransactionsByOrderIdAndTransactionSource } from "~/models/transaction.server";

const trxSource = TRX_SOURCE_TRANSACTION;
export const loader = async () => {
  const data = await getAllTransactionBySource(trxSource);

  var transactionsData = [];

  for (const trx of data) {
    const transactionPerOrderId = await getTransactionsByOrderIdAndTransactionSource(trxSource, trx.orderId);

    const trxTime = trx.trxTime;
    const refId = trx.orderId.toString() + "-" + trx.sourceTrx.toString();
    var remark = "";
    const user = trx.userId;
    var totalAmount = 0;
    for (const transactionCtrl of transactionPerOrderId) {
      if (transactionCtrl.accountId == ACT_CASH) {
        totalAmount += Number(transactionCtrl.amount);
      } else {
        remark += transactionCtrl.accountId + ", ";
      }
    }

    transactionsData.push({ trxTime, refId, remark, user, totalAmount });
  }

  return json({ transactionsData });
};

export default function TransactionIndex() {
  const { transactionsData } = useLoaderData<typeof loader>();

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
                <th className="text-center col-4" scope="col">
                  Remark
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
              {transactionsData.map((transaction: any, idx: number) => (
                <tr key={idx + 1}>
                  <th className="text-center" scope="row">
                    {idx + 1}
                  </th>
                  <td className="text-center">{displayDate(transaction.trxTime)}</td>
                  <td className="text-center">
                    <Link to={transaction.refId}>{transaction.refId.toUpperCase()}</Link>
                  </td>
                  <td className="text-start">{displayCapitalFirst(transaction.remark).replaceAll("-", " ")}</td>
                  <td className="text-end">{displayCapitalFirst(transaction.user)}</td>
                  <td className="text-end">{formatter.format(transaction.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Body>
  );
}
