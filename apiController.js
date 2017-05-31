import fetch from 'isomorphic-fetch'
import Link from 'next/link'
import { renderToString } from 'react-dom/server'

import { systems } from './consts'
import { fetchGitlabIssues, fetchIssues } from './redux/actions'

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

export const Boards = {
	getBoardById: (boardId, boards) => {
		for (let i in boards) {
			if (boards[i].id === boardId) {
				return boards[i]
			}
		}
	},
	getBoardByTaskLabels: (labels, boards) => {
		for (let i in boards) {
			if (labels.indexOf(boards[i].label.name) >= 0) {
				return boards[i]
			}
		}
	},
	getBoardLabels: boards => {
		return boards.reduce((result, board) => {
			result.push(board.label.name)
			return result
		}, [])
	},
	getLabel: (labelName, boards) => {
		for (let i in boards) {
			if (boards[i].label.name == labelName) {
				return boards[i].label
			}
		}
		return ``
	},
	getNonBoardLabels: (issueLabels, boards) => {
		const boardLabels = Boards.getBoardLabels(boards)

		return issueLabels.reduce((result, label) => {
			if (boardLabels.indexOf(label) < 0) {
				result.push(label)
			}
			return result
		}, [])
	},
}

export const GitLab = {
	closeIssue: (dispatch, gitlabEditWrapper, issueIid) => REST.gl(
		`projects/${systems.gitlab.projectId}/issues/${issueIid}`, () => {
			gitlabEditWrapper.style.display = 'none'
			dispatch(fetchGitlabIssues())
		}, 'PUT', {
			issue_iid: issueIid,
			state_event: 'close'
		}
	),
	createIssueFromRm: (dispatch, gitlabUserId, boards, issue) => {
		let labels = [gitlabUserId == 4 ? 'Frontend' : 'Backend', GitLab.getLabelByRmStatusId(issue.status.id, mapGitlabStatusToRedmine, boards)].join(',')

		return REST.gl(`projects/${systems.gitlab.projectId}/issues`, () => {
			dispatch(fetchGitlabIssues())
		}, 'PUT', {
			title: `${issue.id} - ${issue.subject}`,
			description: issue.description,
			assignee_id: gitlabUserId,
			labels,
		})
	},
	editIssue: (issue, boards, {
		gitlabEditWrapper,
		gitlabEditLabels,
		gitlabEdit,
		gitlabEditHeading,
		gitlabEditRedmine,
		gitlabEditUser,
		gitlabEditSelect,
	}) => {
		const rmId = Redmine.findId(issue.title)

		gitlabEditLabels.value = Boards.getNonBoardLabels(issue.labels, boards).join(',')
		gitlabEdit.value = issue.iid
		gitlabEditHeading.innerHTML = issue.title
		gitlabEditRedmine.innerHTML = renderToString(<Link as={`/task/${rmId}`} href={`/task?id=${rmId}`}><a target="_blank">Redmine {rmId}</a></Link>)
		gitlabEditUser.value = issue.assignee ? issue.assignee.id : gitlabEditUser.value
		gitlabEditSelect.value = issue.labels.reduce((result, label) => {
			if (Boards.getLabel(result, boards)) {
				return result
			}
			if (Boards.getLabel(label, boards)) {
				return label
			}
			return result
		})

		gitlabEditWrapper.style.display = 'block'
	},
	findIssue: rmIssueId => {
		const { gitlabIssues } = this.props

		for (let i in gitlabIssues) {
			if (gitlabIssues.hasOwnProperty(i)) {
				if (Redmine.findId(gitlabIssues[i].title) == rmIssueId) {
					return gitlabIssues[i]
				}
			}
		}
	},
	getLabelByRmStatusId: (rmStatusId, mapGitlabStatusToRedmine, boards) => {
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
	getUserById: (redmineUserId, redmineUsers, gitlabUsers) => {
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
	updateIssue: (dispatch, gitlabEditWrapper, issueIid, nonBoardLabels, boardLabel, assigneeId, comment = ``) => {
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
}

export const Redmine = {
	closeIssue: (dispatch, userId, cmnWrapper, issueId) => REST.rm(
		`issues/${issueId}.json`, () => {
			cmnWrapper.style.display = 'none'
			dispatch(fetchIssues(userId))
		}, 'PUT', {
			issue: {
				status_id: 5 // Uzavřený
			}
		}
	),
	createIssueFromGl: (dispatch, issue) => REST.rm(
		`issues.json`, data => {
			if (!Redmine.findId(issue.title)) {
				REST.gl(`projects/${systems.gitlab.projectId}/issues/${issue.iid}`, () => {
					dispatch(fetchGitlabIssues())
				}, 'PUT', {
					title: `${data.issue.id} - ${issue.title}`,
				})
			}
			else {
				dispatch(fetchGitlabIssues())
			}
		}, 'POST', {
			issue: {
				project_id: systems.redmine.projectId,
				status_id: 2, // ve vyvoji
				subject: issue.title,
				description: issue.description,
				assigned_to_id: userId,
			}
		}
	),
	findId: string => {
		const findId = /\d{4,}/g
		return parseInt(string.match(findId))
	},
	getIssue: (issues, taskId) => {
		for (let i in issues) {
			if (issues[i].id == taskId) {
				return issues[i]
			}
		}
	},
	getUserByGlUserId: (gitlabId, redmineUsers, gitlabUsers) => {
		let userName = gitlabUsers.reduce((result, user) => {
			if (result.id == gitlabId) {
				return result.name
			}
			if (user.id == gitlabId) {
				return user.name
			}
			return result
		}, gitlabUsers[0])
		for (let i in redmineUsers) {
			if (redmineUsers[i].name == userName) {
				return redmineUsers[i]
			}
		}
		return {}
	},
	updateIssue: (dispatch, userId, { cmnWrapper, cmnComment }, issueId, statusId, assigneeId, comment = ``) => {
		return REST.rm(`issues/${issueId}.json`, () => {
			cmnWrapper.style.display = 'none'
			cmnComment.value = ''
			dispatch(fetchIssues(userId))
		}, 'PUT', {
			issue: {
				assigned_to_id : assigneeId,
				status_id: statusId,
				notes: comment,
			}
		})
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
		mode: 'cors',
		method: method,
		headers: {
			'Access-Control-Allow-Origin': '*',
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