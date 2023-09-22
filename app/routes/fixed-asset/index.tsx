import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { displayCapitalFirst, formatter } from "assets/helper/helper";
import Body from "assets/layouts/body";
import FixedAssetNavbar from "assets/layouts/customnavbar/fixed-asset-navbar";
import { getAllFixedAsset } from "~/models/fixedasset.server";

export const loader = async () => {
  var fixedAsset = await getAllFixedAsset();

  return json({ fixedAsset });
};

export default function FixedAsset() {
  const { fixedAsset } = useLoaderData<typeof loader>();

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
              {fixedAsset.map((fixedAsset: any, idx: any) => (
                <tr key={idx + 1}>
                  <th className="text-center align-middle" scope="row">
                    {idx + 1}
                  </th>
                  <td className="text-start align-middle">{displayCapitalFirst(fixedAsset.name)}</td>
                  <td className="text-center align-middle">{formatter.format(!!fixedAsset.acquisitionCost ? fixedAsset.acquisitionCost : 0.0)}</td>
                  <td className="text-center align-middle">
                    <Link to={fixedAsset.id}>
                      <button className="btn btn-primary m-1">Edit</button>
                    </Link>
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
