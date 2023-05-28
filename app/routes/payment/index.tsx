import Body from "assets/layouts/body";
import PaymentNavbar from "assets/layouts/customnavbar/payment-navbar";

export default function Payment() {
  return (
    <Body>
      <PaymentNavbar />
      <div className="d-flex justify-content-center">
        <div className="self-align-center col-11">
          <table className="table table-bordered">
            <thead>
              <tr className="bg-dark text-white">
                <th className="text-center col-1" scope="col">
                  #
                </th>
                <th className="text-center col-2" scope="col">
                  Date
                </th>
                <th className="text-center col-2" scope="col">
                  Ref ID
                </th>
                <th className="text-center col-2" scope="col">
                  Account
                </th>
                <th className="text-center col-2" scope="col">
                  Sub-Account
                </th>
                <th className="text-center col-1" scope="col">
                  User
                </th>
                <th className="text-center col-2" scope="col">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </Body>
  );
}
