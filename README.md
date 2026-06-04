# WE26 · Mundial 2026

App de calendario del Mundial 2026 con horarios en **Chile**, **España** y **Bélgica**, información de transmisión TV/streaming y **polla** entre amigos.

## Funciones

- **Cuentas de usuario**: registro con email, login, perfil con nombre visible en el ranking.
- **Grupos**: crea una polla, obtén código de invitación, tus amigos se registran y se unen con el código. Puedes pertenecer a varios grupos.
- **Calendario**: 104 partidos con filtros por fase, grupo y selección.
- **Horarios**: conversión desde hora base EST/EDT a CLT, CEST (España y Bélgica).
- **Transmisión** por país:
  - 🇨🇱 DSports/DGo/Paramount+ (todos), Chilevisión (52 partidos TV abierta), Disney+ Premium (30 partidos).
  - 🇪🇸 DAZN/Movistar (todos), RTVE La 1/Teledeporte (partidos destacados y España).
  - 🇧🇪 VRT y RTBF (cobertura completa en TV pública).
- **Polla**: crear grupo con código, pronósticos de marcador, eliminatoria, campeón, sorpresa, revelación, goleador y jugador revelación, ranking en vivo.

## Puntuación polla

| Acierto | Puntos |
|--------|--------|
| Marcador exacto | 3 |
| Resultado (ganador/empate) | 1 |
| Ganador en eliminatoria | 2 |
| Campeón | 10 |
| Selección sorpresa / revelación | 6 c/u |
| Goleador | 8 |
| Jugador revelación | 6 |

### Panel admin

Ruta: `/admin` — contraseña en `ADMIN_PASSWORD` (por defecto `we26admin`, cámbiala en producción).

Ahí cargas marcadores reales y las respuestas correctas de campeón, goleador, etc. El ranking se recalcula al instante.

Reglas detalladas: `/polla/reglas`

### ¿Necesitas base de datos en la nube?

Para **~10 usuarios fijos y 1 grupo privado**:

| Dónde corre | Base de datos | Notas |
|-------------|---------------|--------|
| Tu PC / servidor en casa (`npm run start`) | **SQLite** (`prisma/dev.db`) | Suficiente. Datos persisten en disco. |
| Vercel serverless | SQLite **no sirve** (se borra en cada deploy) | Necesitas Turso/Postgres gratis **o** no usar Vercel |

**Recomendación:** si el grupo es cerrado y pequeño, hostea en un mini PC, Raspberry o un VPS barato con SQLite. Solo migra a Turso si quieres URL pública en Vercel.

### PWA y notificaciones

- **Instalar app:** en móvil Chrome/Safari → «Añadir a pantalla de inicio» o el banner «Instalar WE26».
- **Recordatorios:** en Perfil activa avisos y pulsa «Activar avisos» en la polla (permiso del navegador). Revisa partidos sin pronóstico en las próximas 48 h.

### Despliegue en Vercel (opcional)

Si eliges Vercel, configura **Turso** (plan free) y `DATABASE_URL` con `libsql://...`. Para uso casero, no hace falta.

## Desarrollo

```bash
npm install
node scripts/generate-matches.mjs
npx prisma db push
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Flujo polla

1. `/cuenta/registro` — crear cuenta  
2. `/polla/grupos` — crear grupo o unirse con código  
3. `/polla` — pronósticos y ranking del grupo activo  
4. Compartir invitación: botón «Copiar invitación» (código + enlace)

## Notas

- Los horarios usan **EDT (UTC-4)** como referencia FIFA para sedes en Norteamérica.
- La lista de partidos en Chilevisión/Disney+ sigue el reparto oficial publicado; puede ajustarse en `scripts/generate-matches.mjs`.
- Los resultados reales de partidos se cargan en la tabla `MatchResult` (próxima mejora: panel admin).
