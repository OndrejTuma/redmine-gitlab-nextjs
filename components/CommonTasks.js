import { Component } from 'react'
import { connect } from 'react-redux'
import Link from 'next/link'
import getSlug from 'speakingurl'
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext, DragSource, DropTarget } from 'react-dnd'
import copy from 'copy-to-clipboard'

import { GitLab, Redmine, Boards } from '../apiController'
import Users from '../modules/Users'

import { systems, statuses } from '../consts'
import { addIssue, addGitlabIssue, updateGitlabIssue } from '../redux/actions'

const ItemTypes = {
	BOARD: 'board'
}

class CommonTasks extends Component {
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

	render () {
		const { auth, boards, dispatch } = this.props

		let commonTasks = this._findCommonTasks()

		return (
			<TaskBoards>
				<h2>Common tasks:</h2>
				<button onClick={() => {
					this.newWrapper.style.display = 'block'
					this.newAssignee.value = auth.user.id
				}}>New task</button>
				<div ref={elm => this.newWrapper = elm} style={{ display: 'none', clear: 'both' }}>
					<button style={{ float: 'right' }} onClick={() => this.newWrapper.style.display = 'none'}>x</button>
					<input type="text" ref={elm => this.newTitle = elm} placeholder={`Issue title`} />
					<br/>
					<textarea ref={elm => this.newDescription = elm} placeholder={`Issue description`} ></textarea>
					<br/>
					<p>Assign to: <select ref={elm => this.newAssignee = elm} defaultValue={auth.user.id}>
						{Users && Users.users.map((person) => (
							<option key={person.id} value={person.id}>{person.name}</option>
						))}
					</select></p>
					<button onClick={() => this.newCommonTask()}>Create</button>
				</div>
				<style>{`
					.task-list { display: table; list-style: none; padding-left: 0; table-layout: fixed; width: 100%; }
					.task-list li { display: table-cell; vertical-align: top; }
					.task-list li + li { border-left: 1px dashed #000; }
					.task-list .heading { color: #222; display: block; margin-bottom: 1em; text-align: center; border-bottom: 1px dashed #000; padding: 10px 0; }

					.board { padding: 0 10px 0 25px; }
					.board li { display: list-item; margin-bottom: 1em; padding: 0; }
					.board li + li { border-left: none; }

					.icon { display: inline-block; vertical-align: middle; cursor: pointer; margin-right: 10px; }
					img.icon, .icon img { width: 20px; }
				`}</style>
				<ul className="task-list">
					{boards && commonTasks && boards.map(board => (
						<Board key={board.label.name} dispatch={dispatch} userId={auth.user.id} name={board.label.name} boards={boards} board={board} tasks={commonTasks} />
					))}
				</ul>
			</TaskBoards>
		)
	}
}

