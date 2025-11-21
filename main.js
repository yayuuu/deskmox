const { app, dialog, BrowserWindow, Menu, ipcMain } = require('electron');
const keytar = require('keytar');
const fs = require('fs');
const path = require('path');

const injectCode = fs.readFileSync(path.join(__dirname, "inject.js"), "utf8");

const openedTabs = [];

function removeTab(id) {
	for(i=0; i<openedTabs.length; i++) {
		if(openedTabs[i].id === id) {
			openedTabs.splice(i, 1);
			break;
		}
	}
}

function getTab(id) {
	for(i=0; i<openedTabs.length; i++) {
		if(openedTabs[i].id === id) {
			return openedTabs[i];
		}
	}
	return null;
}

function updateTab(id, info = {}) {
	for(i=0; i<openedTabs.length; i++) {
		if(openedTabs[i].id === id) {
			for (const key in info) {
				openedTabs[i][key] = info[key];
			}
			break;
		}
	}
}

// app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
	let allow = false;
	console.log("Błąd certyfikatu dla " + url + ": " + error);
	openedTabs.forEach((tab) => {
		console.log(JSON.stringify(tab));
		if(url.startsWith("https://"+tab.id) || url.startsWith("wss://"+tab.id)) {
			if(tab.ssl === false) {
				allow = true;
				event.preventDefault();
				callback(true);
				return;
			} else {
				updateTab(tab.id, {sslError: true});
			}
		}
	});
	if(!allow){
		callback(false);
	}
});

Menu.setApplicationMenu(null);

function openMenu() {
	const win = new BrowserWindow({
		width: 1200,
		height: 800,
		resizable: true,
		frame: true,         // dekoracje okna
		fullscreen: false,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: false
		}
	});

	win.loadFile(path.join(__dirname, 'dist/index.html'));

	return win;
}

async function openProxmox(address) {
	const tab = getTab(address);
	console.log("Otwieranie Proxmoxa pod adresem " + address);
	const win = new BrowserWindow({
		width: 1200,
		height: 800,
		resizable: true,
		frame: true,         // dekoracje okna
		fullscreen: false,
		show: false,        // ukryte do momentu zalogowania
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true,
			contextIsolation: true,   // ← WAŻNE
			sandbox: false,
		}
	});

	win.webContents.on("will-prevent-unload", (event) => {
		event.preventDefault();
	});

	//win.webContents.openDevTools({ mode: "detach" });

	win.webContents.setWindowOpenHandler(({ url }) => {
		console.log("Intercepted xterm open:", url);

		const child = new BrowserWindow({
			width: 1200,
			height: 800,
			resizable: true,
			frame: true,         // dekoracje okna
			fullscreen: false,
			webPreferences: {
				contextIsolation: true,
				nodeIntegration: true,
				sandbox: false,
			},
		});

		child.webContents.on("will-prevent-unload", (event) => {
			event.preventDefault();
		});

		win.on("closed", () => {
			child.destroy();
		});

		child.loadURL(url);
	});
	
	win.loadURL('https://' + address + ':8006/'); // ← podmień adres
	win.webContents.once("did-finish-load", async () => {
		await win.webContents.executeJavaScript(`window.__PROXMOX_ID__ = "` + address + `";`);
		await win.webContents.executeJavaScript(injectCode);
	});
	
	// co 200ms sprawdzamy, czy skrypty w przeglądarce skończyły, mechanizm timeoutu
	win.webContents.setMaxListeners(55);
	retry = 50;
	while(retry > 0) {
		if(tab.sslError) {
			dialog.showErrorBox("Błąd certyfikatu SSL", "Wystąpił błąd certyfikatu SSL podczas łączenia z serwerem " + address + ".\nJeśli łączysz się z lokalnym serwerem Proxmox VE, spróbuj wyłączyć wymuszanie SSL w ustawieniach serwera w aplikacji.");
			win.destroy();
			removeTab(address);
			return null;
		}

		readyPromise = Promise.race([
			win.webContents.executeJavaScript('window.__READY_TO_SHOW__'),
			new Promise((resolve) => setTimeout(() => resolve(null), 200) )
		]);
		timerPromise = new Promise(resolve => setTimeout(resolve, 200));

		const [ready, timer] = await Promise.all([readyPromise, timerPromise]);

		if (typeof ready === "boolean") {
			if(ready) {
				win.show();
				return win;
			} else {
				win.destroy();
				removeTab(address);
				return null;
			}
		}
		retry -= 1;
	}

	if(retry == 0) {
		console.log("Nie udało się zalogować automatycznie.");
		win.destroy();
		removeTab(address);
		return null;
	}
}

app.whenReady().then(() => {
	menu = openMenu();

	ipcMain.handle("connect", async (event, address, ssl) => {
		console.log("Łączenie z " + address);
		openedTabs.push({id: address, window: null, ssl: ssl});
		let win = await openProxmox(address);
		if (win != null) {
			updateTab(address, {window: win});
			menu.hide();
			win.on("closed", () => {
				removeTab(address);
				win.destroy();
				menu.show(); // tymczasowo do momentu aż zrobię zakładki, zawsze pokazuj główne okno aplikacji
			});
			return true;
		}
		return false;
	});

	ipcMain.handle("close-proxmox-window", async (event, id) => {
		const tab = getTab(id);
		if(tab && tab.window) {
			menu.show();	// tymczasowo do momentu aż zrobię zakładki, zawsze pokazuj główne okno aplikacji
			tab.window.close();
			tab.window.destroy();
			removeTab(id);
		}
		return;
	});
});
