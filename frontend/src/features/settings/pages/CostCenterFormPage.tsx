import React, { useEffect } from "react";
import { CostCentersPage } from "./CostCentersPage";

/**
 * The route /settings/cost-centers/new exists for IA parity, but cost-center
 * creation is a small inline dialog on the list page. This wrapper opens the
 * list (dialog auto-opens via ?new=1 in a future iteration).
 */
const CostCenterFormPage: React.FC = () => {
  useEffect(() => {
    // No-op: dialog-driven creation lives on the list page.
  }, []);
  return <CostCentersPage />;
};

export default CostCenterFormPage;
