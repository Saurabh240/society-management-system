import { Route } from "react-router-dom";
import CommunicationPage from "./pages/CommunicationPage";

export const communicationRoutes = (
  <>
    <Route path="communication" element={<CommunicationPage />} />
  </>
);