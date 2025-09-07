"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fallbackSettings = exports.fallbackPaymentDetails = exports.fallbackOrders = exports.fallbackProducts = exports.fallbackUsers = void 0;
// Fallback data when database is unavailable
exports.fallbackUsers = [
    {
        id: 123456,
        username: 'tw',
        password: '$2b$12$oWve31DF4cGCa5eJw.9SrOYFrSWkmeun9b2/2wIyepruDoyRJjYXe', // hashed: Kp@794628
        isAdmin: true,
        credits: 1000000,
        securityAmount: 50000,
        banned: false,
        notifications: ['Welcome to Atom Point Web! (Admin Account)'],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 789012,
        username: 'testuser',
        password: '$2b$12$rQd5sh6szYGLGDVeFBnI8.2HJT8R8Ue8yF4AkBs.3Rvx5hF5vJ8SZW', // hashed: test123
        isAdmin: false,
        credits: 500,
        securityAmount: 5000,
        banned: false,
        notifications: ['Welcome to Atom Point Web!'],
        createdAt: new Date(),
        updatedAt: new Date()
    }
];
exports.fallbackProducts = [
    // ATOM Products
    { id: "atom_pts_500", operator: 'ATOM', category: 'Points', name: '500 Points', priceMMK: 1500, priceCr: 15, available: true },
    { id: "atom_pts_1000", operator: 'ATOM', category: 'Points', name: '1000 Points', priceMMK: 3000, priceCr: 30, available: true },
    { id: "atom_pts_2000", operator: 'ATOM', category: 'Points', name: '2000 Points', priceMMK: 5500, priceCr: 55, available: true },
    { id: "atom_min_50", operator: 'ATOM', category: 'Mins', name: 'Any-net 50 Mins', priceMMK: 800, priceCr: 8, available: true },
    { id: "atom_min_100", operator: 'ATOM', category: 'Mins', name: 'Any-net 100 Mins', priceMMK: 1550, priceCr: 16, available: true },
    { id: "atom_min_150", operator: 'ATOM', category: 'Mins', name: 'Any-net 150 Mins', priceMMK: 2300, priceCr: 23, available: true },
    { id: "atom_pkg_15k", operator: 'ATOM', category: 'Internet Packages', name: '15k Plan', priceMMK: 10900, priceCr: 109, available: true },
    { id: "atom_pkg_25k", operator: 'ATOM', category: 'Internet Packages', name: '25k Plan', priceMMK: 19200, priceCr: 192, available: true },
    { id: "atom_data_1gb", operator: 'ATOM', category: 'Data', name: '1GB Data', priceMMK: 1000, priceCr: 10, available: true },
    // MYTEL Products  
    { id: "mytel_data_1k", operator: 'MYTEL', category: 'Data', name: '1000MB', priceMMK: 950, priceCr: 10, available: true },
    { id: "mytel_data_3333", operator: 'MYTEL', category: 'Data', name: '3333MB', priceMMK: 3200, priceCr: 32, available: true },
    { id: "mytel_data_5k", operator: 'MYTEL', category: 'Data', name: '5000MB', priceMMK: 4500, priceCr: 45, available: true },
    { id: "mytel_min_90", operator: 'MYTEL', category: 'Mins', name: '90 Mins', priceMMK: 970, priceCr: 10, available: true },
    { id: "mytel_min_180", operator: 'MYTEL', category: 'Mins', name: '180 Mins', priceMMK: 1700, priceCr: 17, available: true },
    { id: "mytel_min_any58", operator: 'MYTEL', category: 'Mins', name: 'Any-net 58', priceMMK: 1000, priceCr: 10, available: true },
    { id: "mytel_plan_10k", operator: 'MYTEL', category: 'Plan Packages', name: '10000MB Plan', priceMMK: 9000, priceCr: 90, available: true },
    { id: "mytel_plan_15k", operator: 'MYTEL', category: 'Plan Packages', name: '12GB + 1050min', priceMMK: 13500, priceCr: 135, available: true },
    { id: "mytel_plan_20k", operator: 'MYTEL', category: 'Plan Packages', name: '20000MB Plan', priceMMK: 17800, priceCr: 178, available: true },
    // OOREDOO Products
    { id: "ooredoo_data_1g", operator: 'OOREDOO', category: 'Data', name: '1GB', priceMMK: 950, priceCr: 10, available: true },
    { id: "ooredoo_data_2.9g", operator: 'OOREDOO', category: 'Data', name: '2.9GB', priceMMK: 2700, priceCr: 27, available: true },
    { id: "ooredoo_data_5.8g", operator: 'OOREDOO', category: 'Data', name: '5.8GB', priceMMK: 5400, priceCr: 54, available: true },
    { id: "ooredoo_data_8.7g", operator: 'OOREDOO', category: 'Data', name: '8.7GB', priceMMK: 8100, priceCr: 81, available: true },
    { id: "ooredoo_plan_11.6g", operator: 'OOREDOO', category: 'Plan Packages', name: '11.6GB Plan', priceMMK: 10000, priceCr: 100, available: true },
    { id: "ooredoo_plan_4.9g", operator: 'OOREDOO', category: 'Plan Packages', name: '4.9GB + ONNET300', priceMMK: 5150, priceCr: 52, available: true },
    { id: "ooredoo_plan_9.8g", operator: 'OOREDOO', category: 'Plan Packages', name: '9.8GB + ONNET300', priceMMK: 10200, priceCr: 102, available: true },
    // MPT Products
    { id: "mpt_data_1.1g", operator: 'MPT', category: 'Data', name: '1.1GB', priceMMK: 950, priceCr: 10, available: true },
    { id: "mpt_data_2.2g", operator: 'MPT', category: 'Data', name: '2.2GB', priceMMK: 1950, priceCr: 20, available: true },
    { id: "mpt_min_any55", operator: 'MPT', category: 'Minutes', name: 'Any-net 55 MIN', priceMMK: 950, priceCr: 10, available: true },
    { id: "mpt_min_any115", operator: 'MPT', category: 'Minutes', name: 'Any-net 115 MIN', priceMMK: 1850, priceCr: 19, available: true },
    { id: "mpt_min_on170", operator: 'MPT', category: 'Minutes', name: 'On-net 170 MIN', priceMMK: 1800, priceCr: 18, available: true },
    { id: "mpt_plan_15k", operator: 'MPT', category: 'Plan Packages', name: '15K Plan', priceMMK: 14400, priceCr: 144, available: true },
    { id: "mpt_plan_25k", operator: 'MPT', category: 'Plan Packages', name: '25K Plan', priceMMK: 24400, priceCr: 244, available: true }
];
exports.fallbackOrders = [];
exports.fallbackPaymentDetails = {
    'KPay': { name: 'ATOM Point Admin', number: '09 987 654 321' },
    'Wave Pay': { name: 'ATOM Point Services', number: '09 123 456 789' }
};
exports.fallbackSettings = {
    adminContact: 'https://t.me/CEO_METAVERSE'
};
//# sourceMappingURL=fallbackData.js.map