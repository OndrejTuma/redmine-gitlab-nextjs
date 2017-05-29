export const mapGitlabStatusToRedmine = {
	2: 4, // To Do: ceka se
	3: 2, // Progress: ve vyvoji
	5: 2, // Test: ve vyvoji
	4: 3, // Deploy: vyreseny
	7: 4, // Čeká: ceka se
}
export const systems = {
	redmine: {
		url: 'http://rm.udiv.eu/',
		issueUrl: 'http://rm.udiv.eu/issues/',
		auth: '3135546c8e97570c179097d2b65738a20368bfc1',
		users: [
			{ id: 187, name: 'Lukas' },
			{ id: 168, name: 'Radek' },
			{ id: 55, name: 'Milos' },
			{ id: 129, name: 'Ondra' },
			{ id: 134, name: 'Dan' },
			{ id: 149, name: 'Tomas' },
			{ id: 39, name: 'Michal' },
		],
		allowedIssueStatuses: [
			2, // ve vyvoji
			3, // vyreseny
			4, // ceka se
			5, // uzavreny
		]
	},
	gitlab: {
		url: 'http://gitlab.dev.footshop.cz/api/v4/',
		issueUrl: 'http://gitlab.dev.footshop.cz/footshop/footshop-ng/issues/',
		auth: 'JYU71ybJZx1HzRjG4eGC',
		projectId: 3,	// footshop-ng
		users: [
			{ id: 1, name: 'Lukas' },
			{ id: 2, name: 'Radek' },
			{ id: 3, name: 'Milos' },
			{ id: 4, name: 'Ondra' },
			{ id: 5, name: 'Dan' },
			{ id: 6, name: 'Tomas' },
			{ id: 7, name: 'Michal' },
		],
	},
	timedoctor: {
		url: 'https://webapi.timedoctor.com/v1.1/',
		auth: 'YzRjM2E5OTM4YWY2MjcwMDRmZjEzNGNmZDU4YmJmZWZlM2RmYzQ5ZjU3OTMyZTc4OThkOTRjZTMxMDA4ZjkyNA',
		// auth: 'M2I1NTU2MWIyZTkzNGViZGJkMDM3YzBlZmZkYjQxY2MxNTA5ZTlkNWQ5ZjIzMWMxMGEyYjljODk4YmE4OGEwMA', //milosh
		// projectId: 883939, // Footshop REST
		// projectId: 440915, // Footshop.com
		projectId: 157560, // Footshop.cz
		companyId: 257766, // Footshop s.r.o.
		users: [
			{ id: 717767, name: 'Lukas' },
			{ id: 659514, name: 'Radek' },
			{ id: 423183, name: 'Milos' },
			{ id: 523967, name: 'Ondra' },
			{ id: 527259, name: 'Dan' },
		]
	},
}