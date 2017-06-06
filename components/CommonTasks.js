import { Component } from 'react'
import { connect } from 'react-redux'
import Link from 'next/link'
import getSlug from 'speakingurl'
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext, DragSource, DropTarget } from 'react-dnd'

import { GitLab, Redmine, Boards } from '../apiController'
import Users from '../modules/Users'

import { systems, statuses } from '../consts'
import { addIssue, addGitlabIssue } from '../redux/actions'

class CommonTasks extends Component {
	_closeCommonTask () {
		const { dispatch, auth } = this.props
		const user = Users.getUserById(auth.user.id)

		GitLab.closeIssue(dispatch, this.gitlabEditWrapper, this.cmnGitlabId.value)
		Redmine.closeIssue(dispatch, user.ids.rm, this.cmnWrapper, this.cmnRedmineId.value)
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
	 * adds issue in Redmine and GitLab, fill name, description (and labels for GitLab) and assign it to current user
	 */
	newCommonTask () {
		const { dispatch, auth } = this.props
		const assignee = Users.getUserById(auth.user.id)

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

	render () {
		const { auth, boards } = this.props

		let commonTasks = this._findCommonTasks()

		const user = Users.getUserById(auth.user.id)

		return (
			<TaskBoards>
				<h2>Common tasks:</h2>
				<div ref={elm => this.cmnWrapper = elm} style={{ display: 'none' }}>
					<p style={{ float: `right` }}>
						<button onClick={() => this.cmnWrapper.style.display = 'none'}>x</button>
					</p>
					<p>Editing: <span ref={elm => this.cmnHeading = elm}></span></p>
					<input type="hidden" ref={elm => this.cmnGitlabLabels = elm}/>
					<input type="hidden" ref={elm => this.cmnRedmineId = elm}/>
					<input type="hidden" ref={elm => this.cmnGitlabId = elm}/>
					Set state:  <select ref={elm => this.cmnState = elm}>
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
				{boards && commonTasks && boards.map(board => (
					<ul key={board.label.name} style={{ listStyle: 'none' }}>
						<li>
							<strong>{board.label.name}</strong>
							<Board name={board.label.name} tasks={commonTasks} />
						</li>
					</ul>
				))}
			</TaskBoards>
		)
	}
}
const TaskBoards = DragDropContext(HTML5Backend)(({ children }) => (
	<div className="common-tasks">
		{children}
	</div>
))
const ItemTypes = {
	BOARD: 'board'
}
const BoardItem = DragSource(ItemTypes.BOARD, {
	beginDrag(props) {
		console.log('beginDrag',props);
		return {};
	},
}, (connect, monitor) => {
	return {
		connectDragSource: connect.dragSource(),
		isDragging: monitor.isDragging()
	}
})(class BoardItem extends Component {
	render () {
		const { task, rmId, connectDragSource } = this.props

		return connectDragSource(
			<li>
				<a href="#" onClick={() => this._editCommonTask(task)}>{task.redmine.subject}</a> <small>({task.gitlab.iid} - {rmId})</small><br/>
				<button style={{ marginRight: 10 }} href="#" onClick={(e) => {
					this._copyElement(e.target, `feature/${task.gitlab.iid}-${task.redmine.id}-${getSlug(task.redmine.subject)}`)
				}}>copy branch name</button>
				<button style={{ marginRight: 10 }} href="#" onClick={(e) => {
					this._copyElement(e.target, `${task.redmine.subject} - ${systems.redmine.url}issues/${task.redmine.id}`)
				}}>copy timedoctor task</button>
				<button style={{ marginRight: 10 }} onClick={() => {
					if (!confirm('Máš mergnuto z produce?')) {
						return
					}
					let url = `${systems.gitlab.projectUrl}merge_requests/new?merge_request[source_project_id]=${systems.gitlab.projectId}&merge_request[source_branch]=feature/${task.gitlab.iid}-${task.redmine.id}-${getSlug(task.redmine.subject)}&merge_request[target_project_id]=${systems.gitlab.projectId}&merge_request[target_branch]=staging`
					window.open(url,'_blank')
					//window.location.href = url
				}}>merge to stage</button>
				<Link as={`/task/${rmId}`} href={`/task?id=${rmId}`}><a style={{ marginRight: 10 }}>rm</a></Link>
				<a style={{ marginRight: 10 }} href={`${systems.redmine.url}issues/${rmId}`} target="_blank">
					<img src="../static/images/rm.png" alt="Redmine" width={20}/>
				</a>
				<a style={{ marginRight: 10 }} href={`${systems.gitlab.issueUrl}${task.gitlab.iid}`} target="_blank">
					<img src="../static/images/gl.png" alt="GitLab" width={20}/>
				</a>
			</li>
		)
	}
})
const Board = DropTarget(ItemTypes.BOARD, {
	drop(props) {
		console.log('drop',props)
	},
}, (connect, monitor) => {
	return {
		connectDropTarget: connect.dropTarget(),
		isOver: monitor.isOver(),
		canDrop: monitor.canDrop()
	};
})(class Board extends Component {
	render () {
		const { tasks, name, connectDropTarget, canDrop } = this.props

		return connectDropTarget(
			<ol className="board">
				{Object.keys(tasks).map(key => {
					if (tasks[key].gitlab.labels.indexOf(name) > -1) {
						return <BoardItem key={key} task={tasks[key]} rmId={key} />
					}
				})}
			</ol>
		)
	}
})

export default connect(state => ({
	auth: state.auth,
	boards: state.gitlab.boards,
	gitlabIssues: state.gitlab.issues,
	issues: state.redmine.issues,
}))(CommonTasks)