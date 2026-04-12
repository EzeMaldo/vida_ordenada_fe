<div align="center">

```
███████╗██████╗  ██████╗ ███╗   ██╗████████╗███████╗███╗   ██╗██████╗
██╔════╝██╔══██╗██╔═══██╗████╗  ██║╚══██╔══╝██╔════╝████╗  ██║██╔══██╗
█████╗  ██████╔╝██║   ██║██╔██╗ ██║   ██║   █████╗  ██╔██╗ ██║██║  ██║
██╔══╝  ██╔══██╗██║   ██║██║╚██╗██║   ██║   ██╔══╝  ██║╚██╗██║██║  ██║
██║     ██║  ██║╚██████╔╝██║ ╚████║   ██║   ███████╗██║ ╚████║██████╔╝
╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═══╝╚═════╝
```

### 🌐 Frontend Web · Next.js · React 19 · TypeScript

*Controlá tu dinero desde cualquier dispositivo*

---

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

## ✨ ¿Qué es este proyecto?

El frontend web de **Vida Ordenada** — una interfaz moderna para gestionar tus finanzas personales desde el navegador. Comparte datos en tiempo real con la app Android a través del backend compartido.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│                                                             │
│   (auth)/          (dashboard)/          /api/backend/*     │
│   └─ login         └─ dashboard          └─ catch-all proxy │
│   └─ register      └─ transactions                          │
│                    └─ accounts           ┌──────────────┐   │
│                    └─ categories         │   Axios +    │   │
│                    └─ reports            │  TanStack    │   │
│                    └─ savings            │    Query     │   │
│                    └─ challenges         └──────┬───────┘   │
│                    └─ fixed                     │           │
│                    └─ settings                  │           │
└─────────────────────────────────────────────────┼───────────┘
                                                  │ HTTPS/JWT
                                                  ▼
                                   ┌──────────────────────────┐
                                   │  Backend REST (Railway)  │
                                   │  Ktor + PostgreSQL       │
                                   └──────────────────────────┘
```

> **Proxy server-side:** `/api/backend/[...path]` reenvía todas las peticiones al backend real, eliminando CORS y manteniendo la URL del backend fuera del bundle del cliente.

---

## 🛠️ Stack Técnico

| Capa | Tecnología |
|:-----|:-----------|
| 🚀 Framework | Next.js 16.2.1 (App Router) |
| ⚛️ UI | React 19.2.4 |
| 📘 Lenguaje | TypeScript 5 |
| 🎨 Estilos | Tailwind CSS 4 + PostCSS |
| 🌐 HTTP | Axios 1.14.0 con interceptores JWT |
| 📦 Estado servidor | TanStack React Query 5.95.2 |
| 📊 Gráficos | Recharts 3.8.1 |
| 🔣 Íconos | Lucide React |
| 📅 Fechas | date-fns 4.1.0 |
| 🍪 Cookies | js-cookie 3.0.5 |

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/                     # Rutas públicas
│   │   ├── login/                  # Pantalla de login
│   │   └── register/               # Pantalla de registro
│   ├── (dashboard)/                # Rutas protegidas (JWT requerido)
│   │   ├── dashboard/              # Resumen financiero
│   │   ├── transactions/           # CRUD de transacciones
│   │   ├── accounts/               # Cuentas bancarias
│   │   ├── categories/             # Categorías personalizables
│   │   ├── reports/                # Análisis 50/30/20
│   │   ├── savings/                # Metas de ahorro
│   │   ├── challenges/             # Desafíos financieros
│   │   ├── fixed/                  # Gastos fijos
│   │   └── settings/               # Configuración
│   ├── api/backend/
│   │   └── [...path]/route.ts      # ← Proxy catch-all
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── layout/                     # Sidebar, TopBar
│   ├── charts/                     # BarChart, DonutChart
│   └── ui/                         # GlassCard, AmountDisplay, StatChip
├── hooks/
│   └── useSyncData.ts              # Sincronización con servidor
├── lib/
│   ├── api.ts                      # Axios + interceptores JWT (auto-refresh)
│   ├── auth.ts                     # Gestión de tokens
│   ├── formatters.ts               # Montos y fechas
│   └── sync.ts                     # Lógica de sync bidireccional
├── providers/
│   ├── AuthProvider.tsx            # Context de autenticación
│   └── QueryProvider.tsx           # TanStack Query provider
└── types/
    └── index.ts                    # Interfaces TypeScript
```

---

## 📱 Pantallas y Features

### 📊 Dashboard
- 💰 Patrimonio neto total y distribución por buckets
- 📈 Gráficos DonutChart y BarChart con Recharts
- 📋 Últimas transacciones con filtros

### 💳 Transacciones
- CRUD completo con categorías e íconos
- Filtrado por fecha, tipo y cuenta

### 📉 Reportes
- Regla **50/30/20** con progress bars y alertas
- Análisis por categoría y por período

### 🎯 Metas y Desafíos
- Progreso visual de metas de ahorro
- Desafíos financieros gamificados

### 🔐 Autenticación
- Login / Registro con JWT
- Auto-refresh del access token via interceptor Axios
- `AuthProvider` para estado global de sesión

---

## ⚙️ Variables de Entorno

```env
NEXT_PUBLIC_API_URL=https://vidaordenadabe-production.up.railway.app
```

---

## 🚀 Levantar en local

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

```bash
# Build de producción
npm run build
npm start
```

---

## 🔄 Proxy Backend

`src/app/api/backend/[...path]/route.ts` es un catch-all que reenvía todas las peticiones a `NEXT_PUBLIC_API_URL`. Esto permite:

- ✅ Sin problemas de CORS
- ✅ URL del backend fuera del bundle del cliente
- ✅ Posibilidad de agregar middleware server-side (rate limiting, logging)

```ts
// El cliente llama a:
fetch('/api/backend/auth/login', { ... })

// El proxy reenvía a:
fetch('https://vidaordenadabe-production.up.railway.app/auth/login', { ... })
```

---

## ✅ Features implementadas

- [x] App Router con grupos de rutas `(auth)` y `(dashboard)`
- [x] Auth JWT con auto-refresh via Axios interceptor
- [x] Dashboard con gráficos Recharts
- [x] CRUD completo para todas las entidades
- [x] Análisis 50/30/20
- [x] Proxy server-side para el backend
- [x] TanStack Query para caché y sincronización

---

## 🔗 Repositorios relacionados

<div align="center">

| Proyecto | Repositorio | Stack |
|:---------|:------------|:------|
| 📱 Android | [VidaOrdenada](https://github.com/EzeMaldo/vida_ordenada) | Kotlin · Compose |
| ⚙️ Backend | [vida_ordenada_be](https://github.com/EzeMaldo/vida_ordenada_be) | Ktor · PostgreSQL |

</div>

---

<div align="center">

*Hecho con ❤️ en Buenos Aires*

</div>
