export const users = [
	{
		name: 'Lukas',
		id: 1,
		ids: {
			gl: 1,
			rm: 187,
			td: 717767,
		},
	},
	{
		name: 'Radek',
		id: 2,
		ids: {
			gl: 8,
			rm: 168,
			td: 659514,
		},
	},
	{
		name: 'Milos',
		id: 3,
		ids: {
			gl: 5,
			rm: 55,
			td: 423183,
		},
	},
	{
		name: 'Ondra',
		id: 4,
		ids: {
			gl: 3,
			rm: 129,
			td: 523967,
		},
	},
	{
		name: 'Dan',
		id: 5,
		ids: {
			gl: 2,
			rm: 134,
			td: 527259,
		},
	},
	{
		name: 'Tomas',
		id: 6,
		ids: {
			gl: 4,
			rm: 149,
			td: undefined,
		},
	},
	{
		name: 'Peter T',
		id: 7,
		ids: {
			gl: 6,
			rm: 193,
			td: undefined,
		},
	},
	{
		name: 'Marek',
		id: 8,
		ids: {
			gl: undefined,
			rm: 219,
			td: undefined,
		},
	},
]
export const statuses = {
	todo: {
		gl: 3,	// To Do
		rm: 1,	// Nový
	},
	progress: {
		gl: 4,	// Progress
		rm: 2,	// Ve vývoji
	},
	test: {
		gl: 5,	// Test
		rm: 8,	// Testování
	},
	deploy: {
		gl: 6,	// Deploy
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
		apiUrl: 'http://footshop-git.s64.cz/api/v4/',
		auth: '-HRjUUtjim76Pk2xJnT4',
		issueUrl: 'http://footshop-git.s64.cz/footshop/footshop-ng/issues/',
		projectId: 2,	// footshop-ng
		projectUrl: 'http://footshop-git.s64.cz/footshop/footshop-ng/',
		url: 'http://footshop-git.s64.cz/',
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