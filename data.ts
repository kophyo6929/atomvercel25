import { ProductsData, User, Order, PaymentAccountDetails, FAQ } from './types';

// In a real app, this would come from an API.

export const initialProducts: ProductsData = {
    "ATOM": {
        "Points": [
            {"id": "atom_pts_500", "name": "500 Points", "price_mmk": 1500},
            {"id": "atom_pts_1000", "name": "1000 Points", "price_mmk": 3000},
            {"id": "atom_pts_2000", "name": "2000 Points", "price_mmk": 5500},
        ],
        "Mins": [
            {"id": "atom_min_50", "name": "Any-net 50 Mins", "price_mmk": 800},
            {"id": "atom_min_100", "name": "Any-net 100 Mins", "price_mmk": 1550},
            {"id": "atom_min_150", "name": "Any-net 150 Mins", "price_mmk": 2300},
        ],
        "Internet Packages": [
            {"id": "atom_pkg_15k", "name": "15k Plan", "price_mmk": 10900},
            {"id": "atom_pkg_25k", "name": "25k Plan", "price_mmk": 19200},
        ],
        "Data": [
            {"id": "atom_data_1gb", "name": "1GB Data", "price_mmk": 1000},
        ],
        "Beautiful Numbers": [],
    },
    "MYTEL": {
        "Data": [
            {"id": "mytel_data_1k", "name": "1000MB", "price_mmk": 950, "extra": "(တစ်လလုံး)"},
            {"id": "mytel_data_3333", "name": "3333MB", "price_mmk": 3200, "extra": "(တစ်လလုံး)"},
            {"id": "mytel_data_5k", "name": "5000MB", "price_mmk": 4500, "extra": "(15ရက်)"},
        ],
        "Mins": [
            {"id": "mytel_min_90", "name": "90 Mins", "price_mmk": 970, "extra": "(တစ်လလုံး)"},
            {"id": "mytel_min_180", "name": "180 Mins", "price_mmk": 1700, "extra": "(တစ်လလုံး)"},
            {"id": "mytel_min_any58", "name": "Any-net 58", "price_mmk": 1000, "extra": "(Today)"},
        ],
        "Plan Packages": [
            {"id": "mytel_plan_10k", "name": "10000MB Plan", "price_mmk": 9000, "extra": "👉 ညဘက် Billeąျ: ရှေ့ / B2B မရ"},
            {"id": "mytel_plan_15k", "name": "12GB + 1050min", "price_mmk": 13500, "extra": "👉 ညဘက် Billeąျ: ရှေ့ / B2B မရ"},
            {"id": "mytel_plan_20k", "name": "20000MB Plan", "price_mmk": 17800, "extra": "👉 ညဘက် Billeąျ: ရှေ့ / B2B မရ"},
        ],
        "Beautiful Numbers": [],
    },
    "OOREDOO": {
        "Data": [
            {"id": "ooredoo_data_1g", "name": "1GB", "price_mmk": 950, "extra": "(Today)"},
            {"id": "ooredoo_data_2.9g", "name": "2.9GB", "price_mmk": 2700},
            {"id": "ooredoo_data_5.8g", "name": "5.8GB", "price_mmk": 5400},
            {"id": "ooredoo_data_8.7g", "name": "8.7GB", "price_mmk": 8100},
        ],
        "Plan Packages": [
            {"id": "ooredoo_plan_11.6g", "name": "11.6GB Plan", "price_mmk": 10000, "extra": "👉 ညဘက် Billeąျ: ရှေ့ / B2B မရ"},
            {"id": "ooredoo_plan_4.9g", "name": "4.9GB + ONNET300", "price_mmk": 5150, "extra": "👉 ညဘက် Billeąျ: ရှေ့ / B2B မရ"},
            {"id": "ooredoo_plan_9.8g", "name": "9.8GB + ONNET300", "price_mmk": 10200, "extra": "👉 ညဘက် Billeąျ: ရှေ့ / B2B မရ"},
        ],
        "Beautiful Numbers": [],
    },
    "MPT": {
        "Data": [
            {"id": "mpt_data_1.1g", "name": "1.1GB", "price_mmk": 950},
            {"id": "mpt_data_2.2g", "name": "2.2GB", "price_mmk": 1950},
        ],
        "Minutes": [
            {"id": "mpt_min_any55", "name": "Any-net 55 MIN", "price_mmk": 950},
            {"id": "mpt_min_any115", "name": "Any-net 115 MIN", "price_mmk": 1850},
            {"id": "mpt_min_on170", "name": "On-net 170 MIN", "price_mmk": 1800},
        ],
        "Plan Packages": [
            {"id": "mpt_plan_15k", "name": "15K Plan", "price_mmk": 14400},
            {"id": "mpt_plan_25k", "name": "25K Plan", "price_mmk": 24400},
        ],
        "Beautiful Numbers": [],
    }
};

export const initialUsers: User[] = [
    { id: 123456, username: 'Tw', password: 'Kp@794628', isAdmin: true, credits: 99999.99, securityAmount: 1111, banned: false, notifications: ["Welcome to the new Atom Point Web!"] },
    { id: 987654, username: 'user', password: 'password', isAdmin: false, credits: 125.50, securityAmount: 2222, banned: false, notifications: ["Welcome to the new Atom Point Web!"] },
];

export const initialOrders: Order[] = [
    { id: 'PROD-240901-EGSU', userId: 987654, product: { name: '500 Points', operator: 'ATOM' }, cost: 15.00, status: 'Completed', date: new Date().toISOString(), deliveryInfo: '09789037037' },
    { id: 'CRD-240901-8155', type: 'CREDIT', userId: 987654, product: { name: '20.00 Credits Purchase' }, cost: 2000, paymentMethod: 'KPay', paymentProof: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', status: 'Pending Approval', date: new Date(Date.now() - 86400000).toISOString() },
];

// Note: Payment account details are now managed in App.tsx state to allow for admin editing.

export const faqData: FAQ[] = [
    {
        q: "How do I buy credits?",
        a: "Navigate to the 'Buy Credits' section from your dashboard. You can choose a pre-set package or enter a custom amount in MMK. Then, select your preferred payment method (like KPay or Wave Pay), transfer the amount to the provided account details, and upload a screenshot of your payment confirmation. An admin will review and approve your request shortly."
    },
    {
        q: "How long does it take for my credit purchase to be approved?",
        a: "Our admins review credit purchase requests as quickly as possible, usually within a few minutes to an hour during business hours. You will see the updated credit balance on your dashboard once it's approved."
    },
    {
        q: "How do I purchase a product?",
        a: "Go to 'Browse Products' from the dashboard. Select the operator (e.g., ATOM, MPT), then the category (e.g., Data, Mins), and finally choose the product you want. Click 'Buy', enter the phone number for delivery, and confirm the purchase. The cost in credits will be deducted from your account balance."
    },
    {
        q: "What happens if my product order is declined?",
        a: "If your product order is declined for any reason, the credits that were deducted for the purchase will be automatically refunded to your account balance. You can check the status of your orders in the 'My Orders' section."
    },
    {
        q: "Is there a transaction fee?",
        a: "No, we do not charge any extra transaction fees. The price you see in MMK or credits is the final amount you will pay."
    }
];