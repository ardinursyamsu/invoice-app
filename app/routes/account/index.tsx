import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Body from "assets/layouts/body";
import { getAccounts } from "~/models/account.server";
import AccountNavbar from "assets/layouts/customnavbar/account-navbar";
import { displayCapitalFirst } from "assets/helper/helper";

export const loader = async () => {
  // Get sub-account type inventory
  var accounts = await getAccounts();

  return json({ accounts });
};

export default function Inventory() {
  const { accounts } = useLoaderData<typeof loader>();

  return (
    <Body>
      <AccountNavbar />
      <div className="d-flex justify-content-center">
        <div className="self-align-center col-10">
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
              {accounts.map((account: any, idx: any) => (
                <tr key={idx + 1}>
                  <th className="text-center" scope="row">
                    {idx + 1}
                  </th>
                  <td className="text-start">
                    <Link to={account.id}>{account.name}</Link>
                  </td>
                  <td className="text-center">{displayCapitalFirst(account.type)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Body>
  );
}
