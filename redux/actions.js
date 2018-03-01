import { systems, statuses } from '../consts'
import {REST, restFetch, gitlabFetch, redmineFetch} from '../apiController'
import Users from '../modules/Users'

import {
    ADD_MERGE_REQUEST,
	SET_FORM_ISSUE_ASSIGNEE,
    SET_FORM_ISSUE_COMMENT,
	SET_FORM_ISSUE_STATE,
} from './actionTypes'

/* ============================= AUTH REDUCER ACTIONS ============================= */
export const logUser = (name, password, userId = 4) => dispatch => restFetch(`#`, data => {
	const user = Users.getUserById(userId)

	dispatch({ type: 'AUTH_USER', payload: data || {
		id: userId,
		glKey: 'JYU71ybJZx1HzRjG4eGC',
		rmKey: '3135546c8e97570c179097d2b65738a20368bfc1',
		tdKey: 'YzRjM2E5OTM4YWY2MjcwMDRmZjEzNGNmZDU4YmJmZWZlM2RmYzQ5ZjU3OTMyZTc4OThkOTRjZTMxMDA4ZjkyNA',
	}})

	dispatch({ type: 'LOG_IN' })
	dispatch(fetchRmIssues(user.ids.rm))
    dispatch(setStatuses())
    dispatch(setMergeRequests(user.ids.gl))
    dispatch(setMergeRequestAssignedToMe(user.ids.gl))
}, 'PUT', {
	name,
	password,
})
export const logOutUser = () => dispatch => dispatch({ type: 'LOG_OUT' })

/* ============================= FORMS REDUCER ACTIONS ============================== */
export const setFormIssueAssignee = payload => dispatch => dispatch({type: SET_FORM_ISSUE_ASSIGNEE, payload})
export const setFormIssueState = payload => dispatch => dispatch({type: SET_FORM_ISSUE_STATE, payload})
export const setFormIssueComment = payload => dispatch => dispatch({type: SET_FORM_ISSUE_COMMENT, payload})
export const resetFormIssueComment = () => dispatch => dispatch({type: SET_FORM_ISSUE_COMMENT, payload: ''})

/* ============================= GITLAB REDUCER ACTIONS ============================= */
export const setMergeRequests = author_id => dispatch => gitlabFetch('merge_requests', 'GET', {
	state: 'opened',
	author_id,
}).then(data => {
	if (data) {
		dispatch({ type: 'SET_MY_MR', payload: data })
	}
})
export const addMergeRequest = mr => dispatch => dispatch({type: ADD_MERGE_REQUEST, payload: mr})
export const setMergeRequestAssignedToMe = assignee_id => dispatch => gitlabFetch('merge_requests', 'GET', {
	state: 'opened',
    assignee_id,
}).then(data => {
	if (data) {
		dispatch({ type: 'SET_MR_FOR_ME', payload: data })
	}
})

/* ============================= GLOBAL REDUCER ACTIONS ============================= */
export const isFetching = payload => dispatch => dispatch({ type: 'IS_FETCHING', payload})

/* ============================= REDMINE REDUCER ACTIONS ============================= */
export const fetchRmIssues = userId => dispatch => REST.rm(
	`issues.json`,
	response => dispatch({ type: 'SET_ISSUES', payload: response.issues }),
	'GET',
	{ assigned_to_id: userId }
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
export const updateRedmineIssue = (issue, data) => dispatch => {
	let { status_id, assigned_to_id } = data.issue

	if (issue.id && issue.assigned_to) {
		if (
			(status_id && status_id === statuses.closed.rm) ||
			(assigned_to_id && assigned_to_id !== issue.assigned_to.id)
		) {
			dispatch({type: 'DELETE_REDMINE_ISSUE', payload: issue.id})
		}
		else {
			dispatch({
				type: 'UPDATE_REDMINE_ISSUE', payload: {
					...issue,
					assigned_to: {
						id: assigned_to_id
					},
					status: {
						id: status_id
					}
				}
			})
		}
	}
	return redmineFetch(`issues/${issue.id}.json`, 'PUT', data)
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