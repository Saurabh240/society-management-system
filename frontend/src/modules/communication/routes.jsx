import { Route, Navigate } from "react-router-dom";
import CommunicationPage   from "./pages/CommunicationPage";
import EmailPage           from "./pages/EmailPage";
import MailingPage         from "./pages/MailingPage";
import TemplatePage        from "./pages/TemplatePage";
import TextMessagePage     from "./pages/TextMessagePage";
import CreateMailingPage   from "./pages/CreateMailingPage";
import CreateTemplatePage  from "./pages/CreateTemplatePage";

export const communicationRoutes = (
  <Route path="communication" element={<CommunicationPage />}>

    {/* Default redirect: /communication → /communication/emails */}
    <Route index element={<Navigate to="emails" replace />} />

    {/* Tab routes */}
    <Route path="emails"        element={<EmailPage />} />
    <Route path="mailings"      element={<MailingPage />} />
    <Route path="templates"     element={<TemplatePage />} />
    <Route path="text-messages" element={<TextMessagePage />} />

    {/* Action routes */}
    <Route path="mailings/create"   element={<CreateMailingPage />} />
    <Route path="templates/create"  element={<CreateTemplatePage />} />

  </Route>
);