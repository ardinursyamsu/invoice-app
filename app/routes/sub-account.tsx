import { ActionArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Body from "assets/layouts/body";
import { useState } from "react";
import { getAccounts } from "~/models/account.server";
import { createSubAccount } from "~/models/subaccount.server";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const id: any = formData.get("subaccount-id");
  const name: any = formData.get("subaccount-name");
  const accountId: any = formData.get("subaccount-type");

  await createSubAccount({ id, name, accountId });
  return redirect("/sub-account");
};

export const loader = async () => {
  const accounts = await getAccounts();

  return json({ accounts });
};

export default function SubAccount() {
  const { accounts } = useLoaderData<typeof loader>();

  const [subAccountId, setSubAccountId] = useState("");

  const handleSubAccountChange = (e: any) => {
    const accountIdString = e.target.value;
    setSubAccountId(accountIdString.replaceAll(" ", "-").toLowerCase());
  };

  const onSubAccountIdChange = (e: any) => {
    setSubAccountId(e.target.value);
  };

  return (
    <Body>
      <div className="px-4 py-5 my-5 text-center">
        <div className="col-lg-9 mx-auto">
          <form className="card border-1 mb-3 shadow" method="post">
            <div className="card-header bg-dark text-white py-3">
              <h4>Create Sub-Account</h4>
            </div>
            <div className="p-4">
              <div className="row mb-3">
                <label
                  className="col-sm-4 col-form-label text-start"
                  htmlFor="subaccount-name"
                >
                  Sub-Account Name
                </label>
                <div className="col-sm-8">
                  <input
                    className="form-control mb-2"
                    name="subaccount-name"
                    type="text"
                    onChange={handleSubAccountChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <label
                  className="col-sm-4 col-form-label text-start"
                  htmlFor="subaccount-id"
                >
                  Sub-Account Id
                </label>
                <div className="col-sm-8">
                  <input
                    className="form-control mb-2"
                    name="subaccount-id"
                    type="text"
                    value={subAccountId}
                    onChange={onSubAccountIdChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <label className="col-sm-4 col-form-label text-start">
                  Account Type
                </label>
                <div className="col-sm-8">
                  <select
                    className="form-select mb-2"
                    name="subaccount-type"
                    id="subaccount-type"
                  >
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <input
                  className="btn btn-primary float-end"
                  type="submit"
                  value="Create"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </Body>
  );
}
