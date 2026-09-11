import fs from 'fs';
import path from 'path';

const targetDir = path.join(process.cwd(), 'inertia-export');
const srcDir = path.join(process.cwd(), 'src');

console.log('📦 Starting export of React project to Laravel + Inertia.js structure...');

// Create target directories
const dirsToCreate = [
  targetDir,
  path.join(targetDir, 'resources/js/Pages'),
  path.join(targetDir, 'resources/js/components'),
  path.join(targetDir, 'resources/js/types'),
  path.join(targetDir, 'resources/js/utils'),
  path.join(targetDir, 'resources/js/data'),
  path.join(targetDir, 'resources/js/hooks'),
  path.join(targetDir, 'resources/js/assets/images'),
  path.join(targetDir, 'resources/js/audio'),
  path.join(targetDir, 'resources/css')
];

dirsToCreate.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper function to copy recursive
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy components, types, utils, data, hooks, assets, audio
console.log('📁 Copying components, types, utils, data, assets...');
copyRecursive(path.join(srcDir, 'components'), path.join(targetDir, 'resources/js/components'));
copyRecursive(path.join(srcDir, 'types'), path.join(targetDir, 'resources/js/types'));
copyRecursive(path.join(srcDir, 'utils'), path.join(targetDir, 'resources/js/utils'));
copyRecursive(path.join(srcDir, 'data'), path.join(targetDir, 'resources/js/data'));
copyRecursive(path.join(srcDir, 'hooks'), path.join(targetDir, 'resources/js/hooks'));
copyRecursive(path.join(srcDir, 'assets'), path.join(targetDir, 'resources/js/assets'));
copyRecursive(path.join(srcDir, 'audio'), path.join(targetDir, 'resources/js/audio'));

// Copy App.tsx as an Inertia Page (resources/js/Pages/GameApp.tsx)
if (fs.existsSync(path.join(srcDir, 'App.tsx'))) {
  let appContent = fs.readFileSync(path.join(srcDir, 'App.tsx'), 'utf-8');
  // Adjust relative imports from './components' to '../components' since Pages is one level deeper
  appContent = appContent
    .replace(/from '\.\/components\//g, "from '../components/")
    .replace(/from '\.\/types\//g, "from '../types/")
    .replace(/from '\.\/data\//g, "from '../data/")
    .replace(/from '\.\/utils\//g, "from '../utils/")
    .replace(/from '\.\/hooks\//g, "from '../hooks/")
    .replace(/from '\.\/audio\//g, "from '../audio/");

  fs.writeFileSync(path.join(targetDir, 'resources/js/Pages/GameApp.tsx'), appContent);
}

// Copy CSS
if (fs.existsSync(path.join(srcDir, 'index.css'))) {
  fs.copyFileSync(
    path.join(srcDir, 'index.css'),
    path.join(targetDir, 'resources/css/app.css')
  );
}

// Create resources/js/app.jsx (Inertia setup entry point)
const appJsContent = `import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => \`\${title} - \${appName}\`,
    resolve: (name) => resolvePageComponent(\`./Pages/\${name}.tsx\`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
`;
fs.writeFileSync(path.join(targetDir, 'resources/js/app.jsx'), appJsContent);

// Create Blade view resources/views/app.blade.php
const bladeContent = `<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
`;
const viewsDir = path.join(targetDir, 'resources/views');
if (!fs.existsSync(viewsDir)) fs.mkdirSync(viewsDir, { recursive: true });
fs.writeFileSync(path.join(viewsDir, 'app.blade.php'), bladeContent);

// Create README instructions
const readmeContent = `# Laravel + Inertia.js Export Guide

This folder contains the exported components, assets, pages, and configuration templates from your React application ready to be integrated into a Laravel + Inertia.js (React) project following the official Inertia.js v3 specifications (https://inertiajs.com/docs/v3/getting-started).

## Integration Steps:

1. **Create or Open your Laravel project**:
   \`\`\`bash
   composer create-project laravel/laravel my-app
   cd my-app
   \`\`\`

2. **Install Inertia.js Server-side Adapter**:
   \`\`\`bash
   composer require inertiajs/inertia-laravel
   \`\`\`

3. **Install Frontend Dependencies**:
   \`\`\`bash
   npm install @inertiajs/react @inertiajs/core framer-motion gsap d3 canvas-confetti lucide-react react react-dom
   npm install --save-dev @vitejs/plugin-react laravel-vite-plugin @tailwindcss/vite tailwindcss
   \`\`\`

4. **Copy Exported Files**:
   Copy the contents of \`resources/\` from this export folder directly into your Laravel project's \`resources/\` directory.

5. **Configure Routes (routes/web.php)**:
   \`\`\`php
   use Illuminate\\Support\\Facades\\Route;
   use Inertia\\Inertia;

   Route::get('/', function () {
       return Inertia::render('GameApp');
   });
   \`\`\`

6. **Run Development Server**:
   \`\`\`bash
   npm run dev
   # in another terminal:
   php artisan serve
   \`\`\`
`;

fs.writeFileSync(path.join(targetDir, 'INERTIA_MIGRATION_README.md'), readmeContent);

console.log('✨ Export successfully completed into the "inertia-export/" directory!');
