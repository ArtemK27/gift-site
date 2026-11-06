# Инструкция: Как исправить проект после скачивания из Google AI Studio

Этот документ содержит пошаговую инструкцию и готовые файлы конфигурации для случаев, когда вы выгружаете обновлённый проект из **Google AI Studio App** и переносите его в локальную папку или в основную директорию (`Gift-site`).

---

## ⚡ Экспресс-памятка (Самый быстрый способ переноса)

Если вы внесли изменения в AI Studio и хотите перенести их в основной проект `Gift-site`:
1. **Переносите ТОЛЬКО папки исходного кода и ассетов:**
   - Скопируйте папку `src/`
   - Скопируйте папку `public/` (если добавляли картинки/звуки)
2. **НЕ переносите** из AI Studio в корень проекта:
   - `package.json`
   - `vite.config.ts`
   - `tsconfig.json`
   - `bun.lock`
   - `.aistudio/`
3. В файле `src/index.css` проверьте первые строки: замените `@import "tailwindcss";` на `@tailwind base; ...` (подробно в шаге 4).

---

## 🔍 Почему проект из AI Studio не запускается локально на Windows?

Когда Google AI Studio экспортирует архив, он перезаписывает конфигурационные файлы под свой облачный контейнер:
1. **`package.json` ломает зависимости:** AI Studio добавляет серверные пакеты (`express`, `@google/genai`), несуществующие версии (`vite: ^8.3.0`, `typescript: ^7.0.2`), а также `bun.lock` и плагин `@tailwindcss/vite`, вызывая ошибку `ERESOLVE` при установке.
2. **`vite.config.ts` падает на импорте:** Пытается импортировать `@tailwindcss/vite`, которого нет в локальных `node_modules` (`ERR_MODULE_NOT_FOUND`).
3. **`src/index.css` теряет тему оформления:** Заменяет директивы Tailwind v3 на `@import "tailwindcss";` (Tailwind v4), из-за чего кастомные классы из `tailwind.config.js` (`festive-gold`, `cyber-accent`, `oled` и т.д.) не работают.
4. **`tsconfig.json` падает на типах:** Удаляет ограничение `"include": ["src"]`, и компилятор TypeScript пытается валидировать серверные и тестовые скрипты без установленных типов Node.
5. **Блокировка скриптов в PowerShell:** На Windows запуск команды `npm run dev` в PowerShell блокируется встроенной политикой безопасности (`PSSecurityException`).

---

## 🛠 Пошаговая инструкция восстановления проекта

Если вы распаковали полный архив из AI Studio в новую папку, выполните следующие шаги:

### Шаг 1. Удалите лишние служебные файлы AI Studio
Удалите файлы, созданные веб-песочницей AI Studio:
* `bun.lock`
* `.aistudio/` (папка)

---

### Шаг 2. Замените `package.json`
Вставьте в файл `package.json` в корне проекта следующее содержимое:

```json
{
  "name": "ny-smartphone-gift",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "canvas-confetti": "^1.9.4",
    "framer-motion": "^12.4.7",
    "lucide-react": "^1.16.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.64.1",
    "@types/canvas-confetti": "^1.9.0",
    "@types/node": "^22.14.0",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3",
    "vite": "^6.2.0"
  }
}
```

---

### Шаг 3. Замените `vite.config.ts`
Вставьте в файл `vite.config.ts` в корне проекта:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    host: true,
  },
});
```

---

### Шаг 4. Замените `tsconfig.json`
Вставьте в файл `tsconfig.json` в корне проекта:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "src/**/*.test.ts"]
}
```

---

### Шаг 5. Исправьте верхнюю строчку в `src/index.css`
Откройте `src/index.css`.
В самом верху файла AI Studio пишет:
```css
/* ❌ НЕПРАВИЛЬНО (версия AI Studio): */
@import "tailwindcss";
```

Замените её на:
```css
/* ✅ ПРАВИЛЬНО: */
@tailwind base;
@tailwind components;
@tailwind utilities;
```
Остальные кастомные стили и анимации ниже этой строчки оставляйте без изменений.

---

### Шаг 6. Установка зависимостей и запуск

1. **Если папки `node_modules` ещё нет (или менялись зависимости):**
   ```powershell
   npm.cmd install
   ```

2. **Проверка сборки:**
   ```powershell
   npm.cmd run build
   ```
   *(Должно вывести `✓ built in ...s` без ошибок).*

3. **Запуск сервера разработки:**
   ```powershell
   npm.cmd run dev
   ```
   Откройте в браузере: `http://localhost:5173/`.

---

## 💡 Полезный совет для Windows PowerShell

Если консоль ругается красным текстом:
```text
File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```
Это стандартная защита Windows от запуска скриптов `.ps1`. Чтобы запускать обычные команды `npm run dev` без `.cmd`, выполните один раз:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```
После этого вы сможете запускать `npm run dev` напрямую.
