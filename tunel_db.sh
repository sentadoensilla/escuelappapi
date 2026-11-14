#!/usr/bin/env bash
# tunel_db.sh - Tunel SSH a la DB de sae12.com (vive mientras corre "npm start").
# Arranca el tunel (si no esta activo), ejecuta la app y cierra el tunel al salir.
set -euo pipefail

LOCAL_PORT=5433
REMOTE_HOST=127.0.0.1
REMOTE_PORT=5432
SSH_ALIAS=sae12.com

STARTED=0

if lsof -nP -iTCP:"$LOCAL_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "[tunel] ya estaba activo en :$LOCAL_PORT (se reutiliza)"
else
  echo "[tunel] levantando :$LOCAL_PORT -> $REMOTE_HOST:$REMOTE_PORT ..."
  ssh -f -N -L "$LOCAL_PORT:$REMOTE_HOST:$REMOTE_PORT" -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3 "$SSH_ALIAS"
  sleep 2
  if ! lsof -nP -iTCP:"$LOCAL_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "[tunel] ERROR: no se pudo levantar el tunel" >&2
    exit 1
  fi
  STARTED=1
  echo "[tunel] OK"
fi

cleanup() {
  if [ "$STARTED" -eq 1 ]; then
    STARTED=0
    echo "[tunel] cerrando tunel :$LOCAL_PORT ..."
    kill $(lsof -t -iTCP:"$LOCAL_PORT" -sTCP:LISTEN) 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# Arrancar la aplicacion (nodemon) en primer plano
echo "[app] iniciando nodemon..."
./node_modules/.bin/nodemon app.js
