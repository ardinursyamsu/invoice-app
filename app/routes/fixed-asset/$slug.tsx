import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Body from "assets/layouts/body";
import UserNavbar from "assets/layouts/customnavbar/user-navbar";
import { getUserById } from "~/models/user.server";

export const loader = async ({ params }: LoaderArgs) => {
  const userId = params.slug;
  const userData = await getUserById((!!userId && userId) || "");

  const defaultUser = { id: "nothing", name: "nothing", type: "other" };
  const user = (!!userData && userData) || defaultUser;
  return json({ user });
};

export default function DisplayUser() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <Body>
      <UserNavbar />
      <div className="px-4 py-5 my-5 text-center">
        <div className="col-lg-8 mx-auto">
          <form className="card border-1 mb-3 shadow" method="post">
            <div className="card-header bg-dark text-white py-3">
              <h4>Displaying {user.name}</h4>
            </div>
            <div className="p-4">
              <div className="row mb-3">
                <label className="col-sm-2 col-form-label text-start">User Name</label>
                <div className="col-sm-10">
                  <input className="form-control mb-2" type="text" name="name" value={user.name} />
                </div>
              </div>

              <div className="row mb-3">
                <label className="col-sm-2 col-form-label text-start">User ID</label>
                <div className="col-sm-10">
                  <input className="form-control mb-2" type="text" name="id" value={user.id} />
                </div>
              </div>

              <div className="row mb-3">
                <label className="col-sm-2 col-form-label text-start">User Type</label>
                <div className="col-sm-10">
                  <select className="form-select mb-2" name="type" id="type" defaultValue={user.type}>
                    <option value="Customer">Customer</option>
                    <option value="Supplier">Supplier</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <input className="btn btn-primary float-end" type="submit" value="Create" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </Body>
  );
}
