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
	boards: [
		{id: 3, label: {color: "#F0AD4E", description: null, id: 2, name: "To Do"}, position: 0},
		{id: 4, label: {color: "#5CB85C", description: null, id: 3, name: "Progress"}, position: 1},
		{id: 5, label: {color: "#D9534F", description: null, id: 4, name: "Test"}, position: 2},
		{id: 8, label: {color: "#d14ace", description: null, id: 7, name: "Připraveno na deploy"}, position: 5},
		{id: 6, label: {color: "#428BCA", description: null, id: 5, name: "Deploy"}, position: 3},
		{id: 7, label: {color: "#D1D100", description: null, id: 6, name: "Čeká se"}, position: 4},
	],
	issues: [],
	mr_mine: [],
	mr_for_me: [],
	myTasksOnly: true,
}, action) => {
	switch (action.type) {
		case 'MY_TASKS_TOGGLE': return Object.assign({}, state, {
			myTasksOnly: !state.myTasksOnly,
		})
		case 'SET_MY_MR': return Object.assign({}, state, {
			mr_mine: action.payload,
		})
		case 'SET_MR_FOR_ME': return Object.assign({}, state, {
			mr_for_me: action.payload,
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
		case 'DELETE_GITLAB_ISSUE': return {
			...state,
			issues: state.issues.reduce((result, issue) => {
				if (issue.iid !== action.payload.iid) {
					result.push(issue)
				}
				return result
			}, []),
		}
		case 'UPDATE_GITLAB_ISSUE': return {
			...state,
			issues: state.issues.map(issue => {
				return (issue.iid === action.payload.iid) ? {
					...issue,
					...action.payload,
				} : issue
			}),
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
		case 'ADD_REDMINE_ISSUE': return {
			...state,
			issues: [...state.issues, action.payload],
		}
		case 'SET_STATUSES': return Object.assign({}, state, {
			statuses: action.payload,
		})
		case 'DELETE_REDMINE_ISSUE': return {
			...state,
			issues: state.issues.reduce((result, issue) => {
				if (issue.id !== action.payload) {
					result.push(issue)
				}
				return result
			}, []),
		}
		case 'UPDATE_REDMINE_ISSUE': return {
			...state,
			issues: state.issues.map(issue => {
				return (issue.id === action.payload.id) ? {
					...issue,
					...action.payload,
				} : issue
			}),
		}
		default: return state
	}
}


export default combineReducers({
	auth: authReducer,
	global: globalReducer,
	redmine: redmineReducer,
	gitlab: gitlabReducer,
})