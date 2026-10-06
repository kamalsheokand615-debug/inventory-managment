const fs = require('fs');

const newKeys = {
  hi: {
    zeroPlain: 'शून्य',
    productsCount: 'उत्पाद',
    testPinMsg: '💡 टेस्ट पिन:',
    adminRole: 'मालिक',
    managerRole: 'मैनेजर',
    staffRole: 'स्टाफ',
    changeLangTitle: 'भाषा चुनें / Change Language',
    andCustomization: '& कस्टमाइजेशन',
    andPasswordProtection: '& पासवर्ड प्रोटेक्शन',
    newPrefix: 'नया'
  },
  en: {
    zeroPlain: 'Zero',
    productsCount: 'Products',
    testPinMsg: '💡 Test PIN:',
    adminRole: 'Admin',
    managerRole: 'Manager',
    staffRole: 'Staff',
    changeLangTitle: 'Change Language',
    andCustomization: '& Customization',
    andPasswordProtection: '& Password Protection',
    newPrefix: 'New'
  }
};
newKeys.hinglish = { ...newKeys.en };

let trans = fs.readFileSync('src/utils/translations.ts', 'utf8');
['hi', 'en', 'hinglish'].forEach(lang => {
  const replacement = Object.entries(newKeys[lang]).map(([k, v]) => `    ${k}: '${v.replace(/'/g, "\\'")}',`).join('\n');
  const regex = new RegExp(`(${lang}: \\{\\s*\\n)`, 'm');
  trans = trans.replace(regex, `$1${replacement}\n`);
});
fs.writeFileSync('src/utils/translations.ts', trans);

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [find, replace] of Object.entries(replacements)) {
        content = content.split(find).join(replace);
    }
    fs.writeFileSync(filePath, content);
}

replaceInFile('src/components/DashboardView.tsx', {
    "(शून्य)": "({t.zeroPlain})",
    "({todaySales.length} बिल)": "({todaySales.length} {t.billsCount})",
    "आज का शुद्ध {t.profitLabel}:": "{t.todaysNetProfit}:",
    "सामान का नाम": "{t.itemName}",
    "वर्तमान स्टॉक": "{t.currentStock}",
    "<th>स्थिति</th>": "<th>{t.statusCol}</th>",
    "px-3\">स्थिति</th>": "px-3\">{t.statusCol}</th>",
    "title=\"स्पीकर से स्टॉक सुनें\"": "title={t.speakerStockAnnouncement}"
});

replaceInFile('src/components/InventoryView.tsx', {
    "{filteredItems.length} उत्पाद": "{filteredItems.length} {t.productsCount}",
    "px-3\">कैटेगरी</th>": "px-3\">{t.category}</th>",
    "<span>वर्तमान स्टॉक</span>": "<span>{t.currentStock}</span>",
    "px-4 text-right\">कार्रवाई</th>": "px-4 text-right\">{t.actions}</th>",
    "title=\"स्पीकर से स्टॉक सुनें (Speak Stock)\"": "title={t.speakerStockAnnouncement}",
    "\`क्या आप वाकई \\\"\${item.name}\\\" को हटाना चाहते हैं?\`": "\`\${t.confirmDeleteItem} (\"\${item.name}\")\`"
});

replaceInFile('src/components/LockScreen.tsx', {
    "💡 टेस्ट पिन:": "{t.testPinMsg}",
    "(मालिक)": "({t.adminRole})",
    "(मैनेजर)": "({t.managerRole})",
    "(स्टाफ)": "({t.staffRole})"
});

replaceInFile('src/components/Navbar.tsx', {
    "title=\"भाषा चुनें / Change Language\"": "title={t.changeLangTitle}",
    "हिन्दी (Hindi)": "{t.hindiLang}",
    "Hinglish (हिंग्लिश)": "{t.hinglishLang}"
});

replaceInFile('src/components/ReportsView.tsx', {
    "['इनवॉयस नं', 'तारीख', 'ग्राहक', 'कुल राशि (₹)', 'लागत (₹)', 'लाभ (₹)', 'भुगतान']": "[t.invoiceNo, t.dateAndTime, t.customerPlain, t.amount, t.cost, t.profitLabel, t.payment]",
    "'काउंटर'": "t.counterCustomer"
});

replaceInFile('src/components/SalesView.tsx', {
    "कुल)": "{t.totalPlain})"
});

replaceInFile('src/components/SettingsView.tsx', {
    "& कस्टमाइजेशन": "{t.andCustomization}"
});

replaceInFile('src/components/UsersView.tsx', {
    "पूर्ण नियंत्रण: स्टॉक संपादन, मूल्य परिवर्तन, बैकअप, एन्क्रिप्शन एवं यूजर प्रबंधन": "{t.roleAdminDesc}",
    "स्टॉक नियंत्रण: स्टॉक जोड़ना/घटाना (+/-), रिपोर्ट्स देखना, नया माल दर्ज करना": "{t.roleManagerDesc}",
    "बिक्री व काउंटर: बिल बनाना, स्टॉक देखना, स्पीकर से स्टॉक स्थिति सुनना": "{t.roleStaffDesc}",
    "& पासवर्ड प्रोटेक्शन": "{t.andPasswordProtection}",
    "placeholder=\"नया {t.fourDigitPinInput}\"": "placeholder={`\${t.newPrefix} \${t.fourDigitPinInput}`}"
});

console.log("Patched the final strings successfully!");
