import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MainLayout({ children }) {
  return (
    <div className="d-flex w-100 app-shell" style={{ minHeight: "100vh" }}>
      {/* Sidebar Anchor with Strict Width */}
      <div style={{ width: "260px", flexShrink: 0 }}>
        <Sidebar />
      </div>
      
      {/* Main Workspace Engine */}
      <div className="d-flex flex-column flex-grow-1 min-w-0">
        <Navbar />
        <main className="p-4 flex-grow-1 bg-light">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;