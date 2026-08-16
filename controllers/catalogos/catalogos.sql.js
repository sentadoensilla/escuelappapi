/**
 * catalogos.sql.js
 * Definición de los catálogos SAE (esquema public) soportados por el CRUD genérico
 * y constructores de sentencias SQL (parametrizadas) para cada operación.
 *
 * Cada entrada del mapa `catalogos` describe:
 *  - tabla      : nombre completo de la tabla (esquema.tabla)
 *  - pk         : columna de clave primaria (numérica)
 *  - columnas   : columnas editables/visibles (excluye pk y estado)
 *  - estado     : columna de estado (null si la tabla no la tiene)
 *  - activo     : valor de estado "activo" al insertar (por defecto)
 *  - inactivo   : valor de estado que marca el borrado lógico
 *  - orderBy    : columna de orden para el listado (por defecto pk)
 */

const catalogos = {
    // --- Catálogos geográficos ---
    departamentos: { tabla: 'public.tabdepageog', pk: 'cdepageogid', columnas: ['cdepageogdesc'], estado: 'cdepageogesta', activo: 8, inactivo: 2, orderBy: 'cdepageogdesc' },
    ciudades:      { tabla: 'public.tabciud',      pk: 'cciudid',      columnas: ['cdepageogid', 'cciuddesc'], estado: 'cciudgesta', activo: 8, inactivo: 2, orderBy: 'cciuddesc', fk: ['cdepageogid'] },

    // --- Catálogos de personas / académicos ---
    grados:            { tabla: 'public.tabgrad',      pk: 'cgradid',      columnas: ['cgradcodi', 'cgraddesc', 'cgradnive'], estado: 'cgradesta', activo: 8, inactivo: 2, orderBy: 'cgradcodi' },
    jornadas:          { tabla: 'public.tabjorn',      pk: 'cjornid',      columnas: ['cjorndesc'], estado: 'cjornesta', activo: 8, inactivo: 2, orderBy: 'cjornid' },
    sexos:             { tabla: 'public.tabsexo',      pk: 'csexoid',      columnas: ['csexodesc'], estado: 'csexoesta', activo: 8, inactivo: 2, orderBy: 'csexoid' },
    parentescos:       { tabla: 'public.tabpare',      pk: 'cpareid',      columnas: ['cparedesc'], estado: 'cpareesta', activo: 8, inactivo: 2, orderBy: 'cpareid' },
    tiposdocumento:    { tabla: 'public.tabtipodocu',  pk: 'ctipodocuid',  columnas: ['ctipodocudesc'], estado: 'ctipodocuesta', activo: 8, inactivo: 2, orderBy: 'ctipodocuid' },
    tiposnovedad:      { tabla: 'public.tabtiponove',  pk: 'ctiponoveid',  columnas: ['ctiponovedesc', 'ctiponoveabre'], estado: 'ctiponoveesta', activo: 8, inactivo: 2, orderBy: 'ctiponoveid' },
    tiposnota:         { tabla: 'public.tabtiponota',  pk: 'ctiponotaid',  columnas: ['ctiponotadesc'], estado: 'ctiponotaesta', activo: 8, inactivo: 2, orderBy: 'ctiponotaid' },
    tiposdesempeno:    { tabla: 'public.tabtipodese',  pk: 'ctipodeseid',  columnas: ['cdesctipodese'], estado: 'cestatipdese', activo: 8, inactivo: 2, orderBy: 'ctipodeseid' },
    tiposvinculacion:  { tabla: 'public.tabtipovinc',  pk: 'ctipovincid',  columnas: ['ctipovincdesc'], estado: 'ctipovincesta', activo: 8, inactivo: 2, orderBy: 'ctipovincid' },
    tipossangre:       { tabla: 'public.tabtiposang',  pk: 'ctiposangid',  columnas: ['ctiposangdesc'], estado: 'ctiposangesta', activo: 8, inactivo: 2, orderBy: 'ctiposangid' },
    tipossubsidio:     { tabla: 'public.tabtiposubs',  pk: 'ctiposubsid',  columnas: ['ctiposubsdesc'], estado: 'ctiposubsesta', activo: 8, inactivo: 2, orderBy: 'ctiposubsid' },
    cargos:            { tabla: 'public.tabcarg',      pk: 'ccargid',      columnas: ['ccargdesc'], estado: 'ccargesta', activo: 8, inactivo: 2, orderBy: 'ccargdesc' },
    estadoscurso:      { tabla: 'public.tabestacurs',  pk: 'cestacursid',  columnas: ['cestacursdesc'], estado: 'cestacursesta', activo: 8, inactivo: 2, orderBy: 'cestacursid' },
    estadosgrado:      { tabla: 'public.tabestagrad',  pk: 'cestagradid',  columnas: ['cestagraddesc'], estado: 'cestagradesta', activo: 8, inactivo: 2, orderBy: 'cestagradid' },

    // --- Catálogos del anexo 6 / socioeconómicos ---
    estratos:          { tabla: 'public.tabestr',      pk: 'cestrid',      columnas: ['cestrdesc'], estado: 'cestresta', activo: 8, inactivo: 2, orderBy: 'cestrid' },
    sisben:            { tabla: 'public.tabsisb',      pk: 'csisbid',      columnas: ['csisbdesc'], estado: 'csisbesta', activo: 8, inactivo: 2, orderBy: 'csisbid' },
    zonasresidencia:   { tabla: 'public.tabzonaresi',  pk: 'czonaresiid',  columnas: ['czonaresidesc'], estado: 'czonaresiesta', activo: 8, inactivo: 2, orderBy: 'czonaresiid' },
    etnias:            { tabla: 'public.tabetni',      pk: 'cetniid',      columnas: ['cetnicodi', 'cetnidesc'], estado: 'cetniesta', activo: 8, inactivo: 2, orderBy: 'cetniid' },
    resguardos:        { tabla: 'public.tabresg',      pk: 'cresgid',      columnas: ['cresgcodi', 'cresgdesc'], estado: 'cresgesta', activo: 8, inactivo: 2, orderBy: 'cresgdesc' },
    discapacidades:    { tabla: 'public.tabdisc',      pk: 'cdiscid',      columnas: ['cdiscdesc'], estado: 'cdiscesta', activo: 8, inactivo: 2, orderBy: 'cdiscid' },
    capacidades:       { tabla: 'public.tabcapa',      pk: 'ccapaid',      columnas: ['ccapadesc'], estado: 'ccapaesta', activo: 8, inactivo: 2, orderBy: 'ccapaid' },
    conflictos:        { tabla: 'public.tabconf',      pk: 'cconfid',      columnas: ['cconfdesc'], estado: 'cconfesta', activo: 8, inactivo: 2, orderBy: 'cconfid' },
    fuentesrecursos:   { tabla: 'public.tabfuenrecu',  pk: 'cfuenrecuid',  columnas: ['cfuenrecudesc'], estado: 'cfuenrecuesta', activo: 8, inactivo: 2, orderBy: 'cfuenrecuid' },

    // --- Catálogos institucionales ---
    caracter:          { tabla: 'public.tabcara',      pk: 'ccaraid',      columnas: ['ccaradesc'], estado: 'ccaraesta', activo: 8, inactivo: 2, orderBy: 'ccaraid' },
    especialidades:    { tabla: 'public.tabespeinst',  pk: 'cespeinstid',  columnas: ['cespeinstdesc'], estado: 'cespeinstesta', activo: 8, inactivo: 2, orderBy: 'cespeinstid' },
    metodosinstitucionales: { tabla: 'public.tabmetoinst', pk: 'cmetoinstid', columnas: ['cmetoinstdesc'], estado: 'cmetoinstesta', activo: 8, inactivo: 2, orderBy: 'cmetoinstid' },
    escalanacional:    { tabla: 'public.tabescanaci',  pk: 'cescanaciid',  columnas: ['cescanacidesc'], estado: 'cescanaciesta', activo: 8, inactivo: 2, orderBy: 'cescanaciid' },
    escalacualitativa: { tabla: 'public.tabescacual',  pk: 'cescacualid',  columnas: ['cescacualdesc'], estado: 'cescacualesta', activo: 8, inactivo: 2, orderBy: 'cescacualid' },
    empresas:          { tabla: 'public.tabempr',      pk: 'cemprid',      columnas: ['cemprdesc', 'cemprdire', 'cemprtele', 'cemprpers'], estado: 'cempresta', activo: 8, inactivo: 2, orderBy: 'cemprdesc' },
    icbf:              { tabla: 'public.tabicbf',      pk: 'cicbfid',      columnas: ['cnombicbf'], estado: 'cestaicbf', activo: 8, inactivo: 2, orderBy: 'cnombicbf' },

    // --- Estados generales (no tiene columna de estado propia) ---
    estadosgenerales:  { tabla: 'public.tabestagene',  pk: 'cestageneid',  columnas: ['cestagenedesc'], estado: null, activo: 8, inactivo: 2, orderBy: 'cestageneid' },
};

