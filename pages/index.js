import React, { Component } from 'react'

import Auth from '../components/Auth'
import Layout from '../components/Layout'
import CommonTasks from '../components/CommonTasks'

import Users from '../modules/Users'

import { users } from '../consts'
import { GitLab, Redmine } from '../apiController'
import { nextConnect } from '../store'
import { fetchRmIssues, logUser } from '../redux/actions'

//import simpleGit from 'simple-git'

class Index extends Component {
	componentDidMount () {
		/* potrebuju si vytvorit novy projekt (intergrace) - potrebuju admin prava
		restFetch(`${systems.timedoctor.url}companies/${systems.timedoctor.companyId}/users/${systems.timedoctor.users[0].id}/tasks?access_token=${systems.timedoctor.auth}`, (data) => {
			console.log('task created', data)
		}, 'POST', {
			task: {
				task_name: 'Testíček',
				project_id: systems.timedoctor.projectId2,
				user_id: systems.timedoctor.users[0].id,
			}
		})
		*/
	}

	render() {
		const { dispatch, auth } = this.props

		if (auth.isLogged) {
			return (
				<Layout>
					<p style={{ float: 'left' }}>
						<button onClick={() => {
							dispatch(fetchRmIssues(Users.getUserById(auth.user.id).ids.rm))
						}}>Refresh tasks</button>
					</p>
					<h2 style={{ clear: 'both' }}>
						User:&nbsp;
						<select ref={select => this.select = select } onChange={() => dispatch(logUser('', '', this.select.value))} defaultValue={auth.user.id}>
							{users && users.map((person) => (
								<option key={person.id} value={person.id}>{person.name}</option>
							))}
						</select>
					</h2>

					<CommonTasks/>
				</Layout>
			)
		}

		return <Auth />
	}
}

export default nextConnect(state => ({
	auth: state.auth,
	boards: state.gitlab.boards,
	gitlabIssues: state.gitlab.issues,
	issues: state.redmine.issues,
	myTasksOnly: state.gitlab.myTasksOnly,
	selectedUserId: state.global.selectedUserId,
}))(Index)