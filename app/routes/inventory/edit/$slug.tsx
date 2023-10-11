import { ActionArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import Body from "assets/layouts/body";
import InventoryNavbar from "assets/layouts/customnavbar/inventory-navbar";
import { useState } from "react";
import { json } from "@remix-run/node";
import { getSubAccountById, updateSubAccount } from "~/models/subaccount.server";
import { frmDataToString } from "assets/helper/form-data-converter";
import { ACT_INVENTORY } from "assets/helper/constants";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const id = frmDataToString(formData.get("id"));
  const name = frmDataToString(formData.get("name"));

  const accountId = ACT_INVENTORY;

  await updateSubAccount(id, name, accountId);
  return redirect("/inventory");
};

export const loader = async ({ params }: ActionArgs) => {
  const id = !!params.slug ? params.slug : "";
  const inventory = await getSubAccountById(id);

  return json({ inventory });
};

export default function EditInventory() {
  const inventoryData = useLoaderData<typeof loader>();

  const inventory = inventoryData?.inventory;

  const [inventoryId, setInventoryId] = useState(inventory?.id);
  const [inventoryName, setInventoryName] = useState(inventory?.name);

  const handleInventoryNameChange = (e: any) => {
    setInventoryName(e.target.value);
    const inventoryString = e.target.value;
    const inventoryFilter = inventoryString.replace(/[^a-z0-9 ]/gi, "");
    // setInventoryId(inventoryFilter.replaceAll(" ", "-").toLowerCase());
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
              <h4>Edit {inventoryName}</h4>
            </div>
            <div className="p-4">
              <div className="row mb-3">
                <label className="col-sm-3 col-form-label text-start">Inventory Name</label>
                <div className="col-sm-9">
                  <input className="form-control mb-2" type="text" name="name" value={inventoryName} onChange={handleInventoryNameChange} />
                </div>
              </div>

              <div className="row mb-3">
                <label className="col-sm-3 col-form-label text-start">Inventory ID</label>
                <div className="col-sm-9">
                  <input className="form-control mb-2" type="text" value={inventoryId} disabled />
                  <input type="hidden" value={inventoryId} name="id" />
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
