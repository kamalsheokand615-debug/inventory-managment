const fs = require('fs');
let content = fs.readFileSync('src/components/SalesView.tsx', 'utf8');

content = content.replace(
  /import React, \{ useState \} from 'react';/,
  "import React, { useState, useRef, useEffect } from 'react';"
);

fs.writeFileSync('src/components/SalesView.tsx', content);
