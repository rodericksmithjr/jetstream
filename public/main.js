import { api } from "./api.js";

async function loadDevices() {
  const list = document.getElementById("device-list");
  list.innerHTML = "";

  try {
    const result = await api.getDevices();
    result.data.forEach((d) => {
      const li = document.createElement("li");
      li.textContent = `${d.name} (${d.status}) – ${d.location}`;
      list.appendChild(li);
    });
  } catch (err) {
    list.innerHTML = `<li>Error: ${err.message}</li>`;
  }
}

loadDevices();
