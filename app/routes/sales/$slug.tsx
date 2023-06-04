import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  ACT_ACCOUNT_RECEIVABLE,
  ACT_CASH,
  ACT_INVENTORY,
  ACT_SALES,
  TRX_DEBIT,
} from "assets/helper/constants";
import {
  displayCapitalFirst,
  formatter,
  getCurrentDate,
} from "assets/helper/helper";
import Body from "assets/layouts/body";
import SalesNavbar from "assets/layouts/customnavbar/sales-navbar";
import { getSubAccountsByAccount } from "~/models/subaccount.server";
import { getTransactionsByOrderIdAndTransactionSource } from "~/models/transaction.server";

export async function loader({ params }: LoaderArgs) {
  const slug = params.slug;
  const splitSlug = slug?.split("-");
  const ref = splitSlug?.at(0);
  const transaction = splitSlug?.at(1)?.toLowerCase();

  const salesTransaction = await getTransactionsByOrderIdAndTransactionSource(
    transaction ? transaction : "",
    Number(ref ? ref : 0)
  );

  const inventoryItems = await getSubAccountsByAccount(ACT_INVENTORY);

  // group based control id
  const totalNumControl =
    salesTransaction[salesTransaction.length - 1]?.controlTrx;
  var arrPerControl = [];
  for (var i = 1; i <= totalNumControl; i++) {
    arrPerControl.push(salesTransaction.filter((trx) => trx.controlTrx == i));
  }

  var totalSales = 0;
  var totalAR = 0;
  var totalPaid = 0;
  var inventories = [];

  for (const control of arrPerControl) {
    var name = "";
    var price = 0;
    var quantity = 0;
    var total = 0;
    for (const trx of control) {
      if (trx.accountId === ACT_INVENTORY) {
        const inventoryName = inventoryItems.find(
          (inventory) => inventory.id == trx.subAccountId
        )?.name;
        name = !!inventoryName ? inventoryName : "";
        quantity = Number(trx.quantity);
      } else if (trx.accountId === ACT_SALES) {
        total = Number(trx.amount);
        price = total / quantity;
        totalSales += total;
      } else if (trx.accountId === ACT_ACCOUNT_RECEIVABLE) {
        if (trx.type == TRX_DEBIT) {
          totalAR += Number(trx.amount);
        } else {
          totalAR -= Number(trx.amount);
        }
      } else if (trx.accountId === ACT_CASH) {
        totalPaid += Number(trx.amount);
      }
    }
    inventories.push({ name, price, quantity, total });
  }

  return json({ slug, inventories, totalSales, totalAR, totalPaid });
}

export default function DisplaySales() {
  const { slug, inventories, totalSales, totalAR, totalPaid } =
    useLoaderData<typeof loader>();

  return (
    <Body>
      <SalesNavbar />
      <div className="flex m-4">
        <div className="row my-2">
          <div className="col-2">Sales Number</div>
          <div className="col-10">{slug?.toUpperCase()}</div>
        </div>
        <div className="row my-2">
          <div className="col-2">Date</div>
          <div className="col-10">{getCurrentDate().replace("T", " ")}</div>
        </div>
        <div className="my-10">
          <table className="table table-bordered">
            <thead>
              <tr className="bg-dark text-white">
                <th className="text-center col-1" scope="col">
                  #
                </th>
                <th className="text-center col-4" scope="col">
                  Sub-account
                </th>
                <th className="text-center col-3" scope="col">
                  Amount
                </th>
                <th className="text-center col-1" scope="col">
                  Qty
                </th>
                <th className="text-center col-3" scope="col">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {inventories.map((inventory: any, idx: any) =>
                inventory.name != "" /* check if entry actually exist */ ? (
                  <tr key={idx + 1}>
                    <th scope="col" className="text-center">
                      {idx + 1}
                    </th>
                    <td>
                      {displayCapitalFirst(inventory.name.replaceAll("-", " "))}
                    </td>
                    <td className="text-end">
                      {formatter.format(inventory.price)}
                    </td>
                    <td className="text-center">{inventory.quantity}</td>
                    <td className="text-end">
                      {formatter.format(inventory.total)}
                    </td>
                  </tr>
                ) : (
                  "" /* if not don't display */
                )
              )}
              <tr>
                <td colSpan={4} className="text-end">
                  <b>Total</b>
                </td>
                <td className="text-end">{formatter.format(totalSales)}</td>
              </tr>
              {totalAR > 0 ? (
                <tr>
                  <td colSpan={4} className="text-end">
                    <b>Outstanding</b>
                  </td>
                  <td className="text-end">{formatter.format(totalAR)}</td>
                </tr>
              ) : (
                ""
              )}
              {totalPaid > 0 ? (
                <tr>
                  <td colSpan={4} className="text-end">
                    <b>Paid</b>
                  </td>
                  <td className="text-end">{formatter.format(totalPaid)}</td>
                </tr>
              ) : (
                ""
              )}
            </tbody>
          </table>
        </div>
        <div className="text-end">
          <Link to={"/sales/edit?orderid=" + slug}>
            <button className="btn btn-warning mx-2">Edit Transaction</button>
          </Link>
          <Link to={"/sales/receipt?orderid=" + slug}>
            <button className="btn btn-primary" type="submit">
              Receive Cash
            </button>
          </Link>
        </div>
      </div>
    </Body>
  );
}
