import services from "../utils/token.js";
import moment from "moment";
export async function notAuth(req, res, next) {
  try {
    req.user = result.sub;
    next();
  } catch (err) {
    res.send(err);
  }
}
export async function isAuth(req, res, next) {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer') || !req.headers.authorization.split(' ')[1]) {
    return res.send({
      success: 'fail',
      statusCode: 403,
      message: 'No tienes Autorizacion isAuth'
    });
  }
  const token = req.headers.authorization.split(" ")[1];
  services.verifyToken(token).then(result => {
    // jose.jwtVerify devuelve el payload en result.payload.sub (no result.sub).
    const sub = result.payload && result.payload.sub || result.sub;
    // Si el token expiró o es inválido, verifyToken devuelve {success:'fail'} sin `sub`;
    // NO se debe continuar con req.user undefined (provoca rechazo 401 en las guardas).
    if (!sub) {
      return res.status(401).send({
        success: 'fail',
        statusCode: 401,
        message: 'Token inválido o expirado'
      });
    }
    req.user = sub;
    next();
  }).catch(err => {
    res.send(err);
  });
}
// Construye el arreglo de 10 parámetros que espera data.aelogdispositivos (migadepan).
function registrarPaso(req, res) {
  const ua = req.useragent || {};
  return services.logsteps([
    req.user ? services.decriptar(req.user.usuarioId) : '',
    moment().format(),
    req.originalUrl,
    res.statusCode,
    req.headers['x-forwarded-for'] || req.socket && req.socket.remoteAddress || null,
    ua.browser || '',
    ua.os || '',
    '',
    ua.version || '',
    ''
  ]);
}
export async function estudiante(req, res, next) {
  let rol = parseInt(services.decriptar(req.user?.usuarioRollId));
  if (rol === 3 || rol === 2 || rol === 1 || rol === 203 || rol === 202 || rol === 201) {
    res.status(200);
    await registrarPaso(req, res);
    next();
    return;
  } else {
    res.status(401);
    await registrarPaso(req, res);
    res.send({
      status: 'Unauthorized',
      statusCode: 401,
      message: 'No tienes autorizacion'
    });
    return;
  }
}
export async function Admin_academico(req, res, next) {
  let rol = parseInt(services.decriptar(req.user?.usuarioRollId));
  if (rol === 1 || rol === 3 || rol === 6 || rol === 7 || rol === 201 || rol === 207 || rol === 208) {
    res.status(200);
    await registrarPaso(req, res);
    next();
    return;
  } else {
    res.status(401);
    await registrarPaso(req, res);
    res.send({
      status: 'Unauthorized',
      statusCode: 401,
      message: 'No tienes autorizacion'
    });
    return;
  }
}
export async function Admin(req, res, next) {
  let rol = parseInt(services.decriptar(req.user?.usuarioRollId));
  if (rol === 0 || rol === 1 || rol === 3 || rol === 4 || rol === 201 || rol === 204 || rol === 205 || rol === 207 || rol === 208) {
    res.status(200);
    await registrarPaso(req, res);
    next();
    return;
  } else {
    res.status(401);
    await registrarPaso(req, res);
    res.send({
      status: 'Unauthorized',
      statusCode: 401,
      message: 'No tienes autorizacion'
    });
    return;
  }
}
export async function isTeacher(req, res, next) {
  let rol = parseInt(services.decriptar(req.user?.usuarioRollId));
  if (rol === 2 || rol === 202) {
    res.status(200);
    await registrarPaso(req, res);
    next();
    return;
  } else {
    res.status(401);
    await registrarPaso(req, res);
    res.send({
      status: 'Unauthorized',
      statusCode: 401,
      message: 'No tienes autorizacion'
    });
    return;
  }
}
export async function isAcudient(req, res, next) {
  let rol = parseInt(services.decriptar(req.user?.usuarioRollId));
  if (rol === 3 || rol === 4 || rol === 6 || rol === 203 || rol === 206) {
    res.status(200);
    await registrarPaso(req, res);
    next();
    return;
  } else {
    res.status(400);
    await registrarPaso(req, res);
    res.send({
      status: 'Unauthorized',
      statusCode: 401,
      message: 'No tienes autorizacion'
    });
    return;
  }
}
export async function isDirector_and_tecaher(req, res, next) {
  let rol = parseInt(services.decriptar(req.user?.usuarioRollId));
  if (rol === 0 || rol === 1 || rol === 2 || rol === 3 || rol === 6 || rol === 7 || rol === 201 || rol === 202) {
    res.status(200);
    await registrarPaso(req, res);
    next();
    return;
  } else {
    res.status(401);
    await registrarPaso(req, res);
    res.send({
      status: 'Unauthorized',
      statusCode: 401,
      message: 'No tienes autorizacion'
    });
    return;
  }
}
export async function isAcudiente_and_estudiante(req, res, next) {
  let rol = parseInt(services.decriptar(req.user?.usuarioRollId));
  if (rol === 3 || rol === 4 || rol === 6 || rol === 203 || rol === 206) {
    res.status(200);
    await registrarPaso(req, res);
    next();
    return;
  } else {
    res.status(400);
    await registrarPaso(req, res);
    res.send({
      status: 'Unauthorized',
      statusCode: 401,
      message: 'No tienes autorizacion'
    });
    return;
  }
}
export async function isAcudiente_and_estudiante_and_institucion(req, res, next) {
  let rol = parseInt(services.decriptar(req.user?.usuarioRollId));
  if (rol === 1 || rol === 3 || rol === 4 || rol === 6 || rol === 201 || rol === 203 || rol === 206 || rol === 207 || rol === 208) {
    res.status(200);
    await registrarPaso(req, res);
    next();
    return;
  } else {
    res.status(401);
    await registrarPaso(req, res);
    res.send({
      status: 'Unauthorized',
      statusCode: 401,
      message: 'No tienes autorizacion'
    });
    return;
  }
}
export async function isAcademico_and_estudiante_and_teacher(req, res, next) {
  let rol = parseInt(services.decriptar(req.user?.usuarioRollId));
  if (rol === 1 || rol === 2 || rol === 3 || rol === 201 || rol === 202 || rol === 203) {
    res.status(200);
    await registrarPaso(req, res);
    next();
    return;
  } else {
    res.status(401);
    await registrarPaso(req, res);
    res.send({
      status: 'Unauthorized',
      statusCode: 401,
      message: 'No tienes autorizacion'
    });
    return;
  }
}
export async function isDirector_and_tecaher_and_admin(req, res, next) {
  let rol = parseInt(services.decriptar(req.user?.usuarioRollId));
  if (rol === 0 || rol === 1 || rol === 2 || rol === 3 || rol === 4 || rol === 6 || rol === 7 || rol === 201 || rol === 202 || rol === 204) {
    res.status(200);
    await registrarPaso(req, res);
    next();
    return;
  } else {
    res.status(401);
    await registrarPaso(req, res);
    res.send({
      status: 'Unauthorized',
      statusCode: 401,
      message: 'No tienes autorizacion'
    });
    return;
  }
}
export default {
  notAuth: notAuth,
  isAuth: isAuth,
  estudiante: estudiante,
  Admin_academico: Admin_academico,
  Admin: Admin,
  isTeacher: isTeacher,
  isAcudient: isAcudient,
  isDirector_and_tecaher: isDirector_and_tecaher,
  isAcudiente_and_estudiante: isAcudiente_and_estudiante,
  isAcudiente_and_estudiante_and_institucion: isAcudiente_and_estudiante_and_institucion,
  isAcademico_and_estudiante_and_teacher: isAcademico_and_estudiante_and_teacher,
  isDirector_and_tecaher_and_admin: isDirector_and_tecaher_and_admin
};
