import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AccountListPage from "./pages/accounts/AccountListPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/accounts"
          element={<AccountListPage />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;