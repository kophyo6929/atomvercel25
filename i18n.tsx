import React, { createContext, useState, useContext, ReactNode, FC } from 'react';

type Language = 'en' | 'my';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

type TranslationData = { [key: string]: any };
type TranslationsMap = { [key in Language]?: TranslationData };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const enTranslations: TranslationData = {
  "common": {
    "back": "Back",
    "backToDashboard": "Back to Dashboard",
    "cancel": "Cancel",
    "close": "Close",
    "confirm": "Confirm",
    "submit": "Submit",
    "save": "Save",
    "edit": "Edit",
    "delete": "Delete",
    "search": "Search...",
    "noItemsFound": "No items found",
    "loading": "Loading...",
    "processing": "Processing...",
    "username": "Username",
    "password": "Password",
    "credits": "Credits",
    "yes": "Yes",
    "no": "No"
  },
  "app": {
    "alerts": {
      "accountBanned": "This account has been banned. Please contact an administrator.",
      "invalidCredentials": "Invalid credentials!",
      "usernameTaken": "Username already taken. Please choose a different one.",
      "usernameBanned": "This username is not available. Please choose a different one.",
      "registrationSuccess": "Registration successful! Your new User ID is {id}. Please save it for account recovery.",
      "broadcastSent": "Broadcast sent to {count} user(s).",
      "error": "Error",
      "success": "Success"
    }
  },
  "auth": {
    "signInTitle": "Sign In",
    "usernameLabel": "Username",
    "passwordLabel": "Password",
    "forgotPasswordLink": "Forgot Password?",
    "loginButton": "Login",
    "registerPrompt": "Don't have an account?",
    "registerLink": "Register",
    "createAccountTitle": "Create an Account",
    "confirmPasswordLabel": "Confirm Password",
    "securityAmountLabel": "Security Amount",
    "securityAmountPlaceholder": "4-digit number for recovery",
    "registerButton": "Register",
    "loginPrompt": "Already have an account?",
    "loginLink": "Login",
    "contactAdmin": "Contact Admin for Help",
    "forgotPasswordModal": {
      "title": "Forgot Password",
      "description": "Enter your 6-digit User ID and 4-digit security amount to recover your account.",
      "userIdLabel": "User ID",
      "userIdPlaceholder": "6-digit ID",
      "securityAmountLabel": "Security Amount",
      "securityAmountPlaceholder": "4-digit number",
      "verifyButton": "Verify Identity",
      "alerts": {
        "invalidInput": "Please enter valid numbers for User ID and Security Amount.",
        "invalidCredentials": "Invalid User ID or Security Amount. Please try again."
      }
    },
    "resetPasswordModal": {
        "title": "Set New Password",
        "description": "Create a new password for user: {username}",
        "newPasswordLabel": "New Password",
        "newPasswordPlaceholder": "At least 6 characters",
        "confirmPasswordLabel": "Confirm New Password",
        "setNewPasswordButton": "Set New Password",
        "alerts": {
            "passwordTooShort": "Password must be at least 6 characters long.",
            "passwordsDontMatch": "Passwords don't match!",
            "passwordResetSuccess": "Password for {username} has been reset successfully!\nYou can now log in with your new password."
        }
    }
  },
  "dashboard": {
    "welcome": "Welcome, {username}!",
    "yourCredits": "Your Credits:",
    "browseProductsCardTitle": "🛍️ Browse Products",
    "browseProductsCardDescription": "View our catalog of digital goods.",
    "buyCreditsCardTitle": "💰 Buy Credits",
    "buyCreditsCardDescription": "Top up your account balance.",
    "myOrdersCardTitle": "📋 My Orders",
    "myOrdersCardDescription": "Check your order history and status.",
    "faqCardTitle": "❓ FAQ",
    "faqCardDescription": "Find answers to common questions.",
    "notificationsModal": {
      "title": "Notifications",
      "emptyMessage": "No notifications",
      "emptySubMessage": "You're all caught up!"
    },
    "userDropdown": {
      "myProfile": "My Profile",
      "adminPanel": "Admin Panel",
      "contactAdmin": "Contact Admin",
      "logout": "Logout"
    },
    "notificationBell": "View notifications"
  },
  "productFlow": {
    "headerSelectOperator": "Select Operator",
    "headerOperator": "Operator: {operator}",
    "headerCategory": "Category: {category}",
    "searchInputPlaceholder": "Search products in this category...",
    "buyButton": "Buy",
    "emptyCategory": "No products in this category",
    "emptyCategorySub": "An admin may need to add products here.",
    "deliveryModal": {
      "title": "Delivery Information",
      "description": "Please enter the phone number to deliver {productName} to.",
      "phoneLabel": "Phone Number",
      "phonePlaceholder": "e.g., 09xxxxxxxxx",
      "proceedButton": "Proceed",
      "alertInvalidPhone": "Please enter a valid phone number."
    },
    "confirmModal": {
      "title": "Confirm Your Purchase",
      "product": "Product:",
      "deliverTo": "Deliver to:",
      "cost": "Cost:",
      "yourBalance": "Your Balance:",
      "balanceAfter": "Balance After:",
      "confirmButton": "Confirm Purchase",
      "alertNotEnoughCredits": "You do not have enough credits for this purchase.",
      "alertOrderSubmitted": "Your order for {productName} has been submitted. {cost} C have been deducted and will be refunded if the order is declined."
    }
  },
  "buyCredits": {
    "title": "Buy Credits",
    "step1Title": "Step 1: Choose Amount",
    "quickBuy": "Quick Buy",
    "or": "OR",
    "customAmount": "Enter Custom Amount",
    "amountLabel": "Amount (MMK)",
    "amountPlaceholder": "e.g., 5000",
    "youWillGet": "You will get:",
    "nextButton": "Next →",
    "step2Title": "Step 2: Select Payment Method",
    "purchasingFor": "You are purchasing for {amount} MMK.",
    "step3Title": "Step 3: Upload Payment Proof",
    "instructions": "Please transfer {amount} MMK to the following {method} account:",
    "accountName": "Name:",
    "accountNumber": "Number:",
    "uploadInstruction": "After payment, please upload the screenshot of your payment proof to this website.",
    "chooseScreenshot": "Choose Screenshot",
    "changeScreenshot": "Change Screenshot",
    "submitRequestButton": "Submit Request",
    "alerts": {
      "invalidAmount": "Please enter a valid amount.",
      "noProof": "Please upload a payment proof screenshot.",
      "requestSubmitted": "Your payment request has been submitted for approval."
    }
  },
  "myOrders": {
    "title": "My Order History",
    "filters": {
      "all": "All",
      "pending": "Pending",
      "completed": "Completed",
      "declined": "Declined"
    },
    "orderId": "Order ID:",
    "date": "Date:",
    "deliveredTo": "Delivered to:",
    "paymentVia": "Payment via:",
    "emptyTitle": "You haven't placed any orders yet",
    "emptySubtitle": "Browse products or buy credits to get started.",
    "emptyFilterTitle": "No orders found",
    "emptyFilterSubtitle": "There are no orders that match the current filter."
  },
  "faq": {
    "title": "Frequently Asked Questions",
    "questions": {
      "q1": "How do I buy credits?",
      "a1": "Navigate to the 'Buy Credits' section from your dashboard. You can choose a pre-set package or enter a custom amount in MMK. Then, select your preferred payment method (like KPay or Wave Pay), transfer the amount to the provided account details, and upload a screenshot of your payment confirmation. An admin will review and approve your request shortly.",
      "q2": "How long does it take for my credit purchase to be approved?",
      "a2": "Our admins review credit purchase requests as quickly as possible, usually within a few minutes to an hour during business hours. You will see the updated credit balance on your dashboard once it's approved.",
      "q3": "How do I purchase a product?",
      "a3": "Go to 'Browse Products' from the dashboard. Select the operator (e.g., ATOM, MPT), then the category (e.g., Data, Mins), and finally choose the product you want. Click 'Buy', enter the phone number for delivery, and confirm the purchase. The cost in credits will be deducted from your account balance.",
      "q4": "What happens if my product order is declined?",
      "a4": "If your product order is declined for any reason, the credits that were deducted for the purchase will be automatically refunded to your account balance. You can check the status of your orders in the 'My Orders' section.",
      "q5": "Is there a transaction fee?",
      "a5": "No, we do not charge any extra transaction fees. The price you see in MMK or credits is the final amount you will pay."
    }
  },
  "userProfile": {
    "title": "My Profile",
    "userId": "User ID:",
    "currentBalance": "Current Balance",
    "pendingActivity": "Pending Activity",
    "pendingProductOrders": "Product Orders",
    "pendingCreditPayments": "Credit Payments",
    "viewAllOrders": "View All My Orders"
  },
  "languageSwitcher": {
      "english": "English",
      "myanmar": "မြန်မာ"
  },
  "notifications": {
    "orderSuccess": "Your order has been placed successfully. Please wait for admin approval."
  }
};

