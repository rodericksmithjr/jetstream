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
});
