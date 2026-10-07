/**
 * migrar_cusuallave_base64url.js
 *
 * Normaliza logic.tabusua.cusuallave al nuevo formato base64url (token.encriptar):
 *  - Decodifica el valor actual a texto plano (tolera plano, base64 simple, doble y base64url).
 *  - Re-codifica con base64url (URL-safe, reversible).
 *  - Es idempotente: solo actualiza cuando el valor no está ya en el formato canónico.
 *
 * Uso:
 *   node scripts/migrar_cusuallave_base64url.js           # dry-run (no escribe)
 *   node scripts/migrar_cusuallave_base64url.js --apply   # aplica UPDATEs en transacción
 *
 * Para migrar otra BD (p.ej. localhost) sin tocar .env:
 *   PG_HOST=localhost node scripts/migrar_cusuallave_base64url.js --apply
 */
require('dotenv').config();
const pg = require('pg');

const { Client } = pg;

const encriptar = (text) => {
  if (text === undefined || text === null || text === '') return '';
  return Buffer.from(String(text), 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const decodeUtf8 = (b64) => {
  try {
    const d = Buffer.from(b64, 'base64').toString('utf-8');
    return d === '' || d.includes('\uFFFD') ? null : d;
  } catch {
    return null;
  }
};

const decriptar = (text) => {
  if (text === undefined || text === null || text === '') return '';
  const s = String(text);

  // 1) base64url (nuevo): round-trip canónico.
  if (/^[A-Za-z0-9_-]+$/.test(s)) {
    const d = decodeUtf8(s.replace(/-/g, '+').replace(/_/g, '/'));
    if (d !== null && encriptar(d) === s) return d;
  }

  // 2) base64 estándar (legado).
  if (s.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(s)) {
    const d = decodeUtf8(s);
    if (d !== null) return d;
  }

  // 3) passthrough.
  return s;
};

// Intenta decodificar UNA capa. Devuelve null si la cadena ya es texto plano.
const decodificarUnaCapa = (s) => {
  if (!s) return null;
  const d = decriptar(s);
  return d === s ? null : d;
};

// Decodifica hasta llegar al texto plano (admite base64 simple, doble y base64url).
const aPlano = (v) => {
  let s = v;
  let guard = 0;
  let d;
  while ((d = decodificarUnaCapa(s)) !== null && guard++ < 4) {
    s = d;
  }
  return s;
};

const aplicar = process.argv.includes('--apply');

const client = new Client({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT) || 5432,
  user: process.env.PG_USER,
  database: process.env.PG_DB_NAME,
  password: process.env.PG_PASSWORD,
  ssl: false,
});

client
  .connect()
  .then(() =>
    client.query('SELECT cusuaid, cusuanick, cusuallave FROM logic.tabusua ORDER BY cusuaid'),
  )
  .then(async (res) => {
    const rows = res.rows;
    let vacios = 0;
    let sinCambio = 0;
    let aCambiar = 0;
    const cambios = [];
    const muestras = [];

    for (const r of rows) {
      const v = r.cusuallave;
      if (v === null || v === '') {
        vacios++;
        continue;
      }
      const plano = aPlano(v);
      const nuevo = encriptar(plano);
      if (nuevo === v) {
        sinCambio++;
        continue;
      }
      aCambiar++;
      cambios.push({ id: r.cusuaid, nick: r.cusuanick, viejo: v, plano, nuevo });
      if (muestras.length < 20) muestras.push({ nick: r.cusuanick, viejo: v, plano, nuevo });
    }

    console.log(
      `Resumen: total=${rows.length} vacios=${vacios} sinCambio=${sinCambio} aCambiar=${aCambiar}`,
    );
    console.log('Muestras (nick | viejo -> plano -> nuevo):');
    for (const m of muestras) console.log(`  ${m.nick} | ${m.viejo} -> ${m.plano} -> ${m.nuevo}`);

    if (!aplicar) {
      console.log('\nDRY-RUN: nada escrito. Ejecuta con --apply para aplicar.');
      return client.end();
    }

    try {
      await client.query('BEGIN');
      for (const c of cambios) {
        await client.query('UPDATE logic.tabusua SET cusuallave = $1 WHERE cusuaid = $2', [
          c.nuevo,
          c.id,
        ]);
      }
      await client.query('COMMIT');
      console.log(`\nAPLICADO: ${cambios.length} filas actualizadas.`);
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('ERROR aplicando, rollback ejecutado:', e);
      process.exitCode = 1;
    } finally {
      await client.end();
    }
  })
  .catch((e) => {
    console.error('ERROR de conexión:', e);
    process.exitCode = 1;
  });
