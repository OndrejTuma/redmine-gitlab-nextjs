import {combineReducers} from 'redux'

import authReducer from './reducers/auth'
import gitlabReducer from './reducers/gitlab'
import globalReducer from './reducers/global'
import formReducer from './reducers/form'
import redmineReducer from './reducers/redmine'

export default combineReducers({
    auth: authReducer,
    global: globalReducer,
    redmine: redmineReducer,
    gitlab: gitlabReducer,
    forms: formReducer,
})