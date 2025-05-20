//IMPORTANTE, PUEDEN HABER CAMPOS QUE NO SE LLAMEN IGUAL QUE EN LA BASE DE DATOS LO CUAL DA ERROR A LA HORA DE INSERAR DATOS 
export interface ProductAllData {
    id?: number | null;  
    warehouse: number;
    name: string;
    brand: string;
    price: number;
    purchase_price: number;
    stock: number;
    barcode: number | null;
    product_type: string;
    entry_date: string;  
    expiration_date: string | null;  
}

//NO ESTAN TODOS LOS CAMPOS DECLARADOS, HAY QUE DECLARARLOS
//CAMPOS AÑADIDOS: Name
export interface ProductSold {
    id?: number | null;
    product: number;  
    warehouse: number;
    quantity: number;
    sale_date: string;  
    name?: string| null, 
    barcode?: string | null;
}

export interface User {
    id?: number | null;  
    username?: string |null;
    company?: string |null;
    email?: string |null;
    password?: string;
    role?: string |null;
    isFirstVisit : boolean;
}

export interface Warehouse {
    id: number | null;  
    user_id: number;  
    name: string; 
    location: string;
    products?: ProductAllData[] | null;  
    sales?: ProductSold[] | null;  
}

// Interfaz general para la respuesta de la API
export interface Welcome {
    success: boolean;
    data: Data;
}

export interface Data {
    products: ProductAllData[];
    sales: ProductSold[];
    users: User[];
    warehouses: Warehouse[];
}
