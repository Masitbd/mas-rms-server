import { Router } from "express";
import { TableRoutes } from "../modules/table/table.routes";
import { CustomerRoutes } from "../modules/customer/customer.routes";

const router = Router();

const moduleRoutes = [
  { path: "/table-list", route: TableRoutes },
  { path: "/customer-list", route: CustomerRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
