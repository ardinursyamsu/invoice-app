import InventoryNavbar from "assets/layouts/inventory-navbar";
import Body from "assets/layouts/body";
import ProcurementControl from "assets/components/procurement-control";
import { createTransaction, getLastRefId } from "~/models/transaction.server";
import invariant from "tiny-invariant";
import { json, redirect } from "@remix-run/node";
import type { ActionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getCurrentDate } from "assets/helper/helper";
import { useEffect, useState } from "react";
import { getSubAccountsByAccount } from "~/models/subaccount.server";
import { getUsers } from "~/models/user.server";
import { Decimal } from "@prisma/client/runtime/library";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const rawdata = formData.get("data");
  invariant(typeof rawdata === "string", "Data must be string");
  const jsonData = JSON.parse(rawdata);
  const { data } = jsonData;

  const refId = formData.get("ref");
  invariant(typeof refId === "string", "Data mut be string");
  const ref = parseInt(refId);

  const date = formData.get("trx-time");
  invariant(typeof date === "string", "Data must be string");
  const trxTime = new Date(date);

  const userId = formData.get("user");
  invariant(typeof userId === "string", "Data must be string");

  const paymentType = formData.get("payment");

  var totalAmount = 0;

  // process each row of data input
  data.forEach((element: typeof data) => {
    const { id, data } = element;

    for (var i = 0; i < data.quantity; i++) {
      const transactionData = {
        trxTime: trxTime,
        ref: ref,
        accountId: "inventory",
        subAccountId: data.inventoryId,
        amount: data.price,
        type: "db",
        userId: userId,
      };

      createTransaction(transactionData);
      totalAmount += data.price;
    }
  });

  // process the pair of inventory transactions
  switch (paymentType) {
    case "cash":
      createTransaction({
        trxTime: trxTime,
        ref: ref,
        accountId: "cash",
        subAccountId: "cash-default",
        amount: new Decimal(totalAmount),
        type: "cr",
        userId: userId,
      });
      break;
    case "credit":
      createTransaction({
        trxTime: trxTime,
        ref: ref,
        accountId: "account-payable",
        subAccountId: "account-payable-default",
        amount: new Decimal(totalAmount),
        type: "cr",
        userId: userId,
      });
      break;
  }

  return redirect("/inventory/procure");
};

export const loader = async () => {
  var id = await getLastRefId();

  // For the first time program running, transaction is containing nothing.
  id = !!id ? id : { ref: 0 };

  invariant(typeof id === "object", "Data is not valid");

  const refId = id.ref + 1;

  // Getsub-account type inventory
  var inventories = await getSubAccountsByAccount("inventory");
  inventories = inventories.filter((inventory) => inventory.name !== "default"); // remove the default subaccount

  const users = await getUsers();

  return json({ refId, inventories, users });
};
/* -- Render in Client -- */
export default function Procure() {
  const { refId, inventories, users } = useLoaderData<typeof loader>();

  const date = getCurrentDate();

  const defaultData = {
    account: inventories[0],
    quantity: 0,
    price: 0,
  };

  const [data, setData] = useState([{ id: 1, data: defaultData }]);

  // callback function to update transaction control data if there any change.
  // is called by handleComponentDataChange
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

  const [inputCount, setInputCount] = useState(1);
  const [inputId, setInputId] = useState([1]);
  const [user, setUser] = useState(users[0].id);
  const [ref, setRef] = useState(refId);
  const [payment, setPayment] = useState("cash");

  useEffect(() => {
    //console.log(data);
  }, [data, inputId]);

  // this will handle if user dropdown menu change
  const handleUserChange = (e: any) => {
    setUser(e.target.value);
  };

  // this will handle if user change the ref Id
  // Old ref id shouldn't be used
  const handleRefIdChange = (e: any) => {
    var newRef = parseInt(e.target.value);
    newRef = !!newRef ? newRef : refId;
    if (newRef < refId) {
      newRef = refId;
    }

    setRef(newRef);
  };

  // this will handle if user change peyment type
  const handlePaymentChange = (e: any) => {
    setPayment(e.target.value);
  };

  // this handle will add 1 more row of transaction control
  const handleAddRow = () => {
    setInputCount((prev) => (prev += 1));
    setInputId((prev) => [...prev, inputCount + 1]);
    setData((prev) => [...prev, { id: inputCount + 1, data: defaultData }]);
  };

  // handle if btn delete(X) is clicked
  const handleDelete = (e: any) => {
    const id = e.currentTarget.id;
    setData((prevData) => prevData.filter((data) => data.id != parseInt(id)));
    setInputId((prevInputId) =>
      prevInputId.filter((inputId) => inputId != parseInt(id))
    );
  };

  return (
    <Body>
      <InventoryNavbar />
      <div className="container px-4">
        <div className="row text-center mb-4 bg-warning rounded-2 p-2">
          <h4 className="text-dark">Add Transactions</h4>
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
          <label className="col-sm-2 col-form-label">User</label>
          <div className="col-sm-3">
            <select
              name="user"
              className="form-select"
              onChange={handleUserChange}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name + " - " + user.type}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="row mb-2">
          <label className="col-sm-2 col-form-label">Ref Number</label>
          <div className="col-sm-3">
            <input
              className="form-control"
              name="ref"
              type="text"
              value={ref}
              onChange={handleRefIdChange}
            />
          </div>
          <label className="col-sm-2 col-form-label">Payment Type</label>
          <div className="col-sm-3">
            <select
              name="payment"
              className="form-select"
              onChange={handlePaymentChange}
            >
              <option value="cash">Cash</option>
              <option value="credit">Credit</option>
            </select>
          </div>
        </div>
        <div className="row mb-4"></div>
        <div className="d-flex flex-column border rounded-2 py-3 px-4">
          <div className="row mb-2 bg-dark text-white p-2 rounded">
            <label className="col-3">Inventory</label>
            <label className="col-2">Quantity</label>
            <label className="col-3">Price</label>
            <label className="col-3">Total</label>
          </div>
          {inputId.map((id) => (
            <ProcurementControl
              key={id}
              id={id}
              data={{ inventories }}
              onDelete={handleDelete}
              callback={handleComponentDataChange}
            />
          ))}

          <div className="row align-self-end">
            <div>
              <button
                type="button"
                className="btn btn-warning"
                onClick={handleAddRow}
              >
                Add Row
              </button>
            </div>
          </div>
        </div>
      </div>
      <form className="container px-2" method="post">
        <input type="hidden" name="trx-time" value={date} />
        <input type="hidden" name="ref" value={refId.toString()} />
        <input type="hidden" name="user" value={user.toString()} />
        <input type="hidden" name="payment" value={payment.toString()} />
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
