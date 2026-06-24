import MainLayout from "../layouts/MainLayout";

function Dashboard() {
  return (
    <MainLayout>

      <h2>Dashboard</h2>

      <div className="row mt-4">

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5>Customers</h5>
              <h3>0</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5>Suppliers</h5>
              <h3>0</h3>
            </div>
          </div>
        </div>

      </div>

    </MainLayout>
  );
}

export default Dashboard;