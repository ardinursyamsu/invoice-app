import Body from "assets/layouts/body";
import InventoryNavbar from "assets/layouts/customnavbar/inventory-navbar";
import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import { getInventoryTransactionList } from "~/models/transaction.server";
import { useLoaderData } from "@remix-run/react";
import { decodeTransactionSource, getDate } from "assets/helper/helper";
import { getSubAccountsByAccount } from "~/models/subaccount.server";
import { ACT_INVENTORY } from "assets/helper/constants";

export const loader = async ({ params }: LoaderArgs) => {
  const slug = !!params.slug ? params.slug : "";
  const inventoryTransactionList = await getInventoryTransactionList(slug);
  const inventoryList = await getSubAccountsByAccount(ACT_INVENTORY);

  return json({ inventoryTransactionList, inventoryList });
};

export default function DisplayInventoryTransactions() {
  const { inventoryTransactionList, inventoryList } = useLoaderData<typeof loader>();
  return (
    <Body>
      <InventoryNavbar />
      <div className="conatainer mx-4">
        <table className="table table-bordered">
          <thead>
            <tr className="bg-dark text-white">
              <th className="text-center" scope="col">
                #
              </th>
              <th className="text-center" scope="col">
                Date
              </th>
              <th className="text-center" scope="col">
                Transaction
              </th>
              <th className="text-center" scope="col">
                Inventory Name
              </th>
              <th className="text-center" scope="col">
                Quantity
              </th>
            </tr>
          </thead>
          <tbody>
            {inventoryTransactionList.map((inventory, idx) => (
              <tr>
                <th scope="row" className="text-center">
                  {idx + 1}
                </th>
                <td>{getDate(inventory.trxTime).replace("T", " ")}</td>
                <td className="text-center">{decodeTransactionSource(inventory.sourceTrx)}</td>
                <td>{inventoryList.find((item) => item.id == inventory.subAccountId)?.name}</td>
                <td className="text-center">
                  {inventory.type == "db" ? "+" : "-"}
                  {inventory.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Body>
  );
}