/**
 * Construye la sentencia SELECT del listado de un catálogo.
 * @param {object} config entrada del mapa catalogos
 * @returns {{text:string, values:Array}}
 */
const buildSelect = (config) => {
    const columnas = [config.pk + ' AS idregistro', ...config.columnas];
    if (config.estado) columnas.push(config.estado + ' AS idestado');
    return {
        text: `SELECT ${columnas.join(', ')} FROM ${config.tabla} ORDER BY ${config.orderBy || config.pk};`,
        values: [],
    };
};

/**
 * Construye el INSERT de un catálogo (pk autoincremental con MAX+1).
 * Solo se insertan las columnas presentes en el body.
 * @param {object} config entrada del mapa catalogos
 * @param {object} campos objeto {columna: valor} desde el body
 * @returns {{text:string, values:Array}|null}
 */
const buildInsert = (config, campos) => {
    const cols = [];
    const values = [];
    const ph = [];
    for (const col of config.columnas) {
        if (campos[col] !== undefined && campos[col] !== null && campos[col] !== '') {
            cols.push(col);
            ph.push('$' + (values.length + 1));
            values.push(campos[col]);
        }
    }
    if (config.estado) {
        cols.push(config.estado);
        ph.push('$' + (values.length + 1));
        values.push(campos[config.estado] ?? config.activo);
    }
    if (cols.length === 0) return null;
    return {
        text: `INSERT INTO ${config.tabla} (${config.pk}, ${cols.join(', ')})
               VALUES ((SELECT COALESCE(MAX(${config.pk})+1, 1) FROM ${config.tabla}), ${ph.join(', ')}
               RETURNING ${config.pk} AS idregistro;`,
        values,
    };
};

