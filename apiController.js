import { systems } from './consts'
import fetch from 'isomorphic-fetch'
import { fetchGitlabIssues } from './redux/actions'

export const REST = {
	rm: (resource, callback, method, data) => {
		return restFetch(`${systems.redmine.url}${resource}`, callback, method, Object.assign({
			key: systems.redmine.auth,
		}, data))
	},
	gl: (resource, callback, method, data) => {
		return restFetch(`${systems.gitlab.url}${resource}`, callback, method, Object.assign({
			private_token: systems.gitlab.auth,
		}, data))
	},
	td: (resource, callback, method, data) => {
		return restFetch(`${systems.timedoctor.url}${resource}`, callback, method, Object.assign({
			access_token: systems.timedoctor.auth,
		}, data))
	},
}

export const GitLab = {
	updateGitlabIssue: (gitlabEditWrapper, dispatch, issueIid, nonBoardLabels, boardLabel, assigneeId, comment = ``) => {
		let labels = nonBoardLabels ? nonBoardLabels.split(',') : []
		labels.push(boardLabel)

		return REST.gl(`projects/${systems.gitlab.projectId}/issues/${issueIid}`, () => {
			gitlabEditWrapper.style.display = 'none'
			if (comment) {
				REST.gl(`/projects/${systems.gitlab.projectId}/issues/${issueIid}/notes`, () => {
					dispatch(fetchGitlabIssues())
				}, 'POST', {
					body: comment
				})
			}
			else {
				dispatch(fetchGitlabIssues())
			}
		}, 'PUT', {
			issue_iid: issueIid,
			assignee_id: assigneeId,
			labels: labels.join(','),
		})
	},
	_getGitlabUserById: (redmineUserId, redmineUsers, gitlabUsers) => {
		let userName = redmineUsers.reduce((result, user) => {
			if (result.id == redmineUserId) {
				return result.name
			}
			if (user.id == redmineUserId) {
				return user.name
			}
			return result
		}, redmineUsers[0])
		for (let i in gitlabUsers) {
			if (gitlabUsers[i].name == userName) {
				return gitlabUsers[i]
			}
		}
		return {}
	},
	getGitlabLabelByRedmineStatusId: (rmStatusId, mapGitlabStatusToRedmine, boards) => {
		let gitlabBoardId = 0
		for (let glId in mapGitlabStatusToRedmine) {
			if (rmStatusId == mapGitlabStatusToRedmine[glId]) {
				gitlabBoardId = glId
				break
			}
		}
		for (let i in boards) {
			if (boards[i].id == gitlabBoardId) {
				return boards[i].label.name
			}
		}
	},
}

const restFetch = (url, callback, method = `GET`, data) => {
	if (method === 'GET') {
		url += /\?/.test(url) ? '&' : '?'
		for (let [key, value] of Object.entries(data)) {
			url += `${key}=${value}&`
		}
	}
	return fetch(url, {
		//;mode: 'cors',
		method: method,
		headers: {
			'Content-Type': 'application/json',
		},
		body: method === 'GET' ? null : JSON.stringify(data)
	})
		.then(
			response => {
				//console.log('REST fetch response', response, response.json());
				if (!response.ok) {
					alert(`Fetch on url ( ${response.url} ) failed: ${response.status} - ${response.statusText}`)
				}
				if (['GET', 'POST'].indexOf(method) > -1) {
					return response.json()
				}
			},
			error => console.error('Error occured while fetching:', error)
		)
		.then(response => {
			callback(response)
		})
}