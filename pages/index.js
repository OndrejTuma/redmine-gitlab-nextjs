import React from 'react'
import Link from 'next/link'
import getSlug from 'speakingurl'
import copy from 'copy-to-clipboard'

import Layout from '../components/Layout'
import Auth from '../components/Auth'

import Users from '../modules/Users'

import { systems, statuses } from '../consts'
import { REST, GitLab, Redmine, Boards } from '../apiController'
import { nextConnect } from '../store'
import { addIssue, addGitlabIssue, fetchRmIssues, fetchGitlabIssues, toggleMyTasksOnly, logUser } from '../redux/actions'

//import simpleGit from 'simple-git'

class Index extends React.Component {
	componentDidMount () {
		//const { dispatch } = this.props

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

	_closeCommonTask () {
		const { dispatch, auth } = this.props
		const user = Users.getUserById(auth.user.id)

		GitLab.closeIssue(dispatch, this.gitlabEditWrapper, this.cmnGitlabId.value)
		Redmine.closeIssue(dispatch, user.ids.rm, this.cmnWrapper, this.cmnRedmineId.value)
	}
	_copyElement (elm, text) {
		let prevText = elm.innerHTML

		copy(text)
		elm.innerHTML = 'copied'
		setTimeout(() => {
			elm.innerHTML = prevText
		}, 3000)
	}
	_editCommonTask (commonTask) {
		const { boards } = this.props
		const taskBoard = Boards.getBoardByTaskLabels(commonTask.gitlab.labels, boards)

		this.cmnWrapper.style.display = 'block'
		this.cmnHeading.innerHTML = commonTask.redmine.subject
		this.cmnGitlabLabels.value = Boards.getNonBoardLabels(commonTask.gitlab.labels, boards).join(',')
		this.cmnRedmineId.value = commonTask.redmine.id
		this.cmnGitlabId.value = commonTask.gitlab.iid
		this.cmnState.value = taskBoard.id
		if (commonTask.gitlab.assignee) {
			this.cmnAssignTo.value = commonTask.gitlab.assignee.id
		}
	}

	/**
	 * iterates through Redmine issues and then filters GitLab issues, who has Redmine ID in its name
	 * @returns {*}
	 * @private
	 */
	_findCommonTasks () {
		const { issues, gitlabIssues } = this.props

		let issueIds = issues.map((issue) => {
			return issue.id
		})

		return gitlabIssues.reduce((result, issue) => {
			let rmId = Redmine.findId(issue.title)
			if (issueIds.indexOf(rmId) > -1) {
				result[rmId] = {
					redmine: Redmine.getIssue(issues, rmId),
					gitlab: issue,
				}
			}
			return result
		}, {})
	}

	/**
	 * updates Redmine and GitLab task 
	 * @private
	 */
	_updateCommonTask () {
		const { dispatch, auth } = this.props
		const assignee = Users.getUserById(this.cmnAssignTo.value)
		const user = Users.getUserById(auth.user.id)
		let rmStatusId
		for (let key in statuses) {
			if (statuses.hasOwnProperty(key) && statuses[key].gl === parseInt(this.cmnState.value)) {
				rmStatusId = statuses[key].rm
				break
			}
		}

		GitLab.updateIssue(
			dispatch,
			this.gitlabEditWrapper,
			this.cmnGitlabId.value,
			this.cmnGitlabLabels.value,
			this.cmnState[this.cmnState.selectedIndex].text,
			assignee.ids.gl,
			this.cmnComment.value
		)
		Redmine.updateIssue(
			dispatch,
			user.ids.rm,
			{
				cmnWrapper: this.cmnWrapper,
				cmnComment: this.cmnComment
			},
			this.cmnRedmineId.value,
			rmStatusId,
			assignee.ids.rm,
			this.cmnComment.value
		)
	}

	/**
	 * adds issue in Redmine and GitLab, fill name, description (and labels for GitLab) and assign it to current user
	 */
	newCommonTask () {
		const { dispatch } = this.props
		const assignee = Users.getUserById(this.newAssignee.value)

		REST.rm(`issues.json`, data => {
			dispatch(addIssue(data.issue))
			REST.gl(`projects/${systems.gitlab.projectId}/issues`, data => {
				this.newWrapper.style.display= 'none'
				this.newDescription.value = ''
				this.newTitle.value = ''
				dispatch(addGitlabIssue(data))
			}, 'POST', {
				labels: 'To Do,' + (assignee.ids.gl === 4 ? 'Frontend' : 'Backend'),
				assignee_id: assignee.ids.gl,
				title: `${data.issue.id} - ${this.newTitle.value}`,
				description: this.newDescription.value,
			})
		}, 'POST', {
			issue: {
				project_id: systems.redmine.projectId,
				status_id: 4, // ceka se
				subject: this.newTitle.value,
				description: this.newDescription.value,
				assigned_to_id: assignee.ids.rm,
			}
		})
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
			return alert('Error: no GitLab Issue found')
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

		let commonTasks = this._findCommonTasks()

		if (auth.isLogged) {
			const user = Users.getUserById(auth.user.id)

			return (<Layout>
				<p style={{ float: 'left' }}>
					<button onClick={() => {
						dispatch(fetchRmIssues(Users.getUserById(auth.user.id).ids.rm))
						dispatch(fetchGitlabIssues())
					}}>Refresh tasks</button>
					<button onClick={() => {
						this.newWrapper.style.display = 'block'
						this.newAssignee.value = auth.user.id
					}}>New task</button>
				</p>
				<div ref={elm => this.newWrapper = elm} style={{ display: 'none', clear: 'both' }}>
					<button style={{ float: 'right' }} onClick={() => this.newWrapper.style.display = 'none'}>x</button>
					<input type="text" ref={elm => this.newTitle = elm} placeholder={`Issue title`} />
					<br/>
					<textarea ref={elm => this.newDescription = elm} placeholder={`Issue description`} ></textarea>
					<br/>
					Assign to: <select ref={elm => this.newAssignee = elm} defaultValue={auth.user.id}>
					{Users && Users.users.map((person) => (
						<option key={person.id} value={person.id}>{person.name}</option>
					))}
				</select>
					<button onClick={() => this.newCommonTask()}>Create</button>
				</div>
				<h2  style={{ clear: 'both' }}>
					User:&nbsp;
					<select ref={select => this.select = select } onChange={() => dispatch(logUser('', '', this.select.value))} defaultValue={auth.user.id}>
						{Users && Users.users.map((person) => (
							<option key={person.id} value={person.id}>{person.name}</option>
						))}
					</select>
				</h2>
				<div>
					<h2>Common tasks:</h2>
					<div ref={elm => this.cmnWrapper = elm} style={{ display: 'none' }}>
						<p style={{ float: `right` }}>
							<button onClick={() => this.cmnWrapper.style.display = 'none'}>x</button>
						</p>
						<p>Editing: <span ref={elm => this.cmnHeading = elm}></span></p>
						<input type="hidden" ref={elm => this.cmnGitlabLabels = elm}/>
						<input type="hidden" ref={elm => this.cmnRedmineId = elm}/>
						<input type="hidden" ref={elm => this.cmnGitlabId = elm}/>
						Set state: <select ref={elm => this.cmnState = elm}>
						{boards && boards.map((board, i) => (
							<option key={i} value={board.id}>{board.label.name}</option>
						))}
					</select>
						<p>Assign to: <select ref={elm => this.cmnAssignTo = elm} defaultValue={user.id}>
							{Users && Users.users.map(person => (
								<option key={person.id} value={person.id}>{person.name}</option>
							))}
						</select></p>
						<textarea ref={elm => this.cmnComment = elm}></textarea>
						<br/>
						<button onClick={() => this._updateCommonTask()}>Update task</button>
						<button onClick={() => this._closeCommonTask()}>Close task</button>
					</div>
					<ol>
						{commonTasks && Object.keys(commonTasks).map(key => (
							<li key={key}>
								<a href="#" onClick={() => this._editCommonTask(commonTasks[key])}>{commonTasks[key].redmine.subject}</a> <small>({commonTasks[key].gitlab.iid} - {key})</small><br/>
								<button style={{ marginRight: 10 }} href="#" onClick={(e) => {
									this._copyElement(e.target, `feature/${commonTasks[key].gitlab.iid}-${commonTasks[key].redmine.id}-${getSlug(commonTasks[key].redmine.subject)}`)
								}}>copy branch name</button>
								<button style={{ marginRight: 10 }} href="#" onClick={(e) => {
									this._copyElement(e.target, `${commonTasks[key].redmine.subject} - ${systems.redmine.url}issues/${commonTasks[key].redmine.id}`)
								}}>copy timedoctor task</button>
								<button style={{ marginRight: 10 }} onClick={() => {
									let url = `${systems.gitlab.projectUrl}merge_requests/new?merge_request[source_project_id]=${systems.gitlab.projectId}&merge_request[source_branch]=feature/${commonTasks[key].gitlab.iid}-${commonTasks[key].redmine.id}-${getSlug(commonTasks[key].redmine.subject)}&merge_request[target_project_id]=${systems.gitlab.projectId}&merge_request[target_branch]=staging`
									window.open(url,'_blank')
									//window.location.href = url
								}}>merge to stage</button>
								<Link as={`/task/${key}`} href={`/task?id=${key}`}><a style={{ marginRight: 10 }}>rm</a></Link>
								<a style={{ marginRight: 10 }} href={`${systems.redmine.url}issues/${key}`} target="_blank">
									<img src="../static/images/rm.png" alt="Redmine" width={20}/>
								</a>
								<a style={{ marginRight: 10 }} href={`${systems.gitlab.issueUrl}${commonTasks[key].gitlab.iid}`} target="_blank">
									<img src="../static/images/gl.png" alt="GitLab" width={20}/>
								</a>
							</li>
						))}
					</ol>
				</div>
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
			</Layout>)
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