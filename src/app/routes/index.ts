import { Router } from "express";
import { TableRoutes } from "../modules/table/table.routes";
import { CustomerRoutes } from "../modules/customer/customer.routes";

import { MenuGroupRoutes } from "../modules/menuGroup/menuGroup.routes";
import { ItemCategoryRoutes } from "../modules/itemCategory/itemCategory.routes";
import { WaiterRoutes } from "../modules/waiter/waiter.routes";
import { OrderRoutes } from "../modules/order/order.routes";

import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ProfileRoutes } from "../modules/profile/profile.route";
import { RawMaterialRoutes } from "../modules/raw-mateirals/rawMaterial.routes";
import { RawMaterialConsumptionRouter } from "../modules/rawMaterialConsumption/rawMaterialConsumption.routes";
import { reportRoutes } from "../modules/reports/reports.routes";
import { BranchRoutes } from "../modules/branch/branch.routes";
import { ImageRoutes } from "../modules/image/image.routes";
import { DeliveryAddressRoutes } from "../modules/deliveryAddresses/deliveryAddresses.routes";

const router = Router();

const moduleRoutes = [
  { path: "/table-list", route: TableRoutes },
  { path: "/customer-list", route: CustomerRoutes },
  { path: "/menu-groups", route: MenuGroupRoutes },
  { path: "/item-categories", route: ItemCategoryRoutes },
  { path: "/waiter", route: WaiterRoutes },
  { path: "/order", route: OrderRoutes },
  { path: "/user", route: UserRoutes },
  { path: "/auth", route: AuthRoutes },
  { path: "/profile", route: ProfileRoutes },
  { path: "/reports", route: reportRoutes },
  { path: "/branch", route: BranchRoutes },
  {
    path: "/raw-material",
    route: RawMaterialRoutes,
  },
  {
    path: "/raw-material-consumption",
    route: RawMaterialConsumptionRouter,
  },
  {
    path: "/image",
    route: ImageRoutes,
  },
  {
    path: "/delivery-address",
    route: DeliveryAddressRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
