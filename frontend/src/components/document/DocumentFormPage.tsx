import React from "react";
import { DOC_TYPES } from "./docTypes";
import { DocumentForm } from "./DocumentForm";

/**
 * Shared form page for the four document types (Sales/Purchase Invoices, Credit/Debit Notes).
 * DocumentForm reads :id from useParams internally, so no props besides the doc type are needed.
 */
export const DocumentFormPage: React.FC<{ docTypeKey: keyof typeof DOC_TYPES }> = ({ docTypeKey }) => {
  return <DocumentForm key={docTypeKey} docTypeKey={docTypeKey} />;
};

export default DocumentFormPage;
