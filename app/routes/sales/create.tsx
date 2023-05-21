import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import SalesControl from "assets/components/sales-control";
import { getCurrentDate } from "assets/helper/helper";
import Body from "assets/layouts/body";
import SalesNavbar from "assets/layouts/customnavbar/sales-navbar";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { getSubAccountsByAccount } from "~/models/subaccount.server";
import {
  createTransaction,
  getLastOrderId,
  getQuantityInventoryItem,
} from "~/models/transaction.server";
import { getUserByType } from "~/models/user.server";
import type { ActionArgs } from "@remix-run/node";
import { Decimal } from "@prisma/client/runtime/library";

const transactionSource = "sale";

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

  var totalInventorySalesAmount = 0;
  var totalInventoryCOGSAmount = 0;

  // process each row of data input
/*  data.forEach((element: typeof data) => {
    const { id, data } = element;

    for (var i = 0; i < data.quantity; i++) {
      createTransaction({
        // credit each of the inventory
        trxTime: trxTime,
        orderId: ref,
        sourceTrx: transactionSource,
        controlTrx: "1",
        accountId: "inventory",
        subAccountId: data.inventoryId,
        amount: data.avgPrice,
        type: "cr",
        userId: userId,
        quantity: new Decimal(1);
      });

      totalInventorySalesAmount += data.price; // data for credit sales & debit AR
      totalInventoryCOGSAmount += data.avgPrice; // data for debit cogs
    }
  });

  createTransaction({
    // debit the cost of good sold the same amount as inventories credited
    trxTime: trxTime,
    ref: ref,
    transaction: transactionSource,
    accountId: "cost-of-good-sold",
    subAccountId: "cost-of-good-sold-default",
    amount: new Decimal(totalInventoryCOGSAmount),
    type: "db",
    userId: userId,
  });

  createTransaction({
    // credit the sales as amount willing be paid by customer
    trxTime: trxTime,
    ref: ref,
    transaction: transactionSource,
    accountId: "sales",
    subAccountId: "sales-default",
    amount: new Decimal(totalInventorySalesAmount),
    type: "cr",
    userId: userId,
  });

  createTransaction({
    // debit the AR as amount willing be paid by customer
    trxTime: trxTime,
    ref: ref,
    transaction: transactionSource,
    accountId: "account-receivable",
    subAccountId: "account-receivable-default",
    amount: new Decimal(totalInventorySalesAmount),
    type: "db",
    userId: userId,
  });

  createTransaction({
    // Credit the retained earnings as difference between amount paid by customer and the cost
    trxTime: trxTime,
    ref: ref,
    transaction: transactionSource,
    accountId: "retained-earnings",
    subAccountId: "retained-earnings-default",
    amount: new Decimal(totalInventorySalesAmount - totalInventoryCOGSAmount),
    type: "cr",
    userId: userId,
  });
*/
  return redirect("/sales");
};

export const loader = async () => {
  var id = await getLastOrderId();

  const customers = await getUserByType("Customer");

  id = !!id ? id : { orderId: 0 }; // For the first time program running, transaction is containing nothing.
  invariant(typeof id === "object", "Data is not valid");
  const refId = id.orderId + 1;

  // Get every sub-account type inventory
  const fullInventories = await getSubAccountsByAccount("inventory");

  const inventoryStatus = !!fullInventories[0]; // check if inventory already exists in database
  if (!inventoryStatus) {
    // if no inventory created, redirect user to create inventory
    return redirect("/inventory/create");
  }

  const inventoriesWithoutDefaultSubAccount = fullInventories.filter(
    (inventory) => inventory.name !== "default"
  ); // remove the default subaccount from list

  const inventories: any[] = [];
  for (const inventory of inventoriesWithoutDefaultSubAccount) {
    // extend inventory list to include quantity and average price
    const extendedInventory = await getQuantityInventoryItem(inventory.id);
    inventories.push({
      id: inventory.id,
      name: inventory.name,
      accountId: inventory.accountId,
      avg: extendedInventory.avgPrice,
      qty: extendedInventory.quantity,
    });
  }

  return json({ customers, refId, inventories });
};

export default function CreateSales() {
  const { customers, refId, inventories } = useLoaderData<typeof loader>();

  const date = getCurrentDate();

  const defaultData = {
    account: inventories[0],
    avgPrice: inventories[0].avg,
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

  const [inputCount, setInputCount] = useState(0);
  const [inputId, setInputId] = useState([0]);
  const [customer, setCustomer] = useState(customers[0].id);
  const [ref, setRef] = useState(refId);

  useEffect(() => {
    //console.log(data);
  }, [data, inputId]);

  // this will handle if customer dropdown menu change
  const handleCustomerChange = (e: any) => {
    setCustomer(e.target.value);
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
      <SalesNavbar />
      <div className="container">
        <div className="row text-center mb-4 bg-warning rounded-2 p-2">
          <h4 className="text-dark">Write Invoice</h4>
        </div>
        <div className="col">
          <div className="row mb-2">
            <label className="col-sm-3 col-form-label">Transaction Time</label>
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
            <label className="col-sm-3 col-form-label">Ref Number</label>
            <div className="col-sm-3">
              <input
                className="form-control"
                name="ref"
                type="text"
                value={ref}
                onChange={handleRefIdChange}
              />
            </div>
          </div>
          <div className="row mb-4">
            <label className="col-sm-3 col-form-label">Sales to</label>
            <div className="col-sm-3">
              <select className="form-select" onChange={handleCustomerChange}>
                {customers.map((customer: any) => (
                  <option key={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="d-flex flex-column border rounded-2 py-2 px-4 my-2">
          <div className="row mb-2 bg-dark text-white p-2 rounded">
            <div className="col-4">Inventory</div>
            <div className="col-1">Qty</div>
            <div className="col-3">Price</div>
            <div className="col-4">Total</div>
          </div>
          {inputId.map((id) => (
            <SalesControl
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
      <Form className="container px-2" method="post">
        <input type="hidden" name="trx-time" value={date} />
        <input type="hidden" name="ref" value={refId.toString()} />
        <input type="hidden" name="user" value={customer.toString()} />

        <input type="hidden" name="data" value={JSON.stringify({ data })} />
        <div className="container my-2">
          <button className="btn btn-primary" type="submit">
            Add Sales
          </button>
        </div>
      </Form>
    </Body>
  );
}
