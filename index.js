const express = require('express');
const si = require('systeminformation');
const Docker = require('dockerode');
const cors = require('cors');

const app = express();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const PORT = 4000;

app.use(cors());

app.get('/api/stats', async (req, res) => {
  try {
    const [cpu, mem, disk, time, temp] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.time(),
      si.cpuTemperature()
    ]);

    const containers = await docker.listContainers({ all: true });
    const containerStatus = containers.map(c => ({
      name: c.Names[0].replace('/', ''),
      image: c.Image,
      state: c.State,
      status: c.Status
    }));

    res.json({
      cpu: {
        loadPercent: cpu.currentLoad.toFixed(1)
      },
      temperature: {
        celsius: temp.main.toFixed(1)
      },
      memory: {
        totalGB: (mem.total / 1e9).toFixed(2),
        usedGB: (mem.used / 1e9).toFixed(2),
        usedPercent: ((mem.used / mem.total) * 100).toFixed(1)
      },
      disk: disk.map(d => ({
        mount: d.mount,
        totalGB: (d.size / 1e9).toFixed(2),
        usedGB: (d.used / 1e9).toFixed(2),
        usedPercent: d.use
      })),
      uptime: {
        seconds: time.uptime
      },
      containers: containerStatus
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Stats API running on port ${PORT}`);
});
