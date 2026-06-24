import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MainLayout({ children }) {
  return (
    <div className="container-fluid app-shell">
      <div className="row g-0">
        <div className="col-12 col-lg-3 col-xl-2">
          <Sidebar />
        </div>
        <div className="col-12 col-lg-9 col-xl-10 content-shell">
          <Navbar />
          <main className="p-3 p-md-4">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
