import React from 'react'
import Link from 'next/link'

import Auth from '../components/Auth'
import Layout from '../components/Layout'
import CommonTasks from '../components/CommonTasks'
import Card from '../components/Card'

import Users from '../modules/Users'

import { systems } from '../consts'
import { REST, GitLab, Redmine } from '../apiController'
import { nextConnect } from '../store'
import { fetchRmIssues, fetchGitlabIssues, toggleMyTasksOnly, logUser } from '../redux/actions'

//import simpleGit from 'simple-git'

class Index extends React.Component {
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
			return
		}

		const { dispatch, auth } = this.props

		if (auth.isLogged) {
			const userRmId = Users.getUserById(auth.user.id).ids.rm

			return REST.rm(`issues/${rmId}.json`, () => dispatch(fetchRmIssues(userRmId)), 'PUT', {
				issue: {
					assigned_to_id : userRmId,
				}
			})
		}
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
			return alert('Error: no GitLab Issue found. You must create it first')
		}

		const { dispatch, auth } = this.props

		if (auth.isLogged) {
			const userGlId = Users.getUserById(auth.user.id).ids.gl

			return REST.gl(`projects/${systems.gitlab.projectId}/issues/${gitlabIssue.iid}`, () => dispatch(fetchGitlabIssues()), 'PUT', {
				assignee_id: userGlId,
			})
		}
	}


	render() {
		const { dispatch, gitlabIssues, issues, boards, myTasksOnly, auth } = this.props

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
							{Users && Users.users.map((person) => (
								<option key={person.id} value={person.id}>{person.name}</option>
							))}
						</select>
					</h2>

					<CommonTasks/>

					<div style={{ float: 'left', width: '49%' }}>
						<h2>Redmine tasks:</h2>
						<ol>
							{issues && issues.map((issue) => (
								<li key={issue.id}>
									<Link as={`/task/${issue.id}`} href={`/task?id=${issue.id}`}>
										<a>{issue.id} {issue.subject}</a>
									</Link><br/>
									<small onClick={() => GitLab.createIssueFromRm(dispatch, user.ids.gl, boards, issue)} title="Create GitLab issue from this one" style={{ marginLeft: 10, textDecoration: 'underline', cursor: 'pointer' }}>create</small>
									<small onClick={() => this.pingMeGitlabIssue(issue)} title="Ping GitLab issue to myself" style={{ marginLeft: 10, textDecoration: 'underline', cursor: 'pointer' }}>ping</small>
									<a href={`${systems.redmine.issueUrl}${issue.id}`} target="_blank" style={{ marginLeft: 10 }}><img src="../static/images/rm.png" alt="Redmine Issue" width={20}/></a>
								</li>
							))}
						</ol>
					</div>
					<div id="gitlabWrapper" style={{ float: 'left', width: '49%' }}>
						<h2>
							<a href={`http://gitlab.dev.footshop.cz/footshop/footshop-ng/boards`} target="_blank">Gitlab board:</a>
							<button style={{ marginLeft: 10 }} onClick={ () => this.props.dispatch(toggleMyTasksOnly()) }>{myTasksOnly ? `All tasks` : `My tasks only`}</button>
						</h2>
						<div ref={elm => this.gitlabEditWrapper = elm} style={{ display: 'none' }}>
							<button style={{ float: `right` }} onClick={() => this.gitlabEditWrapper.style.display = 'none'}>x</button>
							<p>Editing: <span ref={elm => this.gitlabEditHeading = elm}></span></p>
							<input type="hidden" ref={elm => this.gitlabEdit = elm}/>
							<input type="hidden" ref={elm => this.gitlabEditLabels = elm}/>
							<p ref={elm => this.gitlabEditRedmine = elm}>...</p>
							<p>Board: <select ref={elm => this.gitlabEditSelect = elm}>
								{boards.map(board => (
									<option key={board.id} value={board.label.name}>{board.label.name}</option>
								))}
							</select></p>
							<p>Assign to: <select ref={elm => this.gitlabEditUser = elm}>
								{systems.gitlab.users.map(person => (
									<option key={person.id} value={person.id}>{person.name}</option>
								))}
							</select></p>
							<textarea ></textarea>
							<button onClick={() => GitLab.updateIssue(this.props.dispatch, this.gitlabEditWrapper, this.gitlabEdit.value, this.gitlabEditLabels.value, this.gitlabEditSelect.value, this.gitlabEditUser.value)}>Update</button>
							<button onClick={() => GitLab.closeIssue(this.props.dispatch, this.gitlabEditWrapper, this.gitlabEdit.value)}>Close</button>
						</div>
						<ol style={{ backgroundColor: '#333', padding: 20 }}>
							{boards && boards.map((board, i) => (
								<li key={i} style={{ color: board.label.color }}>
									<span style={{ cursor: 'pointer' }} onClick={() => (this[`list${i}`].style.display = this[`list${i}`].style.display == 'none' ? 'block' : 'none')}>{board.label.name}</span>
									<ol ref={elm => this[`list${i}`] = elm}>
										{gitlabIssues && gitlabIssues.length && gitlabIssues.map(issue => {
											let showTask = true

											if (issue.labels.indexOf(board.label.name) === -1) {
												showTask = false
											}
											if (myTasksOnly && (!issue.assignee || issue.assignee.id !== user.ids.gl)) {
												showTask = false
											}

											return showTask ? (
												<li key={issue.id}>
													<a href="#" onClick={e => {
														e.preventDefault()
														GitLab.editIssue(issue, boards, {
															gitlabEditWrapper: this.gitlabEditWrapper,
															gitlabEditLabels: this.gitlabEditLabels,
															gitlabEdit: this.gitlabEdit,
															gitlabEditHeading: this.gitlabEditHeading,
															gitlabEditRedmine: this.gitlabEditRedmine,
															gitlabEditUser: this.gitlabEditUser,
															gitlabEditSelect: this.gitlabEditSelect,
														})
														location.href = '#gitlabWrapper'
													}}>{issue.iid} - {issue.title}</a><br/>
													{issue.assignee ? <img src={issue.assignee.avatar_url} alt={issue.assignee.name} title={`Assigned to ${issue.assignee.name}`} style={{ width: 30, display: 'inline-block', borderRadius: '50%', verticalAlign: `middle` }} /> : ``}
													{issue.labels.indexOf('Frontend') >=0 ?
														<span style={{ backgroundColor: `#44ad8e`, color: `#fff`, display: `inline-block`, width: 25, height: 25, marginLeft: 10, textAlign: `center`, borderRadius: `50%`, verticalAlign: `middle` }}>F</span>
														: ``
													}
													{issue.labels.indexOf('Backend') >= 0 ?
														<span style={{ backgroundColor: `#d1d100`, color: `#fff`, display: `inline-block`, width: 25, height: 25, marginLeft: 10, textAlign: `center`, borderRadius: `50%`, verticalAlign: `middle` }}>B</span>
														: ``
													}
													&nbsp;<small onClick={() => Redmine.createIssueFromGl(dispatch, user.ids.rm, issue)} title="Create Redmine issue from this one" style={{ textDecoration: 'underline', cursor: 'pointer' }}>create</small>
													&nbsp;<small onClick={() => this.pingMeRMIssue(issue)} title="Ping Redmine issue to myself" style={{ textDecoration: 'underline', cursor: 'pointer' }}>ping</small>
													<a href={`${systems.gitlab.issueUrl}${issue.iid}`} target="_blank" style={{ marginLeft: 10 }}><img src="../static/images/gl.png" alt="GitLab Issue" width={20}/></a>
												</li>
											) : false
										})}
									</ol>
								</li>
							))}
						</ol>
					</div>
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