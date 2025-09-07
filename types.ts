// --- TYPE DEFINITIONS --- //

export interface ProductItem {
    id: string;
    name: string;
    price_mmk: number;
    extra?: string;
    // Properties added for admin editing context
    operator?: string;
    category?: string;
}

export interface ProductCategories {
    [category: string]: ProductItem[];
}

export interface ProductsData {
    [operator: string]: ProductCategories;
}

export interface User {
    id: number;
    username: string;
    password?: string; // Should not be passed around in a real app
    isAdmin: boolean;
    credits: number;
    securityAmount: number; // For password recovery
    banned: boolean;
    notifications: string[];
}

export interface Order {
    id: string;
    userId: number;
    type?: 'CREDIT';
    product: {
        name: string;
        operator?: string;
    };
    cost: number;
    status: 'Pending Approval' | 'Completed' | 'Declined';
    date: string;
    deliveryInfo?: string;
    paymentMethod?: string;
    paymentProof?: string;
    actionBy?: string; // Admin username who approved/declined
}

export interface PaymentAccount {
    name: string;
    number: string;
}

export interface PaymentAccountDetails {
    [method: string]: PaymentAccount;
}

export interface FAQ {
    q: string;
    a: string;
}
