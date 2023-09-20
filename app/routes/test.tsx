import { Decimal } from "@prisma/client/runtime";
import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { displayCapitalFirst, formatter, getCurrentDate } from "assets/helper/helper";
import Body from "assets/layouts/body";
import SalesNavbar from "assets/layouts/customnavbar/sales-navbar";
import { getTransactionsByOrderIdAndTransactionSource } from "~/models/transaction.server";

export async function loader({ params }: LoaderArgs) {
  const slug = params.slug;
  const splitSlug = slug?.split("-");
  const ref = splitSlug?.at(0);
  const transaction = splitSlug?.at(1)?.toLowerCase();
  Number(0);

  const salesTransaction = await getTransactionsByOrderIdAndTransactionSource(transaction ? transaction : "", Number(ref ? ref : 0));

  const newSales = salesTransaction.reduce((pv: any, cv: any) => {
    if (pv[cv.subAccountId]) {
      pv[cv.subAccountId]++;
    } else {
      pv[cv.subAccountId] = 1;
    }

    return pv;
  }, {});

  const newTransactions = salesTransaction.reduce((pv: any, cv: any) => {
    const cur = {
      ref: cv.ref,
      transaction: cv.transaction,
      accountId: cv.accountId,
      type: cv.type,
      amount: cv.amount,
      subAccountId: cv.subAccountId,
      userId: cv.subAccountId,
    };
    pv = [...pv, cur];
    return pv;
  }, []);

  var transactions = newTransactions.filter(
    (arr: any, index: any, self: any) => index === self.findIndex((t: any) => t.subAccountId === arr.subAccountId)
  );

  return json({ slug, newSales, salesTransaction, transactions });
}

export default function DisplaySales() {
  const { slug, newSales, transactions } = useLoaderData<typeof loader>();
  return (
    <Body>
      <SalesNavbar />
      <div className="flex m-4">
        <div className="row my-2">
          <div className="col-2">Sales Number</div>
          <div className="col-10">{slug}</div>
        </div>
        <div className="row my-2">
          <div className="col-2">Date</div>
          <div className="col-10">{getCurrentDate()}</div>
        </div>

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
            {transactions.map((trx: any, idx: any) => (
              <tr key={idx + 1}>
                <th scope="col" className="text-center">
                  {idx + 1}
                </th>
                <td>{displayCapitalFirst(trx.subAccountId.replaceAll("-", " "))}</td>
                <td className="text-end">{formatter.format(trx.amount)}</td>
                <td className="text-center">{newSales[trx.subAccountId]}</td>
                <td className="text-end">{formatter.format(trx.amount * newSales[trx.subAccountId])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Body>
  );
}
