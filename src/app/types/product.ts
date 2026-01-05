export type Product = {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    inStock: boolean;
    createdAt: Date;
    code?: string;
  };
  
  export type Filters = {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    inStock?: boolean;
    search?: string;
  };