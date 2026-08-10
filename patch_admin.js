import fs from 'fs';
let code = fs.readFileSync('src/components/dashboards/AdminDashboard.tsx', 'utf-8');

if (!code.includes("import { AutomationCMS }")) {
  code = code.replace(
    "import { RelationshipsCMS } from '../admin/RelationshipsCMS';",
    "import { RelationshipsCMS } from '../admin/RelationshipsCMS';\nimport { AutomationCMS } from '../admin/AutomationCMS';"
  );
}

if (!code.includes("id: 'automations'")) {
  code = code.replace(
    "{ id: 'relationships', label: 'ربط أولياء الأمور 👨‍👩‍👧', icon: Users }",
    "{ id: 'relationships', label: 'ربط أولياء الأمور 👨‍👩‍👧', icon: Users },\n          { id: 'automations', label: 'الأتمتة التلقائية ⚡', icon: Zap }"
  );
  
  if (!code.includes("import { LayoutDashboard,")) {
    code = code.replace("import { LayoutDashboard,", "import { LayoutDashboard, Zap,");
  } else {
    // Zap might not be imported if we just added it
    code = code.replace("import {", "import { Zap, ");
  }

  code = code.replace(
    "{adminTab === 'relationships' && <RelationshipsCMS />}",
    "{adminTab === 'relationships' && <RelationshipsCMS />}\n      {adminTab === 'automations' && <AutomationCMS />}"
  );
}

fs.writeFileSync('src/components/dashboards/AdminDashboard.tsx', code);
