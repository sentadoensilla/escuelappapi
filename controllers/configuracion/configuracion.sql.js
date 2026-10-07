export const escalaListar = `
        SELECT e.cescaid AS idregistro, e.cinstid AS idinstitucion, e.canolid AS idano,
               e.cescanaciid AS idescalanacional, e.cescacualid AS idescalacualitativa,
               e.cescadesd AS desde, e.cescahast AS hasta,
               n.cescanacidesc AS escalanacional, c.cescacualdesc AS escalacualitativa
        FROM public.tabesca e
        LEFT JOIN public.tabescanaci n ON (n.cescanaciid = e.cescanaciid)
        LEFT JOIN public.tabescacual c ON (c.cescacualid = e.cescacualid)
        WHERE ($1::integer IS NULL OR e.cinstid = $1)
        ORDER BY e.cescadesd;`;
export const escalaRegistrar = `
        INSERT INTO public.tabesca (cescaid, cinstid, canolid, cescanaciid, cescacualid, cescadesd, cescahast)
        VALUES ((SELECT COALESCE(MAX(cescaid)+1, 1) FROM public.tabesca), $1, $2, $3, $4, $5, $6)
        RETURNING cescaid AS idregistro;`;
export const escalaActualizar = `
        UPDATE public.tabesca SET cescanaciid=$2, cescacualid=$3, cescadesd=$4, cescahast=$5
        WHERE cescaid=$1 RETURNING cescaid AS idregistro;`;
export const escalaBorrar = `
        DELETE FROM public.tabesca WHERE cescaid=$1 RETURNING cescaid AS idregistro;`;
export const sieListar = `
        SELECT csieid AS idregistro, ctipodeseid AS idtipodesempeno, cinstid AS idinstitucion,
               canolid AS idano, cvalprosie AS valorpromocion, csieesta AS idestado, clibsie AS libre
        FROM public.tabsie
        WHERE ($1::integer IS NULL OR cinstid = $1);`;
export const sieRegistrar = `
        INSERT INTO public.tabsie (csieid, ctipodeseid, cinstid, canolid, cvalprosie, csieesta, clibsie)
        VALUES ((SELECT COALESCE(MAX(csieid)+1, 1) FROM public.tabsie), $1, $2, $3, $4, $5, $6)
        RETURNING csieid AS idregistro;`;
export const sieActualizar = `
        UPDATE public.tabsie SET ctipodeseid=$2, cvalprosie=$3, csieesta=$4, clibsie=$5
        WHERE csieid=$1 RETURNING csieid AS idregistro;`;
export const certificadoListar = `
        SELECT ccertiid AS idregistro, cinstid AS idinstitucion, ctitucert AS titulo,
               cparra1cert AS parrafo1, cparra2cert AS parrafo2
        FROM public.tabcerti
        WHERE ($1::integer IS NULL OR cinstid = $1);`;
export const certificadoRegistrar = `
        INSERT INTO public.tabcerti (ccertiid, cinstid, ctitucert, cparra1cert, cparra2cert)
        VALUES ((SELECT COALESCE(MAX(ccertiid)+1, 1) FROM public.tabcerti), $1, $2, $3, $4)
        RETURNING ccertiid AS idregistro;`;
export const certificadoActualizar = `
        UPDATE public.tabcerti SET ctitucert=$2, cparra1cert=$3, cparra2cert=$4
        WHERE ccertiid=$1 RETURNING ccertiid AS idregistro;`;
export const certificadoBorrar = `
        DELETE FROM public.tabcerti WHERE ccertiid=$1 RETURNING ccertiid AS idregistro;`;
export const constanciaListar = `
        SELECT cconsid AS idregistro, cinstid AS idinstitucion, ctitucons AS titulo,
               cparra1cons AS parrafo1, cparra2cons AS parrafo2
        FROM public.tabcons
        WHERE ($1::integer IS NULL OR cinstid = $1);`;
export const constanciaRegistrar = `
        INSERT INTO public.tabcons (cconsid, cinstid, ctitucons, cparra1cons, cparra2cons)
        VALUES ((SELECT COALESCE(MAX(cconsid)+1, 1) FROM public.tabcons), $1, $2, $3, $4)
        RETURNING cconsid AS idregistro;`;
