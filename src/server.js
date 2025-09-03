import express from "express";
import { nanoid } from "nanoid";

const app = express();
app.use(express.json());

// ✅ Toggle auth with environment variable
const REQUIRE_AUTH = process.env.REQUIRE_AUTH === "true";

// Middleware for authentication
function checkAuth(req, res, next) {
  if (!REQUIRE_AUTH) {
    return next(); // skip in dev mode
  }

  const key = req.headers["accesskey"];
  if (key !== "demo-access-key") {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Provide a valid AccessKey header.",
    });
  }
  next();
}

// Apply auth only to API routes
app.use("/v3", checkAuth);
app.use("/health", checkAuth);

// Example in-memory data
let devices = [
  {
    id: "DEV-1001",
    name: "Fridge A",
    type: "REFRIGERATOR",
    status: "ONLINE",
    location: "Lab 1",
    firmwareVersion: "3.5.0",
    lastSeenUtc: "2025-09-03T14:00:00Z",
    batteryPercent: 95
  },
  {
    id: "DEV-1002",
    name: "Freezer B",
    type: "FREEZER",
    status: "OFFLINE",
    location: "Lab 2",
    firmwareVersion: "3.4.2",
    lastSeenUtc: "2025-09-03T13:50:00Z",
    batteryPercent: 80
  },
  {
    id: "DEV-1003",
    name: "RFID Cabinet C",
    type: "RFID_CABINET",
    status: "ONLINE",
    location: "Lab 3",
    firmwareVersion: "3.5.0",
    lastSeenUtc: "2025-09-03T14:10:00Z",
    batteryPercent: 88
  },
  {
    id: "DEV-1004",
    name: "Fridge D",
    type: "REFRIGERATOR",
    status: "ONLINE",
    location: "Lab 4",
    firmwareVersion: "3.5.1",
    lastSeenUtc: "2025-09-03T14:12:00Z",
    batteryPercent: 92
  }
];

let inventory = [
  {
    deviceId: "DEV-1001",
    items: [
      { id: "ITEM-2001", sku: "VIAL-001", tagEpc: "E280689400001", description: "Sample Vial A", quantity: 10, uom: "EA", expiresOn: "2026-01-31", lastSeenUtc: "2025-09-03T14:01:00Z" },
      { id: "ITEM-2002", sku: "VIAL-002", tagEpc: "E280689400002", description: "Sample Vial B", quantity: 5, uom: "EA", expiresOn: "2025-12-31", lastSeenUtc: "2025-09-03T14:02:00Z" }
    ]
  },
  {
    deviceId: "DEV-1002",
    items: [
      { id: "ITEM-2003", sku: "BOX-001", tagEpc: "E280689400003", description: "Frozen Box C", quantity: 2, uom: "EA", expiresOn: "2026-03-15", lastSeenUtc: "2025-09-03T13:52:00Z" }
    ]
  },
  {
    deviceId: "DEV-1003",
    items: [
      { id: "ITEM-2004", sku: "VIAL-003", tagEpc: "E280689400004", description: "Sample Vial C", quantity: 8, uom: "EA", expiresOn: "2026-02-28", lastSeenUtc: "2025-09-03T14:11:00Z" }
    ]
  },
  {
    deviceId: "DEV-1004",
    items: [
      { id: "ITEM-2005", sku: "VIAL-004", tagEpc: "E280689400005", description: "Sample Vial D", quantity: 12, uom: "EA", expiresOn: "2026-05-15", lastSeenUtc: "2025-09-03T14:13:00Z" }
    ]
  }
];

let events = [
  {
    id: "EVT-3001",
    deviceId: "DEV-1001",
    type: "DOOR_OPENED",
    occurredUtc: "2025-09-03T14:05:00Z",
    payload: { openedBy: "api", commandId: "CMD-4001" }
  },
  {
    id: "EVT-3002",
    deviceId: "DEV-1003",
    type: "INVENTORY_SNAPSHOT",
    occurredUtc: "2025-09-03T14:12:00Z",
    payload: { snapshotBy: "api", commandId: "CMD-4002" }
  },
  {
    id: "EVT-3003",
    deviceId: "DEV-1002",
    type: "DOOR_CLOSED",
    occurredUtc: "2025-09-03T13:55:00Z",
    payload: { closedBy: "user" }
  }
];

let policies = [
  {
    id: "POL-1",
    name: "Default Policy",
    rules: {
      doorOpenRequiresKey: false,
      maxItemsPerDevice: 50
    }
  },
  {
    id: "POL-2",
    name: "Restricted Policy",
    rules: {
      doorOpenRequiresKey: true,
      maxItemsPerDevice: 20
    }
  }
];

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/v3/devices", (req, res) => res.json({ data: devices, count: devices.length }));

app.get("/v3/inventory", (req, res) => {
  const { deviceId } = req.query;
  const inv = inventory.find(i => i.deviceId === deviceId);
  res.json(inv || { deviceId, items: [] });
});

app.get("/v3/events", (req, res) => res.json(events));
app.get("/v3/policies", (req, res) => res.json(policies));

app.post("/v3/commands/:deviceId/door/open", (req, res) => {
  const { deviceId } = req.params;
  res.json({
    id: nanoid(),
    type: "DoorOpen",
    deviceId,
    status: "accepted",
    timestamp: new Date().toISOString(),
  });
});

app.post("/v3/commands/:deviceId/inventory/snapshot", (req, res) => {
  const { deviceId } = req.params;
  res.json({
    id: nanoid(),
    type: "InventorySnapshot",
    deviceId,
    status: "accepted",
    timestamp: new Date().toISOString(),
  });
});

// Serve static frontend (public/index.html, etc.)
app.use(express.static("public"));

// ✅ Correct Render port binding
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `Mock Jetstream API running on port ${PORT} (auth ${
      REQUIRE_AUTH ? "enabled" : "disabled"
    })`
  );
});
