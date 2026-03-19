import { Route } from "react-router-dom";
import OwnershipAccountList from "./pages/OwnershipAccountList";
import OwnerAdd from "../associations/pages/OwnerAdd.jsx";
import OwnershipAccountEdit from "./pages/OwnershipAccountEdit";
import OwnershipAccountDetails from "./pages/OwnershipAccountDetails.jsx";

export const ownershipRoutes = [
  <Route key="ownership-list"    path="associations/accounts"            element={<OwnershipAccountList />} />,
    <Route key="ownership-create"  path="associations/accounts/create"     element={<OwnerAdd />} />,
  <Route key="ownership-details" path="associations/accounts/:id"        element={<OwnershipAccountDetails />} />,
  <Route key="ownership-edit"    path="associations/accounts/:id/edit"   element={<OwnershipAccountEdit />} />,
];

export default ownershipRoutes;