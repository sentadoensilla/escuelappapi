/**
 * asegurar-tunel.js — Garantiza que el túnel SSH a la BD de SAE esté arriba.
 *
 * Se ejecuta automáticamente con `npm start` (script "prestart") dentro de
 * escuelappapi. Si el túnel ya está activo no hace nada; si no, lo levanta
 * como proceso hijo de la misma consola (Ctrl+C lo cierra junto con la API).
 *
 * Uso manual:
 *   npm run tunel            # abre el túnel (idempotente)
 *   npm run tunel:stop       # lo cierra
 *
 * Variables de entorno (opcionales):
 *   TUNEL_DESTINO  alias SSH            (default sae12-db, ver ~/.ssh/config)
 *   TUNEL_PUERTO   puerto local         (default 5432)
 *   TUNEL_REMOTO   host:puerto remoto   (default 127.0.0.1:5432)
 *   TUNEL_CLAVE    ruta de la clave     (default ~/.ssh/sae12_rsa)
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const PUERTO = Number(process.env.TUNEL_PUERTO || 5432);
const REMOTO = process.env.TUNEL_REMOTO || '127.0.0.1:5432';
const DESTINO = process.env.TUNEL_DESTINO || 'sae12-db';
const CLAVE = process.env.TUNEL_CLAVE || path.join(os.homedir(), '.ssh', 'sae12_rsa');
const ARCHIVO_PID = path.join(os.tmpdir(), 'escuelapp-tunel.pid');
const LOG = path.join(os.tmpdir(), 'escuelapp-tunel.log');
const ESPERA_MS = Number(process.env.TUNEL_ESPERA_MS || 30000);

const prefijo = '[tunel-bd]';

function puertoAbierto(host = '127.0.0.1', puerto = PUERTO, tiempo = 1500) {
    return new Promise((resolver) => {
        const socket = new net.Socket();
        const terminar = (valor) => {
            socket.destroy();
            resolver(valor);
        };
        socket.setTimeout(tiempo);
        socket.once('connect', () => terminar(true));
        socket.once('timeout', () => terminar(false));
        socket.once('error', () => terminar(false));
        socket.connect(puerto, host);
    });
}

function dormir(ms) {
    return new Promise((resolver) => setTimeout(resolver, ms));
}

function haySsh() {
    const prueba = spawnSync('ssh', ['-V'], { encoding: 'utf8' });
    return !prueba.error;
}

function ultimasLineasDelLog(cantidad = 8) {
    try {
        return fs.readFileSync(LOG, 'utf8').split(/\r?\n/).slice(-cantidad).join('\n');
    } catch (error) {
        return '(sin log)';
    }
}

async function main() {
    if (await puertoAbierto()) {
        console.log(`${prefijo} ya está activo en 127.0.0.1:${PUERTO}; no hago nada.`);
        return 0;
    }

    if (!haySsh()) {
        console.error(`${prefijo} no encontré el cliente ssh en el PATH. Instala OpenSSH.`);
        return 2;
    }
    if (!fs.existsSync(CLAVE)) {
        console.error(`${prefijo} no encontré la clave privada: ${CLAVE}`);
        console.error(`${prefijo} genera/convierte la llave (ver D:\\VENUS\\tunel\\README.md).`);
        return 2;
    }

    const argumentos = [
        '-N',                              // sin shell remota: sólo el reenvío
        '-L', `${PUERTO}:${REMOTO}`,       // 127.0.0.1:5432 -> servidor:5432
        '-i', CLAVE,
        '-o', 'IdentitiesOnly=yes',
        '-o', 'BatchMode=yes',
        '-o', 'ExitOnForwardFailure=yes',
        '-o', 'ServerAliveInterval=30',
        '-o', 'ServerAliveCountMax=3',
        '-o', 'TCPKeepAlive=yes',
        '-o', 'StrictHostKeyChecking=accept-new',
        DESTINO,
    ];

    fs.appendFileSync(LOG, `\n--- ${new Date().toISOString()} abriendo túnel ${PUERTO} -> ${DESTINO} (${REMOTO}) ---\n`);
    console.log(`${prefijo} abriendo túnel SSH 127.0.0.1:${PUERTO} -> ${DESTINO} …`);

    // 'detached' es obligatorio: si el ssh queda en el mismo árbol de procesos
    // que este script, npm lo mata al terminar el prestart (probado: sin
    // detached el túnel moría al instante). Con detached sobrevive y el
    // proceso queda registrado en el archivo PID para poder cerrarlo con
    // `npm run tunel:stop` (o `npm stop`).
    const descriptor = fs.openSync(LOG, 'a');
    const hijo = spawn('ssh', argumentos, {
        detached: true,
        stdio: ['ignore', 'ignore', descriptor],
        windowsHide: true,
    });
    hijo.on('error', (error) => {
        console.error(`${prefijo} no se pudo lanzar ssh: ${error.message}`);
    });
    hijo.unref();
    fs.writeFileSync(ARCHIVO_PID, String(hijo.pid));
    fs.closeSync(descriptor);

    const limite = Date.now() + ESPERA_MS;
    while (Date.now() < limite) {
        if (hijo.exitCode !== null) break;
        if (await puertoAbierto()) {
            console.log(`${prefijo} OK: 127.0.0.1:${PUERTO} escuchando (ssh pid ${hijo.pid}).`);
            return 0;
        }
        await dormir(400);
    }

    console.error(`${prefijo} el túnel no respondió en ${Math.round(ESPERA_MS / 1000)}s.`);
    console.error(`${prefijo} últimas líneas del log (${LOG}):`);
    console.error(ultimasLineasDelLog());
    console.error(`${prefijo} revisa que la VPN/red llegue a sae12.com:2321 y que la llave sea válida.`);
    if (hijo.exitCode === null) hijo.kill();
    return 1;
}

main()
    .then((codigo) => process.exit(codigo))
    .catch((error) => {
        console.error(`${prefijo} error inesperado:`, error);
        process.exit(1);
    });
