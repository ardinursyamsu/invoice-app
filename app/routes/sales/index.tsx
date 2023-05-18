import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { formatter } from "assets/helper/helper";
import Body from "assets/layouts/body";
import { getSubAccountsByAccount } from "~/models/subaccount.server";
import { getQuantityInventoryItem } from "~/models/transaction.server";
import SalesNavbar from "assets/layouts/customnavbar/sales-navbar";

export const loader = async () => {

  // Get sub-account type inventory
  var inventories = await getSubAccountsByAccount("inventory");
  inventories = inventories.filter((inventory) => inventory.name !== "default"); // remove the default subaccount
  var inventoryData: any = [];

  // Getting the inventory data (id, name, quantity, average price)
  for (let i = 0; i < inventories.length; i++) {
    const inventoryId = inventories[i].id;
    const inventoryName = inventories[i].name;
    const inventory = await getQuantityInventoryItem(inventoryId);
    inventoryData.push({
      id: inventoryId,
      name: inventoryName,
      quantity: inventory.quantity,
      price: inventory.avgPrice,
    });
  }

  const salesData = [
    {
      refId: "1-sale",
      name: "Jual Pakaian tuker nasi bakar",
      customer: "Abraham",
      total: 200000,
      status: "paid",
    },
    {
      refId: "2-sale",
      name: "2 lusin pakaian bekas",
      customer: "Naval",
      total: 388123,
      status: "paid",
    },
    {
      refId: "3-sale",
      name: "30 kaos om sonata",
      customer: "Astuti",
      total: 500500,
      status: "unpaid",
    },
    {
      refId: "4-sale",
      name: "18 celana dalam",
      customer: "Omar",
      total: 129000,
      status: "unpaid",
    },
  ];

  return json({ salesData });
};

export default function Sales() {
  const { salesData } = useLoaderData<typeof loader>();

  return (
    <Body>
      <SalesNavbar />
      <div className="d-flex justify-content-center">
        <div className="self-align-center col-10">
          <table className="table table-bordered">
            <thead>
              <tr className="bg-dark text-white">
                <th scope="col">Ref-Id</th>
                <th className="text-start" scope="col">
                  Sales List
                </th>
                <th className="text-center" scope="col">
                  Customers
                </th>
                <th className="text-end" scope="col">
                  Total
                </th>
                <th className="text-end" scope="col">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((sales: any) => (
                <tr key={sales.refId}>
                  <th scope="row">{sales.refId}</th>
                  <td className="text-start">
                    <Link to="">{sales.name}</Link>
                  </td>
                  <td className="text-center">{sales.customer}</td>
                  <td className="text-end">{formatter.format(sales.total)}</td>
                  <td className="text-end">{sales.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Body>
  );
}
