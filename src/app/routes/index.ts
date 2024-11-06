import { Router } from "express";
import { TableRoutes } from "../modules/table/table.routes";
import { CustomerRoutes } from "../modules/customer/customer.routes";

import { MenuGroupRoutes } from "../modules/menuGroup/menuGroup.routes";
import { ItemCategoryRoutes } from "../modules/itemCategory/itemCategory.routes";

import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ProfileRoutes } from "../modules/profile/profile.route";

const router = Router();

const moduleRoutes = [
  { path: "/table-list", route: TableRoutes },
  { path: "/customer-list", route: CustomerRoutes },
  { path: "/menu-groups", route: MenuGroupRoutes },
  { path: "/item-categories", route: ItemCategoryRoutes },
  { path: "/user", route: UserRoutes },
  { path: "/auth", route: AuthRoutes },
  { path: "/profile", route: ProfileRoutes },
  {
    path: "/raw-material",
    route: RawMaterialRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
