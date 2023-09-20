import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getAccounts } from "~/models/account.server";
import { getSubAccounts } from "~/models/subaccount.server";
import { deleteTransactionsByOrderIdAndTransactionSource, getTransactionsByOrderIdAndTransactionSource } from "~/models/transaction.server";
import { getUsers } from "~/models/user.server";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { TransactionControl } from "assets/components/transaction-control";
import invariant from "tiny-invariant";
import { createTransaction } from "~/models/transaction.server";
import Body from "assets/layouts/body";
import { getCurrentDate, getDate } from "assets/helper/helper";
import TransactionNavbar from "assets/layouts/customnavbar/transaction-navbar";
import { TRX_CREDIT, TRX_DEBIT, TRX_SOURCE_TRANSACTION } from "assets/helper/constants";
import { Decimal } from "@prisma/client/runtime/library";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const date = formData.get("trx-time");
  invariant(typeof date === "string", "Data must be string");
  const trxTime = new Date(date);

  const orderIdAsString = formData.get("orderId");
  invariant(typeof orderIdAsString === "string", "Data mut be string");
  const orderId = parseInt(orderIdAsString);

  const rawdata = formData.get("data");
  invariant(typeof rawdata === "string", "Data must be string");
  const jsonData = JSON.parse(rawdata);
  const { data } = jsonData;
  const sourceTrx = TRX_SOURCE_TRANSACTION;

  // delete the old transaction
  await deleteTransactionsByOrderIdAndTransactionSource(sourceTrx, orderId);

  // processing foreach data that send by transcation-control
  data.forEach(async (element: any) => {
    const { id, data } = element;
    const { account, subAccount, debit, credit, user } = data;
    const controlTrx = id;
    const accountId = account;
    const userId = user;
    const subAccountId = subAccount;
    const quantity = 1; // default for transacction control must be 1
    var type;
    var amount;
    if (debit != 0) {
      type = TRX_DEBIT;
      amount = debit;
    } else {
      type = TRX_CREDIT;
      amount = credit;
    }
    const unitPrice = new Decimal(amount); // default for transaction price are amount

    await createTransaction({
      trxTime,
      orderId,
      sourceTrx,
      controlTrx,
      accountId,
      subAccountId,
      type,
      unitPrice,
      quantity,
      amount,
      userId,
    });
  });

  return redirect("/transaction");
};

export const loader = async ({ params }: LoaderArgs) => {
  const accounts = await getAccounts();
  const subAccounts = await getSubAccounts();
  const users = await getUsers();
  const { slug } = params;
  const arrSlug = slug?.split("-");

  var ref = 1;
  var transaction = "";

  if (!!arrSlug) {
    ref = parseInt(arrSlug[0]);
    transaction = arrSlug[1].toLowerCase();
  } else {
    return redirect("/transaction");
  }

  const transactions = await getTransactionsByOrderIdAndTransactionSource(transaction, ref);

  const theData = transactions.map((transaction: any, idx: number) => ({
    id: idx,
    data: {
      account: transaction.accountId,
      subAccount: transaction.subAccountId,
      debit: transaction.type == "db" ? transaction.amount : 0,
      credit: transaction.type == "cr" ? transaction.amount : 0,
      user: transaction.userId,
    },
  }));

  var id = ref;

  var date = getCurrentDate();

  if (!!transactions) {
    date = getDate(transactions[0].trxTime.toString());
  }

  // check user
  const userStatus = !!users[0]; // if user hasn't created yet, force user to create first
  if (!userStatus) {
    return redirect("/user");
  }

  // For the first time program running, transaction is containing nothing.
  //id = !!id ? id : { ref: 0 };

  invariant(typeof id === "number", "id is not valid");

  const refId = id;

  return json({ accounts, subAccounts, users, refId, date, theData });
};

/* -- Render in Client -- */
export default function Transaction() {
  const { accounts, subAccounts, users, refId, date, theData } = useLoaderData<typeof loader>();

  // Default data so that every input-group doesn't send empty data
  const defaultData = {
    account: accounts[0],
    subAccount: subAccounts.find((subAccount: any) => subAccount.accountId == accounts[0].id),
    debit: 0,
    credit: 0,
    user: users[0],
  };

  // keeping track of individual transaction control data
  const [data, setData] = useState(theData);

  // callback function to update transaction control data if there any change.
  // is called by handleComponentDataChange
  const callback = (prevData: any, newData: any) => {
    const retData = prevData.map((prev: any) => (prev.id == newData.id ? newData : prev));
    return retData;
  };

  // this handle any change in data in every transaction control
  const handleComponentDataChange = (id: any, data: any) => {
    const newData = { id, data };
    setData((prevData: any) => callback(prevData, newData));
  };

  const [inputCount, setInputCount] = useState(theData.length);
  const [inputId, setInputId] = useState(Array.from(Array(theData.length).keys()));

  // update for every change in data state
  useEffect(() => {
    //console.log(data);
  }, [data, inputId]);

  // this handle will add 1 more row of transaction control
  const handleAddRow = () => {
    setInputCount((prev: any) => (prev += 1));
    setInputId((prev) => [...prev, inputCount + 1]);
    setData((prev: any) => [...prev, { id: inputCount + 1, data: defaultData }]);
  };

  // handle if btn delete (X) is clicked
  const handleDelete = (e: any) => {
    const id = e.currentTarget.id;
    setData((prevData: any) => prevData.filter((data: any) => data.id != parseInt(id)));
    setInputId((prevInputId) => prevInputId.filter((inputId) => inputId != parseInt(id)));
  };

  return (
    <Body>
      <TransactionNavbar />
      <div className="container">
        <div className="row text-center mb-4 bg-warning rounded-2 p-2">
          <h4 className="text-dark">Add Transactions</h4>
        </div>
        <div className="row mb-2">
          <label className="col-sm-2 col-form-label">Transaction Time</label>
          <div className="col-sm-3">
            <input className="form-control" name="trxTime" type="datetime-local" defaultValue={date} />
          </div>
        </div>
        <div className="row mb-4">
          <label className="col-sm-2 col-form-label">Ref Number</label>
          <div className="col-sm-3">
            <input className="form-control" name="ref" type="text" defaultValue={refId.toString()} />
          </div>
        </div>

        <div className="d-flex flex-column border rounded-2 py-3 px-4">
          <div className="row mb-2 bg-dark text-white p-2 rounded">
            <label className="col-3">Account</label>
            <label className="col-2">Sub Account</label>
            <label className="col-2">Debit</label>
            <label className="col-2">Credit</label>
            <label className="col-2">User</label>
          </div>
          {/* Data from Transaction Control should be "stated" in here*/}
          {/* Every action in TransactionControl should only updated the "Source of truth" */}
          {/* make only 2 props: callback & data*/}

          {inputId.map((id) => (
            <TransactionControl
              key={id}
              id={id}
              data={{ accounts, subAccounts, users }}
              defaultData={theData.at(id)}
              callback={handleComponentDataChange}
              onDelete={handleDelete}
            />
          ))}
          <div className="row align-self-end">
            <div>
              <button type="button" className="btn btn-warning" onClick={handleAddRow}>
                Add Row
              </button>
            </div>
          </div>
        </div>
      </div>

      <form method="post">
        <input type="hidden" name="trx-time" value={date} />
        <input type="hidden" name="orderId" value={refId.toString()} />
        <input type="hidden" name="data" value={JSON.stringify({ data })} />
        <div className="container my-2">
          <button className="btn btn-primary" type="submit">
            Add Transactions
          </button>
        </div>
      </form>
    </Body>
  );
}
