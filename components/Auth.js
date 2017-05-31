import { Component } from 'react'
import { connect } from 'react-redux'

class Auth extends Component {

	_signIn () {
		console.log(this.props.auth);
	}

	render () {
		return this.props.auth.user ? (
			<button>Log out</button>
		) : (
			<div>
				<p><strong>Sign in:</strong></p>
				<input ref={elm => this.userName = elm} type="text" placeholder="Name" />
				<input ref={elm => this.userPassword = elm} type="password" placeholder="Password" />
				<button onClick={() => this._signIn()}>Sign in</button>
			</div>
		)
	}
}


export default connect(state => ({
	auth: state.auth
}))(Auth)
