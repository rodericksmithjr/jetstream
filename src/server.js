import express from 'express';
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
payload: { snapshotId: snapId, count: inventory.filter(i => i.deviceId === deviceId).length }
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