const myTranslations: TranslationData = {
  "common": {
    "back": "နောက်သို့",
    "backToDashboard": "ပင်မစာမျက်နှာသို့ ပြန်သွားမည်",
    "cancel": "မလုပ်တော့ပါ",
    "close": "ပိတ်မည်",
    "confirm": "အတည်ပြုသည်",
    "submit": "ပေးပို့မည်",
    "save": "သိမ်းဆည်းမည်",
    "edit": "ပြင်ဆင်မည်",
    "delete": "ဖျက်မည်",
    "search": "ရှာဖွေပါ...",
    "noItemsFound": "ဘာမှရှာမတွေ့ပါ",
    "loading": "ခဏစောင့်ဆိုင်းပါ...",
    "processing": "လုပ်ဆောင်နေသည်...",
    "username": "အသုံးပြုသူအမည်",
    "password": "စကားဝှက်",
    "credits": "ခရက်ဒစ်များ",
    "yes": "ဟုတ်ကဲ့",
    "no": "မဟုတ်ပါ"
  },
  "app": {
    "alerts": {
      "accountBanned": "ဤအကောင့်ကို ပိတ်ပင်ထားပါသည်။ ကျေးဇူးပြု၍ စီမံခန့်ခွဲသူကို ဆက်သွယ်ပါ။",
      "invalidCredentials": "အထောက်အထားများ မှားယွင်းနေပါသည်။",
      "usernameTaken": "အသုံးပြုသူအမည်ကို အသုံးပြုပြီးသားဖြစ်နေပါသည်။ ကျေးဇူးပြု၍ အခြားတစ်ခုကို ရွေးချယ်ပါ။",
      "usernameBanned": "ဤအသုံးပြုသူအမည်ကို အသုံးပြု၍မရပါ။ ကျေးဇူးပြု၍ အခြားတစ်ခုကို ရွေးချယ်ပါ။",
      "registrationSuccess": "အောင်မြင်စွာ မှတ်ပုံတင်ပြီးပါပြီ! သင်၏ User ID အသစ်မှာ {id} ဖြစ်ပါသည်။ အကောင့်ပြန်လည်ရယူရန်အတွက် ၎င်းကို သိမ်းဆည်းထားပါ။",
      "broadcastSent": "အသုံးပြုသူ {count} ဦးထံသို့ စာတိုပေးပို့ပြီးပါပြီ။",
      "error": "အမှား",
      "success": "အောင်မြင်ပါသည်"
    }
  },
  "auth": {
    "signInTitle": "အကောင့်ဝင်ရန်",
    "usernameLabel": "အသုံးပြုသူအမည်",
    "passwordLabel": "စကားဝှက်",
    "forgotPasswordLink": "စကားဝှက်မေ့နေပါသလား?",
    "loginButton": "အကောင့်ဝင်မည်",
    "registerPrompt": "အကောင့်မရှိသေးဘူးလား?",
    "registerLink": "အကောင့်ဖွင့်မည်",
    "createAccountTitle": "အကောင့်အသစ်ဖွင့်ပါ",
    "confirmPasswordLabel": "စကားဝှက်ကို အတည်ပြုပါ",
    "securityAmountLabel": "လုံခြုံရေး ပမာဏ",
    "securityAmountPlaceholder": "ပြန်လည်ရယူရန်အတွက် ဂဏန်း ၄ လုံး",
    "registerButton": "အကောင့်ဖွင့်မည်",
    "loginPrompt": "အကောင့်ရှိပြီးသားလား?",
    "loginLink": "အကောင့်ဝင်မည်",
    "contactAdmin": "အကူအညီအတွက် Admin ကိုဆက်သွယ်ပါ",
    "forgotPasswordModal": {
      "title": "စကားဝှက်မေ့နေပါသလား",
      "description": "သင့်အကောင့်ကို ပြန်လည်ရယူရန်အတွက် သင်၏ဂဏန်း ၆ လုံးပါ User ID နှင့် ဂဏန်း ၄ လုံးပါ လုံခြုံရေးပမာဏကို ထည့်ပါ။",
      "userIdLabel": "User ID",
      "userIdPlaceholder": "ဂဏန်း ၆ လုံးပါ ID",
      "securityAmountLabel": "လုံခြုံရေး ပမာဏ",
      "securityAmountPlaceholder": "ဂဏန်း ၄ လုံး",
      "verifyButton": "စစ်ဆေးမည်",
      "alerts": {
        "invalidInput": "User ID နှင့် လုံခြုံရေးပမာဏအတွက် မှန်ကန်သောနံပါတ်များကို ထည့်ပါ။",
        "invalidCredentials": "User ID သို့မဟုတ် လုံခြုံရေးပမာဏ မှားယွင်းနေပါသည်။ ကျေးဇူးပြု၍ ထပ်မံကြိုးစားပါ။"
      }
    },
    "resetPasswordModal": {
        "title": "စကားဝှက်အသစ် သတ်မှတ်ရန်",
        "description": "အသုံးပြုသူ {username} အတွက် စကားဝှက်အသစ်တစ်ခု ဖန်တီးပါ။",
        "newPasswordLabel": "စကားဝှက်အသစ်",
        "newPasswordPlaceholder": "အနည်းဆုံး စာလုံး ၆ လုံး",
        "confirmPasswordLabel": "စကားဝှက်အသစ်ကို အတည်ပြုပါ",
        "setNewPasswordButton": "စကားဝှက်အသစ် သတ်မှတ်မည်",
        "alerts": {
            "passwordTooShort": "စကားဝှက်သည် အနည်းဆုံး စာလုံး ၆ လုံး ရှိရပါမည်။",
            "passwordsDontMatch": "စကားဝှက်များ တူညီမှုမရှိပါ!",
            "passwordResetSuccess": "{username} အတွက် စကားဝှက်ကို အောင်မြင်စွာ ပြန်လည်သတ်မှတ်ပြီးပါပြီ!\nယခု သင်၏ စကားဝှက်အသစ်ဖြင့် အကောင့်ဝင်နိုင်ပါပြီ။"
        }
    }
  },
  "dashboard": {
    "welcome": "ကြိုဆိုပါတယ်! {username}",
    "yourCredits": "သင့်ခရက်ဒစ်:",
    "browseProductsCardTitle": "🛍️ ပစ္စည်းများ ကြည့်ရှုရန်",
    "browseProductsCardDescription": "ကျွန်ုပ်တို့၏ ဒစ်ဂျစ်တယ် ကုန်ပစ္စည်းများကို ကြည့်ရှုပါ။",
    "buyCreditsCardTitle": "💰 ခရက်ဒစ် ဝယ်ရန်",
    "buyCreditsCardDescription": "သင့်အကောင့် လက်ကျန်ငွေကို ဖြည့်ပါ။",
    "myOrdersCardTitle": "📋 ကျွန်ုပ်၏ အော်ဒါများ",
    "myOrdersCardDescription": "သင်၏ အော်ဒါမှတ်တမ်းနှင့် အခြေအနေကို စစ်ဆေးပါ။",
    "faqCardTitle": "❓ အမေးများသော မေးခွန်းများ",
    "faqCardDescription": "အမေးများသော မေးခွန်းများအတွက် အဖြေများကို ရှာပါ။",
    "notificationsModal": {
      "title": "အသိပေးချက်များ",
      "emptyMessage": "အသိပေးချက်များ မရှိပါ",
      "emptySubMessage": "အားလုံး ရှင်းလင်းနေပါတယ်!"
    },
    "userDropdown": {
      "myProfile": "ကျွန်ုပ်၏ ပရိုဖိုင်",
      "adminPanel": "စီမံခန့်ခွဲသူ စာမျက်နှာ",
      "contactAdmin": "Admin ကို ဆက်သွယ်ရန်",
      "logout": "အကောင့်ထွက်မည်"
    },
    "notificationBell": "အသိပေးချက်များ ကြည့်ရန်"
  },
  "productFlow": {
    "headerSelectOperator": "အော်ပရေတာ ရွေးချယ်ပါ",
    "headerOperator": "အော်ပရေတာ: {operator}",
    "headerCategory": "အမျိုးအစား: {category}",
    "searchInputPlaceholder": "ဤအမျိုးအစားရှိ ပစ္စည်းများကို ရှာဖွေပါ...",
    "buyButton": "ဝယ်မည်",
    "emptyCategory": "ဤအမျိုးအစားတွင် ပစ္စည်းများ မရှိပါ",
    "emptyCategorySub": "စီမံခန့်ခွဲသူက ဤနေရာတွင် ပစ္စည်းများ ထည့်ရန် လိုအပ်နိုင်ပါသည်။",
    "deliveryModal": {
      "title": "ပေးပို့ရန် အချက်အလက်",
      "description": "{productName} ကို ပေးပို့ရန်အတွက် ဖုန်းနံပါတ်ကို ထည့်သွင်းပါ။",
      "phoneLabel": "ဖုန်းနံပါတ်",
      "phonePlaceholder": "ဥပမာ: 09xxxxxxxxx",
      "proceedButton": "ရှေ့ဆက်မည်",
      "alertInvalidPhone": "ကျေးဇူးပြု၍ မှန်ကန်သော ဖုန်းနံပါတ်ကို ထည့်ပါ။"
    },
    "confirmModal": {
      "title": "သင်၏ ဝယ်ယူမှုကို အတည်ပြုပါ",
      "product": "ပစ္စည်း:",
      "deliverTo": "ပေးပို့ရန်:",
      "cost": "ကျသင့်ငွေ:",
      "yourBalance": "သင့်လက်ကျန်ငွေ:",
      "balanceAfter": "ဝယ်ပြီးနောက် လက်ကျန်ငွေ:",
      "confirmButton": "ဝယ်ယူမှုကို အတည်ပြုမည်",
      "alertNotEnoughCredits": "ဤဝယ်ယူမှုအတွက် သင့်တွင် ခရက်ဒစ် အလုံအလောက်မရှိပါ။",
      "alertOrderSubmitted": "{productName} အတွက် သင်၏ အော်ဒါကို တင်သွင်းပြီးပါပြီ။ {cost} C ကို နှုတ်ယူထားပြီး အော်ဒါ ပယ်ချခံရပါက ပြန်အမ်းပေးပါမည်။"
    }
  },
  "buyCredits": {
    "title": "ခရက်ဒစ် ဝယ်ရန်",
    "step1Title": "အဆင့် ၁: ပမာဏ ရွေးချယ်ပါ",
    "quickBuy": "အမြန်ဝယ်",
    "or": "သို့မဟုတ်",
    "customAmount": "စိတ်ကြိုက် ပမာဏ ထည့်ပါ",
    "amountLabel": "ပမာဏ (ကျပ်)",
    "amountPlaceholder": "ဥပမာ: ၅၀၀၀",
    "youWillGet": "သင်ရရှိမည်မှာ:",
    "nextButton": "ရှေ့ဆက်မည် →",
    "step2Title": "အဆင့် ၂: ငွေပေးချေမှု နည်းလမ်း ရွေးချယ်ပါ",
    "purchasingFor": "သင်သည် {amount} ကျပ်ဖိုး ဝယ်ယူနေပါသည်။",
    "step3Title": "အဆင့် ၃: ငွေလွှဲပြေစာ ပေးပို့ပါ",
    "instructions": "ကျေးဇူးပြု၍ {amount} ကျပ်ကို အောက်ပါ {method} အကောင့်သို့ လွှဲပေးပါ။",
    "accountName": "အမည်:",
    "accountNumber": "နံပါတ်:",
    "uploadInstruction": "ငွေလွှဲပြီးနောက်၊ သင်၏ငွေလွှဲပြေစာ ဓာတ်ပုံကို ဤဝဘ်ဆိုဒ်သို့ တင်ပေးပါ။",
    "chooseScreenshot": "ဓာတ်ပုံ ရွေးချယ်ပါ",
    "changeScreenshot": "ဓာတ်ပုံ ပြောင်းလဲပါ",
    "submitRequestButton": "တောင်းဆိုမှုကို တင်သွင်းပါ",
    "alerts": {
      "invalidAmount": "ကျေးဇူးပြု၍ မှန်ကန်သော ပမာဏကို ထည့်ပါ။",
      "noProof": "ကျေးဇူးပြု၍ ငွေလွှဲပြေစာ ဓာတ်ပုံကို တင်ပါ။",
      "requestSubmitted": "သင်၏ ငွေပေးချေမှု တောင်းဆိုချက်ကို အတည်ပြုရန် တင်သွင်းပြီးပါပြီ။"
    }
  },
  "myOrders": {
    "title": "ကျွန်ုပ်၏ အော်ဒါ မှတ်တမ်း",
    "filters": {
      "all": "အားလုံး",
      "pending": "စောင့်ဆိုင်းနေသည်",
      "completed": "ပြီးမြောက်သည်",
      "declined": "ပယ်ချသည်"
    },
    "orderId": "အော်ဒါ ID:",
    "date": "ရက်စွဲ:",
    "deliveredTo": "ပေးပို့ပြီး:",
    "paymentVia": "ငွေပေးချေမှု:",
    "emptyTitle": "သင်သည် မည်သည့်အော်ဒါမှ မမှာယူရသေးပါ။",
    "emptySubtitle": "စတင်ရန် ပစ္စည်းများကို ကြည့်ရှုပါ သို့မဟုတ် ခရက်ဒစ်များ ဝယ်ယူပါ။",
    "emptyFilterTitle": "အော်ဒါများ မတွေ့ပါ",
    "emptyFilterSubtitle": "လက်ရှိ စစ်ထုတ်မှုနှင့် ကိုက်ညီသော အော်ဒါများ မရှိပါ။"
  },
  "faq": {
    "title": "အမေးများသော မေးခွန်းများ",
    "questions": {
      "q1": "ခရက်ဒစ်ဘယ်လိုဝယ်ရမလဲ။",
      "a1": "Dashboard မှ 'Buy Credits' သို့သွားပါ။ ကြိုတင်သတ်မှတ်ထားသော ပမာဏကို ရွေးချယ်နိုင်သည် သို့မဟုတ် ကျပ်ငွေဖြင့် စိတ်ကြိုက်ပမာဏကို ထည့်သွင်းနိုင်သည်။ ထို့နောက် သင်နှစ်သက်သော ငွေပေးချေမှုနည်းလမ်းကို ရွေးချယ်ပြီး ပေးထားသောအကောင့်သို့ ငွေလွှဲကာ ငွေလွှဲပြေစာ screenshot ကို တင်ပေးပါ။ Admin မှ မကြာမီ စစ်ဆေးအတည်ပြုပေးပါမည်။",
      "q2": "ခရက်ဒစ်ဝယ်ယူမှုကို အတည်ပြုရန် ဘယ်လောက်ကြာပါသလဲ။",
      "a2": "ကျွန်ုပ်တို့၏ Admin များသည် ခရက်ဒစ်ဝယ်ယူမှု တောင်းဆိုချက်များကို အမြန်ဆုံး စစ်ဆေးပေးသည်၊ များသောအားဖြင့် ရုံးချိန်အတွင်း မိနစ်အနည်းငယ်မှ တစ်နာရီအတွင်း အတည်ပြုပေးပါသည်။ အတည်ပြုပြီးသည်နှင့် သင့် Dashboard တွင် ခရက်ဒစ်လက်ကျန် အသစ်ကို တွေ့ရပါမည်။",
      "q3": "ကုန်ပစ္စည်းဘယ်လိုဝယ်ရမလဲ။",
      "a3": "Dashboard မှ 'Browse Products' သို့သွားပါ။ အော်ပရေတာ (ဥပမာ ATOM, MPT)၊ ထို့နောက် အမျိုးအစား (ဥပမာ Data, Mins) ကို ရွေးချယ်ပြီး သင်လိုချင်သော ပစ္စည်းကို ရွေးပါ။ 'Buy' ကိုနှိပ်ပါ၊ ပေးပို့လိုသော ဖုန်းနံပါတ်ကို ထည့်သွင်းပြီး ဝယ်ယူမှုကို အတည်ပြုပါ။ ခရက်ဒစ်ဖြင့် ကျသင့်ငွေကို သင့်အကောင့်မှ နှုတ်ယူပါမည်။",
      "q4": "ကုန်ပစ္စည်းအော်ဒါကို ပယ်ချခံရရင် ဘာဖြစ်မလဲ။",
      "a4": "အကြောင်းတစ်ခုခုကြောင့် သင့်ကုန်ပစ္စည်းအော်ဒါကို ပယ်ချခံရပါက၊ ဝယ်ယူမှုအတွက် နှုတ်ယူထားသော ခရက်ဒစ်များကို သင့်အကောင့်သို့ အလိုအလျောက် ပြန်အမ်းပေးပါမည်။ 'My Orders' တွင် သင့်အော်ဒါများ၏ အခြေအနေကို စစ်ဆေးနိုင်ပါသည်။",
      "q5": "ဝန်ဆောင်ခ ရှိပါသလား။",
      "a5": "မရှိပါ။ ကျွန်ုပ်တို့သည် အပိုဝန်ဆောင်ခများ မယူပါ။ သင်မြင်ရသော ကျပ် သို့မဟုတ် ခရက်ဒစ်ဈေးနှုန်းသည် သင်ပေးချေရမည့် နောက်ဆုံးပမာဏဖြစ်သည်။"
    }
  },
  "userProfile": {
    "title": "ကျွန်ုပ်၏ ပရိုဖိုင်",
    "userId": "User ID:",
    "currentBalance": "လက်ရှိ လက်ကျန်ငွေ",
    "pendingActivity": "စောင့်ဆိုင်းနေသော လုပ်ဆောင်ချက်",
    "pendingProductOrders": "ကုန်ပစ္စည်း အော်ဒါများ",
    "pendingCreditPayments": "ခရက်ဒစ် ငွေပေးချေမှုများ",
    "viewAllOrders": "ကျွန်ုပ်၏ အော်ဒါများအားလုံး ကြည့်ရန်"
  },
  "languageSwitcher": {
      "english": "English",
      "myanmar": "မြန်မာ"
  },
  "notifications": {
    "orderSuccess": "သင်၏မှာယူမှု အောင်မြင်စွာပြီးဆုံးပါပြီ။ Admin ၏ အတည်ပြုချက်ကို စောင့်ဆိုင်းပေးပါ။"
  }
};


const translations: TranslationsMap = {
    en: enTranslations,
    my: myTranslations
};

export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: string, replacements?: { [key: string]: string | number }): string => {
        const keys = key.split('.');
        let text: any = translations[language];
        let fallbackText: any = translations.en;

        for (const k of keys) {
            text = text?.[k];
            fallbackText = fallbackText?.[k];
        }

        let result = text || fallbackText || key;
        
        if (typeof result === 'string' && replacements) {
            Object.keys(replacements).forEach(placeholder => {
                result = result.replace(`{${placeholder}}`, String(replacements[placeholder]));
            });
        }
        
        return typeof result === 'string' ? result : key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
