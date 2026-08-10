import fs from 'fs';
let code = fs.readFileSync('src/components/dashboards/AdminDashboard.tsx', 'utf-8');
code = code.replace("import { ShieldAlert", "import { Zap, ShieldAlert");
fs.writeFileSync('src/components/dashboards/AdminDashboard.tsx', code);
