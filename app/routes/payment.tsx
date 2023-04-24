import { Decimal } from "@prisma/client/runtime";
import { ActionArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import CashControl from "assets/components/cash-control";
import { getCurrentDate } from "assets/helper/helper";
import Body from "assets/layouts/body";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { getAccountById, getAccounts } from "~/models/account.server";
import { getSubAccounts } from "~/models/subaccount.server";
import { createTransaction, getLastRefId } from "~/models/transaction.server";
import { getUsers } from "~/models/user.server";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const date = formData.get("trx-time");
  invariant(typeof date === "string", "Data must be string");
  const trxTime = new Date(date);

  const refId = formData.get("ref");
  invariant(typeof refId === "string", "Data mut be string");
  const ref = parseInt(refId);

  const user = formData.get("user");
  invariant(typeof user === "string", "Data mut be string");

  const rawdata = formData.get("data");
  invariant(typeof rawdata === "string", "Data must be string");
  const jsonData = JSON.parse(rawdata);
  const { data } = jsonData;

  // process each record
  data.forEach(async (element: any) => {
    const { id, data } = element;
    const account = await getAccountById(data.account);
    const accountId = account.id;
    const accountType = account.type;
    const subAccount = data.subAccount;
    const amount = data.amount;
    //console.log(trxTime, ref, user, accountId, accountType, subAccount, amount);

    if (accountType === "asset") {
      await createTransaction({
        trxTime: trxTime,
        ref: ref,
        accountId: accountId,
        subAccountId: subAccount,
        amount: amount,
        type: "db",
        userId: user,
      });
      /* case for fixed asset & inventory 
      // credit the asset (acquired cost)
      console.log("credit the asset", {trxTime: trxTime, ref: ref, accountId: accountId, subAccountId: subAccount, amount: amount,  type: "cr", userId: user})
      // debit the expense (acquired cost of the assets)
      console.log("debit the expense", {trxTime: trxTime, ref: ref, accountId: "expense-trial", subAccountId: "expense-trial-default", amount: amount, type: "db", userId: user})
      // credit the sales (from the amount)
      console.log("credit the sales", {trxTime: trxTime, ref: ref, accountId: "sales", subAccountId: "sales-default", amount: amount, type: "cr", userId: user})
      */
    } else {
      await createTransaction({
        trxTime: trxTime,
        ref: ref,
        accountId: accountId,
        subAccountId: subAccount,
        amount: amount,
        type: "db",
        userId: user,
      });
    }
  });

  // process totalcash attributed to the transactions
  var cashAmount = 0;
  data.forEach((element: any) => {
    cashAmount += element.data.amount;
  });
  await createTransaction({
    trxTime: trxTime,
    ref: ref,
    accountId: "cash",
    subAccountId: "bank",
    amount: new Decimal(cashAmount),
    type: "cr",
    userId: user,
  });

  return redirect("/receipt");
};

export const loader = async () => {
  const accounts = await getAccounts();
  const subAccounts = await getSubAccounts();
  const users = await getUsers();

  const id = await getLastRefId();
  invariant(typeof id === "object", "Data is not valid");

  const refId = id.ref + 1;

  return json({ accounts, subAccounts, users, refId });
};

/* -- Render in Client --*/
export default function Payment() {
  const { accounts, subAccounts, users, refId } =
    useLoaderData<typeof loader>();

  const date = getCurrentDate();
  const defaultData = {
    account: accounts[0],
    subAccounts: subAccounts.find(
      (subAccount) => subAccount.accountId == accounts[0].id
    ),
    amount: 0,
  };

  // keeping track of individual transaction control data
  const [data, setData] = useState([{ id: 1, data: defaultData }]);

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
    setData((prevData) => callback(prevData, newData));
  };

  const [userList, setUserList] = useState(
    users.filter((user) => user.type == "Customer")
  );

  const [inputCount, setInputCount] = useState(1);
  const [inputId, setInputId] = useState([1]);
  const [userId, setUserId] = useState(userList[0].id);

  // filter cateogry of each user
  var typeUser: any = [];
  users.forEach((user) => {
    if (typeUser.indexOf(user.type) == -1) {
      typeUser = [...typeUser, user.type];
    }
  });

  useEffect(() => {
    //console.log("test effect: ", data);
  }, [data, inputId]);

  // do something if category (customer/supplier) change
  const handleCategoryChange = (e: any) => {
    const typeFilter = e.target.value;
    setUserList(users.filter((user) => user.type == typeFilter));
  };

  // handle if add row button is clicked (add more row)
  const handleAddRow = () => {
    setInputCount((prev) => (prev += 1));
    setInputId((prev) => [...prev, inputCount + 1]);
    setData((prev) => [...prev, { id: inputCount + 1, data: defaultData }]);
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
      <div className="container">
        <div className="row text-center mb-4 bg-warning rounded-2 p-2">
          <h4 className="text-dark">Add Payment</h4>
        </div>
        <div className="col">
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
                defaultValue={refId}
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
                {userList.map((user) => (
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
          <input type="hidden" name="ref" value={refId.toString()} />
          <input type="hidden" name="user" value={userId} />
          <input type="hidden" name="data" value={JSON.stringify({ data })} />
          <input
            className="btn btn-primary"
            type="submit"
            value="Add Transactions"
          />
        </form>
      </div>
    </Body>
  );
}
