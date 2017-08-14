import { systems, statuses } from '../consts'
import { REST, restFetch } from '../apiController'
import Users from '../modules/Users'

/* ============================= AUTH REDUCER ACTIONS ============================= */
export const logUser = (name, password, userId = "4") => dispatch => restFetch(`#`, data => {
	if (data) {
		dispatch({ type: 'AUTH_USER', payload: data })
		dispatch({ type: 'LOG_IN' })

		const user = Users.getUserById(data.user.id)

		dispatch(fetchRmIssues(user.ids.rm))
		dispatch(setBoards())
		dispatch(fetchGitlabIssues())
	}
	// !!! remove this dummy data
	else {
		dispatch({ type: 'AUTH_USER', payload: {
			id: userId,
			glKey: 'JYU71ybJZx1HzRjG4eGC',
			rmKey: '3135546c8e97570c179097d2b65738a20368bfc1',
			tdKey: 'YzRjM2E5OTM4YWY2MjcwMDRmZjEzNGNmZDU4YmJmZWZlM2RmYzQ5ZjU3OTMyZTc4OThkOTRjZTMxMDA4ZjkyNA',
		}})
		dispatch({ type: 'LOG_IN' })

		const user = Users.getUserById(parseInt(userId))

		dispatch(fetchRmIssues(user.ids.rm))
		dispatch(setBoards())
		dispatch(fetchGitlabIssues())
	}
}, 'PUT', {
	name,
	password,
})
export const logOutUser = () => dispatch => dispatch({ type: 'LOG_OUT' })

/* ============================= GITLAB REDUCER ACTIONS ============================= */
export const addGitlabIssue = issue => dispatch => dispatch({ type: 'ADD_GITLAB_ISSUE', payload: issue })
export const fetchGitlabIssues = () => dispatch => REST.gl(
	`groups/02/issues?state=opened&per_page=100`,
	response => dispatch({ type: 'SET_GITLAB_ISSUES', payload: response }),
)
export const setBoards = () => dispatch => REST.gl(
	`projects/${systems.gitlab.projectId}/boards`,
	data => {
		if (data && data.length) {
			dispatch({ type: 'SET_BOARDS', payload: data[0].lists })
		}
	},
)
export const toggleMyTasksOnly = () => dispatch => dispatch({ type: 'MY_TASKS_TOGGLE' })
export const updateGitlabIssue = (issue_iid, data, comment = '', callback) => dispatch => {
	return REST.gl(
		`projects/${systems.gitlab.projectId}/issues/${issue_iid}`,
		response => {
			if (response) {
				if (data.state_event && data.state_event === 'close') {
					dispatch({ type: 'DELETE_GITLAB_ISSUE', payload: response })
				}
				else {
					dispatch({ type: 'UPDATE_GITLAB_ISSUE', payload: response })
				}
			}
			if (typeof callback === 'function') {
				callback(response)
			}
		},
		'PUT',
		data
	)
}

/* ============================= GLOBAL REDUCER ACTIONS ============================= */
export const isFetching = isFetching => dispatch => dispatch({ type: 'IS_FETCHING', payload: isFetching })

/* ============================= REDMINE REDUCER ACTIONS ============================= */
export const fetchRmIssues = userId => dispatch => REST.rm(
	`issues.json`,
	response => dispatch({ type: 'SET_ISSUES', payload: response.issues }),
	'GET',
	{ assigned_to_id: userId }
)
export const fetchRmIssue = id => dispatch => REST.rm(
	`issues/${id}.json`,
	response => {
		dispatch({ type: 'ADD_REDMINE_ISSUE', payload: response.issue })
	}
)
export const setAssignees = assignees => dispatch => dispatch({ type: 'SET_ASSIGNEES', payload: assignees })
export const addAssignee = assignee => dispatch => dispatch({ type: 'ADD_ASSIGNEE', payload: assignee })
export const addIssue = issue => dispatch => dispatch({ type: 'ADD_REDMINE_ISSUE', payload: issue })
export const fetchSingleIssue = (id, callback) => dispatch => REST.rm(
	`issues/${id}.json?include=journals,attachments`,
	data => {
		dispatch({ type: 'SET_ISSUE', payload: data.issue })
		if (typeof callback === 'function') {
			callback(data)
		}
	}
)
export const setStatuses = () => dispatch => REST.rm(
	`issue_statuses.json`,
	data => dispatch({
		type: 'SET_STATUSES',
		payload: data.issue_statuses.reduce((result, status) => {
			if (systems.redmine.allowedIssueStatuses.indexOf(status.id) >= 0) {
				result.push(status)
			}
			return result
		}, [])
	})
)
export const updateRedmineIssue = (issue, data, callback) => dispatch => {
	return REST.rm(
		`issues/${issue.id}.json`,
		() => {
			let { status_id, assigned_to_id } = data.issue

			if (issue.id && issue.assigned_to) {
				if (
					(status_id && status_id === statuses.closed.rm) ||
					(assigned_to_id && assigned_to_id !== issue.assigned_to.id)
				) {
					dispatch({ type: 'DELETE_REDMINE_ISSUE', payload: issue.id })
				}
				else {
					dispatch({ type: 'UPDATE_REDMINE_ISSUE', payload: {
						...issue,
						status: {
							id: status_id
						}
					} })
				}
			}
			if (typeof callback === 'function') {
				callback(data)
			}
		},
		'PUT',
		data
	)
}
/*
export const resetAssignees = () => dispatch => dispatch({ type: 'RESET_ASSIGNEES' })
export const setAllAssignees = userIds => dispatch => {
	dispatch(resetAssignees())
	return userIds.map(userId => {
		REST.rm(`users/${userId}.json`, data => dispatch({
			type: 'ADD_ASSIGNEE',
			payload: data.user,
		}))
	})
	/* i cannot call this nice piece of code, because my auth key does not have the authority to retrieve the list of all users
	return REST.rm(`users.json`, data => {
		console.log(`${systems.redmine.url}users.json?key=${systems.redmine.auth}`);
		return dispatch({
			type: 'SET_ASSIGNEES',
			payload: data.reduce((result, user) => {
				if (userIds.indexOf(user.id) >= 0) {
					result.push(user)
				}
				return result
			}, [])
		})
	})
	*/
/*
}
*/