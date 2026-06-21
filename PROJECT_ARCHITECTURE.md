# Project Architecture & Configuration Guide

This document explains the technologies used in the Customer Service Complaint Management System (CSCMS) prototype, their purpose, and the roles of the various configuration files.

---

## 🚀 Technology Stack & Purpose

The project is built as a modern, single-page client-side web application designed to be lightweight, responsive, and easy to deploy.

| Technology | Purpose |
| :--- | :--- |
| **React (v18)** | The core library used to build the user interface using a component-based model. It manages application state, view switching, form inputs, theme switching, and live data binding for the mock complaints. |
| **TypeScript** | Adds static type definitions to JavaScript, preventing runtime errors and ensuring type safety for our database schemas, view actions, and components. |
| **Vite** | A modern frontend build tool that offers an extremely fast Hot Module Replacement (HMR) development server and optimized Rollup production builds. |
| **Tailwind CSS (v4)** | A utility-first CSS framework integrated via Vite. It allows custom layouts, rapid styling, responsive configurations, and native transition controls using semantic CSS variables. |
| **Lucide React** | Provides the rich library of modern, clean UI icons used throughout the header, sidebar navigation, form sections, and status indicators. |
| **Sonner** | A clean, customizable toast notification library used to trigger success, info, and error alerts (such as when incoming calls connect or when a Challan is submitted). |

---

## 🛠️ Configuration Files & Their Purpose

Here is an explanation of the core configuration files in the root of the project:

### 1. [package.json](file:///Users/mohan/workspace/TNPolice_CMS/package.json)
- **Purpose**: Defines the metadata for the project, execution scripts, and external dependencies.
- **Key Configs**:
  - `dependencies`: Lists required runtime packages like `@radix-ui` primitives, `lucide-react`, `motion`, and `recharts`.
  - `devDependencies`: Dev tools like `typescript`, `vite`, and `@tailwindcss/vite`.
  - `scripts`: Commands to run the project locally (`pnpm dev`) and package it (`pnpm build`).

### 2. [vite.config.ts](file:///Users/mohan/workspace/TNPolice_CMS/vite.config.ts)
- **Purpose**: Configures Vite's bundler and plugins.
- **Key Configs**:
  - Integrates `@vitejs/plugin-react` to support React compilation.
  - Integrates `@tailwindcss/vite` to support CSS utility-class compiling directly within Vite's build pipelines.

### 3. [pnpm-workspace.yaml](file:///Users/mohan/workspace/TNPolice_CMS/pnpm-workspace.yaml)
- **Purpose**: Defines the package manager workspace settings.
- **Key Configs**:
  - `packages`: Points to current folder directories.
  - `supportedArchitectures`: Configures target platforms for native packages (e.g., `linux` and `darwin` for arm64/x64 systems), ensuring correct Rollup binaries are downloaded on macOS (Darwin) and Linux deployment environments.

### 4. [postcss.config.mjs](file:///Users/mohan/workspace/TNPolice_CMS/postcss.config.mjs)
- **Purpose**: PostCSS configuration file.
- **Key Configs**:
  - Runs plugins to optimize modern CSS before loading in browser contexts.

---

## 🎨 Theme & Layout Structure

- **Styles Root**: Styles are managed in [src/styles/index.css](file:///Users/mohan/workspace/TNPolice_CMS/src/styles/index.css).
- **Themes**: [theme.css](file:///Users/mohan/workspace/TNPolice_CMS/src/styles/theme.css) defines design variables for background, card color, popover elements, and text under `:root` (dark mode by default) and `.light` (light mode) classes.
- **Vite Entry**: [index.html](file:///Users/mohan/workspace/TNPolice_CMS/index.html) and [main.tsx](file:///Users/mohan/workspace/TNPolice_CMS/src/main.tsx) act as the mounting points for the React Application.
