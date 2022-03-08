import udp from 'dgram';
import { networkInterfaces } from 'os';

function getLocalIp(ipToMatch: string): string {
	const nets = networkInterfaces();
	const ips: string[] = [];
	const match = ipToMatch.split('.').splice(0, 3).join('.');

	for (const name of Object.keys(nets)) {
		for (const net of nets[name]) {
			// Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
			if (net.family === 'IPv4' && !net.internal) {
				if (net.address.startsWith(match)) {
					return net.address;
				}
				ips.push(net.address);
			}
		}
	}

	return ips.at(0);
}

const server = udp.createSocket('udp4');
// process.env.UDP_PORT
// Get the message
server.on('message', (msg, info) => {
	// Send a response back with this servers ip
	server.send(
		process.env.MQTT_HOST ?? getLocalIp(info.address),
		info.port,
		info.address,
		(err, bytes) => {
			if (err) {
				console.error(
					`Error sending server info to client:${info.address}`
				);
			} else {
				console.log(
					`Server info sent to device with ip:${info.address}`
				);
			}
		}
	);
});

server.on('listening', () => {
	console.log(
		`Udp server started listening on port:${server.address().port}`
	);
});

server.bind(parseInt(process.env.UDP_PORT || '29874'));

export default server;