import { Route, Navigate } from "react-router-dom";
import CommunicationPage   from "./pages/CommunicationPage";
import EmailPage           from "./pages/EmailPage";
import MailingPage         from "./pages/MailingPage";
import TemplatePage        from "./pages/TemplatePage";
import TextMessagePage     from "./pages/TextMessagePage";
import CreateMailingPage   from "./pages/CreateMailingPage";
import EditMailingPage     from "./pages/EditMailingPage";
import CreateTemplatePage  from "./pages/CreateTemplatePage";

export const communicationRoutes = (
  <>
    {/* Layout with tabs — only tab pages render inside */}
    <Route path="communication" element={<CommunicationPage />}>
      <Route index element={<Navigate to="emails" replace />} />
      <Route path="emails"        element={<EmailPage />} />
      <Route path="mailings"      element={<MailingPage />} />
      <Route path="templates"     element={<TemplatePage />} />
      <Route path="text-messages" element={<TextMessagePage />} />
    </Route>

    {/* Full page routes — render WITHOUT the tab layout */}
    
    <Route path="communication/templates/create"   element={<CreateTemplatePage />} />
<Route path="/dashboard/:tenantId/communication/mailings" element={<MailingPage />} />
<Route path="/dashboard/:tenantId/communication/mailings/create" element={<CreateMailingPage />} />
<Route path="/dashboard/:tenantId/communication/mailings/edit/:id" element={<CreateMailingPage />} />
   
  </>
);