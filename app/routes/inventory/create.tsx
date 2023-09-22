import { ActionArgs, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { ACT_INVENTORY } from "assets/helper/constants";
import { frmDataToString } from "assets/helper/form-data-converter";
import Body from "assets/layouts/body";
import InventoryNavbar from "assets/layouts/customnavbar/inventory-navbar";
import { useState } from "react";
import { createSubAccount } from "~/models/subaccount.server";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const id = frmDataToString(formData.get("id"));
  const name = frmDataToString(formData.get("name"));

  const accountId = ACT_INVENTORY;

  await createSubAccount({ id, name, accountId });
  return redirect("/inventory");
};

export default function CreateInventory() {
  const [inventoryId, setInventoryId] = useState("");
  const handleInventoryChange = (e: any) => {
    const inventoryString = e.target.value;
    const inventoryFilter = inventoryString.replace(/[^a-z0-9 ]/gi, "");
    setInventoryId(inventoryFilter.replaceAll(" ", "-").toLowerCase());
  };

  const onInventoryIdChange = (e: any) => {
    setInventoryId(e.target.value);
  };

  return (
    <Body>
      <InventoryNavbar />
      <div className="px-4 py-5 my-5 text-center">
        <div className="col-lg-8 mx-auto">
          <Form className="card border-1 mb-3 shadow" method="post">
            <div className="card-header bg-dark text-white py-3">
              <h4>Create Inventory</h4>
            </div>
            <div className="p-4">
              <div className="row mb-3">
                <label className="col-sm-3 col-form-label text-start">Inventory Name</label>
                <div className="col-sm-9">
                  <input className="form-control mb-2" type="text" name="name" onChange={handleInventoryChange} />
                </div>
              </div>

              <div className="row mb-3">
                <label className="col-sm-3 col-form-label text-start">Inventory ID</label>
                <div className="col-sm-9">
                  <input className="form-control mb-2" type="text" name="id" value={inventoryId} onChange={onInventoryIdChange} />
                </div>
              </div>
              <div>
                <input className="btn btn-primary float-end" type="submit" value="Create" />
              </div>
            </div>
          </Form>
        </div>
      </div>
    </Body>
  );
}
