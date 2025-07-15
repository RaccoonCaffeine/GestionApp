export interface InventoryItem {
  id?: string;
  description: string;
  serialNumber: string;
  location: string;
  minStock: number;
  category?: string;
  tags?: string[];
  kitId?: string;
  supplierId?: string;
  // Nuevo: los lotes de este ítem
  batches: Batch[];
}

export interface Batch {
  id?: string;
  lotNumber: string;
  quantity: number;
  expirationDate?: string; // ISO string
  price: number;
  createdAt: string; // ISO string
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
  batchId?: string;
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
