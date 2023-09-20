import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { ACT_CASH, TRX_SOURCE_PAYMENT, TRX_SOURCE_RECEIPT } from "assets/helper/constants";
import { displayCapitalFirst, displayDate, formatter } from "assets/helper/helper";
import Body from "assets/layouts/body";
import PaymentNavbar from "assets/layouts/customnavbar/payment-navbar";
import { getAllTransactionBySource, getTransactionsByOrderIdAndTransactionSource } from "~/models/transaction.server";

export const loader = async () => {
  const data = await getAllTransactionBySource(TRX_SOURCE_PAYMENT);

  var paymentTrxData = [];

  for (const trx of data) {
    const paymentPerOrderID = await getTransactionsByOrderIdAndTransactionSource(TRX_SOURCE_PAYMENT, trx.orderId);

    const trxTime = trx.trxTime;
    const refId = trx.orderId.toString() + "-" + trx.sourceTrx.toString();
    var remark = "";
    const user = trx.userId;
    var totalAmount = 0;
    for (const paymentCtrl of paymentPerOrderID) {
      if (paymentCtrl.accountId == ACT_CASH) {
        totalAmount += Number(paymentCtrl.amount);
      } else {
        remark += paymentCtrl.accountId + ", ";
      }
    }

    paymentTrxData.push({ trxTime, refId, remark, user, totalAmount });
  }

  return json({ paymentTrxData });
};

export default function ReceiptIndex() {
  const { paymentTrxData } = useLoaderData<typeof loader>();

  return (
    <Body>
      <PaymentNavbar />
      <div className="d-flex justify-content-center">
        <div className="self-align-center col-11">
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
              {paymentTrxData.map((payment, idx) => (
                <tr key={idx + 1}>
                  <th className="text-center" scope="row">
                    {idx + 1}
                  </th>
                  <td className="text-center">{displayDate(payment.trxTime)}</td>
                  <td className="text-center">
                    <Link to={payment.refId}>{payment.refId.toUpperCase()}</Link>
                  </td>
                  <td className="text-start">{displayCapitalFirst(payment.remark).replaceAll("-", " ")}</td>
                  <td className="text-end">{displayCapitalFirst(payment.user)}</td>
                  <td className="text-end">{formatter.format(payment.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Body>
  );
}
