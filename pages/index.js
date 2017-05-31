import React from 'react'
import Link from 'next/link'
import getSlug from 'speakingurl'

import Layout from '../components/Layout'

import { mapGitlabStatusToRedmine, systems } from '../consts'
import { REST, GitLab, Redmine, Boards } from '../apiController'
import { nextConnect } from '../store'
import { setUser, fetchIssues, setBoards, fetchGitlabIssues, toggleMyTasksOnly, setGitlabUser } from '../redux/actions'

//import simpleGit from 'simple-git'

class Index extends React.Component {
	componentDidMount () {
		const { dispatch, userId } = this.props

		dispatch(fetchIssues(userId))
		dispatch(setBoards())
		dispatch(fetchGitlabIssues())

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

	closeCommonTask () {
		const { dispatch, userId } = this.props
		GitLab.closeIssue(dispatch, this.gitlabEditWrapper, this.cmnGitlabId.value)
		Redmine.closeIssue(dispatch, userId, this.cmnWrapper, this.cmnRedmineId.value)
	}
	_editCommonTask (commonTask) {
		const taskBoard = Boards.getBoardByTaskLabels(commonTask.gitlab.labels, this.props.boards)

		this.cmnWrapper.style.display = 'block'
		this.cmnHeading.innerHTML = commonTask.redmine.subject
		this.cmnGitlabLabels.value = Boards.getNonBoardLabels(commonTask.gitlab.labels, this.props.boards).join(',')
		this.cmnRedmineId.value = commonTask.redmine.id
		this.cmnGitlabId.value = commonTask.gitlab.iid
		this.cmnState.value = mapGitlabStatusToRedmine[taskBoard.id] ? mapGitlabStatusToRedmine[taskBoard.id] : this.cmnState.value
		this.cmnAssignTo.value = commonTask.gitlab.assignee.id
	}
	_findCommonTasks () {
		const { issues, gitlabIssues } = this.props

		let issueIds = issues.reduce((result, issue) => {
			result.push(issue.id)
			return result
		}, [])

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
	newCommonTask () {
		const { dispatch, userId } = this.props

		REST.rm(`issues.json`, data => {

			REST.gl(`projects/${systems.gitlab.projectId}/issues`, () => {
				this.newWrapper.style.display= 'none'
				this.newDescription.value = ''
				this.newTitle.value = ''
				dispatch(fetchIssues(userId))
				dispatch(fetchGitlabIssues())
			}, 'POST', {
				labels: 'To Do,' + (parseInt(this.newAssignee.value) === 129 ? 'Frontend' : 'Backend'),
				assignee_id: GitLab.getUserById(this.newAssignee.value, systems.redmine.users, systems.gitlab.users).id,
				title: `${data.issue.id} - ${this.newTitle.value}`,
				description: this.newDescription.value,
			})
		}, 'POST', {
			issue: {
				project_id: systems.redmine.projectId,
				status_id: 4, // ceka se
				subject: this.newTitle.value,
				description: this.newDescription.value,
				assigned_to_id: this.newAssignee.value,
			}
		})
	}

	/**
	 * Pings Redmine issue to current user
	 * @param issue - GitLab issue
	 * @returns {*}
	 */
	pingMeRMIssue (issue) {
		const rmId = Redmine.findId(issue.title)

		if (!rmId) {
			return
		}

		const { dispatch, userId } = this.props

		return REST.rm(`issues/${rmId}.json`, () => dispatch(fetchIssues(userId)), 'PUT', {
			issue: {
				assigned_to_id : userId,
			}
		})
	}
	/**
	 * Pings GitLab issue to current user
	 * @param issue - Redmine issue
	 * @returns {*}
	 */
	pingMeGitlabIssue (issue) {
		let gitlabIssue = GitLab.findIssue(issue.id)

		if (!gitlabIssue) {
			return alert('Error: no GitLab Issue found')
		}

		const { gitlabUserId, dispatch } = this.props

		return REST.gl(`projects/${systems.gitlab.projectId}/issues/${gitlabIssue.iid}`, () => dispatch(fetchGitlabIssues()), 'PUT', {
			assignee_id: gitlabUserId,
		})
	}
	updateCommonTask () {
		const { dispatch, userId } = this.props
		const rmUserId = Redmine.getUserByGlUserId(this.cmnAssignTo.value, systems.redmine.users, systems.gitlab.users)
		GitLab.updateIssue(this.props.dispatch, this.gitlabEditWrapper, this.cmnGitlabId.value, this.cmnGitlabLabels.value, this.cmnState[this.cmnState.selectedIndex].text, this.cmnAssignTo.value, this.cmnComment.value)
		Redmine.updateIssue(
			dispatch,
			userId,
				{
					cmnWrapper: this.cmnWrapper,
					cmnComment: this.cmnComment
				},
			this.cmnRedmineId.value,
			this.cmnState.value,
			rmUserId.id,
			this.cmnComment.value
		)
	}


	render() {
		const { dispatch, gitlabIssues, userId, gitlabUserId, issues, boards, myTasksOnly } = this.props

		let commonTasks = this._findCommonTasks()

		return (
			<Layout>
				<h2>
					User:&nbsp;
					<select ref={select => this.select = select } onChange={() => {
						dispatch(setUser(this.select.value))
						let gitlabUser = GitLab.getUserById(this.select.value, systems.redmine.users, systems.gitlab.users)
						dispatch(setGitlabUser(gitlabUser.id))
						dispatch(fetchGitlabIssues())
						dispatch(fetchIssues(this.select.value))
					}} value={userId}>
						{systems.redmine.users && systems.redmine.users.map((person) => (
							<option key={person.id} value={person.id}>{person.name}</option>
						))}
					</select>
				</h2>
				<p><button onClick={() => this.newWrapper.style.display = 'block'}>New task</button></p>
				<div ref={elm => this.newWrapper = elm} style={{ display: 'none' }}>
					<button style={{ float: 'right' }} onClick={() => this.newWrapper.style.display = 'none'}>x</button>
					<input type="text" ref={elm => this.newTitle = elm} placeholder={`Issue title`} />
					<br/>
					<textarea ref={elm => this.newDescription = elm} placeholder={`Issue description`} ></textarea>
					<br/>
					Assign to: <select ref={elm => this.newAssignee = elm} defaultValue={userId}>
						{systems.redmine.users && systems.redmine.users.map((person) => (
							<option key={person.id} value={person.id}>{person.name}</option>
						))}
					</select>
					<button onClick={() => this.newCommonTask()}>Create</button>
				</div>
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
								<option key={i} value={mapGitlabStatusToRedmine[board.id] ? mapGitlabStatusToRedmine[board.id] : 0}>{board.label.name}</option>
							))}
						</select>
						<p>Assign to: <select ref={elm => this.cmnAssignTo = elm}>
							{systems.gitlab.users.map(person => (
								<option key={person.id} value={person.id}>{person.name}</option>
							))}
						</select></p>
						<textarea ref={elm => this.cmnComment = elm}></textarea>
						<br/>
						<button onClick={() => this.updateCommonTask()}>Update task</button>
						<button onClick={() => this.closeCommonTask()}>Close task</button>
					</div>
					<ol>
						{commonTasks && Object.keys(commonTasks).map(key => (
							<li key={key}>
								<a href="#" onClick={() => this._editCommonTask(commonTasks[key])}>{commonTasks[key].redmine.subject}</a> <small>({commonTasks[key].gitlab.iid} - {key})</small><br/>
								<a style={{ marginRight: 10 }} href="#" onClick={(e) => {
									e.preventDefault()
									let branch = `feature/${commonTasks[key].gitlab.iid}-${commonTasks[key].redmine.id}-${getSlug(commonTasks[key].redmine.subject)}`
									this.code.innerHTML = `git fetch\ngit checkout -b ${branch} origin/production\ngit push --set-upstream origin ${branch}`
									this.codeWrapper.style.display = 'block'
								}}>create branch</a>
								<a style={{ marginRight: 10 }} href="#" onClick={(e) => {
									e.preventDefault()
									this.codeTDTaskWrapper.style.display = 'block'
									this.codeTDTask.innerHTML = `${commonTasks[key].redmine.subject} - ${systems.redmine.url}issues/${commonTasks[key].redmine.id}`
								}}>create timedoctor task</a>
								<Link as={`/task/${key}`} href={`/task?id=${key}`}><a style={{ marginRight: 10 }}>rm</a></Link>
								<a style={{ marginRight: 10 }} href={`${systems.redmine.url}issues/${key}`} target="_blank">
									<img src="../static/images/rm.png" alt="Redmine" width={20}/>
								</a>
								<a style={{ marginRight: 10 }} href={`http://gitlab.dev.footshop.cz/footshop/footshop-ng/issues/${commonTasks[key].gitlab.iid}`} target="_blank">
									<img src="../static/images/gl.png" alt="GitLab" width={20}/>
								</a>
							</li>
						))}
					</ol>
				</div>
				<div ref={elm => this.codeTDTaskWrapper = elm} style={{ display: 'none' }}>
					<button onClick={() => this.codeTDTaskWrapper.style.display = 'none'}>x</button>
					<pre style={{ backgroundColor: '#ccc', borderRadius: 5, padding: 10 }}><code ref={elm => this.codeTDTask = elm}></code></pre>
				</div>
				<div ref={elm => this.codeWrapper = elm} style={{ display: 'none' }}>
					<button onClick={() => this.codeWrapper.style.display = 'none'}>x</button>
					<pre style={{ backgroundColor: '#ccc', borderRadius: 5, padding: 10 }}	><code ref={elm => this.code = elm}></code></pre>
				</div>
				<div style={{ float: 'left', width: '49%' }}>
					<h2>Redmine tasks:</h2>
					<ol>
						{issues && issues.map((issue) => (
							<li key={issue.id}>
								<Link as={`/task/${issue.id}`} href={`/task?id=${issue.id}`}>
									<a>{issue.id} {issue.subject}</a>
								</Link><br/>
								<small onClick={() => GitLab.createIssueFromRm(dispatch, gitlabUserId, boards, issue)} title="Create GitLab issue from this one" style={{ marginLeft: 10, textDecoration: 'underline', cursor: 'pointer' }}>create</small>
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
										if (myTasksOnly && (!issue.assignee || issue.assignee.id !== gitlabUserId)) {
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
												&nbsp;<small onClick={() => Redmine.createIssueFromGl(dispatch, issue)} title="Create Redmine issue from this one" style={{ textDecoration: 'underline', cursor: 'pointer' }}>create</small>
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
}

export default nextConnect(state => ({
	userId: state.global.userId,
	gitlabUserId: state.global.gitlabUserId,
	issues: state.redmine.issues,
	gitlabIssues: state.gitlab.issues,
	boards: state.gitlab.boards,
	myTasksOnly: state.gitlab.myTasksOnly,
}))(Index)