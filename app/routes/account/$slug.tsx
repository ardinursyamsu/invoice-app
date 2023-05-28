import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import AccountNavbar from "assets/layouts/customnavbar/account-navbar";
import Body from "assets/layouts/body";
import { getAccountById } from "~/models/account.server";
import { getSubAccountsByAccount } from "~/models/subaccount.server";

export const loader = async ({ params }: LoaderArgs) => {
  const accountId = params.slug;
  const accountData = await getAccountById((!!accountId && accountId) || "");

  const defaultAccount = { id: "nothing", name: "nothing", type: "asset" };
  const account = (!!accountData && accountData) || defaultAccount;
  var subaccounts = [{ id: "nothing", name: "nothing", accountId: "nothing" }];
  if (!!accountData) {
    const subAccounts = await getSubAccountsByAccount(account.id);
    subaccounts = subAccounts;
  }
  return json({ account, subaccounts });
};

export default function DisplayAccount() {
  const { account, subaccounts } = useLoaderData<typeof loader>();
  return (
    <Body>
      <AccountNavbar />
      <div className="px-4 py-5 text-center">
        <div className="d-flex justify-content-center">
          <div className="self-align-center col-10">
            <div className="mb-4">
              <h3>Sub-account for {account.name}</h3>
            </div>

            <table className="table table-bordered">
              <thead>
                <tr className="bg-dark text-white">
                  <th className="text-center" scope="col">
                    #
                  </th>
                  <th className="text-start" scope="col">
                    Account Name
                  </th>
                  <th className="text-center" scope="col">
                    Account Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {subaccounts.map((subaccount: any, idx: any) => (
                  <tr key={idx + 1}>
                    <th className="text-center" scope="row">
                      {idx + 1}
                    </th>
                    <td className="text-start">
                      <Link to={subaccount.id}>{subaccount.name}</Link>
                    </td>
                    <td className="text-center">{subaccount.accountId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-primary">Add Sub-account</button>
          </div>
        </div>
      </div>
    </Body>
  );
}
