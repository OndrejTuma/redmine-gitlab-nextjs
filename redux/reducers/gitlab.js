import {ADD_MERGE_REQUEST} from '../actionTypes'

export default (state = {
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
        case 'MY_TASKS_TOGGLE':
            return {...state, myTasksOnly: !state.myTasksOnly}
        case 'SET_MY_MR':
            return {...state, mr_mine: action.payload}
        case ADD_MERGE_REQUEST:
            return {...state, mr_mine: [...state.mr_mine, action.payload]}
        case 'SET_MR_FOR_ME':
            return {...state, mr_for_me: action.payload}
        case 'SET_GITLAB_ISSUES':
            return {...state, issues: action.payload}
        case 'ADD_GITLAB_ISSUE':
            return {...state, issues: [...state.issues, action.payload]}
        case 'DELETE_GITLAB_ISSUE':
            return {
                ...state,
                issues: state.issues.reduce((result, issue) => {
                    if (issue.iid !== action.payload.iid) {
                        result.push(issue)
                    }
                    return result
                }, []),
            }
        case 'UPDATE_GITLAB_ISSUE':
            return {
                ...state,
                issues: state.issues.map(issue => {
                    return (issue.iid === action.payload.iid) ? {
                        ...issue,
                        ...action.payload,
                    } : issue
                }),
            }
        default:
            return state
    }
}