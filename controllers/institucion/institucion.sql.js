export const institucionListar = `
        SELECT i.cinstid AS idregistro, i.cinstnomb AS nombre, i.cinstcodidane AS codigodane,
               i.cinstnit AS nit, i.cinstdire AS direccion, i.cinsttele AS telefono,
               i.cinstemai AS email, i.cinstlema AS lema, i.cinstescu AS escudo,
               i.cinstcara AS idcaracter, i.cinstciud AS idciudad, i.cinstdepa AS iddepartamento,
               i.tabespeinst_cespeinstid AS idespecialidad, i.tabmetoinst_cmetoinst AS idmetodo,
               i.tabzonaresi_czonaresiid AS idzona, i.cinstesta AS idestado, i.cinstpadre AS idpadre,
               i.cinstreconocimiento AS reconocimiento, i.cinsthimno AS himno,
               i.cinstresolrector AS resolrector, i.cinstmanualconvivencia AS manualconvivencia,
               i.cinstcalendario AS calendario, i.cinstcoordx AS coordx, i.cinstcoordy AS coordy,
               i.cinstfacebook AS facebook, i.cinstinstagram AS instagram, i.cinstyoutube AS youtube,
               i.cinsttiktok AS tiktok, i.cinsttwitter AS twitter
        FROM public.tabinst i
        ORDER BY i.cinstnomb;`;
export const institucionRegistrar = `
        INSERT INTO public.tabinst
            (cinstid, tabzonaresi_czonaresiid, tabmetoinst_cmetoinst, cinstdire, tabespeinst_cespeinstid,
             cinstnomb, cinstcodidane, cinstpadre, cinstciud, cinstdepa, cinstescu, cinstesta,
             cinsttele, cinstemai, cinstlema, cinstnit, cinstcara, cinstfirm,
             cinstreconocimiento, cinsthimno, cinstresolrector, cinstmanualconvivencia,
             cinstcalendario, cinstcoordx, cinstcoordy, cinstfacebook, cinstinstagram,
             cinstyoutube, cinsttiktok, cinsttwitter)
        VALUES ((SELECT COALESCE(MAX(cinstid)+1, 1) FROM public.tabinst),
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
             $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
        RETURNING cinstid AS idregistro;`;
export const institucionActualizar = `
        UPDATE public.tabinst
        SET cinstnomb=$2, cinstcodidane=$3, cinstnit=$4, cinstdire=$5, cinsttele=$6,
            cinstemai=$7, cinstlema=$8, cinstescu=$9, cinstcara=$10, cinstciud=$11, cinstdepa=$12,
            tabespeinst_cespeinstid=$13, tabmetoinst_cmetoinst=$14, tabzonaresi_czonaresiid=$15, cinstesta=$16,
            cinstreconocimiento=$17, cinsthimno=$18, cinstresolrector=$19, cinstmanualconvivencia=$20,
            cinstcalendario=$21, cinstcoordx=$22, cinstcoordy=$23, cinstfacebook=$24, cinstinstagram=$25,
            cinstyoutube=$26, cinsttiktok=$27, cinsttwitter=$28
        WHERE cinstid=$1
        RETURNING cinstid AS idregistro;`;
export const institucionBorrar = `
        UPDATE public.tabinst SET cinstesta=$2 WHERE cinstid=$1 RETURNING cinstid AS idregistro;`;
export const sedeListar = `
        SELECT csedeid AS idregistro, cinstid AS idinstitucion, csedenomb AS nombre
        FROM public.tabinstsede
        WHERE ($1::integer IS NULL OR cinstid = $1)
        ORDER BY csedenomb;`;
export const sedeRegistrar = `
        INSERT INTO public.tabinstsede (csedeid, cinstid, csedenomb)
        VALUES ((SELECT COALESCE(MAX(csedeid)+1, 1) FROM public.tabinstsede), $1, $2)
        RETURNING csedeid AS idregistro;`;
export const sedeActualizar = `
        UPDATE public.tabinstsede SET csedenomb=$2 WHERE csedeid=$1 RETURNING csedeid AS idregistro;`;
export const sedeBorrar = `
        DELETE FROM public.tabinstsede WHERE csedeid=$1 RETURNING csedeid AS idregistro;`;
export default {
  institucionListar: institucionListar,
  institucionRegistrar: institucionRegistrar,
  institucionActualizar: institucionActualizar,
  institucionBorrar: institucionBorrar,
  sedeListar: sedeListar,
  sedeRegistrar: sedeRegistrar,
  sedeActualizar: sedeActualizar,
  sedeBorrar: sedeBorrar
};
/**
 * institucion.sql.js
 * Sentencias SQL del módulo de instituciones SAE (public.tabinst) y sedes (public.tabinstsede).
 */
