import { ActionArgs, redirect } from "@remix-run/node";
import Body from "assets/layouts/body";
import { useState } from "react";
import invariant from "tiny-invariant";
import { createUser } from "~/models/user.server";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const id = formData.get("id");
  const name = formData.get("name");
  const type = formData.get("type");

  invariant(typeof id === "string", "This should be a string");
  invariant(typeof name === "string", "This should be a string");
  invariant(typeof type === "string", "This should be a string");

  await createUser({ id, name, type });
  return redirect("/user");
};

export default function User() {
  const [userId, setUserId] = useState("");
  const handleUserChange = (e: any) => {
    const userString = e.target.value;
    setUserId(userString.replaceAll(" ", "-").toLowerCase());
  };
  const onUserIdChange = (e: any) => {
    setUserId(e.target.value);
  };

  return (
    <Body>
      <div className="px-4 py-5 my-5 text-center">
        <div className="col-lg-8 mx-auto">
          <form className="card border-1 mb-3 shadow" method="post">
            <div className="card-header bg-dark text-white py-3">
              <h4>Create User</h4>
            </div>
            <div className="p-4">
              <div className="row mb-3">
                <label className="col-sm-2 col-form-label text-start">
                  User Name
                </label>
                <div className="col-sm-10">
                  <input
                    className="form-control mb-2"
                    type="text"
                    name="name"
                    onChange={handleUserChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <label className="col-sm-2 col-form-label text-start">
                  User ID
                </label>
                <div className="col-sm-10">
                  <input
                    className="form-control mb-2"
                    type="text"
                    name="id"
                    value={userId}
                    onChange={onUserIdChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <label className="col-sm-2 col-form-label text-start">
                  User Type
                </label>
                <div className="col-sm-10">
                  <select className="form-select mb-2" name="type" id="type">
                    <option value="Customer">Customer</option>
                    <option value="Supplier">Supplier</option>
                    <option value="other">Other</option>
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
