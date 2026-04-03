import { useLocation, useParams } from "react-router-dom";
import CreateMailingPage from "./CreateMailingPage";


export default function EditMailingPage() {
  const { state }  = useLocation();
  const { id }     = useParams();
  const mailing    = state || mailing.find((m) => String(m.id) === String(id));

  return <CreateMailingPage mailingData={mailing} />;
}