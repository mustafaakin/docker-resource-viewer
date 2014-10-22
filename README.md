docker-resource-viewer
======================

This project allows you to monitor your Docker containers resource usage by using cgroups metrics located in /sys/fs/cgroup/..  

![sample-output](https://raw.githubusercontent.com/mustafaakin/docker-resource-viewer/master/example.gif)

# Note: 

It is currently tested Docker Remote API over TCP, I did not test with default Unix socket API. To 

# The API

By running `node sample.js` you can see the following information about your container(s):

	{ memory: 
	   { stats: 
	      { cache: 278528,
	        rss: 913408,
	        rss_huge: 0,
	        mapped_file: 0,
	        writeback: 0,
	        pgpgin: 913,
	        pgpgout: 622,
	        pgfault: 4375,
	        pgmajfault: 2,
	        inactive_anon: 12288,
	        active_anon: 884736,
	        inactive_file: 237568,
	        active_file: 4096,
	        unevictable: 0,
	        hierarchical_memory_limit: 18446744073709552000,
	        total_cache: 278528,
	        total_rss: 913408,
	        total_rss_huge: 0,
	        total_mapped_file: 0,
	        total_writeback: 0,
	        total_pgpgin: 913,
	        total_pgpgout: 622,
	        total_pgfault: 4375,
	        total_pgmajfault: 2,
	        total_inactive_anon: 12288,
	        total_active_anon: 884736,
	        total_inactive_file: 237568,
	        total_active_file: 4096,
	        total_unevictable: 0 },
	     usage: 1474560 },
	  cpu: 
	   { total: 10965841123,
	     cpus: 
	      [ 2736482062,
	        197772,
	        8675116,
	        2733683958,
	        1141992806,
	        2567813,
	        2740863962,
	        1601377634 ] },
	  disk: 
	   { bytes: { read: 118784, write: 0, sync: 0, async: 118784, total: 118784 },
	     ops: { read: 3, write: 0, sync: 0, async: 3, total: 3 } },
	  top: 
	   [ { USER: 'root',
	       PID: '15297',
	       CPU: '0.7',
	       MEM: '0.0',
	       VSZ: '18176',
	       RSS: '1980',
	       TTY: 'pts/12',
	       STAT: 'Ss',
	       START: '13:24',
	       TIME: '0:00',
	       COMMAND: '/bin/bash' },
	     { USER: 'root',
	       PID: '15338',
	       CPU: '549',
	       MEM: '0.0',
	       VSZ: '19776',
	       RSS: '1124',
	       TTY: 'pts/12',
	       STAT: 'Sl+',
	       START: '13:24',
	       TIME: '0:10',
	       COMMAND: 'sysbench --num-threads 4 --test cpu --cpu-max-prime 20000 run' } ] }
