import { Route } from "react-router-dom";

import AssociationList from "../associations/pages/AssociationList";
import AssociationCreate from "../associations/pages/AssociationCreate";
import AssociationEdit from "../associations/pages/AssociationEdit";
import AssociationDetailView from "../associations/pages/AssociationDetailView";
import AssociationUnitCreate from "../associations/pages/AssociationUnitCreate";
import AssociationUnitEdit from "../associations/pages/AssociationUnitEdit";
import AssociationUnitList from "../associations/pages/AssociationUnitList";

export const associationRoutes = (
  <>
    {/* Associations */}
    <Route path="associations" element={<AssociationList />} />
    <Route path="associations/create" element={<AssociationCreate />} />
    <Route path="associations/edit/:id" element={<AssociationEdit />} />
<Route path="associations/view/:id" element={<AssociationDetailView />} />
    <Route path="associations/units" element={<AssociationUnitList />} />
<Route path="associations/units/create" element={<AssociationUnitCreate />} />
<Route path="associations/units/edit/:id" element={<AssociationUnitEdit />} />
  </>
);