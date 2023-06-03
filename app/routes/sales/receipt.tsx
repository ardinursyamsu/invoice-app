import { Decimal } from "@prisma/client/runtime/library";
import { json, redirect } from "@remix-run/node";
import type { LoaderArgs, ActionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { ACT_ACCOUNT_RECEIVABLE, ACT_CASH, ACT_INVENTORY, ACT_SALES, TRX_DEBIT, TRX_SOURCE_SALES } from "assets/helper/constants";
import {
  displayCapitalFirst,
  formatter,
  getCurrentDate,
} from "assets/helper/helper";
import Body from "assets/layouts/body";
import SalesNavbar from "assets/layouts/customnavbar/sales-navbar";
import { useState } from "react";
import invariant from "tiny-invariant";
import { getSubAccountsByAccount } from "~/models/subaccount.server";
import {
  createTransaction,
  getTransactionsByOrderIdAndTransactionSource,
} from "~/models/transaction.server";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const totalReceipt = formData.get("totalReceipt")?.toString();
  var amount = parseInt(
    !!totalReceipt ? totalReceipt.replace(/[^\d.-]/g, "") : ""
  );
  const order = formData.get("orderId")?.toString().split("-");
  const orderId = !!order ? parseInt(order[0]) : 0;
  const trxSource = !!order ? order[1] : "";
  const relatedTrx = await getTransactionsByOrderIdAndTransactionSource(
    trxSource,
    orderId
  );
  const lastNumControlId = relatedTrx[relatedTrx.length - 1]?.controlTrx;
  const userId = relatedTrx[relatedTrx.length - 1]?.userId;

  const trxTime = !!formData.get("trxTime")
    ? formData.get("trxTime")
    : getCurrentDate();
  invariant(typeof trxTime == "string", "trxTime must be String");

  const controlTrx = lastNumControlId + 1;
  // credit the AR
  createTransaction({
    trxTime: new Date(trxTime),
    orderId: orderId,
    sourceTrx: TRX_SOURCE_SALES,
    controlTrx: controlTrx,
    accountId: "account-receivable",
    subAccountId: "account-receivable-default",
    unitPrice: new Decimal(amount),
    quantity: 1,
    amount: new Decimal(amount),
    type: "cr",
    userId: userId,
  });
  // debit the cash
  createTransaction({
    trxTime: new Date(trxTime),
    orderId: orderId,
    sourceTrx: TRX_SOURCE_SALES,
    controlTrx: controlTrx,
    accountId: "cash",
    subAccountId: "cash-default",
    unitPrice: new Decimal(amount),
    quantity: 1,
    amount: new Decimal(amount),
    type: "db",
    userId: userId,
  });

  return redirect("/sales");
};

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("orderid");
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

/* render in client */
export default function DisplaySales() {
  const { slug, inventories, totalSales, totalAR, totalPaid } =
    useLoaderData<typeof loader>();

  const [totalReceipt, setTotalReceipt] = useState(totalAR);
  const handleCashReceiptChange = (e: any) => {
    const receiptAsString = e.target.value;
    var parsedAmount = parseInt(receiptAsString.replace(/[^\d.-]/g, ""));
    if (parsedAmount > totalAR) {
      parsedAmount = totalAR;
    }

    setTotalReceipt(!!parsedAmount ? parsedAmount : 0);
  };

  const [date, setDate] = useState(getCurrentDate());
  const handleDateChange = (e: any) => {
    setDate(e.target.value);
  };

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
          <div className="col-10">
            <div className="col-sm-4">
              <input
                className="form-control"
                name="trxTime"
                type="datetime-local"
                value={date}
                onChange={handleDateChange}
              />
            </div>
          </div>
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

        <Form method="post" className="row justify-content-end mt-3">
          <div className="row justify-content-end">
            <div className="col-4">
              <label className="col-form-label" htmlFor="totalReceipt">
                <b>Total Cash Received</b>
              </label>
            </div>

            <div className="col-4">
              <input
                className="form-control"
                type="text"
                name="totalReceipt"
                value={formatter.format(totalReceipt)}
                onChange={handleCashReceiptChange}
              />
            </div>
          </div>
          <input type="hidden" name="orderId" value={!!slug ? slug : ""} />
          <input type="hidden" name="trxTime" value={date} />
          <div className="text-end my-2">
            <button className="btn btn-primary" type="submit">
              Receive Cash
            </button>
          </div>
        </Form>
      </div>
    </Body>
  );
}
