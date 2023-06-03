import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { displayCapitalFirst, formatter } from "assets/helper/helper";
import Body from "assets/layouts/body";
import {
  getAllTransactionBySource,
  getTransactionsByOrderIdAndTransactionSource,
} from "~/models/transaction.server";
import SalesNavbar from "assets/layouts/customnavbar/sales-navbar";
import { TRX_SOURCE_SALES } from "assets/helper/constants";

export const loader = async () => {
  const allTrxSales = await getAllTransactionBySource(TRX_SOURCE_SALES);

  var salesData: any[] = [];

  // iterate for every orderId
  for (const sales of allTrxSales) {
    const trxSales = await getTransactionsByOrderIdAndTransactionSource(
      sales.sourceTrx,
      sales.orderId
    );

    // iterate for every transaction per order id
    var amount = 0.0;
    var cashEntry = 0.0;
    var accountReceivableEntry = 0.0;
    for (const trx of trxSales) {
      if (trx.accountId === "sales") {
        const salesAmount = trx?.amount;
        amount += Number(salesAmount);
      } else if (trx.accountId === "account-receivable" && trx.type === "db") {
        const arAmount = trx?.amount;
        accountReceivableEntry += Number(arAmount);
      } else if (trx.accountId === "cash" && trx.type == "db") {
        const cashAmount = trx?.amount;
        cashEntry += Number(cashAmount);
      }
    }
    //const salesEntry = trxSales.find((trx: any) => trx.accountId === "sales")
    //var amount = !!salesEntry ? salesEntry.amount : 0;

    //const accountReceivableEntry = trxSales.find((trx: any) => trx.accountId === "account-receivable")
    //const cashEntry = trxSales.find((trx: any) => trx.accountId === "cash")

    //const amountPaid = Number(!!cashEntry? cashEntry.amount : 0) - Number(!!accountReceivableEntry? accountReceivableEntry.amount : 0)
    const amountPaid = cashEntry - accountReceivableEntry;
    var status = "Partially-paid";
    if (amountPaid == 0) {
      status = "Paid";
    } else if (amountPaid == -accountReceivableEntry) {
      status = "Unpaid";
    }

    salesData = [
      ...salesData,
      {
        orderId: sales.orderId,
        sourceTrx: sales.sourceTrx,
        userId: sales.userId,
        amount: amount,
        status: status,
        amountPaid: cashEntry,
      },
    ];
  }

  return json({ salesData });
};

export default function Sales() {
  const { salesData } = useLoaderData<typeof loader>();

  return (
    <Body>
      <SalesNavbar />
      <div className="d-flex justify-content-center">
        <div className="self-align-center col-10">
          <table className="table table-bordered">
            <thead>
              <tr className="bg-dark text-white">
                <th className="text-center col-1" scope="col">
                  #
                </th>
                <th className="text-center col-2" scope="col">
                  Ref-id
                </th>
                <th className="text-center col-3" scope="col">
                  Customers
                </th>
                <th className="text-center col-2" scope="col">
                  Total
                </th>
                <th className="text-center col-2" scope="col">
                  Paid
                </th>
                <th className="text-center col-2" scope="col">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((sales: any, idx: number) => (
                <tr key={idx + 1}>
                  <th className="text-center" scope="row">
                    {idx + 1}
                  </th>
                  <td className="text-center">
                    <Link to={sales.orderId + "-" + sales.sourceTrx}>
                      {sales.orderId + "-" + sales.sourceTrx.toUpperCase()}
                    </Link>
                  </td>
                  <td className="text-center">
                    {displayCapitalFirst(sales.userId)}
                  </td>
                  <td className="text-end">{formatter.format(sales.amount)}</td>
                  <td className="text-end">
                    {formatter.format(Math.abs(sales.amountPaid))}
                  </td>
                  <td className="text-start">{sales.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Body>
  );
}
