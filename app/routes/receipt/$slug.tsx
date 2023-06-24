import { Decimal } from "@prisma/client/runtime/library";
import { ActionArgs, LoaderArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import CashControl from "assets/components/cash-control";
import {
  ACC_TYPE_ASSET,
  ACC_TYPE_EQUITY,
  ACC_TYPE_LIABILITY,
  ACT_CASH,
  SUB_CASH,
  TRX_CREDIT,
  TRX_DEBIT,
  TRX_SOURCE_RECEIPT,
} from "assets/helper/constants";
import { getCurrentDate, getDate } from "assets/helper/helper";
import Body from "assets/layouts/body";
import ReceiptNavbar from "assets/layouts/customnavbar/receipt-navbar";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { getAccountById, getAccounts } from "~/models/account.server";
import { getSubAccounts } from "~/models/subaccount.server";
import {
  createTransaction,
  deleteTransactionsByOrderIdAndTransactionSource,
  getTransactionsByOrderIdAndTransactionSource,
} from "~/models/transaction.server";
import { getUsers } from "~/models/user.server";

const trxSource = TRX_SOURCE_RECEIPT;

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const rawdata = formData.get("data");
  invariant(typeof rawdata === "string", "Data must be string");
  const jsonData = JSON.parse(rawdata);
  const { data } = jsonData;

  const orderId = formData.get("orderId");
  invariant(typeof orderId === "string", "Data mut be string");
  const ref = parseInt(orderId);

  const date = formData.get("trx-time");
  invariant(typeof date === "string", "Data must be string");
  const trxTime = new Date(date);

  const userId = formData.get("user");
  invariant(typeof userId === "string", "Data must be string");

  // delete the old transaction
  await deleteTransactionsByOrderIdAndTransactionSource(trxSource, ref);

  // iterate for each controlId
  data.forEach(async (element: any) => {
    const { id, data } = element;
    const { account, subAccount, amount } = data;

    const accountData = await getAccountById(account);
    const accountType = !!accountData ? accountData.type : "";

    switch (accountType.toLowerCase()) {
      case ACC_TYPE_ASSET:
        // credit the asset
        createTransaction({
          trxTime: trxTime,
          orderId: parseInt(orderId),
          sourceTrx: trxSource,
          controlTrx: id,
          accountId: account,
          subAccountId: subAccount,
          unitPrice: new Decimal(amount),
          quantity: 1,
          amount: new Decimal(amount),
          type: TRX_CREDIT,
          userId: userId,
        });
        // debit the cash
        createTransaction({
          trxTime: trxTime,
          orderId: parseInt(orderId),
          sourceTrx: trxSource,
          controlTrx: id,
          accountId: ACT_CASH,
          subAccountId: SUB_CASH,
          unitPrice: new Decimal(amount),
          quantity: 1,
          amount: new Decimal(amount),
          type: TRX_DEBIT,
          userId: userId,
        });
        break;

      case ACC_TYPE_LIABILITY:
        // credit the liabilities
        createTransaction({
          trxTime: trxTime,
          orderId: parseInt(orderId),
          sourceTrx: trxSource,
          controlTrx: id,
          accountId: account,
          subAccountId: subAccount,
          unitPrice: new Decimal(amount),
          quantity: 1,
          amount: new Decimal(amount),
          type: TRX_CREDIT,
          userId: userId,
        });
        // debit the cash
        createTransaction({
          trxTime: trxTime,
          orderId: parseInt(orderId),
          sourceTrx: trxSource,
          controlTrx: id,
          accountId: ACT_CASH,
          subAccountId: SUB_CASH,
          unitPrice: new Decimal(amount),
          quantity: 1,
          amount: new Decimal(amount),
          type: TRX_DEBIT,
          userId: userId,
        });
        break;

      case ACC_TYPE_EQUITY:
        // credit the equitiies
        createTransaction({
          trxTime: trxTime,
          orderId: parseInt(orderId),
          sourceTrx: trxSource,
          controlTrx: id,
          accountId: account,
          subAccountId: subAccount,
          unitPrice: new Decimal(amount),
          quantity: 1,
          amount: new Decimal(amount),
          type: TRX_CREDIT,
          userId: userId,
        });
        // debit the cash
        createTransaction({
          trxTime: trxTime,
          orderId: parseInt(orderId),
          sourceTrx: trxSource,
          controlTrx: id,
          accountId: ACT_CASH,
          subAccountId: SUB_CASH,
          unitPrice: new Decimal(amount),
          quantity: 1,
          amount: new Decimal(amount),
          type: TRX_DEBIT,
          userId: userId,
        });
        break;
    }
  });

  return redirect("/receipt");
};

