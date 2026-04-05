const DEMO_SIGNING_SECRET = "attendance-demo-signing-secret";
const QR_LIFETIME_SECONDS = 30;

const randomNonce = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let output = "";

  for (let i = 0; i < 10; i += 1) {
    output += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return output;
};

const simpleHash = (value) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
};

const createSignature = (payloadWithoutSignature) => {
  const canonical = JSON.stringify(payloadWithoutSignature);
  return simpleHash(`${canonical}.${DEMO_SIGNING_SECRET}`);
};

export const createQrSessionPayload = ({
  schoolCode,
  sessionId,
  sessionName,
  nextVersion = 1,
  issuedAt = Date.now(),
}) => {
  const expiresAt = issuedAt + QR_LIFETIME_SECONDS * 1000;

  const payloadWithoutSignature = {
    schoolCode,
    sessionId,
    sessionName,
    version: nextVersion,
    nonce: randomNonce(),
    issuedAt,
    expiresAt,
  };

  const signature = createSignature(payloadWithoutSignature);
  const payload = { ...payloadWithoutSignature, signature };

  return {
    ...payload,
    encoded: JSON.stringify(payload),
  };
};

export const validateQrSessionPayload = ({ encodedPayload, schoolCode, activeQrSession, consumedNonces }) => {
  if (!encodedPayload) {
    return { ok: false, reason: "No QR payload detected." };
  }

  let parsed;

  try {
    parsed = JSON.parse(encodedPayload);
  } catch (error) {
    return { ok: false, reason: "Invalid QR format." };
  }

  const {
    schoolCode: payloadSchoolCode,
    sessionId,
    sessionName,
    version,
    nonce,
    issuedAt,
    expiresAt,
    signature,
  } = parsed;

  if (!sessionId || !sessionName || !version || !nonce || !issuedAt || !expiresAt || !signature) {
    return { ok: false, reason: "QR data is incomplete." };
  }

  const payloadWithoutSignature = {
    schoolCode: payloadSchoolCode,
    sessionId,
    sessionName,
    version,
    nonce,
    issuedAt,
    expiresAt,
  };

  const expectedSignature = createSignature(payloadWithoutSignature);

  if (signature !== expectedSignature) {
    return { ok: false, reason: "QR signature mismatch." };
  }

  if (payloadSchoolCode !== schoolCode) {
    return { ok: false, reason: "QR is for a different school." };
  }

  if (!activeQrSession) {
    return { ok: false, reason: "No active QR session is available." };
  }

  if (activeQrSession.sessionId !== sessionId || activeQrSession.version !== version) {
    return { ok: false, reason: "QR is no longer active." };
  }

  if (Date.now() > expiresAt) {
    return { ok: false, reason: "QR has expired. Ask teacher to rotate." };
  }

  if (consumedNonces.includes(nonce)) {
    return { ok: false, reason: "Replay detected. QR nonce already used." };
  }

  return {
    ok: true,
    reason: "Attendance confirmed.",
    payload: parsed,
  };
};

export const getSecondsUntilExpiry = (expiresAt) => {
  if (!expiresAt) {
    return 0;
  }

  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
};

export const QR_SESSION_LIFETIME_SECONDS = QR_LIFETIME_SECONDS;
