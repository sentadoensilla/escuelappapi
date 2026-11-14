/**
 * detener-tunel.js — Cierra el túnel SSH abierto por `npm start`.
 *
 * Uso:  npm run tunel:stop
 *
 * Es seguro ejecutarlo aunque el túnel no exista.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ARCHIVO_PID = path.join(os.tmpdir(), 'escuelapp-tunel.pid');
const prefijo = '[tunel-bd]';

function leerPid() {
    try {
        const valor = fs.readFileSync(ARCHIVO_PID, 'utf8').trim();
        return /^\d+$/.test(valor) ? Number(valor) : null;
    } catch (error) {
        return null;
    }
}

const pid = leerPid();
if (!pid) {
    console.log(`${prefijo} no hay registro de un túnel abierto por la API.`);
    process.exit(0);
}

const esWindows = process.platform === 'win32';

if (esWindows) {
    const resultado = spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { encoding: 'utf8' });
    if (resultado.status === 0) {
        console.log(`${prefijo} túnel cerrado (ssh pid ${pid}).`);
    } else {
        console.log(`${prefijo} el proceso ${pid} ya no estaba corriendo.`);
    }
} else {
    try {
        process.kill(pid, 'SIGTERM');
        console.log(`${prefijo} túnel cerrado (ssh pid ${pid}).`);
    } catch (error) {
        console.log(`${prefijo} el proceso ${pid} ya no estaba corriendo.`);
    }
}

try {
    fs.unlinkSync(ARCHIVO_PID);
} catch (error) {
    /* nada */
}
