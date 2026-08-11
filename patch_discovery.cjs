const fs = require('fs');
let content = fs.readFileSync('src/services/discoveryService.ts', 'utf8');
content = content.replace(
`    const analyticsCol = collection(db, 'discoveryAnalytics');
    await addDoc(analyticsCol, {
      eventType,
      ...data,
      timestamp: new Date().toISOString()
    });`,
`    const analyticsCol = collection(db, 'discoveryAnalytics');
    const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    await addDoc(analyticsCol, {
      eventType,
      ...cleanData,
      timestamp: new Date().toISOString()
    });`);
fs.writeFileSync('src/services/discoveryService.ts', content);
