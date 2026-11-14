import cron from "node-cron";
import Db from "../database/conex.js";
import horarios from "../sql/horarios.js";
import { enviarWhatsApp } from "../controllers/whatsapp/envio.js";

/**
 * scheduler.js — tareas programadas de Escuelapp (generan avisos en data.aelog_envios).
 * Se habilita con WP_CRON_ESCUELAPP=true.
 *
 * - Horario de mañana: durante los primeros 2 meses del año lectivo, envía a los
 *   acudientes las asignaturas que verán sus estudiantes al día siguiente.
 * - Boletines: (pendiente; requiere el evento de publicación de reportes).
 * - Calendario: (pendiente; el calendario aún no se programa).
 */
export function startScheduler() {
  if (process.env.WP_CRON_ESCUELAPP !== "true") {
    console.log("scheduler: deshabilitado (WP_CRON_ESCUELAPP != true)");
    return;
  }

  // Todos los días a las 18:00 (hora local del servidor).
  cron.schedule("0 18 * * *", async () => {
    await enviarHorarioManana();
  });

  console.log("scheduler: horario de mañana programado (18:00)");
}

export async function enviarHorarioManana() {
  try {
    // Instituciones con emisor de WhatsApp.
    const emisores = await Db.query({
      text: `SELECT DISTINCT e.idempresa AS aeinst_id
             FROM contact.emisor e
             JOIN migracion.map_institucion m ON (m.aeinst_id = e.idempresa)`,
      values: [],
    });

    for (const em of emisores.rows) {
      const aeinst_id = em.aeinst_id;
      try {
        // Año lectivo en uso (último con asignaciones).
        const yr = await Db.query({
          text: `SELECT aeanol_id FROM data.aeasignaciones WHERE aeinst_id = $1 ORDER BY aeanol_id DESC LIMIT 1`,
          values: [aeinst_id],
        });
        const anol = yr.rows[0]?.aeanol_id;
        if (!anol) continue;

        // Solo los primeros 2 meses del año lectivo.
        const f = await Db.query({
          text: `SELECT fecha_inicio FROM data.aeano WHERE aeano_id = $1`,
          values: [anol],
        });
        const inicio = f.rows[0]?.fecha_inicio ? new Date(f.rows[0].fecha_inicio) : null;
        if (inicio) {
          const limite = new Date(inicio);
          limite.setMonth(limite.getMonth() + 2);
          if (new Date() > limite) continue;
        }

        const r = await Db.query({ text: horarios.horarioManana, values: [aeinst_id, anol] });
        for (const row of r.rows) {
          const contactos = row.contactos || [];
          const texto = `Grupo ${row.grupo}:\n` + (row.asignaturas || []).join("\n");
          for (const tel of contactos) {
            if (tel && String(tel).length > 9) {
              await enviarWhatsApp({
                idempresa: aeinst_id,
                personaTipo: "acudiente",
                destino: String(tel),
                tipo: 3, // HORARIO
                tipoMensaje: "text",
                payload: { titulo: "Horario escolar de mañana", cuerpo: texto },
                idreferencia: anol,
              });
            }
          }
        }
      } catch (e) {
        console.log("scheduler horario (institución " + aeinst_id + "):", e.message);
      }
    }
  } catch (e) {
    console.log("scheduler horario:", e.message);
  }
}

export default { startScheduler, enviarHorarioManana };