export const constanciaActualizar = `
        UPDATE public.tabcons SET ctitucons=$2, cparra1cons=$3, cparra2cons=$4
        WHERE cconsid=$1 RETURNING cconsid AS idregistro;`;
export const constanciaBorrar = `
        DELETE FROM public.tabcons WHERE cconsid=$1 RETURNING cconsid AS idregistro;`;
export const pazsalvoListar = `
        SELECT cpazsalvid AS idregistro, cinstid AS idinstitucion, ctitupazsalv1 AS titulo1,
               ctitupazsalv2 AS titulo2, cparrpazsalv1 AS parrafo1, cparrpazsalv2 AS parrafo2,
               cestapazsal AS idestado
        FROM public.tabpazsalv
        WHERE ($1::integer IS NULL OR cinstid = $1);`;
export const pazsalvoRegistrar = `
        INSERT INTO public.tabpazsalv (cpazsalvid, cinstid, ctitupazsalv1, ctitupazsalv2, cparrpazsalv1, cparrpazsalv2, cestapazsal)
        VALUES ((SELECT COALESCE(MAX(cpazsalvid)+1, 1) FROM public.tabpazsalv), $1, $2, $3, $4, $5, $6)
        RETURNING cpazsalvid AS idregistro;`;
export const pazsalvoActualizar = `
        UPDATE public.tabpazsalv SET ctitupazsalv1=$2, ctitupazsalv2=$3, cparrpazsalv1=$4, cparrpazsalv2=$5, cestapazsal=$6
        WHERE cpazsalvid=$1 RETURNING cpazsalvid AS idregistro;`;
export const firmaListar = `
        SELECT f.cfirmid AS idregistro, f.cinstid AS idinstitucion, f.cdoceid AS iddocente,
               f.cfirmcarg AS cargo, f.cfirmtipo AS tipo, f.cfirmorde AS orden, f.cestafirm AS idestado,
               d.cdoceapel || ' ' || d.cdocenomb AS docente
        FROM public.tabfirm f
        LEFT JOIN public.tabdoce d ON (d.cdoceid = f.cdoceid)
        WHERE ($1::integer IS NULL OR f.cinstid = $1)
        ORDER BY f.cfirmorde;`;
export const firmaRegistrar = `
        INSERT INTO public.tabfirm (cfirmid, cinstid, cdoceid, cfirmcarg, cfirmtipo, cfirmorde, cestafirm)
        VALUES ((SELECT COALESCE(MAX(cfirmid)+1, 1) FROM public.tabfirm), $1, $2, $3, $4, $5, $6)
        RETURNING cfirmid AS idregistro;`;
export const firmaActualizar = `
        UPDATE public.tabfirm SET cdoceid=$2, cfirmcarg=$3, cfirmtipo=$4, cfirmorde=$5, cestafirm=$6
        WHERE cfirmid=$1 RETURNING cfirmid AS idregistro;`;
export const firmaBorrar = `
        DELETE FROM public.tabfirm WHERE cfirmid=$1 RETURNING cfirmid AS idregistro;`;
export default {
  escalaListar: escalaListar,
  escalaRegistrar: escalaRegistrar,
  escalaActualizar: escalaActualizar,
  escalaBorrar: escalaBorrar,
  sieListar: sieListar,
  sieRegistrar: sieRegistrar,
  sieActualizar: sieActualizar,
  certificadoListar: certificadoListar,
  certificadoRegistrar: certificadoRegistrar,
  certificadoActualizar: certificadoActualizar,
  certificadoBorrar: certificadoBorrar,
  constanciaListar: constanciaListar,
  constanciaRegistrar: constanciaRegistrar,
  constanciaActualizar: constanciaActualizar,
  constanciaBorrar: constanciaBorrar,
  pazsalvoListar: pazsalvoListar,
  pazsalvoRegistrar: pazsalvoRegistrar,
  pazsalvoActualizar: pazsalvoActualizar,
  firmaListar: firmaListar,
  firmaRegistrar: firmaRegistrar,
  firmaActualizar: firmaActualizar,
  firmaBorrar: firmaBorrar
};
/**
 * configuracion.sql.js
 * Sentencias SQL del módulo de configuración académica SAE: escalas de calificación
 * (tabesca), SIE (tabsie), resoluciones/certificados (tabcerti), constancias (tabcons),
 * paz y salvo (tabpazsalv) y firmas (tabfirm).
 */
