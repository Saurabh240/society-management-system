import { Route } from "react-router-dom";

import AssociationList from "../associations/pages/AssociationList";
import AssociationCreate from "../associations/pages/AssociationCreate";
import AssociationEdit from "../associations/pages/AssociationEdit";

export const associationRoutes = (
  <>
    <Route path="associations" element={<AssociationList />} />
    <Route path="associations/create" element={<AssociationCreate />} />
    <Route path="associations/edit/:id" element={<AssociationEdit />} />
  </>
);