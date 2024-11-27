import { Router } from "express";
import { TableRoutes } from "../modules/table/table.routes";
import { CustomerRoutes } from "../modules/customer/customer.routes";
import { MenuGroupRoutes } from "../modules/menuGroup/menuGroup.routes";
import { ItemCategoryRoutes } from "../modules/itemCategory/itemCategory.routes";
import { WaiterRoutes } from "../modules/waiter/waiter.routes";
import { OrderRoutes } from "../modules/order/order.routes";

const router = Router();

const moduleRoutes = [
  { path: "/table-list", route: TableRoutes },
  { path: "/customer-list", route: CustomerRoutes },
  { path: "/menu-groups", route: MenuGroupRoutes },
  { path: "/item-categories", route: ItemCategoryRoutes },
  { path: "/waiter", route: WaiterRoutes },
  { path: "/order", route: OrderRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
