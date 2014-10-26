#!/usr/bin/env node

var blessed = require("blessed");
var async = require("async");

var docker = require("./docker");
docker.init("http://127.0.0.1:4500");
var UPDATE_INTERVAL = 1000 / 60; // milliseconds


var scr = blessed.screen();
var list = blessed.list({
	left: 0,
	top: 0,
	width: "100%",
	height: "100%"
});

scr.append(list);

scr.key(['escape', 'q', 'C-c'], function(ch, key) {
	return process.exit(0);
});

var nodes = [];

function addNode(node) {
	table.append(node);
}

function clearNodes() {
	for (var i in nodes) {
		var n = nodes[i];
		table.remove(n);
	}
	nodes = [];
}

function addContainerDisplay(id, cpu, memory, diskRead, diskWrite) {
	var args = Array.prototype.slice.call(arguments);
	var str = "";
	var w = Math.floor(scr.width / args.length);
	for (var i in args) {
		var s = "" + args[i];
		var remaining = w - s.length;
		s += (new Array(remaining)).join(" ");
		str += s;
	}
	list.addItem(str);
}

function getContainersAndResources(cb) {
	docker.getContainers(function(err, containers) {
		if (!err) {
			containers = containers.sort(function(a, b) {
				return a.Id.localeCompare(b.Id);
			});
			async.map(containers, function(container, callback) {
				var id = container.Id;
				async.parallel({
					memory: function(callback) {
						docker.getMemory(id, callback);
					},
					cpu: function(callback) {
						docker.getCpu(id, callback);
					},
					disk: function(callback) {
						docker.getDisk(id, callback);
					},
					top: function(callback) {
						docker.getTop(id, callback);
					}
				}, function(err, results) {
					if (results) {
						results.container = container;
					}
					callback(err, results);
				});
			}, function(err, results) {
				cb(err, results);
			});
		} else {
			cb(err);
		}
	});
}

function timeConverter(ns) {
	// ns: Nano-seconds
	var units = ["ns", "µs", "ms", "s", "m", "h"];
	var i = 0;
	var t = ns;
	while ((i < units.length) && t > 1000) {
		t = t / 1000;
		i++;
	}
	return t.toFixed(2) + " " + units[i];
}

function dataConverter(ns) {
	// ns: Nano-seconds
	var units = ["B", "KB", "MB", "GB", "TB"];
	var i = 0;
	var t = ns;
	while ((i < units.length) && t > 1024) {
		t = t / 1024;
		i++;
	}
	var f = parseInt(t * 1024) / 1024;
	return f.toFixed(2) + " " + units[i];
}

function loop() {
	getContainersAndResources(function(err, containers) {
		list.clearItems();
		addContainerDisplay("CONTAINER", "CPU TIME", "MEMORY", "READ", "WRITE");
		containers.forEach(function(data) {
			var shortId = data.container.Id;
			shortId = shortId.substr(0, 8);

			// they are sometimes undefined
			var cpu = data.cpu.total || 0;
			var mem = data.memory.usage || 0;
			var read = data.disk.bytes.read || 0;
			var write = data.disk.bytes.write || 0;

			cpu = timeConverter(cpu);
			mem = dataConverter(mem);
			read = dataConverter(read);
			write = dataConverter(write);

			addContainerDisplay(shortId, cpu, mem, read, write);
		});
	});
	scr.render();
}

setInterval(function() {
	try {
		loop();	
	} catch (e){
		// meh
	}
}, UPDATE_INTERVAL);
