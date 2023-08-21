import { Decimal } from "@prisma/client/runtime";
import { ActionArgs, redirect } from "@remix-run/node";
import {
  ACCELERATED_DEPRECIATION,
  STRAIGHT_DEPRECIATION,
  SUB_FIXED_ASSET,
} from "assets/helper/constants";
import {
  frmDataToFloat,
  frmDataToInt,
  frmDataToString,
} from "assets/helper/form-data-converter";
import { formatter, getCurrentDate } from "assets/helper/helper";
import Body from "assets/layouts/body";
import FixedAssetNavbar from "assets/layouts/customnavbar/fixed-asset-navbar";
import { useState } from "react";
import { createFixedAsset } from "~/models/fixedasset.server";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const fixedAssetName = frmDataToString(formData.get("fixed-asset"));
  const fixedAssetId = frmDataToString(formData.get("fixed-asset-id"));
  const depreciationType = frmDataToInt(formData.get("depreciation-type"));
  const depreciation = new Decimal(
    frmDataToFloat(formData.get("depreciation"))
  );
  const acquisitionCost = new Decimal(
    frmDataToFloat(formData.get("acquisition-cost"))
  );
  const acquisitionDate = new Date(
    frmDataToString(formData.get("acquisition-date"))
  );
  const description = frmDataToString(formData.get("description"));

  // console.log("Fixed Asset Name", fixed_asset);
  // console.log("Fixed Asset Id", fixed_asset_id);
  // console.log("Depreciation Type", depreciation_type);
  // console.log("Depreciation", depreciation);
  // console.log("Acquisition Cost", acquisition_cost);
  // console.log("Acquisition Date", acquisition_date);
  // console.log("Description", description);

  const fixedAssetData = {
    id: fixedAssetId,
    name: fixedAssetName,
    subAccountId: SUB_FIXED_ASSET,
    acquisitionDate: acquisitionDate,
    description: description,
    acquisitionCost: acquisitionCost,
    depreciationType: depreciationType,
    depreciation: depreciation,
  };
  createFixedAsset(fixedAssetData);

  return redirect("/fixed-asset");
};

export default function CreateFixedAsset() {
  const [fixedAssetId, setFixedAssetId] = useState("");
  const [depreciation, setDepreciation] = useState(0.0);
  const [acquisitionCost, setAcquisitionCost] = useState(0.0);
  const [checkBoxValue, setCheckBoxValue] = useState(true);
  const [depreciationType, setDepreciationType] = useState(
    STRAIGHT_DEPRECIATION
  );

  const handleFixedAssetId = (e: any) => {
    const fixedAssetString = e.target.value;
    setFixedAssetId(fixedAssetString.replaceAll(" ", "-").toLowerCase());
  };
  const onFixedAssetIdChange = (e: any) => {
    setFixedAssetId(e.target.value);
  };

  const date = getCurrentDate();

  const handleDepreciationChange = (e: any) => {
    const depreciationRateAsString: string = e.target.value;
    const parsedDepreciationRate = parseInt(
      depreciationRateAsString.replace(/[^\d.-]/g, "")
    );

    var depreciationRate =
      (!!parsedDepreciationRate && parsedDepreciationRate) || 0;
    if (!checkBoxValue) {
      if (depreciationRate > 100) {
        depreciationRate = 100;
      } else if (depreciationRate < 0) {
        depreciationRate = 0;
      }
    }

    setDepreciation(depreciationRate);
  };

  const handleAcquisitionCostChange = (e: any) => {
    const acquisitionCostAsString: string = e.target.value;
    const parsedAcquisitionCost = parseInt(
      acquisitionCostAsString.replace(/[^\d.-]/g, "")
    );
    setAcquisitionCost((!!parsedAcquisitionCost && parsedAcquisitionCost) || 0);
  };

  const handleDepreciationTypeChange = (e: any) => {
    const isCheckBoxChecked = e.target.checked;
    setCheckBoxValue(isCheckBoxChecked);
    if (isCheckBoxChecked) {
      setDepreciationType(STRAIGHT_DEPRECIATION);
      setDepreciation(0);
    } else {
      setDepreciationType(ACCELERATED_DEPRECIATION);
      setDepreciation(0);
    }
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
              <div className="row mb-3 text-start">
                <div className="col-9"></div>
                <div className="col-3 form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input "
                    role="switch"
                    id="customSwitch1"
                    defaultChecked
                    onChange={handleDepreciationTypeChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexSwitchCheckDefault"
                  >
                    {(checkBoxValue && "Straight Line") || "Accelerated"}
                  </label>
                </div>
              </div>

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
                        value={formatter.format(acquisitionCost)}
                        onChange={handleAcquisitionCostChange}
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
                        name="acquisition-date"
                        type="datetime-local"
                        defaultValue={date}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mb-3">
                <label className="col-sm-2 col-form-label text-start">
                  {checkBoxValue ? "Depreciation Value" : "Depreciation Rate"}
                </label>
                <div className="col-sm-10">
                  <input
                    className="form-control text-end mb-2"
                    type="text"
                    name="depreciation"
                    value={
                      formatter.format(depreciation) +
                      (checkBoxValue ? "" : "%")
                    }
                    onChange={handleDepreciationChange}
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
                    name="description"
                    rows={3}
                  ></textarea>
                </div>
              </div>

              <input
                type="hidden"
                value={depreciationType}
                name="depreciation-type"
              />

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
