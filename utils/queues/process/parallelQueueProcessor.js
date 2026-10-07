import { sendImageMessage, sendVideoMessage, sendVoiceNote, sendTextMessage, checkWhatsAppNumber, upDateWhatsAppNumber } from "../whatsapp/sendFunctions.js";
import { getSession } from "../whatsapp/sessionManager.js";

/**
 * Rate limit por sesión
 */
const lastSentAtBySession = new Map();
const MIN_DELAY_MS = 1500;
async function rateLimit(sessionId) {
  const last = lastSentAtBySession.get(sessionId) || 0;
  const now = Date.now();
  const diff = now - last;
  if (diff < MIN_DELAY_MS) {
    await new Promise(r => setTimeout(r, MIN_DELAY_MS - diff));
  }
  lastSentAtBySession.set(sessionId, Date.now());
}
export default async function parallelQueueProcessor(job) {
  const {
    sessionId,
    to,
    type,
    payload,
    idpersonal
  } = job.data;
  if (!sessionId || !to || !type) {
    throw new Error("INVALID_JOB_DATA");
  }
  const session = getSession(sessionId);
  if (!session || session.status !== "connected") {
    throw new Error("SESSION_NOT_CONNECTED");
  }
  await rateLimit(sessionId);
  switch (type) {
    case "text":
      await sendTextMessage({
        sessionId,
        to,
        text: payload.text
      });
      break;
    case "image":
      await sendImageMessage({
        sessionId,
        to,
        imageUrl: payload.imageUrl,
        caption: payload.caption
      });
      break;
    case "video":
      await sendVideoMessage({
        sessionId,
        to,
        videoUrl: payload.videoUrl,
        caption: payload.caption
      });
      break;
    case "voice":
      await sendVoiceNote({
        sessionId,
        to,
        audioUrl: payload.audioUrl
      });
      break;
    case "checknumber":
      const checado = await checkWhatsAppNumber(sessionId, to);
      await upDateWhatsAppNumber({
        idpersonal: idpersonal,
        isRegistered: checado,
        telefono: to
      });
      return checado;
      break;
    default:
      throw new Error("UNKNOWN_MESSAGE_TYPE");
  }
  return {
    ok: true
  };
}
