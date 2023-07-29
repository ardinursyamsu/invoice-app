import { ActionArgs, redirect } from "@remix-run/node";
import { ACT_FIXED_ASSET } from "assets/helper/constants";
import { formatter, getCurrentDate } from "assets/helper/helper";
import Body from "assets/layouts/body";
import FixedAssetNavbar from "assets/layouts/customnavbar/fixed-asset-navbar";
import { useState } from "react";
import invariant from "tiny-invariant";
import { createSubAccount } from "~/models/subaccount.server";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const fixedAsset = formData.get("fixed-asset");
  const fixedAssetId = formData.get("fixed-asset-id");
  const depreciationRate = formData.get("depreciation-rate");

  invariant(typeof fixedAsset === "string", "This should be a string");
  invariant(typeof fixedAssetId === "string", "This should be a string");
  invariant(typeof depreciationRate === "string", "This should be a string");

  console.log("Fixed Asset Name", fixedAsset);
  console.log("Fixed Asset Id", fixedAssetId);
  console.log("Depreciation Rate", depreciationRate);

  createSubAccount({
    id: fixedAssetId,
    name: fixedAsset,
    accountId: ACT_FIXED_ASSET,
  });
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

  const date = getCurrentDate();

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
                <div className="col-6">
                  <div className="row align-items-center">
                    <label className="col-sm-4 col-form-label text-start">
                      Acquisition Cost
                    </label>
                    <div className="col-sm-8">
                      <input
                        className="form-control text-end mb-2"
                        type="text"
                        name="acquisition-cost"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="row align-items-center">
                    <label className="col-sm-4 col-form-label text-start">
                      Acquisition Date
                    </label>
                    <div className="col-sm-8">
                      <input
                        className="form-control"
                        name="trxTime"
                        type="datetime-local"
                        defaultValue={date}
                      />
                    </div>
                  </div>
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

              <div className="row mb-3">
                <label className="col-sm-2 col-form-label text-start">
                  Description
                </label>
                <div className="col-sm-10">
                  <textarea
                    className="form-control"
                    id="exampleFormControlTextarea1"
                    rows={3}
                  ></textarea>
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
