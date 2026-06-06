import mongoose from "mongoose";
import { dbConnect, dbDisconnect } from "../../../../utils/test-utils/dbHandler.utils";
import { reportServices } from "../report.service";
import { Branch } from "../../branch/branch.model";
import { MenuGroup } from "../../menuGroup/menuGroup.model";
import { ItemCategroy } from "../../itemCategory/itemCategory.model";
import RawMaterial from "../../raw-mateirals/rawMaterials.model";
import MenuItemConsumption from "../../rawMaterialConsumption/rawMaterialConsumption.model";
import { Order } from "../../order/order.model";

describe("Menu Item and Consumption Costing Report", () => {
  beforeAll(async () => {
    await dbConnect();
  });

  afterAll(async () => {
    await dbDisconnect();
  });

  afterEach(async () => {
    // Clear collections after each test to keep them clean
    await Branch.deleteMany({});
    await MenuGroup.deleteMany({});
    await ItemCategroy.deleteMany({});
    await RawMaterial.deleteMany({});
    await MenuItemConsumption.deleteMany({});
    await Order.deleteMany({});
  });

  it("should calculate correct recipe cost of menu items using conversion factors", async () => {
    // 1. Create a Branch
    const branch = await Branch.create({
      bid: "B-001",
      availability: "available",
      name: "Gulshan Branch",
      phone: "01700000000",
      email: "gulshan@rms.com",
      address1: "Gulshan-2, Dhaka",
      address2: "",
      division: "Dhaka",
      city: "Dhaka",
      isActive: true,
    });

    // 2. Create MenuGroup and ItemCategory
    const menuGroup = await MenuGroup.create({
      uid: "MG-001",
      name: "INDIAN CUISINE",
      description: "Indian Cuisine Items",
      branch: branch._id,
    });

    const itemCategory = await ItemCategroy.create({
      uid: "IC-001",
      name: "NAAN & ROTI",
      menuGroup: menuGroup._id,
      branch: branch._id,
    });

    // 3. Create Raw Materials with conversion factors
    // Flour: rate 100 per KG (1000 grams) -> cost per gram is 100/1000 = 0.1
    const flour = await RawMaterial.create({
      id: "RM-001",
      materialName: "FLOUR",
      baseUnit: "GRAM",
      superUnit: "KG",
      conversion: 1000,
      rate: 100,
      branch: branch._id,
    });

    // Salt: rate 50 per Pack (1 unit conversion) -> cost per base unit is 50/1 = 50
    const salt = await RawMaterial.create({
      id: "RM-002",
      materialName: "SALT",
      baseUnit: "PACK",
      superUnit: "PACK",
      conversion: 1,
      rate: 50,
      branch: branch._id,
    });

    // 4. Create MenuItemConsumption
    await MenuItemConsumption.create({
      id: "MI-001",
      itemName: "PLAIN NAAN",
      itemCode: "202",
      rate: 60.00,
      cookingTime: 5,
      itemGroup: menuGroup._id,
      itemCategory: itemCategory._id,
      isDiscount: false,
      isVat: true,
      isWaiterTips: false,
      description: "Yummy Plain Naan",
      branch: [branch._id],
      consumptions: [
        { item: flour._id, qty: 10 }, // 10 grams of flour -> 10 * (100 / 1000) = 1.0
        { item: salt._id, qty: 0.5 }, // 0.5 pack of salt -> 0.5 * (50 / 1) = 25.0
      ],
    });

    // 5. Call the service
    const userPayload = { branch: branch._id.toString() };
    const loggedInUser = { branch: branch._id };
    const reportData = await reportServices.getMenuItemsAndCostingFromDB(userPayload, loggedInUser);

    // 6. Assertions
    expect(reportData).toBeDefined();
    expect(reportData.result.length).toBeGreaterThan(0);

    const indianCuisineGroup = reportData.result.find((g: any) => g.menuGroup === "INDIAN CUISINE");
    expect(indianCuisineGroup).toBeDefined();
    expect(indianCuisineGroup.menuGroupTotalConsumption).toBe(2);
    expect(indianCuisineGroup.menuGroupTotalCosting).toBe(26.0); // 1.0 (flour) + 25.0 (salt)

    const itemGroup = indianCuisineGroup.itemGroups[0];
    expect(itemGroup.itemGroup).toBe("NAAN & ROTI");
    expect(itemGroup.totalCosting).toBe(26.0);
    expect(itemGroup.totalConsumptionCount).toBe(2);

    const plainNaanItem = itemGroup.items[0];
    expect(plainNaanItem.name).toBe("PLAIN NAAN");
    expect(plainNaanItem.code).toBe("202");
    expect(plainNaanItem.rate).toBe(60.0);
    expect(plainNaanItem.cookingTime).toBe(5);
    expect(plainNaanItem.totalCosting).toBe(26.0);

    // Verify consumptions details
    const flourConsumption = plainNaanItem.consumptions.find((c: any) => c.materialName === "FLOUR");
    expect(flourConsumption).toBeDefined();
    expect(flourConsumption.qty).toBe(10);
    expect(flourConsumption.rate).toBe(100);
    expect(flourConsumption.baseUnit).toBe("GRAM");
    expect(flourConsumption.price).toBe(1.0); // Correctly converted

    const saltConsumption = plainNaanItem.consumptions.find((c: any) => c.materialName === "SALT");
    expect(saltConsumption).toBeDefined();
    expect(saltConsumption.qty).toBe(0.5);
    expect(saltConsumption.rate).toBe(50);
    expect(saltConsumption.baseUnit).toBe("PACK");
    expect(saltConsumption.price).toBe(25.0); // Correctly converted
  });

  it("should calculate correct raw material consumption quantities and costs", async () => {
    // 1. Create a Branch
    const branch = await Branch.create({
      bid: "B-002",
      availability: "available",
      name: "Banani Branch",
      phone: "01800000000",
      email: "banani@rms.com",
      address1: "Banani, Dhaka",
      address2: "",
      division: "Dhaka",
      city: "Dhaka",
      isActive: true,
    });

    // 2. Create MenuGroup and ItemCategory
    const menuGroup = await MenuGroup.create({
      uid: "MG-002",
      name: "THAI CUISINE",
      description: "Thai Cuisine Items",
      branch: branch._id,
    });

    const itemCategory = await ItemCategroy.create({
      uid: "IC-002",
      name: "COLD & HOT APPITIZER",
      menuGroup: menuGroup._id,
      branch: branch._id,
    });

    // 3. Create Raw Materials
    // Apple: rate 450 per KG (1000 gm conversion) -> unitRate = 0.45
    const apple = await RawMaterial.create({
      id: "RM-003",
      materialName: "APPLE",
      baseUnit: "GRAM",
      superUnit: "KG",
      conversion: 1000,
      rate: 450,
      branch: branch._id,
    });

    // Mum Water: rate 40 per Case (1 unit conversion) -> unitRate = 40.0
    const water = await RawMaterial.create({
      id: "RM-004",
      materialName: "MUM WATER",
      baseUnit: "BOTTLE",
      superUnit: "BOTTLE",
      conversion: 1,
      rate: 40,
      branch: branch._id,
    });

    // 4. Create MenuItemConsumption
    const wonton = await MenuItemConsumption.create({
      id: "MI-002",
      itemName: "CHICKEN AND PRAWN FRIED WONTON",
      itemCode: "127",
      rate: 295.00,
      cookingTime: 10,
      itemGroup: menuGroup._id,
      itemCategory: itemCategory._id,
      isDiscount: false,
      isVat: true,
      isWaiterTips: false,
      description: "Crispy wonton",
      branch: [branch._id],
      consumptions: [
        { item: apple._id, qty: 100 }, // 100 grams of apple -> unit cost 0.45 -> cost 45.0
        { item: water._id, qty: 1 },  // 1 bottle of water -> unit cost 40.0 -> cost 40.0
      ],
    });

    // 5. Create Order with items
    const startDate = new Date();
    const endDate = new Date();

    await Order.create({
      billNo: "B-2026-0001",
      date: new Date(),
      netPayable: 590.00,
      branch: branch._id,
      status: "posted",
      items: [
        {
          item: wonton._id,
          qty: 2, // 2 wontons ordered -> total apple = 200, total water = 2
          rate: 295.00,
          discount: 0,
          isDiscount: false,
          isVat: true,
        }
      ]
    });

    // 6. Call the service
    const userPayload = {
      branch: branch._id.toString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
    const loggedInUser = { branch: branch._id };
    const reportData = await reportServices.getRawMaterialConsumptionServiceFromDB(userPayload, loggedInUser);

    // 7. Assertions
    expect(reportData).toBeDefined();
    expect(reportData.length).toBeGreaterThan(0);

    const branchReport = reportData.find((r: any) => r.branchId.toString() === branch._id.toString());
    expect(branchReport).toBeDefined();
    expect(branchReport.branchName).toBe("Banani Branch");

    const appleMaterial = branchReport.materials.find((m: any) => m.materialName === "APPLE");
    expect(appleMaterial).toBeDefined();
    expect(appleMaterial.unit).toBe("GRAM");
    expect(appleMaterial.rate).toBe(450);
    expect(appleMaterial.conversion).toBe(1000);
    expect(appleMaterial.unitRate).toBe(0.45);
    expect(appleMaterial.totalQuantity).toBe(200); // 100 qty per wonton * 2 wontons
    expect(appleMaterial.totalCost).toBe(90.0); // 200 * 0.45 = 90.0

    const waterMaterial = branchReport.materials.find((m: any) => m.materialName === "MUM WATER");
    expect(waterMaterial).toBeDefined();
    expect(waterMaterial.unit).toBe("BOTTLE");
    expect(waterMaterial.rate).toBe(40);
    expect(waterMaterial.conversion).toBe(1);
    expect(waterMaterial.unitRate).toBe(40.0);
    expect(waterMaterial.totalQuantity).toBe(2); // 1 qty per wonton * 2 wontons
    expect(waterMaterial.totalCost).toBe(80.0); // 2 * 40.0 = 80.0

    expect(branchReport.branchGrandTotal).toBe(170.0); // 90.0 + 80.0 = 170.0
  });
});
