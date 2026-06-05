# WE26 · Mundial 2026

App de calendario del Mundial 2026 con hora local automática, transmisión TV y **polla Balsuos** (8 amigos, top 4 a eliminatoria).

## Funciones

- **Calendario**: 104 partidos, filtros, favoritos, estado del partido, countdown, enlace `#partido-N`
- **Hora local**: detecta la zona del navegador en la vista lista
- **Polla Balsuos**: 8 jugadores, 5 pts exacto / 2 pts L/E/V, tabla en vivo, clasificados, comentarios y comparar pronósticos
- **Ranking**: `/polla/tabla`, exportar PNG, perfil por jugador con logros
- **PWA**: instalable, cache básico offline
- **Avisos**: notificaciones del navegador (2 h antes si falta pronóstico)
- **Admin**: resultados, import JSON, partido del día (x2 pts), historial de cambios

## Puntuación polla Balsuos

| Acierto | Puntos |
|--------|--------|
| Marcador exacto | 5 |
| Resultado L/E/V | 2 |
| Ganador eliminatoria (solo top 4) | 2 |
| Partido del día (admin) | multiplicador x2 |

Reglas: `/polla/reglas`

## Base de datos

| Entorno | Configuración |
|---------|---------------|
| Local | `DATABASE_URL="file:./dev.db"` |
| Vercel | Turso: `DATABASE_URL=libsql://...` + `DATABASE_AUTH_TOKEN` |

```bash
npm install
npx prisma db push
npm run dev
```

## Variables de entorno

Ver `.env.example`: `ADMIN_PASSWORD`, `POLL_GROUP_NAME`, `POLL_GROUP_CODE`, `POLL_MAX_MEMBERS`, `POLL_QUALIFIERS`, `DATABASE_AUTH_TOKEN` (Turso).

### openfootball (resultados automáticos · recomendado)

Sin API key. Lee el JSON público de [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json).

1. En `/admin` pulsa **Sincronizar openfootball**
2. Para cron automático en Vercel:
   - `CRON_SECRET` = una clave aleatoria larga
   - Vercel ejecuta `/api/cron/sync-results` cada 15 min (openfootball primero; API-Football solo si hay `API_FOOTBALL_KEY`)

Opcional: `OPENFOOTBALL_URL` para apuntar a otro mirror del JSON.

Los marcadores aparecen en `score.ft` cuando la comunidad los publica (antes del torneo puede devolver 0 actualizaciones).

### API-Football (opcional)

1. Crea cuenta en [api-football.com](https://www.api-football.com/) → `API_FOOTBALL_KEY`
2. Mapeo fixture (si el plan incluye 2026): `API_FOOTBALL_KEY=tu_clave npm run fixture-map`

**Nota plan Free:** puede no incluir `season=2026` aún. openfootball cubre el sync sin clave.

## Invitación

Comparte `/unirse` — redirige a registro y unión a Balsuos.

## Scripts

- `npm run test` — tests de puntuación
- `npm run build` — build producción
- `node scripts/generate-matches.mjs` — regenerar fixture

## CI

GitHub Actions en `.github/workflows/ci.yml` (test, lint, build).
