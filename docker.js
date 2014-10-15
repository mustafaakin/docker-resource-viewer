var request = require("request");
var path = require("path");
var fs = require("fs");
var async = require("async");

var log = console.log;

var endpoint = "http://127.0.0.1:4500";
var cgroups = "/sys/fs/cgroup";

module.exports.init = function(_endpoint) {
	endpoint = _endpoint;
}


function getContainers(cb) {
	var url = endpoint + "/containers/json?all=0";
	request(url, function(err, resp, body) {
		if (!err && resp.statusCode == 200) {
			var containers = JSON.parse(body);
			cb(null, containers);
		} else {
			cb(null);
		}
	});
}

function getCpu(containerId, cb) {
	var file = path.join(cgroups, "cpuacct", "docker", containerId, "cpuacct.usage_percpu");
	fs.readFile(file, "utf8", function(err, content) {
		if (!err) {
			content = content.replace("\n", "");
			var t = content.split(" ");
			var result = {
				total: 0,
				cpus: [],
			}
			for (var i in t) {
				var value = parseInt(t[i]);
				if (!isNaN(value)) {
					result.cpus.push(value);
					result.total += value;
				}
			}
			cb(null, result)
		} else {
			cb(err);
		}
	});
}

function getDisk(containerId, cb) {
	var folder = path.join(cgroups, "blkio", "docker", containerId);

	var files = ["blkio.throttle.io_service_bytes", "blkio.throttle.io_serviced"];

	async.map(files, function(file, callback) {
		var p = path.join(folder, file);
		fs.readFile(p, "utf8", function(err, content) {
			if (!err) {
				content = content.split("\n");
				var metrics = ["Read", "Write", "Sync", "Async", "Total"];
				var result = {};
				for (var i in content) {
					var line = content[i].split(" ");
					if (line.length == 3) {
						for (var j in metrics) {
							if (line[1] == metrics[j]) {
								var metric = line[1].toLowerCase();
								var value = parseInt(line[2]);
								result[metric] = value;
								break;
							}
						}
					}
				}
				callback(null, result);
			} else {
				callback(err);
			}
		})
	}, function(err, results) {
		var t = {};
		t["bytes"] = results[0];
		t["ops"] = results[1];
		cb(err, t);
	});
}


function getTop(containerId, cb) {
	var url = endpoint + "/containers/" + containerId + "/top?ps_args=aux";
	request(url, function(err, resp, body) {
		if (!err && resp.statusCode == 200) {
			var top = JSON.parse(body);
			var result = [];
			var processes = top.Processes;
			var titles = top.Titles;
			for (var i in processes) {
				var p = processes[i];

				var obj = {};
				for (var j in titles) {
					var title = titles[j];
					if (title == "%CPU") {
						title = "CPU";
					} else if (title == "%MEM") {
						title = "MEM";
					}
					var value = p[j];
					obj[title] = value;
				}
				result.push(obj);
			}

			cb(null, result);
		} else {
			cb(null);
		}
	});
}


function getMemory(containerId, cb) {
	var folder = path.join(cgroups, "memory", "docker", containerId);

	async.parallel({
		stats: function(callback) {
			var file = path.join(folder, "memory.stat");
			fs.readFile(file, "utf8", function(err, content) {
				if (!err) {
					content = content.split("\n");
					var results = {};
					for (var i in content) {
						var t = content[i].split(" ");
						if (t.length == 2) {
							var metric = t[0];
							var value = parseInt(t[1]);
							results[metric] = parseInt(value);
						}
					}
					callback(null, results);
				} else {
					callback(err);
				}
			});

		},
		usage: function(callback) {
			var file = path.join(folder, "memory.usage_in_bytes");
			fs.readFile(file, "utf8", function(err, content) {
				callback(err, parseInt(content));
			})
		}
	}, function(err, results) {
		cb(err, results);
	});
}

module.exports.getContainers = getContainers;
module.exports.getMemory = getMemory;
module.exports.getDisk = getDisk;
module.exports.getCpu = getCpu;
module.exports.getTop = getTop;