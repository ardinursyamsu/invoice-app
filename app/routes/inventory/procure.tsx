import Body from "assets/layouts/body";
import ProcurementControl from "assets/components/procurement-control";
import { createTransaction, getLastOrderId } from "~/models/transaction.server";
import invariant from "tiny-invariant";
import { json, redirect } from "@remix-run/node";
import type { ActionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { getCurrentDate } from "assets/helper/helper";
import { useEffect, useState } from "react";
import { getSubAccountsByAccount } from "~/models/subaccount.server";
import { getUsers } from "~/models/user.server";
import { Decimal } from "@prisma/client/runtime/library";
import InventoryNavbar from "assets/layouts/customnavbar/inventory-navbar";
import {
  ACT_ACCOUNT_RECEIVABLE,
  ACT_CASH,
  ACT_INVENTORY,
  SUB_ACCOUNT_RECEIVABLE,
  SUB_CASH,
  SUB_NAME_DEFAULT,
  TRX_CREDIT,
  TRX_DEBIT,
  TRX_SOURCE_INVENTORY,
} from "assets/helper/constants";
import { frmDataToInt, frmDataToString } from "assets/helper/form-data-converter";

const ADDITIONAL_EXPENSE_LABEL = "additional-expense";

const getExpensePerInventoryItem = (inventoryData: any) => {
  try {
    var totalExpense = 0;
    var totalInventoryItems = 0;
    for (const subData of inventoryData) {
      if (subData.data.inventoryId == ADDITIONAL_EXPENSE_LABEL) {
        totalExpense += subData.data.total;
      } else {
        totalInventoryItems += subData.data.quantity;
      }
    }

    return totalExpense / totalInventoryItems;
  } catch (e) {
    return 0;
  }
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const rawdata = frmDataToString(formData.get("data"));
  const jsonData = JSON.parse(rawdata);

  const { data } = jsonData;
  const orderId = frmDataToInt(formData.get("orderId"));
  const date = frmDataToString(formData.get("trx-time"));
  const trxTime = new Date(date);
  const userId = frmDataToString(formData.get("user"));

  const paymentType = formData.get("payment");

  const expensePerQtyItem = getExpensePerInventoryItem(data);


  data.forEach((element: any) => {
    // iterate for each control
    const { id, data } = element;
    const { inventoryId, quantity, price, total } = data;

    if (inventoryId == ADDITIONAL_EXPENSE_LABEL){
      return; // works like continue statement
    }

    const priceWithExpense = price + expensePerQtyItem;
    const totalWithExpense = priceWithExpense * quantity;
    // create transaction for inventory
    createTransaction({
      trxTime: trxTime,
      orderId: orderId,
      sourceTrx: TRX_SOURCE_INVENTORY,
      controlTrx: id,
      accountId: ACT_INVENTORY,
      subAccountId: inventoryId,
      unitPrice: new Decimal(priceWithExpense),
      quantity: quantity,
      amount: new Decimal(totalWithExpense),
      type: TRX_DEBIT,
      userId: userId,
    });

    // create transaction for Account payable or cash
    var account = "";
    var subAccount = "";
    switch (paymentType) {
      case "cash": // if cash, credit the cash
        account = ACT_CASH;
        subAccount = SUB_CASH;
        break;
      case "credit": // if credit, credit theh account payable
        account = ACT_ACCOUNT_RECEIVABLE;
        subAccount = SUB_ACCOUNT_RECEIVABLE;
        break;
    }

    createTransaction({
      trxTime: trxTime,
      orderId: orderId,
      sourceTrx: TRX_SOURCE_INVENTORY,
      controlTrx: id,
      accountId: account,
      subAccountId: subAccount,
      unitPrice: new Decimal(totalWithExpense),
      quantity: 1,
      amount: new Decimal(totalWithExpense),
      type: TRX_CREDIT,
      userId: userId,
    });
  });

  return redirect("/inventory");
};

export const loader = async () => {
  var id = await getLastOrderId();

  id = !!id ? id : { orderId: 0 }; // For the first time program running, transaction is containing nothing.
  invariant(typeof id === "object", "Data is not valid");
  const order = id.orderId + 1;

  // Getsub-account type inventory
  var inventories = await getSubAccountsByAccount("inventory");
  inventories = inventories.filter((inventory) => inventory.name !== SUB_NAME_DEFAULT); // remove the default subaccount

  const inventoryStatus = !!inventories[0]; // check if inventory already exists in database
  if (!inventoryStatus) {
    // if no inventory created, redirect user to create inventory
    return redirect("/inventory/create");
  }

  const users = await getUsers();

  // add expenses to inventory
  inventories.push({ id: "additional-expense", name: "Additional Expenses", accountId: "inventory" });

  return json({ order, inventories, users });
};

/* -- Render in Client -- */
export default function ProcureInventory() {
  const { order, inventories, users } = useLoaderData<typeof loader>();

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
    const retData = prevData.map((prev: any) => (prev.id == newData.id ? newData : prev));
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
  const [orderId, setOrderId] = useState(order);
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
    var newOrderId = parseInt(e.target.value);
    newOrderId = !!newOrderId ? newOrderId : orderId;
    if (newOrderId < orderId) {
      newOrderId = orderId;
    }

    setOrderId(newOrderId);
  };

  // this will handle if user change payment type
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
    setInputId((prevInputId) => prevInputId.filter((inputId) => inputId != parseInt(id)));
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
          <div className="col-sm-10">
            <input className="form-control" name="trxTime" type="datetime-local" defaultValue={date} />
          </div>
          <label className="col-sm-2 col-form-label">User</label>
          <div className="col-sm-3">
            <select name="user" className="form-select" onChange={handleUserChange}>
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
            <input className="form-control" name="orderId" type="text" value={orderId} onChange={handleRefIdChange} />
          </div>
          <label className="col-sm-2 col-form-label">Payment Type</label>
          <div className="col-sm-3">
            <select name="payment" className="form-select" onChange={handlePaymentChange}>
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
            <ProcurementControl key={id} id={id} data={{ inventories }} onDelete={handleDelete} callback={handleComponentDataChange} />
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
      <Form className="container px-2" method="post">
        <input type="hidden" name="trx-time" value={date} />
        <input type="hidden" name="orderId" value={orderId.toString()} />
        <input type="hidden" name="user" value={user.toString()} />
        <input type="hidden" name="payment" value={payment.toString()} />
        <input type="hidden" name="data" value={JSON.stringify({ data })} />
        <div className="container my-2">
          <button className="btn btn-primary" type="submit">
            Add Transactions
          </button>
        </div>
      </Form>
    </Body>
  );
}