export const loader = async ({ params }: LoaderArgs) => {
  const slug = params.slug;
  const splitSlug = slug?.split("-");
  const ref = splitSlug?.at(1);
  const transaction = splitSlug?.at(0)?.toLowerCase();

  const accounts = await getAccounts();
  const subAccounts = await getSubAccounts();
  const users = await getUsers();

  // get the transaction related to the orderID
  const receiptTransactions =
    await getTransactionsByOrderIdAndTransactionSource(
      transaction ? transaction : "",
      Number(ref ? ref : 0)
    );

  // group based control id
  const totalNumControl = receiptTransactions.filter(
    (trx) => trx.accountId == ACT_CASH
  ).length;

  var arrPerControl = [];
  for (var i = 1; i <= totalNumControl; i++) {
    arrPerControl.push(
      receiptTransactions.filter((trx) => trx.controlTrx == i)
    );
  }

  // generate the data to be passed to control(s)
  var theData: any = [];
  var theDataCounter = 1;
  for (const control of arrPerControl) {
    var account = "";
    var subAccount = "";
    var amount = 0.0;

    for (const trx of control) {
      if (trx.accountId == ACT_CASH) {
        amount = !!trx.amount ? Number(trx.amount) : 0.0;
      } else {
        account = !!trx.accountId ? trx.accountId : "";
        subAccount = !!trx.subAccountId ? trx.subAccountId : "";
      }
    }
    theData.push({
      id: theDataCounter,
      data: { account, subAccount, amount },
    });
    theDataCounter++;
  }

  // get date
  var date = getCurrentDate();
  if (!!receiptTransactions) {
    date = getDate(receiptTransactions[0].trxTime.toString());
  }

  // check user
  const userStatus = !!users[0]; // if user hasn't created yet, force user to create first
  if (!userStatus) {
    return redirect("/user");
  }

  var refId = ref;
  const order = !!refId ? Number(refId) : 0;

  return json({ accounts, subAccounts, users, order, date, theData });
};

/* -- Render in Client --*/
export default function EditReceipt() {
  const { accounts, subAccounts, users, order, date, theData } =
    useLoaderData<typeof loader>();

  //const date = getCurrentDate();
  const defaultData = {
    account: accounts[0],
    subAccounts: subAccounts.find(
      (subAccount: any) => subAccount.accountId == accounts[0].id
    ),
    amount: 0,
  };

  // keeping track of individual transaction control data
  const [data, setData] = useState(theData);

  // callback function to update transaction control data if there any change
  const callback = (prevData: any, newData: any) => {
    const retData = prevData.map((prev: any) =>
      prev.id == newData.id ? newData : prev
    );
    return retData;
  };

  // this handle any change in data in every transaction control
  const handleComponentDataChange = (id: any, data: any) => {
    const newData = { id, data };
    setData((prevData: any) => callback(prevData, newData));
  };

  const [userList, setUserList] = useState(
    users.filter((user: any) => user.type == "Customer")
  );

  const [inputCount, setInputCount] = useState(theData.length);
  const [inputId, setInputId] = useState(
    Array.from(theData.map((data: any) => data.id))
  );
  const [userId, setUserId] = useState(users[0].id);

  // filter cateogry of each user
  var typeUser: any = [];
  users.forEach((user: any) => {
    if (typeUser.indexOf(user.type) == -1) {
      typeUser = [...typeUser, user.type];
    }
  });

  useEffect(() => {
    //console.log("test effect: ", data);
    setUserId(userList[0].id);
  }, [data, inputId, userList]);

  // do something if category (customer/supplier) change
  const handleCategoryChange = (e: any) => {
    const typeFilter = e.target.value;
    setUserList(users.filter((user: any) => user.type == typeFilter));
  };

  // handle if add row button is clicked (add more row)
  const handleAddRow = () => {
    setInputCount((prev: any) => (prev += 1));
    setInputId((prev) => [...prev, inputCount + 1]);
    setData((prev: any) => [
      ...prev,
      { id: inputCount + 1, data: defaultData },
    ]);
  };

  // handle if btn delete (X) is clicked
  const handleDelete = (e: any) => {
    const id = e.currentTarget.id;
    setInputId((prevInputId) =>
      prevInputId.filter((inputId) => inputId != parseInt(id))
    );
  };

  // handle user dropdown change
  const handleUserChange = (e: any) => {
    setUserId(e.target.value);
  };

  return (
    <Body>
      <ReceiptNavbar />
      <div className="container">
        <div className="col">
          <div className="row text-center mb-4 bg-warning rounded-2 p-2">
            <h4 className="text-dark">Edit Receipt</h4>
          </div>
          <div className="row mb-2">
            <label className="col-sm-2 col-form-label">Transaction Time</label>
            <div className="col-sm-3">
              <input
                className="form-control"
                name="trxTime"
                type="datetime-local"
                defaultValue={date}
              />
            </div>
          </div>
          <div className="row mb-2">
            <label className="col-sm-2 col-form-label">Ref Number</label>
            <div className="col-sm-3">
              <input
                className="form-control"
                name="ref"
                type="text"
                defaultValue={order}
              />
            </div>
          </div>
          <div className="row mb-4">
            <label className="col-sm-2 col-form-label">Receipt from</label>
            <div className="col-sm-3">
              <select onChange={handleCategoryChange} className="form-select">
                {typeUser.map((type: string) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="col-sm-3">
              <select className="form-select" onChange={handleUserChange}>
                {userList.map((user: any) => (
                  <option key={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="d-flex flex-column border rounded-2 py-2 px-4 my-2">
            <div className="row mb-2 bg-dark text-white p-2 rounded">
              <div className="col-4">Account</div>
              <div className="col-4">Sub Account</div>
              <div className="col-3">Amount</div>
            </div>
            {inputId.map((id) => (
              <CashControl
                key={id}
                id={id}
                defaultData={data.find((d: any) => d.id == id)}
                data={{ accounts, subAccounts }}
                callback={handleComponentDataChange}
                onDelete={handleDelete}
              />
            ))}

            <div className="row text-end">
              <div>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="btn btn-warning"
                >
                  Add Row
                </button>
              </div>
            </div>
          </div>
        </div>
        <form method="post">
          <input type="hidden" name="trx-time" value={date} />
          <input type="hidden" name="orderId" value={order?.toString()} />
          <input type="hidden" name="user" value={userId} />
          <input type="hidden" name="data" value={JSON.stringify({ data })} />
          <input
            className="btn btn-primary"
            type="submit"
            value="Edit Transactions"
          />
        </form>
      </div>
    </Body>
  );
}
