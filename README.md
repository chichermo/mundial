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

### API-Football (resultados automáticos)

1. Crea cuenta gratis en [api-football.com](https://www.api-football.com/)
2. Copia tu API key → `API_FOOTBALL_KEY` en Vercel
3. Genera el mapeo partido ↔ fixture (una vez, o cuando actualicen el calendario):

```bash
API_FOOTBALL_KEY=tu_clave npm run fixture-map
git add src/data/fixture-map.json && git commit -m "Actualizar fixture map"
```

4. En `/admin` pulsa **Sincronizar ahora**, o configura cron:
   - `CRON_SECRET` = una clave aleatoria larga
   - Vercel ejecuta `/api/cron/sync-results` cada 15 min (plan Pro; en Hobby usa sync manual)

La tabla en vivo y la polla se actualizan solas al guardar resultados.

**Nota plan Free:** a fecha de hoy API-Football puede limitar `season=2026` al plan de pago. La clave queda lista en Vercel; cuando habiliten 2026 en free (cerca del torneo), `npm run fixture-map` y el sync automático funcionarán. Hasta entonces usa `/admin` manual.

## Invitación

Comparte `/unirse` — redirige a registro y unión a Balsuos.

## Scripts

- `npm run test` — tests de puntuación
- `npm run build` — build producción
- `node scripts/generate-matches.mjs` — regenerar fixture

## CI

GitHub Actions en `.github/workflows/ci.yml` (test, lint, build).
