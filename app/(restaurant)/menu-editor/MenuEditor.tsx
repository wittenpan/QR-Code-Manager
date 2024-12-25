"use client";
import { ExtendedMenu, ExtendedMenuItem } from "../../types/menu";
import { useState, useRef, useEffect } from "react";
import { Menu, MenuItem } from "@prisma/client";
import { MenuItemCard } from "../../components/menu/MenuItemCard";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { MenuItemDialog } from "./MenuItemDialog";
import { toast } from "../../components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

interface MenuEditorProps {
  initialMenus: ExtendedMenu[];
}

export function MenuEditor({ initialMenus }: MenuEditorProps) {
  const [menus, setMenus] = useState<ExtendedMenu[]>(initialMenus);
  const [selectedMenu, setSelectedMenu] = useState<string>(menus[0]?.id || "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExtendedMenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ExtendedMenuItem | null>(
    null,
  );

  const onOpenChangeRef = useRef<(open: boolean) => void>();
  const onSaveRef = useRef<(data: any) => void>();

  useEffect(() => {
    onOpenChangeRef.current = setIsDialogOpen;
    onSaveRef.current = (formData: any) => {
      const isEditing = !!editingItem;
      const endpoint = isEditing
        ? `/api/menu-items/${editingItem.id}`
        : "/api/menu-items";
      const method = isEditing ? "PUT" : "POST";

      handleMenuItemSave(formData, method, endpoint);
    };
  }, [editingItem]);

  const handleEditItem = (item: ExtendedMenuItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = (item: ExtendedMenuItem) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/menu-items/${itemToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete menu item");
      }

      setMenus((currentMenus: ExtendedMenu[]) =>
        currentMenus.map((menu) => ({
          ...menu,
          menuItems: menu.menuItems.filter(
            (item) => item.id !== itemToDelete.id,
          ),
        })),
      );

      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setItemToDelete(null);
    }
  };

  const handleToggleAvailability = async (item: ExtendedMenuItem) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/menu-items/${item.id}/availability`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });

      if (!response.ok) {
        throw new Error("Failed to update item availability");
      }

      const updatedItem = await response.json();

      setMenus((currentMenus: ExtendedMenu[]) =>
        currentMenus.map((menu) => ({
          ...menu,
          menuItems: menu.menuItems.map((menuItem) =>
            menuItem.id === item.id
              ? { ...menuItem, isAvailable: !menuItem.isAvailable }
              : menuItem,
          ),
        })),
      );

      toast({
        title: "Success",
        description: `${item.name} is now ${!item.isAvailable ? "available" : "unavailable"}`,
      });
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast({
        title: "Error",
        description: "Failed to update item availability",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuItemSave = async (
    formData: any, 
    method: string, 
    endpoint: string
  ) => {
    try {
      setIsLoading(true);
      const requestData = {
        ...formData,
        menuId: selectedMenu,
      };

      console.log('Is Editing:', method === 'PUT');
      console.log('Endpoint:', endpoint);
      console.log('Method:', method);
      console.log('Request Data:', requestData);

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json(); // Make sure this line is here
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(
          responseData.message ||
            `Failed to ${method === 'PUT' ? "update" : "create"} menu item`
        );
      }

      setMenus((currentMenus: ExtendedMenu[]) =>
        currentMenus.map((menu) => {
          if (menu.id !== selectedMenu) return menu;

          const updatedItems = method === 'PUT'
            ? menu.menuItems.map((item) =>
                item.id === editingItem?.id ? responseData : item
              )
            : [...menu.menuItems, responseData];

          return {
            ...menu,
            menuItems: updatedItems,
          };
        }),
      );

      setIsDialogOpen(false);
      setEditingItem(null);

      toast({
        title: "Success",
        description: `Menu item ${method === 'PUT' ? "updated" : "created"} successfully`,
      });
    } catch (error) {
      console.error("Error saving menu item:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Editor</h1>
        <Button onClick={handleAddItem} disabled={isLoading || !selectedMenu}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {menus.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">
            No menus found. Please create a menu first.
          </p>
        </div>
      ) : (
        <Tabs
          value={selectedMenu}
          onValueChange={setSelectedMenu}
          className="w-full"
        >
          <TabsList className="mb-4">
            {menus.map((menu) => (
              <TabsTrigger key={menu.id} value={menu.id}>
                {menu.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {menus.map((menu) => (
            <TabsContent key={menu.id} value={menu.id}>
              {menu.menuItems.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">
                    No items in this menu. Add your first item!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menu.menuItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onEdit={handleEditItem}
                      onDelete={handleDeleteItem}
                      onToggleAvailability={() =>
                        handleToggleAvailability(item)
                      }
                      disabled={isLoading}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <MenuItemDialog
        open={isDialogOpen}
        onOpenChangeRef={onOpenChangeRef}
        item={editingItem}
        menuId={selectedMenu}
        onSaveRef={onSaveRef}
        isDisabled={isLoading}
      />

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={() => setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {itemToDelete?.name}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}