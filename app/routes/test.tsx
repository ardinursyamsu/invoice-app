import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { formatter } from "assets/helper/helper";
import Body from "assets/layouts/body";

export const loader = () => {
  /*
  * id & name is obtained from sub-account with "inventory" account-type
  * quantity is (sum of debit) - (sum of credit)
  * price(avg price) - [(sum of price debit) - (sum of price credit)/quantity]
  */
  const inventoryData = [
    { id: "jeans", name: "Jeans", quantity: 20, price: 32000 },
    { id: "t-shirt", name: "Hoodie", quantity: 29, price: 25000 },
    { id: "sweater", name: "Sweater", quantity: 18, price: 45000 },
    { id: "hoodie", name: "Hoodie", quantity: 17, price: 48000 },
  ];

  return json({ inventoryData });
};

export default function Inventory() {
  const { inventoryData } = useLoaderData<typeof loader>();

  return (
    <Body>
      <div className="d-flex justify-content-center">
        <div className="self-align-center col-10">
          <table className="table table-bordered">
            <thead>
              <tr className="bg-dark text-white">
                <th scope="col">#</th>
                <th className="text-start" scope="col">Inventory Name</th>
                <th className="text-center" scope="col">Quantity</th>
                <th className="text-end" scope="col">Avg. Price</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.map((inventory, idx) => (
                <tr key={idx + 1}>
                  <th scope="row">{idx + 1}</th>
                  <td className="text-start">{inventory.name}</td>
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
