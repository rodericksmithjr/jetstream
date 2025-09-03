const API_BASE = "";
// empty means "same server as frontend"

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  getDevices: () => apiFetch("/v3/devices"),
  openDoor: (deviceId) =>
    apiFetch(`/v3/commands/${deviceId}/door/open`, { method: "POST" }),
};

