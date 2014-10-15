var log = console.log;
var async = require("async");

var docker = require("./docker");

docker.init("http://127.0.0.1:4500");

var log = console.log;

docker.getContainers(function(err, containers){
	if (!err) {
		containers.forEach(function(container) {
			var id = container.Id;
			async.parallel({
				memory: function(callback){
					docker.getMemory(id, callback);
				}, 
				cpu: function(callback){
					docker.getCpu(id, callback);
				},
				disk: function(callback){
					docker.getDisk(id, callback);
				},
				top: function(callback){
					docker.getTop(id, callback);
				}
			}, function(err, results){
				log(results);
			});
		});
	} else {
		log(err);
	}
});