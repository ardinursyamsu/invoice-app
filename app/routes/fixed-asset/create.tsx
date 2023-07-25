import { ActionArgs, redirect } from "@remix-run/node";
import { formatter } from "assets/helper/helper";
import Body from "assets/layouts/body";
import FixedAssetNavbar from "assets/layouts/customnavbar/fixed-asset-navbar";
import { useState } from "react";
import invariant from "tiny-invariant";
import { createUser } from "~/models/user.server";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const fixedAsset = formData.get("fixed-asset");
  const fixedAssetId = formData.get("fixed-asset-id");
  const depreciationRate = formData.get("depreciation-rate");

  invariant(typeof fixedAsset === "string", "This should be a string");
  invariant(typeof fixedAssetId === "string", "This should be a string");
  invariant(typeof depreciationRate === "string", "This should be a string");

  console.log("Fixed Asset Name", fixedAsset)
  console.log("Fixed Asset Id", fixedAssetId)
  console.log("Depreciation Rate", depreciationRate)

  //await createUser({ id, name, type });
  return redirect("/fixed-asset");
};

export default function CreateFixedAsset() {
  const [fixedAssetId, setFixedAssetId] = useState("");
  const [depreciationRate, setDepreciationRate] = useState(0.0);
  const handleFixedAssetId = (e: any) => {
    const fixedAssetString = e.target.value;
    setFixedAssetId(fixedAssetString.replaceAll(" ", "-").toLowerCase());
  };
  const onFixedAssetIdChange = (e: any) => {
    setFixedAssetId(e.target.value);
  };

  const handleDepreciationRateChange = (e: any) => {
    const depreciationRateAsString: string = e.target.value;
    const parsedDepreciationRate = parseInt(
      depreciationRateAsString.replace(/[^\d.-]/g, "")
    );
    setDepreciationRate(
      (!!parsedDepreciationRate && parsedDepreciationRate) || 0
    );
  };

  return (
    <Body>
      <FixedAssetNavbar />
      <div className="px-4 py-5 my-5 text-center">
        <div className="col-lg-8 mx-auto">
          <form className="card border-1 mb-3 shadow" method="post">
            <div className="card-header bg-dark text-white py-3">
              <h4>Create Fixed Asset</h4>
            </div>
            <div className="p-4">
              <div className="row mb-3">
                <label className="col-sm-2 col-form-label text-start">
                  Fixed Asset
                </label>
                <div className="col-sm-10">
                  <input
                    className="form-control mb-2"
                    type="text"
                    name="fixed-asset"
                    onChange={handleFixedAssetId}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <label className="col-sm-2 col-form-label text-start">
                  Fixed Asset ID
                </label>
                <div className="col-sm-10">
                  <input
                    className="form-control mb-2"
                    type="text"
                    name="fixed-asset-id"
                    value={fixedAssetId}
                    onChange={onFixedAssetIdChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <label className="col-sm-2 col-form-label text-start">
                  Depreciation Rate
                </label>
                <div className="col-sm-10">
                  <input
                    className="form-control text-end mb-2"
                    type="text"
                    name="depreciation-rate"
                    value={formatter.format(depreciationRate) + "%"}
                    onChange={handleDepreciationRateChange}
                  />
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
