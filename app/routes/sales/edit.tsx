import { LoaderArgs, json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import SalesControl from "assets/components/sales-control";
import { getCurrentDate, getDate } from "assets/helper/helper";
import Body from "assets/layouts/body";
import SalesNavbar from "assets/layouts/customnavbar/sales-navbar";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import {
  getSubAccounts,
  getSubAccountsByAccount,
} from "~/models/subaccount.server";
import {
  createTransaction,
  deleteTransactionsByOrderIdAndTransactionSource,
  getQuantityInventoryItem,
  getTransactionsByOrderIdAndTransactionSource,
} from "~/models/transaction.server";
import { getUserByType, getUsers } from "~/models/user.server";
import type { ActionArgs } from "@remix-run/node";
import { Decimal } from "@prisma/client/runtime/library";
import {
  ACT_ACCOUNT_RECEIVABLE,
  ACT_CASH,
  ACT_COGS,
  ACT_INVENTORY,
  ACT_RETAINED_EARNINGS,
  ACT_SALES,
  SUB_ACCOUNT_RECEIVABLE,
  SUB_CASH,
  SUB_COGS,
  SUB_NAME_DEFAULT,
  SUB_RETAINED_EARNINGS,
  SUB_SALES,
  TRX_CREDIT,
  TRX_DEBIT,
  TRX_SOURCE_SALES,
} from "assets/helper/constants";

const transactionSource = "sale";

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

  // get the old transaction
  const oldSalesTransaction =
    await getTransactionsByOrderIdAndTransactionSource(TRX_SOURCE_SALES, ref);
  // get the payment only transaction
  const receiptTransaction = oldSalesTransaction.filter(
    (trx) => trx.subAccountId === SUB_CASH
  );

  // delete the old transaction
  await deleteTransactionsByOrderIdAndTransactionSource(TRX_SOURCE_SALES, ref);

  const lastControlId = data[data.length - 1].id;

  // iterate for each controlId
  data.forEach(async (element: any) => {
    const { id, data } = element;
    const { inventoryId, avgPrice, quantity, price } = data;

    const total = price * quantity;
    const totalCost = avgPrice * quantity;

    // credit the inventory
    await createTransaction({
      trxTime: trxTime,
      orderId: parseInt(orderId),
      sourceTrx: transactionSource,
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
    await createTransaction({
      trxTime: trxTime,
      orderId: parseInt(orderId),
      sourceTrx: transactionSource,
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
    await createTransaction({
      trxTime: trxTime,
      orderId: parseInt(orderId),
      sourceTrx: transactionSource,
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
    await createTransaction({
      trxTime: trxTime,
      orderId: parseInt(orderId),
      sourceTrx: transactionSource,
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
    await createTransaction({
      trxTime: trxTime,
      orderId: parseInt(orderId),
      sourceTrx: transactionSource,
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

  // add the old cash payment
  for (const trx of receiptTransaction) {
    // create cash transaction
    const cashTransaction = {
      trxTime: trxTime,
      orderId: parseInt(orderId),
      sourceTrx: transactionSource,
      controlTrx: lastControlId + 1,
      accountId: ACT_CASH,
      subAccountId: SUB_CASH,
      unitPrice: trx.unitPrice,
      quantity: trx.quantity,
      amount: trx.amount,
      type: TRX_DEBIT,
      userId: userId,
    };
    await createTransaction(cashTransaction);

    // create the account receivable pair
    const accountReceivableTransaction = {
      trxTime: trxTime,
      orderId: parseInt(orderId),
      sourceTrx: transactionSource,
      controlTrx: lastControlId + 1,
      accountId: ACT_ACCOUNT_RECEIVABLE,
      subAccountId: SUB_ACCOUNT_RECEIVABLE,
      unitPrice: trx.unitPrice,
      quantity: trx.quantity,
      amount: trx.amount,
      type: TRX_CREDIT,
      userId: userId,
    };
    await createTransaction(accountReceivableTransaction);
  }

  return redirect("/sales");
};

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const slug = url.searchParams.get("orderid");
  const splitSlug = slug?.split("-");
  const ref = splitSlug?.at(0);
  const transaction = splitSlug?.at(1)?.toLowerCase();

  const users = await getUsers();
  const customers = await getUserByType("Customer");

  // get the transaction related to the orderID
  const salesTransaction = await getTransactionsByOrderIdAndTransactionSource(
    transaction ? transaction : "",
    Number(ref ? ref : 0)
  );

  // group based control id
  const totalNumControl = salesTransaction.filter(
    (trx) => trx.accountId == ACT_INVENTORY
  ).length;

  var arrPerControl = [];
  for (var i = 1; i <= totalNumControl; i++) {
    arrPerControl.push(salesTransaction.filter((trx) => trx.controlTrx == i));
  }

  // generate the data to be passed to control(s)
  var theData: any = [];
  var theDataCounter = 1;
  for (const control of arrPerControl) {
    var inventoryId = "";
    var avgPrice;
    var quantity = 0;
    var totalAmount = 0.0;

    for (const trx of control) {
      if (trx.accountId == ACT_INVENTORY) {
        inventoryId = trx.subAccountId;
        avgPrice = !!trx.unitPrice ? trx.unitPrice : 0.0;
        quantity = !!trx.quantity ? trx.quantity : 0;
      } else if (trx.subAccountId == SUB_SALES) {
        totalAmount = !!trx.amount ? Number(trx.amount) : 0.0;
      }
    }
    const price = Number(totalAmount) / quantity;

    if (inventoryId === "") {
      continue; // to escape from control that has no inventory transaction (recipt, payment, etc...)
    }
    theData.push({
      id: theDataCounter,
      data: { inventoryId, avgPrice, quantity, price },
    });
    theDataCounter++;
  }

  // get date
  var date = getCurrentDate();
  if (!!salesTransaction) {
    date = getDate(salesTransaction[0].trxTime.toString());
  }

  // check user
  const userStatus = !!users[0]; // if user hasn't created yet, force user to create first
  if (!userStatus) {
    return redirect("/user");
  }

  // For the first time program running, transaction is containing nothing.
  //id = !!id ? id : { ref: 0 };

  var refId = ref;
  const order = !!refId ? Number(refId) : 0;

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
  return json({ customers, order, inventories, date, theData });
};

export default function EditSales() {
  const { customers, order, inventories, date, theData } =
    useLoaderData<typeof loader>();

  const defaultData = {
    inventoryId: inventories[0].id,
    avgPrice: inventories[0].avg,
    quantity: 0,
    price: 0,
  };

  // keeping track of individual transaction control data
  const [data, setData] = useState(theData);

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
    setData((prevData: any) => callback(prevData, newData));
  };

  const [inputCount, setInputCount] = useState(theData.length);
  const [inputId, setInputId] = useState(
    Array.from(theData.map((data: any) => data.id))
  );

  const [customer, setCustomer] = useState(customers[0].id);
  const [orderId, setOrderId] = useState(order);

  useEffect(() => {
    //console.log("data", data);
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
    setInputCount((prev: any) => (prev += 1));
    setInputId((prev) => [...prev, inputCount + 1]);
    setData((prev: any) => [
      ...prev,
      { id: inputCount + 1, data: defaultData },
    ]);
  };

  // handle if btn delete(X) is clicked
  const handleDelete = (e: any) => {
    const id = e.currentTarget.id;
    setData((prevData: any) =>
      prevData.filter((data: any) => data.id != parseInt(id))
    );
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
              defaultData={data.find((d: any) => d.id == id)}
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
