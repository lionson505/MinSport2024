# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})


```


""""FOR MAKING SURE THAT YOU HAVE ALL PERMISSIONS ADD THIS BLOCK OF CODE INTO YOUR PERMSSIONS IN STORAGE """

import { usePermissions } from '../hooks/usePermissions';
import { MODULE_IDS } from '../constants/modules';

[{"id":2,"groupId":1,"moduleId":5,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":5,"name":"dashboard","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
{"id":3,"groupId":1,"moduleId":2,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":2,"name":"national_teams","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
{"id":4,"groupId":1,"moduleId":3,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":3,"name":"federations","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
{"id":5,"groupId":1,"moduleId":4,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":4,"name":"sports_professionals","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
{"id":6,"groupId":1,"moduleId":6,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":6,"name":"trainings","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
{"id":7,"groupId":1,"moduleId":7,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":7,"name":"isonga_programs","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
{"id":8,"groupId":1,"moduleId":8,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":8,"name":"academies","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
{"id":9,"groupId":1,"moduleId":9,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":9,"name":"infrastructure","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
{"id":10,"groupId":1,"moduleId":10,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":10,"name":"sports_tourism","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
{"id":11,"groupId":1,"moduleId":11,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":11,"name":"documents","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
{"id":12,"groupId":1,"moduleId":12,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":12,"name":"contracts","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
{"id":13,"groupId":1,"moduleId":13,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":13,"name":"appointments","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
{"id":14,"groupId":1,"moduleId":14,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":14,"name":"employee","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
{"id":15,"groupId":1,"moduleId":15,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":15,"name":"users","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
{"id":16,"groupId":1,"moduleId":16,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":16,"name":"partners","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
{"id":17,"groupId":1,"moduleId":17,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":17,"name":"reports","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
{"id":18,"groupId":1,"moduleId":18,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":18,"name":"sports_for_all","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
{"id":19,"groupId":1,"moduleId":19,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":19,"name":"player_transfer_report","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}},
{"id":20,"groupId":1,"moduleId":20,"canRead":true,"canCreate":true,"canUpdate":true,"canDelete":true,"createdAt":"2024-12-27T15:40:15.002Z","updatedAt":"2024-12-27T15:40:15.002Z","module":{"id":20,"name":"match_operator","createdAt":"2024-12-24T23:02:33.318Z","updatedAt":"2024-12-24T23:02:33.318Z"}}
]

export const usePermissionLogger = (moduleName) => {
const { checkPermission } = usePermissions();

const logPermissions = () => {
const moduleId = MODULE_IDS[moduleName.toUpperCase()];
if (!moduleId) {
console.error(`No module ID found for ${moduleName}`);
return;
}

    const modulePermission = ALL_PERMISSIONS.find(p => p.moduleId === moduleId);
    if (!modulePermission) {
      console.error(`No permissions found for module: ${moduleName}`);
      return;
    }

    const permissions = {
      canCreate: modulePermission.canCreate,
      canRead: modulePermission.canRead,
      canUpdate: modulePermission.canUpdate,
      canDelete: modulePermission.canDelete
    };

    console.log(`Permissions for ${moduleName}:`, permissions);
    return permissions;
};

return logPermissions;
};

export const useAllPermissions = () => {
return ALL_PERMISSIONS;
};

