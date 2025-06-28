export interface InventoryItem {
  id?: string;
  description: string;
  serialNumber: string;
  location: string;
  stock: number;
  minStock: number;
  category?: string;
  tags?: string[];
  lot?: string;
  expirationDate?: string; // ISO string
  priceHistory?: { date: string; price: number }[];
  kitId?: string;
  supplierId?: string;
}

export interface InventoryMovement {
  id?: string;
  itemId: string;
  type: 'entrada' | 'salida' | 'transferencia' | 'uso' | 'devolucion';
  quantity: number;
  date: string; // ISO string
  project?: string;
  userId: string;
  notes?: string;
}

export interface Supplier {
  id?: string;
  name: string;
  contact: string;
  paymentTerms?: string;
}

export interface Kit {
  id?: string;
  name: string;
  items: { itemId: string; quantity: number }[];
}
