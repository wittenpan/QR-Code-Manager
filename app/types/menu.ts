export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  category: string | null;
  isAvailable: boolean;
  menuId: string;
  createdAt: Date;
  updatedAt: Date;
  images: {
    id: string;
    url: string;
    altText: string | null;
    menuItemId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  variants: {
    id: string;
    name: string;
    price: number;
    menuItemId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  translations: {
    id: string;
    language: string;
    name: string;
    description: string | null;
    menuItemId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  addons: {
    id: string;
    name: string;
    price: number;
    available: boolean;
    menuItemId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

export type Menu = {
  id: string;
  name: string;
  language: string;
  restaurantId: string;
  startTime: Date | null;
  endTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
  menuItems: MenuItem[];
};

export type Image = {
  id: string;
  url: string;
  altText: string | null;
  menuItemId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Variant = {
  id: string;
  name: string;
  price: number;
  menuItemId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Translation = {
  id: string;
  language: string;
  name: string;
  description: string | null;
  menuItemId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Addon = {
  id: string;
  name: string;
  price: number;
  available: boolean;
  menuItemId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ExtendedMenuItem = MenuItem & {
  images: Image[];
  variants: Variant[];
  translations: Translation[];
  addons: Addon[];
};

export type ExtendedMenu = Omit<Menu, "menuItems"> & {
  menuItems: ExtendedMenuItem[];
};