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
import { ACT_ACCOUNT_RECEIVABLE, ACT_COGS, ACT_INVENTORY, ACT_RETAINED_EARNINGS, ACT_SALES, SUB_ACCOUNT_RECEIVABLE, SUB_COGS, SUB_NAME_DEFAULT, SUB_RETAINED_EARNINGS, SUB_SALES, TRX_CREDIT, TRX_DEBIT, TRX_SOURCE_SALES } from "assets/helper/constants";

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

  var totalInventorySalesAmount = 0;
  var totalInventoryCOGSAmount = 0;

  // iterate for each controlId
  data.forEach(async (element: any) => {
    const { id, data } = element;
    const { inventoryId, avgPrice, quantity, price } = data;

    const total = price * quantity;
    const totalCost = avgPrice * quantity;

    // credit the inventory
    createTransaction({
      trxTime: trxTime,
      orderId: parseInt(orderId),
      sourceTrx: TRX_SOURCE_SALES,
      controlTrx: id,
      accountId: ACT_INVENTORY,
      subAccountId: inventoryId,
      unitPrice: new Decimal(avgPrice),
      quantity: quantity,
      amount: new Decimal(totalCost),
      type: TRX_CREDIT,
      userId: userId,
    });

    // debit the cogs
    createTransaction({
      trxTime: trxTime,
      orderId: parseInt(orderId),
      sourceTrx: TRX_SOURCE_SALES,
      controlTrx: id,
      accountId: ACT_COGS,
      subAccountId: SUB_COGS,
      unitPrice: new Decimal(totalCost),
      quantity: 1,
      amount: new Decimal(totalCost),
      type: TRX_DEBIT,
      userId: userId,
    });

    // record the sales credit
    createTransaction({
      trxTime: trxTime,
      orderId: parseInt(orderId),
      sourceTrx: TRX_SOURCE_SALES,
      controlTrx: id,
      accountId: ACT_SALES,
      subAccountId: SUB_SALES,
      unitPrice: new Decimal(total),
      quantity: 1,
      amount: new Decimal(total),
      type: TRX_CREDIT,
      userId: userId,
    });

    // record the a/r debit
    createTransaction({
      trxTime: trxTime,
      orderId: parseInt(orderId),
      sourceTrx: TRX_SOURCE_SALES,
      controlTrx: id,
      accountId: ACT_ACCOUNT_RECEIVABLE,
      subAccountId: SUB_ACCOUNT_RECEIVABLE,
      unitPrice: new Decimal(total),
      quantity: 1,
      amount: new Decimal(total),
      type: TRX_DEBIT,
      userId: userId,
    });
    // record the retained earnings
    createTransaction({
      trxTime: trxTime,
      orderId: parseInt(orderId),
      sourceTrx: TRX_SOURCE_SALES,
      controlTrx: id,
      accountId: ACT_RETAINED_EARNINGS,
      subAccountId: SUB_RETAINED_EARNINGS,
      unitPrice: new Decimal(total - totalCost),
      quantity: 1,
      amount: new Decimal(total - totalCost),
      type: TRX_CREDIT,
      userId: userId,
    });
  });

  return redirect("/sales");
};

export const loader = async () => {
  var id = await getLastOrderId();

  const customers = await getUserByType("Customer");

  id = !!id ? id : { orderId: 0 }; // For the first time program running, transaction is containing nothing.
  invariant(typeof id === "object", "Data is not valid");
  const order = id.orderId + 1;

  // Get every sub-account type inventory
  const fullInventories = await getSubAccountsByAccount(ACT_INVENTORY);

  const inventoryStatus = !!fullInventories[0]; // check if inventory already exists in database
  if (!inventoryStatus) {
    // if no inventory created, redirect user to create inventory
    return redirect("/inventory/create");
  }

  const inventoriesWithoutDefaultSubAccount = fullInventories.filter(
    (inventory) => inventory.name !== SUB_NAME_DEFAULT
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

  return json({ customers, order, inventories });
};

export default function CreateSales() {
  const { customers, order, inventories } = useLoaderData<typeof loader>();

  const date = getCurrentDate();

  const defaultData = {
    account: inventories[0].id,
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

  const [inputCount, setInputCount] = useState(1);
  const [inputId, setInputId] = useState([1]);
  const [customer, setCustomer] = useState(customers[0].id);
  const [orderId, setOrderId] = useState(order);

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
    var newOrderId = parseInt(e.target.value);
    newOrderId = !!newOrderId ? newOrderId : orderId;
    if (newOrderId < orderId) {
      newOrderId = orderId;
    }

    setOrderId(newOrderId);
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
                value={orderId}
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
            <div className="col-3">Inventory</div>
            <div className="col-2">Qty</div>
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
        <input type="hidden" name="orderId" value={orderId.toString()} />
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
