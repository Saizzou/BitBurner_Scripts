/** @param {NS} ns **/
const purchasedPrefix = "purchased";
const profileData = "list.txt";
const excluded = ["darkweb","s1","s2","s3","s4","s5","s6","s7","s8","s9","s10","s11","s12",
"s13","s14","s15","s16","s17","s18","s19","s20","s21","s22","s23","s24","s25"];

class profile {
	constructor(host, root, skill, ports, scripts) {
		this.Name = host;
		this.Scanned = false;
		this.Root = root;
		this.Skill = skill
		this.Ports = ports;
		this.Connected = [];
		this.Scripts = scripts;
	}
}

const getProfile = (known, host) => known.filter(p => p.Name === host); 

const getData = (ns, host, known) => {
	var connections = ns.scan(host).filter(h => !h.startsWith(purchasedPrefix) && !excluded.includes(h));
	connections.forEach(c => {
		if (getProfile(known, c).length !== 0) return;
		let data = new profile(
			c,
			ns.hasRootAccess(c),
			ns.getServerRequiredHackingLevel(c),
			ns.getServerNumPortsRequired(c),
			ns.getServerMaxRam(c) > 0);
		known = [...known, data];
	});
	getProfile(known, host)[0].Scanned = true;
	getProfile(known, host)[0].Connected = connections;
	return known;
}

export async function main(ns) {
	while (true) {
		let host = "home";
		let known = [new profile(host, true, 0, 0)];

		let complete = false;
		do {
			known = getData(ns, host, known);
			let next = known.filter(s => !s.Scanned);
			if (next.length === 0) complete = true
			else host = next[0].Name;
		} while (!complete)
		
		await ns.write(profileData, JSON.stringify(known), "w");

		await ns.sleep(3000);
	}
}
