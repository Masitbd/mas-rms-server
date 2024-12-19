import { Document, ObjectId, Types } from "mongoose";
import {
  dbConnect,
  dbDisconnect,
} from "../../../../utils/test-utils/dbHandler.utils";
import { TTable } from "../../table/table.interface";
import { TableServices } from "../../table/table.services";
import { TWaiter } from "../../waiter/waiter.interface";
import { WaiterServices } from "../../waiter/waiter.service";
import { IMenuItemConsumption } from "../../rawMaterialConsumption/rawMaterialConsumption.interface";
import { IRawMaterials } from "../../raw-mateirals/rawMaterials.interface";
import rawMaterialConsumptionService from "../../rawMaterialConsumption/rawMaterialConsumption.service";
import { RawMaterialService } from "../../raw-mateirals/rawMaterial.service";
import { TItemCategory } from "../../itemCategory/itemCategory.interface";
import { TMenuGroup } from "../../menuGroup/menuGroup.interface";
import { MenuGroupServices } from "../../menuGroup/menuGroup.service";
import { ItemCategoryServices } from "../../itemCategory/itemCategory.service";
import { ORDER_STATUS, TOrder } from "../order.interface";
import { OrderServices } from "../order.services";
import { IKitchenOrderData } from "../../kitchenOrders/kitchenOrder.interface";

beforeAll(async () => {
  // Connect to your MongoDB database
  await dbConnect();
});
afterAll(async () => {
  // Connect to your MongoDB database
  await dbDisconnect();
});
describe("Testing Order Functionality", () => {
  it("should create necessary data to place an Order", async () => {
    // dummy data
    const tableDummyData: TTable = {
      details: "some details",
      name: "Table 1",
      tid: "001",
    };
    const waiterDummyData: TWaiter = {
      name: "Waiter 1",
      remarks: "some description",
      uid: "1",
    };
    const rawMaterialsDummyData: IRawMaterials = {
      baseUnit: "gram",
      conversion: 1000,
      id: "1",
      materialName: "some description",
      superUnit: "gram",
      rate: 1000,
    };

    const menuGroupDummyData: TMenuGroup = {
      description: "some description",
      name: "some description",
      uid: "1",
    };

    const tableResult = await TableServices.createTableIntoDB(tableDummyData);
    const waiterResult =
      await WaiterServices.createWaiterIntoDB(waiterDummyData);
    const consumptionData = await RawMaterialService.post(
      rawMaterialsDummyData
    );
    const menuGroupResult =
      await MenuGroupServices.createMenuGroupIntoDB(menuGroupDummyData);

    expect(tableResult).toHaveProperty("_id");
    expect(waiterResult).toHaveProperty("_id");
    expect(consumptionData).toHaveProperty("_id");
    expect(menuGroupResult).toHaveProperty("_id");

    // menuItem category
    const itemCategorydummyData: TItemCategory = {
      menuGroup: menuGroupResult._id,
      name: "itemCategory",
      uid: "0444",
    };

    const itemCategoryResult =
      await ItemCategoryServices.createItemCategoryIntoDB(
        itemCategorydummyData
      );
    expect(itemCategoryResult).toHaveProperty("_id");

    // menu item consumption
    const menuItemConsumptionDummyData: IMenuItemConsumption = {
      cookingTime: 44,
      id: "00001",
      isDiscount: true,
      isVat: true,
      isWaiterTips: true,
      itemCategory: itemCategoryResult._id,
      itemGroup: itemCategoryResult._id,
      itemCode: "79",
      itemName: "djjidf",
      rate: 700,
      consumptions: [
        {
          item: consumptionData?._id as unknown as Types.ObjectId,
          qty: 444,
        },
      ],
      description: "dokfodk",
    };

    const menuItemConsumptionResult =
      await rawMaterialConsumptionService.create(menuItemConsumptionDummyData);
    expect(menuItemConsumptionResult).toHaveProperty("_id");

    // Placing Order
    let OrderData: TOrder = {
      tableName: tableResult._id,
      waiter: waiterResult._id,
      items: [
        {
          discount: 0,
          isDiscount: false,
          isVat: false,
          item: menuItemConsumptionResult._id as unknown as Types.ObjectId,
          qty: 10,
          rate: menuItemConsumptionResult.rate,
        },
      ],
      guest: 4,
      sCharge: 4,
      vat: 4,
      percentDiscount: 0,
      discountAmount: 1,
      totalBill: 1000,
      totalVat: 878,
      serviceCharge: 8,
      totalDiscount: 88,
      netPayable: 878,
      paid: 8487,
      pPayment: 77,
      due: 74,
      cashBack: 44,
      cashReceived: 848,
      paymentMode: "Cash",
      remark: " string;",
      serviceChargeRate: 8,

      customer: {
        name: "Customer",
        address: "Address",
      },
      guestType: "unRegistered",
    } as TOrder;

    const orderResult = await OrderServices.createOrderIntoDB(OrderData);

    OrderData.items = [{ ...OrderData.items[0], qty: 500 }];

    const updateResult = await OrderServices.updateOrder(
      orderResult?._id.toString(),
      OrderData
    );

    OrderData.guest = 100;
    const updateResult1 = await OrderServices.updateOrder(
      orderResult?._id.toString(),
      OrderData
    );
    const statusChanger = await OrderServices.changeStatus(
      orderResult?._id.toString(),
      { status: ORDER_STATUS.POSTED }
    );

    const kl = await OrderServices.getKitchenOrderListForSingleBill(
      orderResult?._id?.toString()
    );

    expect(orderResult).toHaveProperty("_id");
  });
});
