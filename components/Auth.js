import { Component } from 'react'
import { connect } from 'react-redux'

import { logUser, logOutUser, fetchRmIssues, setBoards, fetchGitlabIssues } from '../redux/actions'
import Users from '../modules/Users'

class Auth extends Component {

	_logIn () {
		const { dispatch } = this.props

		dispatch(logUser(this.userName.value, this.userPassword.value))
	}
	_logOut () {
		this.props.dispatch(logOutUser())
	}

	render () {
		const { auth: { isLogged, user } } = this.props

		return isLogged ? (
			<button onClick={() => this._logOut()}>
				Log out {Users.getUserById(user.id).name}
			</button>
		) : (
			<div>
				<p style={{ textAlign: 'center', fontSize: '1.5em' }}><strong>You must be logged in</strong></p>
				<p><strong>Sign in:</strong></p>
				<input ref={elm => this.userName = elm} type="text" placeholder="Name" />
				<input ref={elm => this.userPassword = elm} type="password" placeholder="Password" />
				<button onClick={() => this._logIn()}>Log in</button>
			</div>
		)
	}
}


export default connect(state => ({
	auth: state.auth
}))(Auth)