const Board = DropTarget(ItemTypes.BOARD, {
	drop(props, monitor) {
		//console.log('drop',props, monitor.getDropResult())
		return props
	},
}, (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isOver: monitor.isOver(),
	canDrop: monitor.canDrop(),
}))(({ userId, board, boards, dispatch, tasks, name, connectDropTarget }) => connectDropTarget(
	<li>
		<strong className="heading" style={{ backgroundColor: board.label.color }}>{name}</strong>
		<ol className="board">
			{Object.keys(tasks).map(key => {
				if (tasks[key].gitlab.labels.indexOf(name) > -1) {
					return <BoardTask dispatch={dispatch} userId={userId} key={key} task={tasks[key]} rmId={key} boards={boards} />
				}
			})}
		</ol>
	</li>
))
const BoardTask = DragSource(ItemTypes.BOARD, {
	beginDrag(props) {
		//console.log('beginDrag',props);
		return {};
	},
	endDrag(props, monitor) {
		if (monitor.didDrop()) {
			const { dispatch, task, boards, userId } = props
			let result = monitor.getDropResult()

			let nonBoardLabels = Boards.getNonBoardLabels(task.gitlab.labels, boards).join(',')
			let labels = nonBoardLabels ? nonBoardLabels.split(',') : []
			labels.push(result.name)

			dispatch(updateGitlabIssue(task.gitlab, task.gitlab.assignee.id, labels.join(',')))
		}
	},
}, (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging()
}))(class extends Component {
	/**
	 * Closes common task
	 * @private
	 */
	_closeTask (commonTask) {
		const { dispatch, userId } = this.props
		const { gitlab: { iid: glId }, redmine: { id: rmId } } = commonTask
		
		const user = Users.getUserById(userId)

		GitLab.closeIssue(dispatch, null, glId)
		Redmine.closeIssue(dispatch, user.ids.rm, this.cmnWrapper, rmId)
	}
	/**
	 * Copies text and notify user by setting target's innerHTML
	 * @param text string - text to copy to clipboard
	 * @param elm domNode
	 * @private
	 */
	_copyElement (text, elm) {
		copy(text)

		if (elm) {
			let prevText = elm.innerHTML
			elm.innerHTML = 'copied'
			setTimeout(() => {
				elm.innerHTML = prevText
			}, 3000)
		}
	}
	/**
	 * Fires before edit task form is shown
	 * @param commonTask
	 * @private
	 */
	_editTask (commonTask) {
		const { boards } = this.props
		const taskBoard = Boards.getBoardByTaskLabels(commonTask.gitlab.labels, boards)

		this.cmnWrapper.style.display = 'block'
		this.cmnGitlabLabels.value = Boards.getNonBoardLabels(commonTask.gitlab.labels, boards).join(',')
		this.cmnState.value = taskBoard.id
		if (commonTask.gitlab.assignee) {
			this.cmnAssignTo.value = commonTask.gitlab.assignee.id
		}
	}
	_update () {
		const { dispatch, userId } = this.props
		const { gitlab: { iid: glId }, redmine: { id: rmId } } = commonTask

		const assignee = Users.getUserById(this.cmnAssignTo.value)
		const user = Users.getUserById(userId)
		let rmStatusId

		for (let key in statuses) {
			if (statuses.hasOwnProperty(key) && statuses[key].gl === parseInt(this.cmnState.value)) {
				rmStatusId = statuses[key].rm
				break
			}
		}

		GitLab.updateIssue(
			dispatch,
			null,
			glId,
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
			rmId,
			rmStatusId,
			assignee.ids.rm,
			this.cmnComment.value
		)
	}
	/**
	 * updates Redmine and GitLab task
	 * @param commonTask
	 * @private
	 */
	_updateTask (commonTask) {
		const { dispatch, userId } = this.props
		const { gitlab: { iid: glId }, redmine: { id: rmId } } = commonTask
		
		const assignee = Users.getUserById(this.cmnAssignTo.value)
		const user = Users.getUserById(userId)
		let rmStatusId
		
		for (let key in statuses) {
			if (statuses.hasOwnProperty(key) && statuses[key].gl === parseInt(this.cmnState.value)) {
				rmStatusId = statuses[key].rm
				break
			}
		}

		GitLab.updateIssue(
			dispatch,
			null,
			glId,
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
			rmId,
			rmStatusId,
			assignee.ids.rm,
			this.cmnComment.value
		)
	}

	render () {
		const { boards, task, rmId, connectDragSource, userId } = this.props

		return connectDragSource(
			<li>
				<a href="#" onClick={e => {
					e.preventDefault()
					this._editTask(task)
				}}>{task.redmine.subject}</a> <small>({task.gitlab.iid} - {rmId})</small><br/>
				<img className="icon" title="Copy branch name" src="../static/images/git.png" onClick={() => this._copyElement(`feature/${task.gitlab.iid}-${task.redmine.id}-${getSlug(task.redmine.subject)}`)}/>
				<img className="icon" title="Copy TimeDoctor task" src="../static/images/td.png" onClick={() => this._copyElement(`${task.redmine.subject} - ${systems.redmine.url}issues/${task.redmine.id}`)}/>
				<a className="icon" title="Go to Redmine task" href={`${systems.redmine.url}issues/${rmId}`} target="_blank">
					<img src="../static/images/rm.png" alt="Redmine"/>
				</a>
				<a className="icon" title="Go to GitLab issue" href={`${systems.gitlab.issueUrl}${task.gitlab.iid}`} target="_blank">
					<img src="../static/images/gl.png" alt="GitLab"/>
				</a>
				<br/>
				<button style={{ marginRight: 10 }} onClick={() => {
					if (!confirm('Máš mergnuto z produce?')) {
						return
					}
					let url = `${systems.gitlab.projectUrl}merge_requests/new?merge_request[source_project_id]=${systems.gitlab.projectId}&merge_request[source_branch]=feature/${task.gitlab.iid}-${task.redmine.id}-${getSlug(task.redmine.subject)}&merge_request[target_project_id]=${systems.gitlab.projectId}&merge_request[target_branch]=staging`
					window.open(url,'_blank')
					//window.location.href = url
				}}>merge to stage</button>
				<Link as={`/task/${rmId}`} href={`/task?id=${rmId}`}><a style={{ marginRight: 10 }}>rm</a></Link>

				<div ref={elm => this.cmnWrapper = elm} style={{ display: 'none' }}>
					<p style={{ float: `right` }}>
						<button onClick={() => this.cmnWrapper.style.display = 'none'}>x</button>
					</p>
					<input type="hidden" ref={elm => this.cmnGitlabLabels = elm}/>
					<p>Set state: <select ref={elm => this.cmnState = elm}>
						{boards && boards.map((board, i) => (
							<option key={i} value={board.id}>{board.label.name}</option>
						))}
					</select></p>
					<p>Assign to: <select ref={elm => this.cmnAssignTo = elm} defaultValue={userId}>
						{Users && Users.users.map(person => (
							<option key={person.id} value={person.id}>{person.name}</option>
						))}
					</select></p>
					<textarea ref={elm => this.cmnComment = elm}></textarea>
					<br/>
					<button onClick={() => this._updateTask(task)}>Update task</button>
					<button onClick={() => this._closeTask(task)}>Close task</button>
				</div>
			</li>
		)
	}
})
const TaskBoards = DragDropContext(HTML5Backend)(({ children }) => (
	<div className="common-tasks">
		{children}
	</div>
))

export default connect(state => ({
	auth: state.auth,
	boards: state.gitlab.boards,
	gitlabIssues: state.gitlab.issues,
	issues: state.redmine.issues,
}))(CommonTasks)