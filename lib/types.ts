export type ProductCategory = "mobiliario" | "accesorio";
export type InquiryStatus = "nueva" | "en_contacto" | "surtida" | "cancelada";

export type CatalogProduct = {
  id: string;
  brand: string;
  model: string;
  sku: string | null;
  dimensions: string | null;
  description: string;
  category: ProductCategory;
  msrp: number;
  discountPercent: number;
  salePrice: number;
  stock: number;
  imagePath: string | null;
};

export type AdminProduct = CatalogProduct & {
  cost: number;
};

export type InquiryItem = {
  id: string;
  productId: string | null;
  brand: string;
  model: string;
  quantityRequested: number;
  quantityFulfilled: number;
  salePrice: number;
};

export type Inquiry = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  note: string | null;
  status: InquiryStatus;
  createdAt: string;
  items: InquiryItem[];
};

export type SelectionDraft = {
  productId: string;
  brand: string;
  model: string;
  msrp: number;
  salePrice: number;
  stock: number;
  imageUrl: string | null;
  quantity: number;
};
