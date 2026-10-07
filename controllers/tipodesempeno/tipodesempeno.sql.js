export const listadoTipoDesempeno = `
    --LISTADO DE ANO LECTIVO
        SELECT * FROM tabtipodese ORDER BY ctipodeseid;
    `;
export const InserTipoDesempeno = `
        --INSERCIÓN DE TIPO DE DESEMPEÑO
        INSERT INTO tabtipodese(
            ctipodeseid, cdesctipodese, cestatipdese) 
        VALUES ((SELECT MAX(ctipodeseid)+1 FROM tabtipodese), $1, 8);
    `;
export const UpdateTipoDesempeno = `
        --ACTUALIZACION DE TIPO DE DESEMPEÑO
        UPDATE tabtipodese SET cdesctipodese=$2, cestatipdese=$3 WHERE ctipodeseid=$1;
    `;
export const DeleteTipoDesempeno = `
        --ELIMINACIÓN DE TIPO DE DESEMPEÑO
        DELETE FROM tabtipodese WHERE ctipodeseid=$1;`;
export const FalsoDeleteTipoDesempeno = `
        --FALSA ELIMINACIÓN DE TIPO DE DESEMPEÑO
        UPDATE tabtipodese SET cestatipdese=2 WHERE ctipodeseid=$1;
    `;
export default {
  listadoTipoDesempeno: listadoTipoDesempeno,
  InserTipoDesempeno: InserTipoDesempeno,
  UpdateTipoDesempeno: UpdateTipoDesempeno,
  DeleteTipoDesempeno: DeleteTipoDesempeno,
  FalsoDeleteTipoDesempeno: FalsoDeleteTipoDesempeno
};
