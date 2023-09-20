import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { ACT_INVENTORY } from "assets/helper/constants";
import { formatter } from "assets/helper/helper";
import Body from "assets/layouts/body";
import InventoryNavbar from "assets/layouts/customnavbar/inventory-navbar";
import { getSubAccountsByAccount } from "~/models/subaccount.server";
import { getQuantityInventoryItem } from "~/models/transaction.server";

export const loader = async () => {
  /*
   * id & name is obtained from sub-account with "inventory" account-type
   * quantity is (sum of debit) - (sum of credit)
   * price(avg price) - [(sum of price debit) - (sum of price credit)/quantity]
   */

  // Get sub-account type inventory
  var inventories = await getSubAccountsByAccount(ACT_INVENTORY);
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

  /* example data to display in jsx
  const inventoryData = [
    { id: "jeans", name: "Jeans", quantity: 20, price: 32000 },
    { id: "t-shirt", name: "Hoodie", quantity: 29, price: 25000 },
    { id: "sweater", name: "Sweater", quantity: 18, price: 45000 },
    { id: "hoodie", name: "Hoodie", quantity: 17, price: 48000 },
  ];
  */

  return json({ inventoryData });
};

export default function Inventory() {
  const { inventoryData } = useLoaderData<typeof loader>();

  return (
    <Body>
      <InventoryNavbar />
      <div className="d-flex justify-content-center">
        <div className="self-align-center col-10">
          <table className="table table-bordered">
            <thead>
              <tr className="bg-dark text-white">
                <th scope="col">#</th>
                <th className="text-start" scope="col">
                  Inventory Name
                </th>
                <th className="text-center" scope="col">
                  Quantity
                </th>
                <th className="text-end" scope="col">
                  Avg. Price
                </th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.map((inventory: any, idx: any) => (
                <tr key={idx + 1}>
                  <th scope="row">{idx + 1}</th>
                  <td className="text-start">
                    <Link to={inventory.id}>{inventory.name}</Link>
                  </td>
                  <td className="text-center">{inventory.quantity}</td>
                  <td className="text-end">{formatter.format(inventory.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Body>
  );
}
