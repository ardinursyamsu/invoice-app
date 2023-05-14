import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Body from "assets/layouts/body";
import { getAccounts } from "~/models/account.server";
import AccountNavbar from "assets/layouts/customnavbar/account-navbar";

export const loader = async () => {
  // Get sub-account type inventory
  var accounts = await getAccounts();

  return json({ accounts });
};

const toUpper = (input: string) => {
  const firstLetter = input.charAt(0).toUpperCase();
  const theRest = input.slice(1, input.length);
  return firstLetter + theRest;
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
                  <td className="text-center">{toUpper(account.type)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Body>
  );
}
