import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MainLayout({ children }) {
  return (
    <div className="container-fluid">

      <div className="row">

        <div className="col-md-3 p-0">
          <Sidebar />
        </div>

        <div className="col-md-9 p-0">

          <Navbar />

          <div className="p-4">
            {children}
          </div>

        </div>

      </div>

    </div>
  );
}

export default MainLayout;