/**
 * Construye el UPDATE de un catálogo por pk.
 * @param {object} config entrada del mapa catalogos
 * @param {number|string} pk valor de la clave primaria
 * @param {object} campos objeto {columna: valor} desde el body
 * @returns {{text:string, values:Array}|null}
 */
const buildUpdate = (config, pk, campos) => {
    const sets = [];
    const values = [pk];
    for (const col of config.columnas) {
        if (campos[col] !== undefined) {
            sets.push(`${col} = $${values.length + 1}`);
            values.push(campos[col]);
        }
    }
    if (config.estado && campos[config.estado] !== undefined) {
        sets.push(`${config.estado} = $${values.length + 1}`);
        values.push(campos[config.estado]);
    }
    if (sets.length === 0) return null;
    return {
        text: `UPDATE ${config.tabla} SET ${sets.join(', ')} WHERE ${config.pk} = $1 RETURNING ${config.pk} AS idregistro;`,
        values,
    };
};

/**
 * Construye el borrado LÓGICO (UPDATE de estado) de un catálogo por pk.
 * @param {object} config entrada del mapa catalogos
 * @param {number|string} pk valor de la clave primaria
 * @returns {{text:string, values:Array}|null}
 */
const buildDelete = (config, pk) => {
    if (!config.estado) return null;
    return {
        text: `UPDATE ${config.tabla} SET ${config.estado} = $1 WHERE ${config.pk} = $2 RETURNING ${config.pk} AS idregistro;`,
        values: [config.inactivo, pk],
    };
};

module.exports = { catalogos, buildSelect, buildInsert, buildUpdate, buildDelete };
