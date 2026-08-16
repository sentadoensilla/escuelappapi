module.exports={
    listadoTipoDesempeno:`
    --LISTADO DE ANO LECTIVO
        SELECT * FROM tabtipodese ORDER BY ctipodeseid;
    `,

    InserTipoDesempeno:`
        --INSERCIÓN DE TIPO DE DESEMPEÑO
        INSERT INTO tabtipodese(
            ctipodeseid, cdesctipodese, cestatipdese) 
        VALUES ((SELECT MAX(ctipodeseid)+1 FROM tabtipodese), $1, 8);
    `,

    UpdateTipoDesempeno:`
        --ACTUALIZACION DE TIPO DE DESEMPEÑO
        UPDATE tabtipodese SET cdesctipodese=$2, cestatipdese=$3 WHERE ctipodeseid=$1;
    `,

    DeleteTipoDesempeno:`
        --ELIMINACIÓN DE TIPO DE DESEMPEÑO
        DELETE FROM tabtipodese WHERE ctipodeseid=$1;`,

    FalsoDeleteTipoDesempeno:`
        --FALSA ELIMINACIÓN DE TIPO DE DESEMPEÑO
        UPDATE tabtipodese SET cestatipdese=2 WHERE ctipodeseid=$1;
    `,
}