import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Body from "assets/layouts/body";
import FixedAssetNavbar from "assets/layouts/customnavbar/fixed-asset-navbar";
import { getUsers } from "~/models/user.server";

export const loader = async () => {
  // Get user
  var users = await getUsers();

  return json({ users });
};

export default function FixedAsset() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <Body>
      <FixedAssetNavbar />
      <div className="d-flex justify-content-center">
        <div className="self-align-center col-10">
          <table className="table table-bordered">
            <thead>
              <tr className="bg-dark text-white">
                <th className="text-center align-middle" scope="col">
                  #
                </th>
                <th className="text-start" scope="col">
                  Fixed Asset
                </th>
                <th className="text-center" scope="col">
                  Acquisition Cost
                </th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any, idx: any) => (
                <tr key={idx + 1}>
                  <th className="text-center align-middle" scope="row">
                    {idx + 1}
                  </th>
                  <td className="text-start align-middle">{user.name}</td>
                  <td className="text-center align-middle">{user.type}</td>
                  <td className="text-center align-middle">
                    <Link to={user.id}><button className="btn btn-primary m-1">Edit</button></Link>
                    <button className="btn btn-danger m-1">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Body>
  );
}
