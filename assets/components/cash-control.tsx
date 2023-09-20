import { formatter } from "assets/helper/helper";
import { useEffect, useState } from "react";

export default function CashControl(props: any) {
  const { accounts, subAccounts } = props.data;

  const [selectedSubAccounts, setSelectedSubAccounts] = useState(
    subAccounts.filter((sub: any) => (sub.accountId === !!props.defaultData ? props.defaultData.data.account : accounts[0]))
  );
  const [account, setAccount] = useState(!!props.defaultData ? props.defaultData.data.account : accounts[0].id);
  const [subAccount, setSubAccount] = useState(!!props.defaultData ? props.defaultData.data.subAccount : selectedSubAccounts[0].id);
  const [amount, setAmount] = useState(!!props.defaultData ? props.defaultData.data.amount : 0);

  const [data, setData] = useState({
    account: account,
    subAccount: subAccount,
    amount: amount,
  });

  // handle if user change the account options drop down
  const handleAccountChange = (e: any) => {
    const subaccounts = subAccounts.filter((sub: any) => sub.accountId === e.target.value);
    setSelectedSubAccounts(subaccounts);
    setAccount(e.target.value);
    setData((prevData) => ({
      ...prevData,
      account: e.target.value,
      subAccount: subaccounts[0].id,
    }));
  };

  const handleAmountChange = (e: any) => {
    const amountValueAsString: string = e.target.value;
    const parsedAmount = parseInt(amountValueAsString.replace(/[^\d.-]/g, ""));

    setAmount((!!parsedAmount && parsedAmount) || 0);
    setData({ ...data, amount: parsedAmount });
  };

  useEffect(() => {
    //console.log("useEffect-", props.id , data);
    props.callback(props.id, data);
  }, [data]);

  return (
    <div className="row border rounded-2 mb-2 py-2">
      <div className="col-4">
        <select className="form-select" onChange={handleAccountChange} defaultValue={account}>
          {accounts.map((account: any) => (
            <option value={account.id} key={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-4">
        <select name="account" className="form-select" defaultValue={subAccount}>
          {selectedSubAccounts.map((subAccount: any) => (
            <option key={subAccount.id}>{subAccount.name}</option>
          ))}
        </select>
      </div>
      <div className="col-3">
        <input className="form-control text-end" type="text" value={formatter.format(amount)} onChange={handleAmountChange} />
      </div>
      <div className="col-1">
        <button id={props.id} onClick={props.onDelete} className="btn btn-outline-secondary d-none d-sm-none d-md-none d-lg-block">
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  );
}
