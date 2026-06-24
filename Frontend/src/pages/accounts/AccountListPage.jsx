import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getAccounts } from "../../services/accountApi";

function AccountListPage() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await getAccounts();

      setAccounts(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Chart Of Accounts</h2>

        <button className="btn btn-primary">
          + New Account
        </button>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Type</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {accounts.map((account) => (
            <tr key={account._id}>
              <td>{account.code}</td>
              <td>{account.name}</td>
              <td>{account.accountType}</td>
              <td>{account.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </MainLayout>
  );
}

export default AccountListPage;