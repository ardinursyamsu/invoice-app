import { ActionArgs, json, redirect } from "@remix-run/node";
import Body from "assets/layouts/body";
import { useState } from "react";
import invariant from "tiny-invariant";
import { createAccount } from "~/models/account.server";
import { createSubAccount } from "~/models/subaccount.server";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const id: any = formData.get("account-id");
  const name: any = formData.get("account-name");
  const type: any = formData.get("account-type");

  invariant(typeof id === "string", "Data must be string");
  invariant(typeof id === "string", "Data must be string");
  invariant(typeof id === "string", "Data must be string");

  const subAccountId = id + "-default";
  await createAccount({ id, name, type });
  await createSubAccount({ id: subAccountId, name: "default", accountId: id }); // create default sub-account

  return redirect("/account");
}

export default function Account() {
  const [accountId, setAccountId] = useState("");
  const handleAccountChange = (e: any) => {
    const accountString = e.target.value;
    setAccountId(accountString.replaceAll(" ", "-").toLowerCase());
  };

  const onAccountIdChange = (e: any) => {
    setAccountId(e.target.value);
  };
  return (
    <Body>
      <div className="px-4 py-5 my-5 text-center">
        <div className="col-lg-8 mx-auto">
          <form className="card border-1 mb-3 shadow" method="post">
            <div className="card-header bg-dark text-white py-3">
              <h4>Create Account</h4>
            </div>
            <div className="p-4">
              <div className="row mb-3">
                <label
                  className="col-sm-3 col-form-label text-start"
                  htmlFor="account-name"
                >
                  Account Name
                </label>
                <div className="col-sm-9">
                  <input
                    className="form-control mb-2"
                    name="account-name"
                    type="text"
                    onChange={(e) => handleAccountChange(e)}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <label
                  className="col-sm-3 col-form-label text-start"
                  htmlFor="account-id"
                >
                  Account Id
                </label>
                <div className="col-sm-9">
                  <input
                    className="form-control mb-2"
                    name="account-id"
                    type="text"
                    value={accountId}
                    onChange={onAccountIdChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <label className="col-sm-3 col-form-label text-start">
                  Account Type
                </label>
                <div className="col-sm-9">
                  <select
                    className="form-select mb-2"
                    name="account-type"
                    id="account-type"
                  >
                    <option value="asset">Asset</option>
                    <option value="liability">Liability</option>
                    <option value="equity">Equity</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
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
