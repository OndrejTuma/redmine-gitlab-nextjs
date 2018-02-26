export default (state = {
    assignees: [],
    issues: [],
    issue: {},
    statuses: [],
}, action) => {
    switch (action.type) {
        case 'SET_ASSIGNEES':
            return Object.assign({}, state, {
                assignees: action.payload,
            })
        case 'ADD_ASSIGNEE':
            return {
                ...state,
                assignees: [action.payload, ...state.assignees],
            }
        case 'SET_ISSUES':
            return Object.assign({}, state, {
                issues: action.payload,
            })
        case 'SET_ISSUE':
            return Object.assign({}, state, {
                issue: action.payload,
            })
        case 'ADD_REDMINE_ISSUE':
            return {
                ...state,
                issues: [...state.issues, action.payload],
            }
        case 'SET_STATUSES':
            return Object.assign({}, state, {
                statuses: action.payload,
            })
        case 'DELETE_REDMINE_ISSUE':
            return {
                ...state,
                issues: state.issues.reduce((result, issue) => {
                    if (issue.id !== action.payload) {
                        result.push(issue)
                    }
                    return result
                }, []),
            }
        case 'UPDATE_REDMINE_ISSUE':
            return {
                ...state,
                issues: state.issues.map(issue => {
                    return (issue.id === action.payload.id) ? {
                        ...issue,
                        ...action.payload,
                    } : issue
                }),
            }
        default:
            return state
    }
}