import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import { customAlphabet } from 'nanoid';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ====== Config ======
const PORT = process.env.PORT || 3000;
const REQUIRED_ACCESS_KEY = process.env.ACCESS_KEY || 'demo-access-key';
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);

// ====== Fake in-memory data ======
const devices = [
  {
    id: 'DEV-1001',
    name: 'RFID Cabinet A',
    type: 'RFID_CABINET',
    status: 'ONLINE',
    lastSeenUtc: new Date().toISOString(),
    location: 'Lab 1',
    firmwareVersion: '3.2.1'
  },
  {
    id: 'DEV-1002',
    name: 'RFID Freezer B',
    type: 'RFID_FREEZER',
    status: 'OFFLINE',
    lastSeenUtc: new Date(Date.now() - 3600_000).toISOString(),
    location: 'Pharmacy',
    firmwareVersion: '2.9.0'
  }
];

const inventory = [
  {
    id: 'ITEM-2001',
    deviceId: 'DEV-1001',
    sku: 'KIT-123',
    tagEpc: 'E28068940000400ABC001234',
    description: 'Sample Kit A',
    quantity: 1,
    uom: 'EA',
    expiresOn: '2025-12-31',
    lastSeenUtc: new Date().toISOString()
  },
  {
    id: 'ITEM-2002',
    deviceId: 'DEV-1001',
    sku: 'PATCH-777',
    tagEpc: 'E28068940000400ABC007777',
    description: 'RFID Patch',
    quantity: 5,
    uom: 'EA',
    expiresOn: null,
    lastSeenUtc: new Date().toISOString()
  }
];

const events = [
  {
    id: 'EVT-' + nanoid(),
    deviceId: 'DEV-1001',
    type: 'INVENTORY_SNAPSHOT',
    occurredUtc: new Date().toISOString(),
    payload: { count: 2 }
  }
];

// ====== Simple auth middleware (mimics Jetstream header) ======
app.use((req, res, next) => {
//  const key = req.header('AccessKey');
//  if (!key || key !== REQUIRED_ACCESS_KEY) {
//    return res.status(401).json({
//      error: 'Unauthorized',
//      message: 'Provide a valid AccessKey header.'
    });
  }
  next();
});

// ====== Health ======
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ====== Devices ======
app.get('/v3/devices', (req, res) => {
  const { status } = req.query;
  const data = status ? devices.filter(d => d.status === status) : devices;
  res.json({ data, count: data.length });
});

app.get('/v3/devices/:id', (req, res) => {
  const d = devices.find(x => x.id === req.params.id);
  if (!d) return res.status(404).json({ error: 'NotFound' });
  res.json(d);
});

// ====== Inventory ======
app.get('/v3/inventory', (req, res) => {
  const { deviceId } = req.query;
  const data = deviceId ? inventory.filter(i => i.deviceId === deviceId) : inventory;
  res.json({ data, count: data.length });
});

// ====== Events ======
app.get('/v3/events', (req, res) => {
  const { deviceId, type } = req.query;
  let data = events.slice().sort((a, b) => b.occurredUtc.localeCompare(a.occurredUtc));
  if (deviceId) data = data.filter(e => e.deviceId === deviceId);
  if (type) data = data.filter(e => e.type === type);
  res.json({ data, count: data.length });
});

app.post('/v3/events/acknowledge', (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: 'BadRequest', message: 'ids must be an array' });
  }
  // no-op in mock
  res.json({ acknowledged: ids });
});

// ====== Commands (mocked no-ops) ======
app.post('/v3/commands/:deviceId/door/open', (req, res) => {
  const { deviceId } = req.params;
  const dev = devices.find(d => d.id === deviceId);
  if (!dev) return res.status(404).json({ error: 'NotFound' });
  const cmdId = 'CMD-' + nanoid();
  events.unshift({
    id: 'EVT-' + nanoid(),
    deviceId,
    type: 'DOOR_OPENED',
    occurredUtc: new Date().toISOString(),
    payload: { by: 'api', cmdId }
  });
  res.json({ id: cmdId, status: 'ACCEPTED' });
});

app.post('/v3/commands/:deviceId/inventory/snapshot', (req, res) => {
  const { deviceId } = req.params;
  const dev = devices.find(d => d.id === deviceId);
  if (!dev) return res.status(404).json({ error: 'NotFound' });
  const snapId = 'SNAP-' + nanoid();
  events.unshift({
    id: 'EVT-' + nanoid(),
    deviceId,
    type: 'INVENTORY_SNAPSHOT',
    occurredUtc: new Date().toISOString(),
    payload: {
      snapshotId: snapId,
      count: inventory.filter(i => i.deviceId === deviceId).length
    }
  });
  res.json({ id: snapId, status: 'ACCEPTED' });
});

// ====== Policies (minimal) ======
const policies = [
  { id: 'POL-1', name: 'Default Policy', rules: { doorOpenRequiresKey: false } }
];

app.get('/v3/policies', (req, res) => {
  res.json({ data: policies, count: policies.length });
});

// ====== 404 ======
app.use((req, res) => {
  res.status(404).json({ error: 'NotFound', path: req.path });
});

app.listen(PORT, () => {
  console.log(`Mock Jetstream API listening on :${PORT}`);
});
