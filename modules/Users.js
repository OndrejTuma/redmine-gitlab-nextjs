const Users = {
	users: [
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
				gl: 2,
				rm: 168,
				td: 659514,
			},
		},
		{
			name: 'Milos',
			id: 3,
			ids: {
				gl: 3,
				rm: 55,
				td: 423183,
			},
		},
		{
			name: 'Ondra',
			id: 4,
			ids: {
				gl: 4,
				rm: 129,
				td: 523967,
			},
		},
		{
			name: 'Dan',
			id: 5,
			ids: {
				gl: 5,
				rm: 134,
				td: 527259,
			},
		},
		{
			name: 'Tomas',
			id: 6,
			ids: {
				gl: 6,
				rm: 149,
				td: undefined,
			},
		},
		{
			name: 'Michal',
			id: 7,
			ids: {
				gl: 7,
				rm: 39,
				td: undefined,
			},
		},
	],

	getUserById: function(userId) {
		userId = parseInt(userId)

		for (let i in this.users) {
			if (this.users.hasOwnProperty(i) && this.users[i].id === userId) {
				return this.users[i]
			}
		}
		return {}
	},
	getUserByGlId: function(glUserId) {
		glUserId = parseInt(glUserId)

		for (let i in this.users) {
			if (this.users.hasOwnProperty(i) && this.users[i].ids.rm === glUserId) {
				return this.users[i]
			}
		}
		return {}
	},
	getUserByRmId: function(rmUserId) {
		rmUserId = parseInt(rmUserId)

		for (let i in this.users) {
			if (this.users.hasOwnProperty(i) && this.users[i].ids.rm === rmUserId) {
				return this.users[i]
			}
		}
		return {}
	},
}

export default Users