/** @param {NS} ns **/
const excludedServers = ["darkweb", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", 
                         "s11", "s12", "s13", "s14", "s15", "s16", "s17", "s18", "s19", "s20", 
                         "s21", "s22", "s23", "s24", "s25","home"];

const HACK_SCRIPT = "hackv3.js";
const HACK_SCRIPT_RAM = 2.80;
const MAX_BUYABLE_RAM = 1048576;
const SERVER_PREFIX = "s";
const MAX_SERVERS = 25;
const START_RAM = 8;

export async function main(ns) {
  // Display help text if "--help" or "-h" is passed as the first argument
  if (ns.args.length > 0 && (ns.args[0] === "--help" || ns.args[0] === "-h")) {
    ns.tprint(`
Usage: run automate.js <loop> <refresh time> | run atuomate.js 
  - loop: How many times automate.js should run. Use '0' for endless mode.
  - refresh time: Wait time in minutes after each loop.

  * Endless mode is automatically used if no Arguments are given!
  * Refresh Time is automatically 1 Minute if just a loop argument is given!

Script made by: >>> Saizzou <<<
GitHub: github.com/saizzou
`);
    return;
  }

  // Default to endless mode if no arguments are provided
  let loops = ns.args[0] || 0; // Default to 0 (endless mode) if no loop argument is provided
  let refreshTimeMinutes = ns.args[1] || 1; // Default to 1 minute if no refresh time is provided
  if (ns.args[0] === "--home" || ns.args[0] === "-home"){
    loops = ns.args[1] || 0;
    refreshTimeMinutes = ns.args[2] || 1;
  } else if (ns.args[1] === "--home" || ns.args[1] === "-home"){
    loops = ns.args[0] || 0;
    refreshTimeMinutes = ns.args[3] || 1;
  } else if (ns.args[2] === "--home" || ns.args[1] === "-home"){
    loops = ns.args[0] || 0;
    refreshTimeMinutes = ns.args[1] || 1;
  }
  const refreshTimeMillis = refreshTimeMinutes * 60 * 1000;

  if (loops == 0) {
    // Endless mode
    ns.tprint("Running in endless mode with a refresh time of " + refreshTimeMinutes + " minutes.");
    while (true) {
      await startLoop(ns);
      await ns.sleep(refreshTimeMillis);
    }
  } else {
    // Finite loop mode
    ns.tprint("Running in finite mode with " + loops + " loops and a refresh time of " + refreshTimeMinutes + " minutes.");
    for (let l = 0; l < loops; l++) {
      await startLoop(ns);
      await ns.sleep(refreshTimeMillis);
    }
  }
  ns.tprint("Automate.js Ended. Out of Loop!");
}

