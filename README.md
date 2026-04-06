# Vida Ordenada — Frontend Web

Interfaz web moderna para gestionar finanzas personales, construida con Next.js 16 y React 19. Complementa la app Android con acceso desde cualquier dispositivo.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.1 (App Router) |
| Lenguaje | TypeScript 5 |
| UI | React 19.2.4 |
| Estilos | Tailwind CSS 4 + PostCSS |
| HTTP client | Axios 1.14.0 con interceptores JWT |
| Estado servidor | TanStack React Query 5.95.2 |
| Gráficos | Recharts 3.8.1 |
| Iconos | Lucide React 1.7.0 |
| Utilidades | date-fns 4.1.0, js-cookie 3.0.5 |

## Arquitectura

```
┌──────────────────────────────────────┐
│           Next.js App                │
│  (App Router — grupos (auth) y       │
│   (dashboard) para rutas protegidas) │
└─────────────┬────────────────────────┘
              │
    ┌─────────▼──────────┐
    │  /api/backend/*    │  ← Proxy server-side (evita CORS)
    └─────────┬──────────┘
              │ HTTP/JWT
              ▼
    ┌──────────────────────────────────────┐
    │   Backend REST API (Railway/Ktor)    │
    └──────────────────────────────────────┘
```

Las peticiones del cliente van a `/api/backend/*` (mismo origen), que actúa como proxy server-side hacia el backend real en Railway.

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/                 # Rutas públicas
│   │   ├── login/              # Pantalla de login
│   │   └── register/           # Pantalla de registro
│   ├── (dashboard)/            # Rutas protegidas (requieren JWT)
│   │   ├── dashboard/          # Dashboard principal con resumen
│   │   ├── accounts/           # Gestión de cuentas bancarias
│   │   ├── categories/         # Gestión de categorías
│   │   ├── transactions/       # CRUD de transacciones
│   │   ├── calendar/           # Vista calendario de movimientos
│   │   ├── reports/            # Reportes y análisis 50/30/20
│   │   ├── savings/            # Metas de ahorro
│   │   ├── challenges/         # Desafíos financieros
│   │   ├── fixed/              # Gastos fijos recurrentes
│   │   └── settings/           # Configuración del usuario
│   ├── api/backend/
│   │   └── [...path]/
│   │       └── route.ts        # Proxy catch-all hacia el backend real
│   ├── layout.tsx              # Layout raíz con providers
│   ├── page.tsx                # Landing page
│   └── globals.css             # Estilos globales (Tailwind base)
├── components/
│   ├── layout/                 # Sidebar, TopBar
│   ├── charts/                 # BarChart, DonutChart (Recharts)
│   └── ui/                     # GlassCard, AmountDisplay, StatChip
├── hooks/
│   └── useSyncData.ts          # Hook de sincronización con servidor
├── lib/
│   ├── api.ts                  # Axios con interceptores JWT (auto-refresh)
│   ├── auth.ts                 # Gestión de tokens (get/save/clear)
│   ├── formatters.ts           # Formateo de montos y fechas
│   └── sync.ts                 # Lógica de sincronización bidireccional
├── providers/
│   ├── AuthProvider.tsx        # Context de autenticación
│   └── QueryProvider.tsx       # TanStack React Query provider
└── types/
    └── index.ts                # TypeScript interfaces y types
```

## Features principales

### Dashboard
- Resumen de patrimonio neto
- Distribución de gastos (Fijos / Variables / Deudas / Inversión)
- Últimas transacciones
- Gráficos con Recharts (DonutChart, BarChart)

### Gestión financiera
- Transacciones (CRUD completo)
- Cuentas bancarias múltiples
- Categorías personalizables
- Gastos fijos recurrentes

### Análisis
- Regla 50/30/20 con progress bars
- Reportes por categoría y por período
- Vista calendario de movimientos

### Metas y desafíos
- Metas de ahorro con seguimiento de progreso
- Desafíos financieros gamificados

### Autenticación
- Login / Register con JWT
- Interceptor Axios para adjuntar token automáticamente
- Refresh automático cuando el access token expira
- Context `AuthProvider` para estado global de sesión

## Variables de entorno

```env
NEXT_PUBLIC_API_URL=https://vidaordenadabe-production.up.railway.app
```

## Levantar en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Proxy backend

`src/app/api/backend/[...path]/route.ts` es un catch-all que reenvía todas las peticiones a `NEXT_PUBLIC_API_URL`. Esto permite que el frontend llame a `/api/backend/auth/login` en lugar del backend directamente, eliminando problemas de CORS y manteniendo la URL del backend fuera del bundle del cliente.

## Repositorios relacionados

| Proyecto | Repositorio |
|---|---|
| Android | [VidaOrdenada](https://github.com/EzeMaldo/vida_ordenada) |
| Backend | [vida_ordenada_be](https://github.com/EzeMaldo/vida_ordenada_be) |
