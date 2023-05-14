import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import SalesControl from "assets/components/sales-control";
import { getCurrentDate } from "assets/helper/helper";
import Body from "assets/layouts/body";
import SalesNavbar from "assets/layouts/customnavbar/sales-navbar";
import invariant from "tiny-invariant";
import { getLastRefId } from "~/models/transaction.server";
import { getUserByType } from "~/models/user.server";

export const loader = async () => {
  var id = await getLastRefId();

  const customers = await getUserByType("Customer");

  // For the first time program running, transaction is containing nothing.
  id = !!id ? id : { ref: 0 };

  invariant(typeof id === "object", "Data is not valid");
  const refId = id.ref + 1;

  return json({ customers, refId });
};

export default function CreateSales() {
  const { customers, refId } = useLoaderData<typeof loader>();

  const date = getCurrentDate();
  return (
    <Body>
      <SalesNavbar />
      Todo: 1. design input - ref - transactionSource = "sale" - customer - date
      - inventory - inventory quantity - inventory price - inventory total -
      total all
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
                defaultValue={refId}
              />
            </div>
          </div>
          <div className="row mb-4">
            <label className="col-sm-3 col-form-label">Sales to</label>
            <div className="col-sm-3">
              <select className="form-select">
                {customers.map((customer: any) => (
                  <option key={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>
            <div className="col-sm-3">
              <select className="form-select"></select>
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
          <SalesControl />
        </div>
        
      </div>
    </Body>
  );
}
