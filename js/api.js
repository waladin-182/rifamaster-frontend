// Cambia esta URL por la de tu backend cuando lo despliegues en Render.
const API_BASE_URL = window.RIFAMASTER_API_BASE || "https://rifamaster-backend.onrender.com/api";

const Auth = {
  getToken() { return localStorage.getItem("rm_token"); },
  setSession(token, user) {
    localStorage.setItem("rm_token", token);
    localStorage.setItem("rm_user", JSON.stringify(user));
  },
  getUser() {
    const raw = localStorage.getItem("rm_user");
    return raw ? JSON.parse(raw) : null;
  },
  clear() {
    localStorage.removeItem("rm_token");
    localStorage.removeItem("rm_user");
  },
  requireAuthOrRedirect() {
    if (!this.getToken()) window.location.href = "login.html";
  },
};

async function api(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = Auth.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch (_) { /* respuesta sin cuerpo */ }

  if (!res.ok) {
    const message = (data && data.error) || `Error ${res.status}`;
    throw new Error(message);
  }
  return data;
}

const MAX_PROOF_BYTES = 5 * 1024 * 1024; // 5MB

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      return reject(new Error("El comprobante debe ser una imagen (PNG, JPG o WEBP)."));
    }
    if (file.size > MAX_PROOF_BYTES) {
      return reject(new Error("La imagen del comprobante no debe superar 5MB."));
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

function formatMoney(value, currency = "COP") {
  try {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  } catch (_) {
    return `${value} ${currency}`;
  }
}

function showError(container, message) {
  container.innerHTML = `<div class="error-box">${message}</div>`;
}

function showSuccess(container, message) {
  container.innerHTML = `<div class="success-box">${message}</div>`;
}
