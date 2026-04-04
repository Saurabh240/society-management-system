

import { Route } from "react-router-dom";

import AssociationList from "../associations/pages/AssociationList";
import AssociationCreate from "../associations/pages/AssociationCreate";
import AssociationEdit from "../associations/pages/AssociationEdit";
import AssociationDetailView from "../associations/pages/AssociationDetailView";
import AssociationUnitCreate from "../associations/pages/AssociationUnitCreate";
import AssociationUnitView from "../associations/pages/AssociationUnitView";
import AssociationUnitEdit from "../associations/pages/AssociationUnitEdit";
import AssociationUnitList from "../associations/pages/AssociationUnitList";
import UnitView from "@/modules/associations/pages/UnitView";
import UnitEdit from "@/modules/associations/pages/UnitEdit";
import UnitAdd from "@/modules/associations/pages/UnitAdd";
import OwnerAdd from "@/modules/associations/pages/OwnerAdd";
import OwnershipAccountDetails from "../ownership/pages/OwnershipAccountDetails";
import OwnershipAccountEdit from "../ownership/pages/OwnershipAccountEdit";

export const associationRoutes = (
  <>
    {/* Associations */}
    <Route path="associations" element={<AssociationList />} />
    <Route path="associations/create" element={<AssociationCreate />} />
    <Route path="associations/edit/:id" element={<AssociationEdit />} />
    <Route path="associations/:id" element={<AssociationDetailView />} />

    {/* Units */}
    <Route path="associations/units" element={<AssociationUnitList />} />
    <Route path="associations/units/create" element={<AssociationUnitCreate />} />
    
    <Route path="associations/units/edit/:id" element={<AssociationUnitEdit />} />
    <Route path="associations/units/view/:id" element={<AssociationUnitView />} />
    <Route
      path="associations/:associationId/units/view/:unitId"
      element={<UnitView />}
    />

    <Route
      path="associations/:associationId/units/edit/:unitId"
      element={<UnitEdit />}
    />

    <Route
      path="associations/:associationId/units/add"
      element={<UnitAdd />}
    />

    <Route
      path="associations/:associationId/units/:unitId/owners/add"
      element={<OwnerAdd />}
    />
    <Route
  path="associations/:associationId/units/:unitId/accounts/:id"
  element={<OwnershipAccountDetails />}
/>

<Route
  path="associations/:associationId/units/:unitId/accounts/:id/edit"
  element={<OwnershipAccountEdit />}
/>



  </>
);