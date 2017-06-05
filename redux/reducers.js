import { combineReducers } from 'redux'

const authReducer = (state = {
	user: {
		id: 0,
		glKey: '',
		rmKey: '',
		tdKey: '',
	},
	isLogged: false,
}, action) => {
	switch (action.type) {
		case 'AUTH_USER': return Object.assign({}, state, {
			user: action.payload
		})
		case 'LOG_IN': return Object.assign({}, state, {
			isLogged: true
		})
		case 'LOG_OUT': return Object.assign({}, state, {
			isLogged: false
		})
		default: return state
	}
}
const gitlabReducer = (state = {
	boards: [],
	issues: [],
	myTasksOnly: true,
}, action) => {
	switch (action.type) {
		case 'MY_TASKS_TOGGLE': return Object.assign({}, state, {
			myTasksOnly: !state.myTasksOnly,
		})
		case 'SET_BOARDS': return Object.assign({}, state, {
			boards: action.payload,
		})
		case 'SET_GITLAB_ISSUES': return Object.assign({}, state, {
			issues: action.payload,
		})
		case 'ADD_GITLAB_ISSUE': return {
			...state,
			issues: [...state.issues, action.payload],
		}
		default: return state
	}
}
const globalReducer = (state = {
	fetching: false,
}, action) => {
	switch (action.type) {
		case 'IS_FETCHING':  return Object.assign({}, state, {
			fetching: action.payload,
		})
		default: return state
	}
}
const redmineReducer = (state = {
	assignees: [],
	issues: [],
	issue: {},
	statuses: [],
}, action) => {
	switch (action.type) {
		case 'SET_ASSIGNEES': return Object.assign({}, state, {
			assignees: action.payload,
		})
		case 'ADD_ASSIGNEE': return {
			...state,
			assignees: [action.payload, ...state.assignees],
		}
		case 'SET_ISSUES': return Object.assign({}, state, {
			issues: action.payload,
		})
		case 'SET_ISSUE':  return Object.assign({}, state, {
			issue: action.payload,
		})
		case 'ADD_ISSUE': return {
			...state,
			issues: [...state.issues, action.payload],
		}
		case 'SET_STATUSES': return Object.assign({}, state, {
			statuses: action.payload,
		})
		default: return state
	}
}


export default combineReducers({
	auth: authReducer,
	global: globalReducer,
	redmine: redmineReducer,
	gitlab: gitlabReducer,
})