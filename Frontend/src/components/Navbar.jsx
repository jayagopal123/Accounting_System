function Navbar() {
  return (
    <header className="topbar px-4 py-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <div>
          <h4 className="mb-1 fw-bold">ERP Accounting System</h4>
          <div className="text-muted small">Accounts, masters, journals, and invoices</div>
        </div>
        <div className="text-muted small">Welcome, User!</div>
      </div>
    </header>
  );
}

export default Navbar;
