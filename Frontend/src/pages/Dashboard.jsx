import MainLayout from "../layouts/MainLayout";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAccounts } from "../services/accountApi";
import { getCustomers } from "../services/customerApi";
import { getSuppliers } from "../services/supplierApi";
import { getJournalEntries } from "../services/journalEntryApi";

const cards = [
  { key: "accounts", label: "Accounts", route: "/accounts" },
  { key: "customers", label: "Customers", route: "/customers" },
  { key: "suppliers", label: "Suppliers", route: "/suppliers" },
  { key: "journalEntries", label: "Journal Entries", route: "/journal-entries" },
];

function Dashboard() {
  const [stats, setStats] = useState({
    accounts: 0,
    customers: 0,
    suppliers: 0,
    journalEntries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [accountsResponse, customersResponse, suppliersResponse, journalResponse] =
          await Promise.all([
            getAccounts(),
            getCustomers(),
            getSuppliers(),
            getJournalEntries(),
          ]);

        setStats({
          accounts: accountsResponse.data.data.length,
          customers: customersResponse.data.data.total ?? customersResponse.data.data.customers?.length ?? 0,
          suppliers: suppliersResponse.data.data.total ?? suppliersResponse.data.data.suppliers?.length ?? 0,
          journalEntries: journalResponse.data.data.length,
        });
      } catch {
        setStats({
          accounts: 0,
          customers: 0,
          suppliers: 0,
          journalEntries: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Dashboard</h2>
          <p className="text-muted mb-0">Operational summary from the existing ERP modules</p>
        </div>
      </div>

      <div className="row g-3">
        {cards.map((card) => (
          <div className="col-12 col-md-6 col-xl-3" key={card.key}>
            <div className="stat-card">
              <div className="stat-card__label">{card.label}</div>
              <div className="stat-card__value">{loading ? "..." : stats[card.key]}</div>
              <Link className="btn btn-sm btn-outline-primary mt-3" to={card.route}>
                Open module
              </Link>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}

export default Dashboard;
