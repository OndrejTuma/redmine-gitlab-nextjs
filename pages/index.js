import React, { Component } from 'react'
import Link from 'next/link'

import Auth from '../components/Auth'
import Layout from '../components/Layout'
import CommonTasks from '../components/CommonTasks'

import Users from '../modules/Users'

import { systems, users } from '../consts'
import { GitLab, Redmine } from '../apiController'
import { nextConnect } from '../store'
import { fetchRmIssues, fetchGitlabIssues, toggleMyTasksOnly, logUser, updateGitlabIssue, updateRedmineIssue, fetchRmIssue } from '../redux/actions'

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

	/**
	 * Pings Redmine issue to current user
	 * @param glIssue - GitLab issue
	 * @returns {*}
	 */
	pingMeRMIssue (glIssue) {
		const rmId = Redmine.findId(glIssue.title)

		if (!rmId) {
			return alert('No Redmine Issue found. Create it first')
		}

		const { dispatch, auth } = this.props
		const userRmId = Users.getUserById(auth.user.id).ids.rm

		return dispatch(updateRedmineIssue(rmId, userRmId, {
			issue: {
				assigned_to_id : userRmId,
			}
		}, () => dispatch(fetchRmIssue(rmId))))
	}
	/**
	 * Pings GitLab issue to current user
	 * @param rmIssue - Redmine issue
	 * @returns {*}
	 */
	pingMeGitlabIssue (rmIssue) {
		const { gitlabIssues } = this.props

		let gitlabIssue = GitLab.findIssueById(rmIssue.id, gitlabIssues)

		if (!gitlabIssue) {
			return alert('No GitLab Issue found. Create it first')
		}

		const { dispatch, auth } = this.props

		return dispatch(updateGitlabIssue(gitlabIssue.iid, {
			assignee_id: Users.getUserById(auth.user.id).ids.gl,
		}))
	}


	render() {
		const { dispatch, auth } = this.props

		if (auth.isLogged) {
			const user = Users.getUserById(auth.user.id)

			return (
				<Layout>
					<p style={{ float: 'left' }}>
						<button onClick={() => {
							dispatch(fetchRmIssues(Users.getUserById(auth.user.id).ids.rm))
							dispatch(fetchGitlabIssues())
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