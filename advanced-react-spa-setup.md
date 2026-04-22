
## **Configuración del Entorno de Desarrollo - SPA con React**

La aplicación utiliza una **arquitectura SPA (Single Page Application)** desarrollada con **React 18**, **TypeScript**, **React Router v7** y **Vite** como herramienta de construcción. Esta guía explica cómo configurar el entorno local para desarrollar el frontend.

### **Requisitos Previos**

- **Node.js**: versión 18.x o superior ([Descargar](https://nodejs.org))
- **npm**: versión 9.x o superior (incluido con Node.js)
- **Git**: para clonar el repositorio
- **Editor de código**: VS Code recomendado ([Descargar](https://code.visualstudio.com))
- **Backend ejecutándose**: La aplicación frontend requiere que el backend (Práctica 2 API REST) esté disponible en `https://localhost:8443`

**Verificar instalación:**
```bash
node --version    # Debe ser >= 18.0.0
npm --version     # Debe ser >= 9.0.0
```

### **Estructura del Proyecto Frontend**

```
frontend/
├── app/
│   ├── routes/              # Rutas de React Router v7 (pages)
│   │   ├── admin/          # Rutas administrativas
│   │   ├── user/           # Rutas privadas del usuario
│   │   ├── product/        # Páginas de productos
│   │   └── ...
│   ├── components/          # Componentes reutilizables
│   ├── services/            # Servicios para consumir API REST
│   ├── dto/                 # Data Transfer Objects (tipos TypeScript)
│   ├── stores/              # Zustand (state management)
│   └── app.css              # Estilos globales
├── package.json             # Dependencias npm
├── vite.config.ts           # Configuración de Vite
├── tsconfig.json            # Configuración de TypeScript
├── react-router.config.ts   # Configuración de rutas (React Router v7)
└── build/                   # Output compilado (se genera automáticamente)
```

### **Instalación y Configuración Local**

#### **Paso 1: Navegar al directorio frontend**

```bash
cd frontend
```

#### **Paso 2: Instalar dependencias**

```bash
# npm
npm install

# O si usas yarn
yarn install

# O si usas pnpm
pnpm install
```

**Salida esperada:**
```
added XXX packages in Xs
```

#### **Paso 3: Variables de Entorno (opcional)**

Si necesitas cambiar la URL del backend (ej: desarrollo remoto), crea un archivo `.env.local`:

```bash
# frontend/.env.local
VITE_API_URL=https://localhost:8443
```

**Valores por defecto:**
- `VITE_API_URL`: `https://localhost:8443` (producción)
- En desarrollo local, Vite maneja automáticamente el proxy a través de la config

#### **Paso 4: Iniciar el servidor de desarrollo**

```bash
# npm
npm run dev

# O si usas yarn
yarn dev

# O si usas pnpm
pnpm dev
```

**Salida esperada:**
```
 VITE v7.3.2  building for production...
 ✓ 440 modules transformed.
 
 ➜  Local:   http://localhost:5173/new/
 ➜  press h to show help
```

Abre tu navegador e ingresa a `http://localhost:5173/new/` (puerto puede variar)

#### **Paso 5: Verificar autenticación y conexión**

La aplicación debería:
- Cargar la página principal (homepage)
- Conectarse al backend en `https://localhost:8443`

Si ves errores de CORS o conexión rechazada:
1. Verifica que el backend esté ejecutándose
2. Confirma que estés usando HTTPS (certificado auto-firmado es normal)
3. Revisa la consola del navegador (F12 > Console)

### **Compilación para Producción**

Para generar la versión compilada lista para producción:

```bash
npm run build
```

**Qué hace este comando:**
1. Compila TypeScript a JavaScript
2. Optimiza el código con tree-shaking
3. Genera archivos estáticos en `/build/client`
4. Copia los archivos al backend en `backend/src/main/resources/static/new`
5. El backend sirve estos archivos estáticos en producción

**Salida esperada:**
```
✓ 440 modules transformed
✓ built in 2.61s
✓ 12 modules transformed (SSR)
✓ built in 390ms

SPA Mode: Generated build/client/index.html
```

### **Arquitectura Frontend - Patrones Implementados**

#### **1. React Router v7 con clientLoader (Datos Pre-cargados)**

Todas las rutas que requieren datos del backend utilizan `clientLoader` para pre-cargar datos **antes** de renderizar el componente:

```typescript
// app/routes/user/user-products.tsx
import { redirect } from 'react-router';
import type { Route } from "./+types/user-products";

export async function clientLoader() {
  try {
    const products = await getMyProducts();  // Carga datos
    return products || [];
  } catch (error: any) {
    if (error?.status === 401) {
      throw redirect('/login');  // Auto-redirect si no autenticado
    }
    throw redirect('/login');
  }
}

export default function MyProducts({ loaderData }: Route.ComponentProps) {
  const [products, setProducts] = useState(loaderData);  // Datos YA disponibles
  // Sin useEffect, sin loading spinner - datos listos inmediatamente
}
```

**Beneficios:**
- Autenticación verificada antes de renderizar
- Errores 401 redirigen automáticamente a login
- Datos pre-cargados (sin flickering)
- Mejor UX y rendimiento

#### **2. Servicios + API Client (MVC Pattern)**

La aplicación sigue el patrón MVC con capas bien definidas:

```
Routes (UI) 
  ↓
Services (business logic) 
  ↓
api.ts (HTTP wrapper con JWT)
  ↓
Backend REST API
```

**Ejemplo:**
```typescript
// app/services/products-service.ts
export async function getMyProducts(): Promise<ProductDTO[]> {
  return api.get('/v1/products/my-products');  // Consumir API
}

// app/routes/user/user-products.tsx
import { getMyProducts } from '../../services/products-service';

export async function clientLoader() {
  const products = await getMyProducts();  // Usar servicio
  return products;
}
```

**Ventajas:**
- Reutilización de código
- Fácil testing
- Cambios centralizados

#### **3. Zustand para State Management (Autenticación)**

El estado global de autenticación se gestiona con Zustand:

```typescript
// app/stores/useUserStore.ts
export const useUserStore = create<UserStore>(
  persist(
    (set) => ({
      user: null,
      loginUser: async (username, password) => {
        const user = await logIn(username, password);  // API call
        set({ user });
        localStorage.setItem('token', user.token);  // Guardar token
      },
    }),
    { name: 'stilnovo-user-storage' }  // Persist en localStorage
  )
);

// En componentes
const { user, loginUser } = useUserStore();
if (!user) return <Navigate to="/login" />;
```

**Características:**
- Persistencia automática en localStorage
- Acceso global sin prop drilling
- Re-render automático en cambios

#### **4. DTOs Tipados (TypeScript)**

Toda la comunicación con el backend usa DTOs (Data Transfer Objects) fuertemente tipados:

```typescript
// app/dto/ProductDTO.ts
export interface ProductDTO {
  id: number;
  name: string;
  category: string;
  price: number;
  status: 'ACTIVE' | 'SOLD' | 'INACTIVE';
  image: ImageDTO;
  seller: UserDTO;
  description: string;
}

// En componentes - TypeScript catch errors en compile time
const product: ProductDTO = data;  // Type-safe
```

### **Desarrollo Avanzado**

#### **Agregar Nueva Página (Ruta)**

1. **Crear componente:**
```typescript
// app/routes/user/my-new-page.tsx
import type { Route } from "./+types/my-new-page";

export async function clientLoader() {
  try {
    const data = await myDataService();
    return data;
  } catch (error: any) {
    if (error?.status === 401) throw redirect('/login');
    throw redirect('/login');
  }
}

export default function MyNewPage({ loaderData }: Route.ComponentProps) {
  return <div>Contenido</div>;
}
```

2. **Registrar ruta en `app/routes.ts`:**
```typescript
{
  path: '/my-new-page',
  component: MyNewPage,
  loader: clientLoader,
}
```

3. **Usar en navegación:**
```typescript
<Link to="/my-new-page">Ir a nueva página</Link>
```

#### **Consumir Nueva Clase del Backend**

1. **Crear DTO:**
```typescript
// app/dto/MyNewDTO.ts
export interface MyNewDTO {
  id: number;
  title: string;
}
```

2. **Crear servicio:**
```typescript
// app/services/my-service.ts
import { MyNewDTO } from '../dto/MyNewDTO';
import { api } from './api';

export async function getMyData(): Promise<MyNewDTO[]> {
  return api.get('/v1/my-endpoint');
}
```

3. **Usar en componente:**
```typescript
import { getMyData } from '../../services/my-service';

export async function clientLoader() {
  return await getMyData();
}
```

### **Solución de Problemas Comunes**

| Problema | Causa | Solución |
|----------|-------|----------|
| `CORS error` | Backend no permite requests | Verifica `@CrossOrigin` en backend |
| `401 Unauthorized` | Token expirado o inválido | Login nuevamente |
| `Module not found` | Ruta de import incorrecta | Usa rutas relativas: `../../services` |
| `Blank page` | Error en compilación | Mira console.log (F12 > Console) |
| `Port 5173 already in use` | Otro proceso usa el puerto | `lsof -i :5173` y mata el proceso |
| `Cannot read property` | Variable es undefined | Usa optional chaining: `user?.id` |
| `Token not sent** en requests | Falta header Authorization | Verifica `api.ts` incluya el token |

### **Comandos Útiles**

```bash
# Desarrollo
npm run dev              # Iniciar servidor desarrollo (hot reload)
npm run build            # Compilar para producción
npm run lint             # Verificar código (si está configurado)
npm run type-check       # Verificar tipos TypeScript

# Limpiar
rm -rf node_modules      # Eliminar dependencias
rm -rf build             # Eliminar build compilado

# Reinstalar limpio
rm -rf node_modules && npm install
npm run build
```
--- 
