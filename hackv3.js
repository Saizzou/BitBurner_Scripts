/** @param {NS} ns */
export async function main(ns) {
    var yer = ns.args[0] || ns.getHostname();

    // Check if we have root access, if not, try to gain it
    if (!ns.hasRootAccess(yer)) {
        var portsRequired = ns.getServerNumPortsRequired(yer);

        if (portsRequired === 0) {
            ns.nuke(yer);
        } else if (portsRequired === 1 && ns.fileExists("BruteSSH.exe", "home")) {
            ns.brutessh(yer);
            ns.nuke(yer);
        } else if (portsRequired === 2 && ns.fileExists("BruteSSH.exe", "home") && ns.fileExists("FTPCrack.exe", "home")) {
            ns.brutessh(yer);
            ns.ftpcrack(yer);
            ns.nuke(yer);
        } else if (portsRequired === 3 && ns.fileExists("BruteSSH.exe", "home") && ns.fileExists("FTPCrack.exe", "home") && ns.fileExists("relaySMTP.exe", "home")) {
            ns.brutessh(yer);
            ns.ftpcrack(yer);
            ns.relaysmtp(yer);
            ns.nuke(yer);
        } else if (portsRequired === 4 && ns.fileExists("BruteSSH.exe", "home") && ns.fileExists("FTPCrack.exe", "home") && ns.fileExists("relaySMTP.exe", "home") && ns.fileExists("HTTPWorm.exe", "home")) {
            ns.brutessh(yer);
            ns.ftpcrack(yer);
            ns.relaysmtp(yer);
            ns.httpworm(yer);
            ns.nuke(yer);
        } else if (portsRequired === 5 && ns.fileExists("BruteSSH.exe", "home") && ns.fileExists("FTPCrack.exe", "home") && ns.fileExists("relaySMTP.exe", "home") && ns.fileExists("HTTPWorm.exe", "home") && ns.fileExists("SQLInject.exe", "home")) {
            ns.brutessh(yer);
            ns.ftpcrack(yer);
            ns.relaysmtp(yer);
            ns.httpworm(yer);
            ns.sqlinject(yer);
            ns.nuke(yer);
        } else {
            ns.tprint(`ERROR: Not enough port hacking tools for ${yer}`);
            return;
        }
    }

    // Main hacking loop
    while (true) {
        var maxpara = ns.getServerMaxMoney(yer);
        var para = ns.getServerMoneyAvailable(yer);

        if (para >= maxpara * 0.8) {
            if ((await ns.hack(yer)) > 0) {
                await ns.grow(yer);
            } else {
                await ns.weaken(yer);
            }
        } else {
            await ns.grow(yer);
            await ns.weaken(yer);
        }
    }
}
