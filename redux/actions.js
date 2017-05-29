import fetch from 'isomorphic-fetch'
import { systems } from '../consts'
import { REST } from '../apiController'

export const restFetch = (url, callback, method = `GET`, data) => {
	const params = !!data ? {
		mode: 'cors',
		method: method,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data)
	} : {}

	// isFetching(true)
	return fetch(url, params)
		.then(
			response => response.json(),
			error => console.log('Error occured while fetching:', error)
		)
		.then(response => {
			// isFetching(false)
			callback(response)
		})
}

/* ============================= GLOBAL REDUCER ACTIONS ============================= */
export const setUser = userId => dispatch => dispatch({ type: 'SET_USER', payload: userId })
export const setGitlabUser = userId => dispatch => dispatch({ type: 'SET_GITLAB_USER', payload: userId })
export const isFetching = isFetching => dispatch => dispatch({ type: 'IS_FETCHING', payload: isFetching })

/* ============================= REDMINE REDUCER ACTIONS ============================= */
export const fetchIssues = userId => dispatch => REST.rm(
	`issues.json`,
	response => dispatch({ type: 'SET_ISSUES', payload: response.issues }),
	'GET',
	{ assigned_to_id: userId }
)
export const addIssue = issue => dispatch => dispatch({ type: 'ADD_ISSUE', payload: issue })
export const fetchIssue = (id, callback) => dispatch => REST.rm(
	`issues/${id}.json?include=journals,attachments`,
	data => {
		dispatch({ type: 'SET_ISSUE', payload: data.issue })
		// dispatch(setAllAssignees(getAllAssignees(data.issue)))
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

/* ============================= GITLAB REDUCER ACTIONS ============================= */
export const setBoards = (onlyForUserId = 0) => dispatch => restFetch(
	`${systems.gitlab.url}projects/${systems.gitlab.projectId}/boards/?private_token=${systems.gitlab.auth}`,
	data => {
		if (data[0]) {
			dispatch({ type: 'SET_BOARDS', payload: data[0].lists })
			data[0].lists.map(list => dispatch(fillBoardWithIssues(list.label.name, onlyForUserId)))
		}
	},
)
const fillBoardWithIssues = (label, onlyForUserId) => dispatch => restFetch(
	`${systems.gitlab.url}groups/02/issues/?labels=${label}&private_token=${systems.gitlab.auth}`,
	data => {
		dispatch({ type: 'SET_BOARDS_ISSUES', payload: onlyForUserId ? data.reduce((result, issue) => {
			if (issue.assignee && issue.assignee.id == onlyForUserId) {
				result.push(issue)
			}
			return result
		}, []) : data, label })
	}
)
export const toggleMyTasksOnly = () => dispatch => dispatch({ type: 'MY_TASKS_TOGGLE' })