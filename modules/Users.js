import { users } from '../consts'

const Users = {
	getUserById: function(userId) {
		userId = parseInt(userId)

		for (let i in users) {
			if (users.hasOwnProperty(i) && users[i].id === userId) {
				return users[i]
			}
		}
		return {}
	},
	getUserByGlId: function(glUserId) {
		glUserId = parseInt(glUserId)

		for (let i in users) {
			if (users.hasOwnProperty(i) && users[i].ids.rm === glUserId) {
				return users[i]
			}
		}
		return {}
	},
	getUserByRmId: function(rmUserId) {
		rmUserId = parseInt(rmUserId)

		for (let i in users) {
			if (users.hasOwnProperty(i) && users[i].ids.rm === rmUserId) {
				return users[i]
			}
		}
		return {}
	},
	getUserByName: function(name) {
		for (let i in users) {
			if (users.hasOwnProperty(i) && users[i].name === name) {
				return users[i]
			}
		}
		return {}
	},
}

export default Users