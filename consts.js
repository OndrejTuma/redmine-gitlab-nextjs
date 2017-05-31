export const mapGitlabStatusToRedmine = {
	2: 4, // To Do: ceka se
	3: 2, // Progress: ve vyvoji
	5: 2, // Test: ve vyvoji
	4: 3, // Deploy: vyreseny
	7: 4, // Čeká: ceka se
}
export const systems = {
	redmine: {
		allowedIssueStatuses: [
			2, // ve vyvoji
			3, // vyreseny
			4, // ceka se
			5, // uzavreny
		],
		// auth: '404f76820130f2287b95cfcbff149be28f1daa12',	//admin api klic
		auth: '3135546c8e97570c179097d2b65738a20368bfc1',	//muj api klic
		issueUrl: 'http://rm.udiv.eu/issues/',
		projectId: 15, // Footshop.cz
		url: 'http://rm.udiv.eu/',
		users: [
			{ id: 187, name: 'Lukas' },
			{ id: 168, name: 'Radek' },
			{ id: 55, name: 'Milos' },
			{ id: 129, name: 'Ondra' },
			{ id: 134, name: 'Dan' },
			{ id: 149, name: 'Tomas' },
			{ id: 39, name: 'Michal' },
		],
	},
	gitlab: {
		auth: 'JYU71ybJZx1HzRjG4eGC',
		issueUrl: 'http://gitlab.dev.footshop.cz/footshop/footshop-ng/issues/',
		projectId: 3,	// footshop-ng
		url: 'http://gitlab.dev.footshop.cz/api/v4/',
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
		// auth: 'M2I1NTU2MWIyZTkzNGViZGJkMDM3YzBlZmZkYjQxY2MxNTA5ZTlkNWQ5ZjIzMWMxMGEyYjljODk4YmE4OGEwMA', //milosh
		// projectId: 883939, // Footshop REST
		// projectId: 440915, // Footshop.com
		auth: 'YzRjM2E5OTM4YWY2MjcwMDRmZjEzNGNmZDU4YmJmZWZlM2RmYzQ5ZjU3OTMyZTc4OThkOTRjZTMxMDA4ZjkyNA',
		companyId: 257766, // Footshop s.r.o.
		projectId: 157560, // Footshop.cz
		url: 'https://webapi.timedoctor.com/v1.1/',
		users: [
			{ id: 717767, name: 'Lukas' },
			{ id: 659514, name: 'Radek' },
			{ id: 423183, name: 'Milos' },
			{ id: 523967, name: 'Ondra' },
			{ id: 527259, name: 'Dan' },
		]
	},
}