async function startLoop(ns) {
  const servers = JSON.parse(ns.read("list.txt"));
  const hackableServers = [];

  for (const server of servers) {
    const { Name: serverName, Skill: requiredSkill, Ports: requiredPorts } = server;

    if (requiredSkill < ns.getHackingLevel() && !excludedServers.includes(serverName)) {
      ns.tprint(`
Target is HACKABLE!
Name: ${serverName}
Skill: ${requiredSkill}
Ports: ${requiredPorts}
--------------------
`);

      if (!ns.hasRootAccess(serverName)) {
        try {
          getRootAccess(ns, serverName);
        } catch (e) {
          ns.tprint(`Failed to get root access on ${serverName}: ${e}`);
          continue;
        }
      }

      if (ns.hasRootAccess(serverName)) {
        sendHackScript(ns, serverName);
        const threads = getAvailableThreads(ns, serverName);

        if (threads >= 1) {
          startHack(ns, serverName, threads, serverName);
          ns.tprint(`\n+++++++++++++++\nServer ${serverName} started hacking ${serverName} with ${threads} threads!`);
        }

        if (!hackableServers.includes(serverName)) {
          hackableServers.push(serverName);
        }
      }
    }
  }

  ns.tprint(`Your Hackable Server List: ${hackableServers}`);

  // Manage purchased servers
  if (!ns.serverExists("s25")) {
    for (let i = 1; i <= MAX_SERVERS; i++) {
      const serverName = SERVER_PREFIX + i;
      const randomServer = hackableServers[Math.floor(Math.random() * hackableServers.length)];

      if (!ns.serverExists(serverName)) {
        const cost = ns.getPurchasedServerCost(START_RAM);

        if (ns.getServerMoneyAvailable("home") >= cost) {
          ns.purchaseServer(serverName, START_RAM);
          sendHackScript(ns, serverName);
          startHack(ns, serverName, 2, randomServer);
          ns.tprint(`Purchased server: ${serverName} with ${START_RAM}GB RAM`);
        } else {
          ns.tprint(`Not enough money to purchase ${serverName}. Needed: ${cost}`);
        }
      }
    }
  } else {
    for (let i = 1; i <= MAX_SERVERS; i++) {
      const serverName = SERVER_PREFIX + i;
      const randomServer = hackableServers[Math.floor(Math.random() * hackableServers.length)];
      const currentRam = ns.getServerMaxRam(serverName);

      if (currentRam < MAX_BUYABLE_RAM) {
        const upgradeCost = ns.getPurchasedServerCost(currentRam * 2) * 25;

        if (upgradeCost < ns.getServerMoneyAvailable("home")) {
          ns.upgradePurchasedServer(serverName, currentRam * 2);
          const threads = getAvailableThreads(ns, serverName);
          startHack(ns, serverName, threads, randomServer);
          ns.tprint(`Server: ${serverName} upgraded and started hacking: ${randomServer}`);
        }
      }

      const threads = getAvailableThreads(ns, serverName);
      if (threads > 1) {
        startHack(ns, serverName, threads, randomServer);
        ns.tprint(`Server: ${serverName} started hacking: ${randomServer}`);
        await ns.sleep(1000);
      }
    }
  }

  // Use home server for hacking
  const homeThreads = getAvailableThreads(ns, "home");
  ns.tprint(`Your Home Server can use ${homeThreads} threads to hack!`);

  for (let h = 0; h < 4; h++) {
    if (ns.args.length > 0 && (ns.args[h] === "--home" || ns.args[h] === "-home")) {
      ns.tprint(`Your Home Server will use hackv3.js Randomly with max 300 Threads`); // This could be changed later.

      if (homeThreads > 0) {
        const maxThreadsPerRun = 300; // Maximum threads per hackv3.js instance
        let remainingThreads = homeThreads;

        while (remainingThreads > 0) {
          const randomServer = hackableServers[Math.floor(Math.random() * hackableServers.length)];
          const threadsToUse = Math.min(remainingThreads, maxThreadsPerRun);
          startHack(ns, "home", threadsToUse, randomServer);
          remainingThreads -= threadsToUse;
          ns.tprint("Home Hack Runned!")
          await ns.sleep(1000);

        }
      }
    }
  }
}

function getAvailableThreads(ns, serverName) {
  const maxRam = ns.getServerMaxRam(serverName);
  const usedRam = ns.getServerUsedRam(serverName);
  const availableRam = maxRam - usedRam;
  return Math.floor(availableRam / HACK_SCRIPT_RAM);
}

function sendHackScript(ns, server) {
  ns.scp(HACK_SCRIPT, server, "home");
}

function startHack(ns, serverName, threads, target) {
  ns.exec(HACK_SCRIPT, serverName, threads, target);
}

function getRootAccess(ns, serverName) {
  if (!ns.hasRootAccess(serverName)) {
    const portsRequired = ns.getServerNumPortsRequired(serverName);
    const portOpeners = [
      { file: "BruteSSH.exe", func: ns.brutessh },
      { file: "FTPCrack.exe", func: ns.ftpcrack },
      { file: "relaySMTP.exe", func: ns.relaysmtp },
      { file: "HTTPWorm.exe", func: ns.httpworm },
      { file: "SQLInject.exe", func: ns.sqlinject },
    ];

    for (let i = 0; i < portsRequired; i++) {
      if (ns.fileExists(portOpeners[i].file, "home")) {
        portOpeners[i].func(serverName);
      } else {
        return; // Not enough port-opening programs
      }
    }

    ns.nuke(serverName);
  }
}
