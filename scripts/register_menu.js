/**
 * register_menu.js
 * Script reutilizable para registrar una opción de menú en el frontend dinámico
 * (engine.aemenu + engine.aeopcmenu) y sus privilegios por rol (engine.aerollopc).
 *
 * Uso:
 *   node scripts/register_menu.js --enlace avisos --nombre "Avisos" \
 *       --menu 202 --icono "fa fa-bullhorn" --orden 18 --roles 201,202,204
 *
 * Convenciones (ver .agents/frontend.md §5.1 y AGENTS.md):
 *  - aeopcmenu_enlace guarda la ruta SIN "/" inicial (el login la expone como "/" + enlace).
 *  - Los IDs se generan con COALESCE(MAX(id)+1,1) para conservar históricos.
 *  - Borrado lógico con estado (no DELETE).
 *  - engine.aerollopc relaciona opción <-> rol (privilegio); también puede usarse
 *    engine.aeusuopc para privilegios por usuario específico.
 */
import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const args = {};
process.argv.slice(2).forEach((a, i) => {
  if (a.startsWith('--')) args[a.slice(2)] = process.argv.slice(2)[i + 1];
});

const ENLACE = args.enlace;
const NOMBRE = args.nombre;
const MENU = parseInt(args.menu, 10);
const ICONO = args.icono || 'fa fa-circle';
const ORDEN = parseInt(args.orden, 10) || 1;
const ROLES = (args.roles || '').split(',').map((r) => parseInt(r.trim(), 10)).filter((r) => !isNaN(r));

if (!ENLACE || !NOMBRE || !MENU || ROLES.length === 0) {
  console.error('Uso: node scripts/register_menu.js --enlace <x> --nombre "<y>" --menu <id> [--icono <c>] [--orden <n>] --roles <id1,id2,...>');
  process.exit(1);
}

const c = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  database: process.env.PG_DB_NAME,
  password: process.env.PG_PASSWORD,
  ssl: false,
});

async function main() {
  await c.connect();

  // 1) Verificar el menú padre.
  const menu = await c.query('SELECT aemenu_id, aemenu_nombre FROM engine.aemenu WHERE aemenu_id=$1 AND aemenu_estado=1', [MENU]);
  if (menu.rows.length === 0) throw new Error('Menú ' + MENU + ' no existe o está inactivo');

  // 2) Si la opción ya existe con ese enlace, reutilizarla (idempotente).
  let opc = await c.query('SELECT aeopcmenu_id FROM engine.aeopcmenu WHERE aeopcmenu_enlace=$1', [ENLACE]);
  let opcId;
  if (opc.rows.length > 0) {
    opcId = opc.rows[0].aeopcmenu_id;
    console.log('Opción existente aeopcmenu_id=' + opcId + ' (se actualizará el menú/orden/icono).');
    await c.query(
      `UPDATE engine.aeopcmenu SET aemenu_id=$2, aeopcmenu_nombre=$3, aeopcmenu_icono=$4, aeopcmenu_orden=$5, aeopcmenu_estado=1 WHERE aeopcmenu_id=$1`,
      [opcId, MENU, NOMBRE, ICONO, ORDEN]
    );
  } else {
    const max = await c.query('SELECT COALESCE(MAX(aeopcmenu_id)+1,1) AS nid FROM engine.aeopcmenu');
    opcId = max.rows[0].nid;
    await c.query(
      `INSERT INTO engine.aeopcmenu (aeopcmenu_id, aemenu_id, aeopcmenu_nombre, aeopcmenu_descripcion, aeopcmenu_enlace, aeopcmenu_icono, aeopcmenu_orden, aeopcmenu_estado)
       VALUES ($1,$2,$3,$3,$4,$5,$6,1)`,
      [opcId, MENU, NOMBRE, ENLACE, ICONO, ORDEN]
    );
    console.log('Opción creada aeopcmenu_id=' + opcId + ' enlace=/' + ENLACE);
  }

  // 3) Asignar privilegios por rol (engine.aerollopc), idempotente.
  for (const rol of ROLES) {
    const ex = await c.query('SELECT aerollopc_id FROM engine.aerollopc WHERE aeopcmenu_id=$1 AND aeroll_id=$2', [opcId, rol]);
    if (ex.rows.length > 0) {
      await c.query('UPDATE engine.aerollopc SET aerollopc_estado=1 WHERE aerollopc_id=$1', [ex.rows[0].aerollopc_id]);
      console.log('Privilegio rol ' + rol + ' -> opción ' + opcId + ' (reactivado).');
    } else {
      const max = await c.query('SELECT COALESCE(MAX(aerollopc_id)+1,1) AS nid FROM engine.aerollopc');
      const privId = max.rows[0].nid;
      await c.query(
        'INSERT INTO engine.aerollopc (aerollopc_id, aeopcmenu_id, aeroll_id, aerollopc_estado) VALUES ($1,$2,$3,1)',
        [privId, opcId, rol]
      );
      console.log('Privilegio rol ' + rol + ' -> opción ' + opcId + ' (creado aerollopc_id=' + privId + ').');
    }
  }

  console.log('OK: menú registrado. Ruta del navegador: /' + ENLACE);
  await c.end();
  process.exit(0);
}

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
