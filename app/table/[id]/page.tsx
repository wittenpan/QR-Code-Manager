import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { MenuItem, OrderStatus } from "@prisma/client";
import { MenuItemCard } from "../../components/ui/menu-item";
import { CartProvider } from "@/contexts/cart-context";
import { ShoppingCart } from "../../components/ui/shopping-cart";

export default async function TablePage({
  params,
}: {
  params: { id: string };
}) {
  console.log("Table ID:", params.id);
  
  const table = await prisma.restaurantTable.findUnique({
    where: {
      id: params.id,
    },
    include: {
      restaurant: {
        include: {
          menus: {
            include: {
              menuItems: {
                include: {
                  images: true,
                  variants: true,
                  addons: {
                    where: {
                      available: true
                    }
                  },
                  translations: true
                }
              }
            }
          }
        }
      },
      orders: {
        where: {
          status: OrderStatus.PENDING
        },
        include: {
          orderItems: {
            include: {
              menuItem: true,
              MenuItemVariant: true,
              MenuItemAddon: true
            }
          }
        }
      }
    },
  });

  console.log("Found table:", table);

  if (!table) {
    console.log("Table not found, redirecting to 404");
    notFound();
  }

  // Get all menu items across all menus
  const allMenuItems = table.restaurant.menus.flatMap(menu => menu.menuItems);

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to {table.restaurant.name}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Table {table.tableNumber}
              </p>
              
              {/* Menu Section */}
              <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Our Menu</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allMenuItems.map((item) => (
                    <MenuItemCard 
                      key={item.id} 
                      item={item}
                      language="en" // TODO: Make this dynamic based on user preference
                    />
                  ))}
                </div>
              </div>

              {/* Active Orders Section */}
              {table.orders.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-semibold mb-4">Active Orders</h2>
                  <div className="space-y-4">
                    {table.orders.map((order) => (
                      <div key={order.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">Order #{order.id.slice(-4)}</p>
                            <p className="text-gray-600">Status: {order.status}</p>
                          </div>
                          <p className="text-lg font-bold">${order.totalPrice}</p>
                        </div>
                        <div className="mt-4">
                          {order.orderItems.map((item) => (
                            <div key={item.id} className="text-sm text-gray-600">
                              {item.quantity}x {item.menuItem.name}
                              {item.MenuItemVariant && ` (${item.MenuItemVariant.name})`}
                              {item.MenuItemAddon && ` + ${item.MenuItemAddon.name}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Call Server Button */}
              <button 
                className="mt-8 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors"
              >
                Call Server
              </button>
            </div>
          </div>
        </div>
      </div>
      <ShoppingCart />
    </CartProvider>
  );
}