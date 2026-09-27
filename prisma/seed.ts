import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Create Default Branch
  const branch = await prisma.branch.upsert({
    where: { code: "MAIN-01" },
    update: {},
    create: {
      name: "The Grand Bistro - Downtown",
      code: "MAIN-01",
      address: "123 Culinary Boulevard",
      city: "Metropolis",
      state: "NY",
      zipCode: "10001",
      phone: "+1 (555) 019-2834",
      email: "contact@grandbistro.com",
      taxRate: 0.08875, // 8.875% NYC tax
      currency: "USD",
      timezone: "America/New_York",
      isActive: true,
    },
  });
  console.log(`✓ Branch created: ${branch.name}`);

  // 2. Create Seed Users
  const passwordHash = await bcrypt.hash("Admin123!", 10);
  const managerHash = await bcrypt.hash("Manager123!", 10);
  const staffHash = await bcrypt.hash("Staff123!", 10);
  const chefHash = await bcrypt.hash("Chef123!", 10);

  const users = [
    {
      email: "admin@restaurant.com",
      name: "Alexander Vance",
      role: UserRole.SUPER_ADMIN,
      passwordHash: passwordHash,
      branchId: branch.id,
      phone: "+1 (555) 111-2233",
    },
    {
      email: "manager@restaurant.com",
      name: "Elena Rostova",
      role: UserRole.MANAGER,
      passwordHash: managerHash,
      branchId: branch.id,
      phone: "+1 (555) 222-3344",
    },
    {
      email: "waiter@restaurant.com",
      name: "Marcus Cole",
      role: UserRole.WAITER,
      passwordHash: staffHash,
      branchId: branch.id,
      phone: "+1 (555) 333-4455",
    },
    {
      email: "chef@restaurant.com",
      name: "Chef Jean-Luc",
      role: UserRole.CHEF,
      passwordHash: chefHash,
      branchId: branch.id,
      phone: "+1 (555) 444-5566",
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash: u.passwordHash, role: u.role, branchId: u.branchId },
      create: u,
    });
  }
  console.log("✓ Seed users created with hashed credentials");

  // 3. Create Floors & Tables
  const mainDining = await prisma.floor.upsert({
    where: { branchId_name: { branchId: branch.id, name: "Main Dining Hall" } },
    update: {},
    create: {
      name: "Main Dining Hall",
      sortOrder: 1,
      branchId: branch.id,
    },
  });

  const terrace = await prisma.floor.upsert({
    where: { branchId_name: { branchId: branch.id, name: "Terrace Garden" } },
    update: {},
    create: {
      name: "Terrace Garden",
      sortOrder: 2,
      branchId: branch.id,
    },
  });

  const tablesData = [
    // Main Dining Hall
    { label: "T1", capacity: 2, shape: "square", posX: 50, posY: 50, floorId: mainDining.id },
    { label: "T2", capacity: 4, shape: "rectangle", posX: 180, posY: 50, floorId: mainDining.id },
    { label: "T3", capacity: 4, shape: "rectangle", posX: 320, posY: 50, floorId: mainDining.id },
    { label: "T4", capacity: 6, shape: "circle", posX: 50, posY: 180, floorId: mainDining.id },
    { label: "T5", capacity: 2, shape: "square", posX: 180, posY: 180, floorId: mainDining.id },
    { label: "T6", capacity: 8, shape: "rectangle", posX: 320, posY: 180, floorId: mainDining.id },
    // Terrace Garden
    { label: "TG1", capacity: 2, shape: "circle", posX: 60, posY: 60, floorId: terrace.id },
    { label: "TG2", capacity: 4, shape: "rectangle", posX: 200, posY: 60, floorId: terrace.id },
    { label: "TG3", capacity: 4, shape: "rectangle", posX: 340, posY: 60, floorId: terrace.id },
  ];

  for (const t of tablesData) {
    await prisma.table.upsert({
      where: { floorId_label: { floorId: t.floorId, label: t.label } },
      update: { capacity: t.capacity, shape: t.shape, posX: t.posX, posY: t.posY },
      create: t,
    });
  }
  console.log("✓ Floors and tables populated");

  // 4. Menu Categories
  const categories = [
    { name: "Signature Starters", description: "Artisan appetizers & tapas", sortOrder: 1 },
    { name: "Artisan Steaks & Mains", description: "Prime cuts and chef specials", sortOrder: 2 },
    { name: "Woodfired Pizza & Pasta", description: "Handmade sourdough and fresh pasta", sortOrder: 3 },
    { name: "Decadent Desserts", description: "Sweet master creations", sortOrder: 4 },
    { name: "Craft Cocktails & Wines", description: "Mixology & curated vintages", sortOrder: 5 },
  ];

  const catMap: Record<string, string> = {};
  for (const c of categories) {
    const created = await prisma.menuCategory.upsert({
      where: { branchId_name: { branchId: branch.id, name: c.name } },
      update: { description: c.description, sortOrder: c.sortOrder },
      create: { ...c, branchId: branch.id },
    });
    catMap[c.name] = created.id;
  }
  console.log("✓ Menu categories created");

  // 5. Menu Items with Modifiers
  const menuItems = [
    {
      name: "Truffle Burrata Crostini",
      description: "Creamy pugliese burrata, black truffle glaze, heirloom tomatoes, toasted sourdough",
      price: 18.5,
      cost: 5.2,
      category: "Signature Starters",
      imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6ef231f6?w=600&auto=format&fit=crop&q=80",
      isPopular: true,
      prepTime: 10,
    },
    {
      name: "Crispy Calamari Fritti",
      description: "Wild-caught squid with lemon pepper seasoning, preserved lemon aioli and marinara",
      price: 16.0,
      cost: 4.5,
      category: "Signature Starters",
      imageUrl: "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=600&auto=format&fit=crop&q=80",
      isPopular: false,
      prepTime: 12,
    },
    {
      name: "Prime Dry-Aged Ribeye (12oz)",
      description: "45-day aged Black Angus, rosemary bone marrow butter, roasted garlic head",
      price: 54.0,
      cost: 19.5,
      category: "Artisan Steaks & Mains",
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
      isPopular: true,
      prepTime: 22,
      modifiers: [
        {
          name: "Meat Temperature",
          type: "SELECT",
          isRequired: true,
          options: [
            { label: "Rare (Cool red center)", priceAdjust: 0, isDefault: false },
            { label: "Medium Rare (Warm red center)", priceAdjust: 0, isDefault: true },
            { label: "Medium (Warm pink center)", priceAdjust: 0, isDefault: false },
            { label: "Medium Well (Slight pink)", priceAdjust: 0, isDefault: false },
          ],
        },
        {
          name: "Add-Ons & Crust",
          type: "MULTI",
          isRequired: false,
          options: [
            { label: "Truffle Butter Crust", priceAdjust: 4.5, isDefault: false },
            { label: "Grilled Tiger Prawns (2pc)", priceAdjust: 9.0, isDefault: false },
          ],
        },
      ],
    },
    {
      name: "Pan-Seared Chilean Sea Bass",
      description: "Miso-glazed sea bass, shiitake dashi broth, bok choy, lotus root crisp",
      price: 46.0,
      cost: 14.8,
      category: "Artisan Steaks & Mains",
      imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80",
      isPopular: true,
      prepTime: 18,
    },
    {
      name: "Black Truffle & Wild Mushroom Pappardelle",
      description: "Handmade ribbons, foraged chanterelles & cremini, parmigiano reggiano 24-month",
      price: 28.0,
      cost: 7.0,
      category: "Woodfired Pizza & Pasta",
      imageUrl: "https://images.unsplash.com/photo-1621996346565-e3d5d6281051?w=600&auto=format&fit=crop&q=80",
      isPopular: true,
      prepTime: 15,
    },
    {
      name: "Diavola Sourdough Pizza",
      description: "San Marzano tomatoes, fior di latte, spicy soppressata, chili honey drizzle",
      price: 23.0,
      cost: 4.9,
      category: "Woodfired Pizza & Pasta",
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
      isPopular: false,
      prepTime: 14,
    },
    {
      name: "Classic Valrhona Chocolate Lava Cake",
      description: "Warm molten center, Madagascar bourbon vanilla gelato, gold dust crunch",
      price: 14.0,
      cost: 3.2,
      category: "Decadent Desserts",
      imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
      isPopular: true,
      prepTime: 12,
    },
    {
      name: "Smoked Old Fashioned",
      description: "Woodford Reserve bourbon, demerara, aromatic bitters, applewood smoke infusion",
      price: 17.0,
      cost: 3.5,
      category: "Craft Cocktails & Wines",
      imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80",
      isPopular: true,
      prepTime: 5,
    },
  ];

  for (const item of menuItems) {
    const catId = catMap[item.category];
    const createdItem = await prisma.menuItem.create({
      data: {
        name: item.name,
        description: item.description,
        price: item.price,
        cost: item.cost,
        imageUrl: item.imageUrl,
        isPopular: item.isPopular,
        prepTime: item.prepTime,
        categoryId: catId,
      },
    });

    if (item.modifiers) {
      for (const mod of item.modifiers) {
        const createdMod = await prisma.menuItemModifier.create({
          data: {
            name: mod.name,
            type: mod.type,
            isRequired: mod.isRequired,
            menuItemId: createdItem.id,
          },
        });

        for (const opt of mod.options) {
          await prisma.modifierOption.create({
            data: {
              label: opt.label,
              priceAdjust: opt.priceAdjust,
              isDefault: opt.isDefault,
              modifierId: createdMod.id,
            },
          });
        }
      }
    }
  }
  console.log("✓ Menu items and modifier options created");

  console.log("✅ Seeding successfully completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
