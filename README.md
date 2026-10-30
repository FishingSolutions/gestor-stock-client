# Gestor de Stock - Frontend Client

Aplicación web desarrollada en React con Vite para la gestión y control de inventario.

## Tecnologías
- React
- Vite
- JavaScript
- Supabase (cliente JS `@supabase/supabase-js`)

*IMPORTANTE: NO realizar commits directos al main. Todo cambio va por rama y Pull Request.*

## Instalación local

1. Clonar el repositorio:
   ```bash
   git clone git@github.com:FishingSolutions/gestor-stock-client.git
   cd gestor-stock-client
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar las variables de entorno de Supabase (ver abajo).

4. Levantar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Configuración de Supabase

El frontend se conecta **directamente** a Supabase con el SDK oficial; no hay backend propio en este repositorio.

1. Crear (o usar) un proyecto en [supabase.com](https://supabase.com/dashboard).
2. Ir a **Project Settings → API** y copiar:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon key** o **publishable key** → `VITE_SUPABASE_ANON_KEY`
3. Completar el archivo `.env` en la raíz del proyecto. Si no existe, crearlo a partir del ejemplo:
   ```bash
   cp .env.example .env
   ```

```dotenv
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-o-publishable-key>
```

> Vite lee el `.env` al arrancar: si lo cambiás, reiniciá `npm run dev`.
> Las variables expuestas al navegador deben empezar con `VITE_`.

## Uso del cliente

El cliente ya está inicializado en [`src/lib/supabase.js`](src/lib/supabase.js):

```js
import { supabase } from './lib/supabase'

// Ejemplo: leer productos
const { data, error } = await supabase.from('productos').select('*')
```

## Seguridad

- La **anon/publishable key** es pública por diseño: cualquiera puede verla en el bundle del navegador.
- La protección real de los datos se configura con **RLS (Row Level Security)** en cada tabla de Supabase. Sin políticas RLS, las tablas expuestas por la Data API quedan accesibles.
- **Nunca** uses la `service_role` key en este proyecto: saltea RLS y quedaría expuesta en el frontend.
