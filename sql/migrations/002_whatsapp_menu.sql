-- ============================================================================
-- Menú dinámico (schema logic) para WhatsApp multiinstitución.
-- Roles: 0 = Administrador, 3 = Institución.
-- Idempotente: inserta solo si no existe una opción con ese enlace.
-- ============================================================================
BEGIN;

-- 1) Menú "WhatsApp" (si no existe)
INSERT INTO logic.tabmenu (cmenuid, cmenunomb, cmenudesc, cmenudest, cmenuesta, cmenuorde)
SELECT (SELECT COALESCE(MAX(cmenuid)+1, 1) FROM logic.tabmenu), 'WhatsApp', 'Comunicaciones por WhatsApp', '', 1, 8
WHERE NOT EXISTS (SELECT 1 FROM logic.tabmenu WHERE cmenunomb = 'WhatsApp');

-- 2) Opción "WhatsApp de la institución" (enlace 'whatsapp')
INSERT INTO logic.tabopcimenu (copcimenuid, copcimenumenu, copcimenunomb, copcimenudesc, copcimenuenla, copcimenuicon, copcimenuorde, copcimenuesta)
SELECT (SELECT COALESCE(MAX(copcimenuid)+1, 1) FROM logic.tabopcimenu),
       (SELECT cmenuid FROM logic.tabmenu WHERE cmenunomb = 'WhatsApp'),
       'WhatsApp de la institución', 'Vincular emisor, consultar cola y mensajes de la institución',
       'whatsapp', 'tabler:brand-whatsapp', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM logic.tabopcimenu WHERE copcimenuenla = 'whatsapp');

-- 3) Opción "Administración WhatsApp" (enlace 'whatsappadmin')
INSERT INTO logic.tabopcimenu (copcimenuid, copcimenumenu, copcimenunomb, copcimenudesc, copcimenuenla, copcimenuicon, copcimenuorde, copcimenuesta)
SELECT (SELECT COALESCE(MAX(copcimenuid)+1, 1) FROM logic.tabopcimenu),
       (SELECT cmenuid FROM logic.tabmenu WHERE cmenunomb = 'WhatsApp'),
       'Administración WhatsApp', 'Supervisión global de emisores, colas y mensajes',
       'whatsappadmin', 'tabler:brand-whatsapp', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM logic.tabopcimenu WHERE copcimenuenla = 'whatsappadmin');

-- 4) Privilegios por rol: 'whatsapp' -> Admin(0) e Institución(3)
INSERT INTO logic.tabrollopci (crollopciid, copcimenuid, crollid, crollopciesta)
SELECT (SELECT COALESCE(MAX(crollopciid), 0) FROM logic.tabrollopci) + ROW_NUMBER() OVER (ORDER BY r.crollid),
       o.copcimenuid, r.crollid, 1
FROM logic.tabopcimenu o
CROSS JOIN (VALUES (0), (3)) AS r(crollid)
WHERE o.copcimenuenla = 'whatsapp'
  AND NOT EXISTS (SELECT 1 FROM logic.tabrollopci x WHERE x.copcimenuid = o.copcimenuid AND x.crollid = r.crollid);

-- 5) Privilegio: 'whatsappadmin' -> solo Admin(0)
INSERT INTO logic.tabrollopci (crollopciid, copcimenuid, crollid, crollopciesta)
SELECT (SELECT COALESCE(MAX(crollopciid)+1, 1) FROM logic.tabrollopci), o.copcimenuid, 0, 1
FROM logic.tabopcimenu o
WHERE o.copcimenuenla = 'whatsappadmin'
  AND NOT EXISTS (SELECT 1 FROM logic.tabrollopci x WHERE x.copcimenuid = o.copcimenuid AND x.crollid = 0);

COMMIT;
