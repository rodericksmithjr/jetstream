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
  { id: "dev1", name: "Fridge A", status: "online", location: "Lab 1" },
  { id: "dev2", name: "Freezer B", status: "offline", location: "Lab 2" },
];

let inventory = [
  {
    deviceId: "dev1",
    items: [
      { id: "item1", name: "Vial A" },
      { id: "item2", name: "Vial B" }
    ]
  },
  {
    deviceId: "dev2",
    items: [
      { id: "item3", name: "Box C" }
    ]
  }
];

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/v3/devices", (req, res) => {
  res.json({ data: devices, count: devices.length });
});

app.get("/v3/inventory", (req, res) => {
  const { deviceId } = req.query;
  const inv = inventory.find((i) => i.deviceId === deviceId);
  res.json(inv || { deviceId, items: [] });
});

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
