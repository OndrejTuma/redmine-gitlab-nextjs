import nextConnectRedux from 'next-connect-redux'
import { createStore, applyMiddleware } from 'redux'
import { createLogger } from 'redux-logger'
import thunkMiddleware from 'redux-thunk'

import reducer from './redux/reducers'

const loggerMiddleware = createLogger()
const initStore = (initialState) => {
	return createStore(
		reducer,
		initialState,
		applyMiddleware(thunkMiddleware, loggerMiddleware)
	)
}


export const nextConnect = nextConnectRedux(initStore)