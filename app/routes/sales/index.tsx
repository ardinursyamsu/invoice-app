import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { displayCapitalFirst, formatter } from "assets/helper/helper";
import Body from "assets/layouts/body";
import {
  getAllTransactionBySource,
  getTransactionsByRefAndTransaction,
} from "~/models/transaction.server";
import SalesNavbar from "assets/layouts/customnavbar/sales-navbar";

export const loader = async () => {
  const allTrxSales = await getAllTransactionBySource("sale");

  var salesData:any[] = [];

  for (const sales of allTrxSales) {
    const trxSales = await getTransactionsByRefAndTransaction(
      sales.transaction,
      sales.ref
    );

    const salesEntry = trxSales.find((trx: any) => trx.accountId === "sales")
    var amount = !!salesEntry ? salesEntry.amount : 0;

    const accountReceivableEntry = trxSales.find((trx: any) => trx.accountId === "account-receivable")
    const cashEntry = trxSales.find((trx: any) => trx.accountId === "cash")

    const amountPaid = Number(!!cashEntry? cashEntry.amount : 0) - Number(!!accountReceivableEntry? accountReceivableEntry.amount : 0)
    var status = "Partially-paid";
    if (amountPaid > 0){
      status = "Paid"
    } else if (amountPaid < 0){
      status = "Unpaid"
    }

    salesData = [...salesData, {ref: sales.ref, transaction: sales.transaction, userId: sales.userId, amount: amount, status:  status}]
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
                  Sales List
                </th>
                <th className="text-center col-2" scope="col">
                  Customers
                </th>
                <th className="text-center col-2" scope="col">
                  Total
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
                    <Link
                      to={sales.ref + "-" + sales.transaction.toUpperCase()}
                    >
                      {sales.ref + "-" + sales.transaction.toUpperCase()}
                    </Link>
                  </td>
                  <td className="text-start"></td>
                  <td className="text-center">
                    {displayCapitalFirst(sales.userId)}
                  </td>
                  <td className="text-end">{formatter.format(sales.amount)}</td>
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
