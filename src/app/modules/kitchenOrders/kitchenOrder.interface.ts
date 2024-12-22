export interface IKitchenOrderData {
  items: {
    itemCode?: string;
    itemName?: string;
    qty?: number;
    rate?: number;
  }[];
  billNo: string | number;
  kitchenOrderNo: string | number;
  status: "active" | "inactive";
  remark?: string;
  tableName?: string;
  waiterName?: string;
}
