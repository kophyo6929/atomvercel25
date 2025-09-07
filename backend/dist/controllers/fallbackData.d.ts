export declare const fallbackUsers: {
    id: number;
    username: string;
    password: string;
    isAdmin: boolean;
    credits: number;
    securityAmount: number;
    banned: boolean;
    notifications: string[];
    createdAt: Date;
    updatedAt: Date;
}[];
export declare const fallbackProducts: {
    id: string;
    operator: string;
    category: string;
    name: string;
    priceMMK: number;
    priceCr: number;
    available: boolean;
}[];
export declare const fallbackOrders: any[];
export declare const fallbackPaymentDetails: {
    KPay: {
        name: string;
        number: string;
    };
    'Wave Pay': {
        name: string;
        number: string;
    };
};
export declare const fallbackSettings: {
    adminContact: string;
};
//# sourceMappingURL=fallbackData.d.ts.map