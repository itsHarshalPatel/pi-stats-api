# Pi Stats API

A small Express API that exposes live system stats and Docker container
status from a Raspberry Pi 5 running as a home server.

## What it does
- Reads CPU load, memory usage, disk usage, and uptime via `systeminformation`
- Reads live Docker container status via the Docker socket
- Serves it all as JSON at `/api/stats`

## Architecture
This API runs as a Docker container on the Pi, alongside Nextcloud, Jellyfin,
and Portainer. It's exposed to the public internet via **Tailscale Funnel**
(no router port-forwarding needed), so a separately-deployed frontend
(see [pi-dashboard](https://github.com/itsHarshalPatel/pi-dashboard)) can
fetch live data from it.

## Stack
Node.js, Express, systeminformation, dockerode
