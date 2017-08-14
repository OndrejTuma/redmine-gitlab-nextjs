import { statuses } from '../consts'

const Statuses = {
	getStatusByRmId: rmId => {
		rmId = parseInt(rmId)

		for (let name in statuses) {
			if (statuses.hasOwnProperty(name) && statuses[name].rm === rmId) {
				return statuses[name]
			}
		}
		return {}
	},
	getStatusByGlId: glId => {
		glId = parseInt(glId)

		for (let name in statuses) {
			if (statuses.hasOwnProperty(name) && statuses[name].gl === glId) {
				return statuses[name]
			}
		}
		return {}
	}
}

export default Statuses