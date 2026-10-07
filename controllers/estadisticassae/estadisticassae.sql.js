export const matriculaTotal = `
        SELECT COUNT(*)::int AS total
        FROM public.tabmatr m
        WHERE m.cmatresta = 13
          AND ($1::integer IS NULL OR m.cmatrinst = $1);`;
export const matriculaPorSexo = `
        SELECT s.csexodesc AS etiqueta, COUNT(*)::int AS total
        FROM public.tabmatr m
        JOIN public.tabestu e ON (e.cestuid = m.cestuid)
        LEFT JOIN public.tabsexo s ON (s.csexoid = e.cestugene)
        WHERE m.cmatresta = 13
        GROUP BY s.csexodesc
        ORDER BY total DESC;`;
export const matriculaPorEtnia = `
        SELECT COALESCE(t.cetnidesc, 'Sin información') AS etiqueta, COUNT(*)::int AS total
        FROM public.tabmatr m
        LEFT JOIN public.tabestuotrodato o ON (o.cmatrid = m.cmatrid)
        LEFT JOIN public.tabetni t ON (t.cetniid = o.cestuotrodatoetni)
        WHERE m.cmatresta = 13
        GROUP BY t.cetnidesc
        ORDER BY total DESC;`;
export const matriculaPorGrado = `
        SELECT g.cgraddesc AS etiqueta, COUNT(*)::int AS total
        FROM public.tabmatr m
        JOIN public.tabcurs c ON (c.ccursid = m.ccursid)
        LEFT JOIN public.tabgrad g ON (g.cgradid = c.cgradid)
        WHERE m.cmatresta = 13
        GROUP BY g.cgraddesc
        ORDER BY total DESC;`;
export const resumen = `
        SELECT
            (SELECT COUNT(*)::int FROM public.tabmatr m WHERE m.cmatresta = 13 AND ($1::integer IS NULL OR m.cmatrinst = $1)) AS matriculados,
            (SELECT COUNT(*)::int FROM public.tabmatr m JOIN public.tabestu e ON (e.cestuid = m.cestuid) WHERE m.cmatresta = 13 AND e.cestugene = 1) AS mujeres,
            (SELECT COUNT(*)::int FROM public.tabmatr m JOIN public.tabestu e ON (e.cestuid = m.cestuid) WHERE m.cmatresta = 13 AND e.cestugene = 2) AS hombres,
            (SELECT COUNT(*)::int FROM public.tabdoce) AS docentes,
            (SELECT COUNT(*)::int FROM public.tabcurs c WHERE c.ccursesta = 8) AS cursos;`;
export default {
  matriculaTotal: matriculaTotal,
  matriculaPorSexo: matriculaPorSexo,
  matriculaPorEtnia: matriculaPorEtnia,
  matriculaPorGrado: matriculaPorGrado,
  resumen: resumen
};
/**
 * estadisticassae.sql.js
 * Sentencias SQL del módulo de reportes/estadísticas SAE (solo lectura).
 */
