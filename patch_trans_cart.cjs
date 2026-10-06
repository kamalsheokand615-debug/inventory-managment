const fs = require('fs');
let content = fs.readFileSync('src/utils/translations.ts', 'utf8');

content = content.replace(/'बाएं से उत्पाद पर क्लिक करके जोड़ें'/g, "'उत्पाद खोजें या क्लिक करके जोड़ें'");
content = content.replace(/'Click on products from the left to add'/g, "'Search or click on products to add'");

fs.writeFileSync('src/utils/translations.ts', content);
