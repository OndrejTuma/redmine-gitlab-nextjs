import React, {Component} from 'react'

import Auth from '../components/Auth'
import Layout from '../components/Layout'
import CommonTasks from '../components/CommonTasks'
import MergeRequestBlock from '../components/MergeRequestBlock/index'

import Users from '../modules/Users'

import {users} from '../consts'
import {GitLab, Redmine} from '../apiController'
import {nextConnect} from '../store'
import {fetchRmIssues, logUser, setMergeRequests, setMergeRequestAssignedToMe} from '../redux/actions'

//import simpleGit from 'simple-git'

class Index extends Component {
	render() {
		const {dispatch, auth} = this.props

		if (auth.isLogged) {
			return (
				<Layout>
					<p style={{float: 'left'}}>
						<button onClick={() => {
							const user = Users.getUserById(auth.user.id)
							dispatch(fetchRmIssues(user.ids.rm))
							dispatch(setMergeRequests(user.ids.gl))
							dispatch(setMergeRequestAssignedToMe(user.ids.gl))
						}}>Refresh tasks
						</button>
					</p>
					<MergeRequestBlock/>
					<h2 style={{clear: 'both'}}>
						User:&nbsp;
						<select ref={select => this.select = select}
								onChange={() => dispatch(logUser('', '', this.select.value))}
								defaultValue={auth.user.id}>
							{users && users.map((person) => (
								<option key={person.id} value={person.id}>{person.name}</option>
							))}
						</select>
					</h2>

					<CommonTasks/>
				</Layout>
			)
		}

		return <Auth/>
	}
}

export default nextConnect(state => ({
	auth: state.auth,
	boards: state.gitlab.boards,
	issues: state.redmine.issues,
	myTasksOnly: state.gitlab.myTasksOnly,
	selectedUserId: state.global.selectedUserId,
}))(Index)