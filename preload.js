const { contextBridge, ipcRenderer } = require('electron');
const keytar = require('keytar');
const fs = require('fs');
const path = require('path');

const configDir = process.env.XDG_CONFIG_HOME || `${process.env.HOME}/.config`;

contextBridge.exposeInMainWorld('appAPI', {
	getCredentials: async (id) => {
		const accounts = await keytar.findCredentials("deskmox-"+ id.replace(/\./g, "-"));
		return accounts[0];
	},

	saveCredentials: async (id, account, password, authType) => {
		await keytar.setPassword(
			"deskmox-"+ id.replace(/\./g, "-"),
			account + "@" + authType,
			password
		);
	},

	connect: async (addr, ssl) => {
		return ipcRenderer.invoke('connect', addr, ssl);
	},

	closeProxmoxWindow: (id) => {
		return ipcRenderer.invoke('close-proxmox-window', id);
	},

	getServerList: () => {
		const filePath = `${configDir}/deskmox/servers.json`;
		
		let servers = [];
		if (fs.existsSync(filePath)) {
			const data = fs.readFileSync(filePath, 'utf-8');
			servers = JSON.parse(data);
		}

		const validServers = [];

		if(typeof servers == 'object' && servers !== null && Array.isArray(servers)) {
			servers.forEach((srv, i) => {
				const server={};
				if(srv.name && srv.address) {
					server.name = srv.name;
					server.address = srv.address;
					server.ssl = true;
					if(srv.ssl !== undefined) {
						server.ssl = (Boolean)(srv.ssl);
					}
					validServers.push(server);
				}
			});
		}

		return validServers;
	},

	async saveServer(oldName, srv) {
		const filePath = `${configDir}/deskmox/servers.json`;
		const servers = this.getServerList();

		if(oldName == null) {
			const newServer = {
				name: srv.name,
				address: srv.address,
				ssl: srv.ssl || false
			}
			servers.push(newServer);
			
			if(srv.password != null && srv.password != undefined && srv.password != "") {
				await this.saveCredentials(srv.address, srv.username, srv.password, srv.authType || "pam");
			}
		} else {
			for(i=0; i <servers.length; i++) {
				if(servers[i].name === oldName) {
					servers[i].name = srv.name;
					servers[i].address = srv.address;
					servers[i].ssl = srv.ssl;

					if(srv.password != null && srv.password != undefined && srv.password != "") {
						await this.saveCredentials(srv.address, srv.username, srv.password, srv.authType || "pam");
					}
					break;
				}
			}
		}
		if (!fs.existsSync(path.dirname(filePath))) {
			fs.mkdirSync(path.dirname(filePath), { recursive: true });
		}
		fs.writeFileSync(filePath, JSON.stringify(servers, null, 2), 'utf-8');
	}
	
});
