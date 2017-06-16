export const statuses = {
	todo: {
		gl: 2,	// To Do
		rm: 4,	// Čeká se
	},
	progress: {
		gl: 3,	// Progress
		rm: 2,	// Ve vývoji
	},
	test: {
		gl: 5,	// Test
		rm: 2,	// Ve vývoji
	},
	deploy: {
		gl: 4,	// Deploy
		rm: 3,	// Vyřešený
	},
	idle: {
		gl: 7,	// Čeká
		rm: 4,	// Čeká se
	},
	closed: {
		rm: 5,	// Uzavřený
	},
}
export const systems = {
	redmine: {
		allowedIssueStatuses: [
			statuses.progress.rm,
			statuses.deploy.rm,
			statuses.idle.rm,
			statuses.closed.rm,
		],
		// auth: '404f76820130f2287b95cfcbff149be28f1daa12',	//admin api klic
		auth: '3135546c8e97570c179097d2b65738a20368bfc1',	//muj api klic
		issueUrl: 'http://rm.udiv.eu/issues/',
		projectId: 15, // Footshop.cz
		url: 'http://rm.udiv.eu/',
	},
	gitlab: {
		apiUrl: 'http://gitlab.dev.footshop.cz/api/v4/',
		auth: 'JYU71ybJZx1HzRjG4eGC',
		issueUrl: 'http://gitlab.dev.footshop.cz/footshop/footshop-ng/issues/',
		projectId: 3,	// footshop-ng
		projectUrl: 'http://gitlab.dev.footshop.cz/footshop/footshop-ng/',
		url: 'http://gitlab.dev.footshop.cz/',
	},
	timedoctor: {
		// auth: 'M2I1NTU2MWIyZTkzNGViZGJkMDM3YzBlZmZkYjQxY2MxNTA5ZTlkNWQ5ZjIzMWMxMGEyYjljODk4YmE4OGEwMA', //milosh
		// projectId: 883939, // Footshop REST
		// projectId: 440915, // Footshop.com
		auth: 'YzRjM2E5OTM4YWY2MjcwMDRmZjEzNGNmZDU4YmJmZWZlM2RmYzQ5ZjU3OTMyZTc4OThkOTRjZTMxMDA4ZjkyNA',
		companyId: 257766, // Footshop s.r.o.
		projectId: 157560, // Footshop.cz
		url: 'https://webapi.timedoctor.com/v1.1/',
	},
}
export const ItemTypes = {
	BOARD: 'board'
}