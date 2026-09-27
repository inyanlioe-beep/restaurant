import { NextResponse } from "next/server";
import { getOrders } from "@/lib/services/order-service";
import { getTables } from "@/lib/services/table-service";

export async function GET() {
  try {
    const orders = await getOrders();
    const tables = await getTables();

    // Calculate Today KPIs
    const completedOrders = orders.filter((o) => o.status === "COMPLETED" || o.status === "SERVED");
    const activeOrders = orders.filter((o) => ["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(o.status));

    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0) + 1284.5; // baseline sample revenue
    const totalOrdersCount = orders.length + 38; // baseline
    const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    const occupiedTables = tables.filter((t) => t.status === "OCCUPIED").length;
    const occupancyRate = tables.length > 0 ? Math.round((occupiedTables / tables.length) * 100) : 0;

    // Sales trend by hour (for Recharts sparkline/bar)
    const hourlySales = [
      { time: "12 PM", revenue: 420, orders: 12 },
      { time: "1 PM", revenue: 680, orders: 18 },
      { time: "2 PM", revenue: 310, orders: 8 },
      { time: "3 PM", revenue: 190, orders: 5 },
      { time: "4 PM", revenue: 240, orders: 7 },
      { time: "5 PM", revenue: 520, orders: 14 },
      { time: "6 PM", revenue: 890, orders: 24 },
      { time: "7 PM", revenue: 1120, orders: 31 },
      { time: "8 PM", revenue: 950, orders: 26 },
      { time: "9 PM", revenue: 640, orders: 17 },
    ];

    // Popular items
    const topItems = [
      { name: "Prime Dry-Aged Ribeye", quantity: 42, revenue: 2268, category: "Steaks" },
      { name: "Pan-Seared Chilean Sea Bass", quantity: 36, revenue: 1656, category: "Mains" },
      { name: "Black Truffle Pappardelle", quantity: 31, revenue: 868, category: "Pasta" },
      { name: "Truffle Burrata Crostini", quantity: 29, revenue: 536.5, category: "Starters" },
      { name: "Smoked Old Fashioned", quantity: 48, revenue: 816, category: "Cocktails" },
    ];

    return NextResponse.json({
      success: true,
      data: {
        kpi: {
          totalRevenue,
          activeOrders: activeOrders.length,
          occupancyRate,
          occupiedTables,
          totalTables: tables.length,
          avgOrderValue,
          revenueGrowth: "+18.4%",
          ordersGrowth: "+12.1%",
        },
        hourlySales,
        topItems,
        recentOrders: orders.slice(0, 5),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
