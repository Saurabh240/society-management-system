import { useLocation, useParams } from "react-router-dom";
import CreateMailingPage from "./CreateMailingPage";
import { MAILINGS } from "../data";

export default function EditMailingPage() {
  const { state }  = useLocation();
  const { id }     = useParams();
  const mailing    = state || MAILINGS.find((m) => String(m.id) === String(id));

  return <CreateMailingPage mailingData={mailing} />;
}