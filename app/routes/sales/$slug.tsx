import { Decimal } from "@prisma/client/runtime";
import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { displayCapitalFirst, formatter, getCurrentDate } from "assets/helper/helper";
import Body from "assets/layouts/body";
import SalesNavbar from "assets/layouts/customnavbar/sales-navbar";
import { getTransactionsByRefAndTransaction } from "~/models/transaction.server";

export async function loader({ params }: LoaderArgs) {
  const slug = params.slug;
  const splitSlug = slug?.split("-");
  const ref = splitSlug?.at(0);
  const transaction = splitSlug?.at(1)?.toLowerCase();
  Number(0);

  const salesTransaction = await getTransactionsByRefAndTransaction(
    transaction ? transaction : "",
    Number(ref ? ref : 0)
  );

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
    pv = [...pv, cur ];
    return pv;
  }, []);

  var transactions = newTransactions.filter((arr:any, index:any, self:any) =>
    index === self.findIndex((t:any) => (t.subAccountId === arr.subAccountId)))

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
        <div className="row my-2">
            <div className="col-1 text-center"><b>#</b></div>
            <div className="col-4 text-center"><b>Sub-account</b></div>
            <div className="col-3 text-center"><b>Amount</b></div>
            <div className="col-1 text-center"><b>Qty</b></div>
            <div className="col-3 text-center"><b>Total</b></div>
          </div>

        {transactions.map((trx: any, idx:any) => (
          <div className="row my-2" key={idx+1}>
            <div className="col-1 text-center">{idx+1}</div>
            <div className="col-4">{displayCapitalFirst(trx.subAccountId.replaceAll("-", " "))}</div>
            <div className="col-3 text-end">{formatter.format(trx.amount)}</div>
            <div className="col-1 text-center">{newSales[trx.subAccountId]}</div>
            <div className="col-3 text-end">{formatter.format(trx.amount * newSales[trx.subAccountId])}</div>
          </div>
        ))}
      </div>
    </Body>
  );
}
