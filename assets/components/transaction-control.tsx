/* Only to be used in Transactions Page
 * Props: - id =>
 *        - accounts => Accounts model
 *        - subaccounts => SubAccounts model
 *        - users => Users Model
 *        - handleData => callback handle to updated component data
 *        - onDelete => callback to handle delete click
 */

import { useEffect, useState } from "react";

const formatter = new Intl.NumberFormat("en-US", { style: "decimal" });

/* -- Render in Client -- */
export function TransactionControl(props: any) {
  const { accounts, subAccounts, users } = props.data;

  const [selectedSubAccounts, setSelectedSubAccounts] = useState(
    subAccounts.filter((sub: any) => sub.accountId === accounts[0].id)
  );
  const [account, setAccount] = useState(!!props.defaultData? props.defaultData.data.account : accounts[0].id);
  const [subAccount, setSubAccount] = useState(!!props.defaultData? props.defaultData.data.subAccount : selectedSubAccounts[0].id);
  const [debit, setDebit] = useState(!!props.defaultData? props.defaultData.data.debit : 0);
  const [credit, setCredit] = useState(!!props.defaultData? props.defaultData.data.credit : 0);
  const [user, setUser] = useState(!!props.defaultData? props.defaultData.data.user : users[0].id);

  const [data, setData] = useState({
    account: account,
    subAccount: subAccount,
    debit: debit,
    credit: credit,
    user: user,
  });

  // call the higher state if there's any update in data
  useEffect(() => {
    //console.log(data);
    // the final state is in the parent. Use callback in here to update value in the parent
    props.callback(props.id, data);
  }, [data]);

  const handleAccountChange = (e: any) => {
    const subaccounts = subAccounts.filter(
      (sub: any) => sub.accountId === e.target.value
    );
    setSelectedSubAccounts(subaccounts);
    setAccount(e.target.value);
    setData((prevData) => ({
      ...prevData,
      account: e.target.value,
      subAccount: subaccounts[0].id,
    }));
  };

  const handleSubAccountChange = (e: any) => {
    setSubAccount(e.target.value);
    setData((prevData) => ({ ...prevData, subAccount: e.target.value }));
  };

  const handleDebitChange = (e: any) => {
    const debitValueAsString: string = e.target.value;
    const parsedDebit = parseInt(debitValueAsString.replace(/[^\d.-]/g, ""));

    setDebit(!!parsedDebit && parsedDebit || 0);
    setCredit(0);
    setData({ ...data, credit: 0, debit: parsedDebit });
  };

  const handleCreditChange = (e: any) => {
    const creditValueAsString: string = e.target.value;
    const parsedCredit = parseInt(creditValueAsString.replace(/[^\d.-]/g, ""));

    setCredit(!!parsedCredit && parsedCredit || 0);
    setDebit(0);
    setData({ ...data, credit: parsedCredit, debit: 0 });
  };

  const handleUserChange = (e: any) => {
    setUser(e.target.value);
    setData((prevData) => ({ ...prevData, user: e.target.value }));
  };

  return (
    <div className="row border rounded-2 mb-2">
      <div className="col-3 my-2">
        <select
          className="form-select"
          name="account"
          defaultValue={account}
          onChange={(e) => handleAccountChange(e)}
        >
          {accounts.map((account: any) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-2 my-2">
        <select
          className="form-select"
          name="sub-account"
          defaultValue={subAccount}
          onChange={(e) => handleSubAccountChange(e)}
        >
          {selectedSubAccounts.map((subAccount: any) => (
            <option key={subAccount.id} value={subAccount.id}>
              {subAccount.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-2 my-2">
        <input
          className="form-control text-end"
          name="debit"
          type="text"
          value={formatter.format(debit)}
          onChange={(e) => handleDebitChange(e)}
        />
      </div>
      <div className="col-2 my-2">
        <input
          className="form-control text-end"
          name="credit"
          type="text"
          value={formatter.format(credit)}
          onChange={(e) => handleCreditChange(e)}
        />
      </div>
      <div className="col-2 my-2">
        <select
          className="form-select"
          name="user"
          onChange={(e) => handleUserChange(e)}
        >
          {users.map((user: any) => (
            <option key={user.id} value={user.id}>
              {user.name} - {user.type}
            </option>
          ))}
        </select>
      </div>
      <div className="col-1 my-2">
        <button
          className="btn btn-outline-secondary d-none d-sm-none d-md-none d-lg-block"
          id={props.id}
          onClick={(e) => props.onDelete(e)}
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  );
}
