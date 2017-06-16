import { Component } from 'react'
import { DragSource } from 'react-dnd'
import Link from 'next/link'
import getSlug from 'speakingurl'
import copy from 'copy-to-clipboard'

import { Boards } from '../apiController'
import { ItemTypes, statuses, systems } from '../consts'
import Users from '../modules/Users'
import { updateGitlabIssue, updateRedmineIssue } from '../redux/actions'

class CommonTask extends Component {
	/**
	 * Closes common task
	 * @private
	 */
	_closeTask (commonTask) {
		const { dispatch, userId } = this.props
		const { gitlab: { iid: glId }, redmine: { id: rmId } } = commonTask

		const user = Users.getUserById(userId)

		dispatch(updateGitlabIssue(glId, {
			state_event: 'close'
		}))
		dispatch(updateRedmineIssue(rmId, user.ids.rm, {
			issue: {
				status_id: statuses.closed.rm
			}
		}))
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
			let prevClassName = elm.className
			elm.className += ' highlighted'
			setTimeout(() => {
				elm.className = prevClassName
			}, 1000)
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
	/**
	 * updates Redmine and GitLab task
	 * @param commonTask
	 * @private
	 */
	_updateTask (commonTask) {
		const { dispatch, boards, userId } = this.props
		const assignee = Users.getUserById(this.cmnAssignTo.value)
		const user = Users.getUserById(userId)
		let labels = Boards.getNonBoardLabels(commonTask.gitlab.labels, boards)

		labels.push(this.cmnState[this.cmnState.selectedIndex].text)

		let glBoard = Boards.getBoardByTaskLabels(labels, boards)
		let rmStatusId
		for (let key in statuses) {
			if (statuses.hasOwnProperty(key) && statuses[key].gl === glBoard.id) {
				rmStatusId = statuses[key].rm
				break
			}
		}

		dispatch(updateGitlabIssue(commonTask.gitlab.iid, {
			assignee_id: assignee.ids.gl,
			labels: labels.join(','),
			state_event: 'reopen',
		}, this.cmnComment.value))
		dispatch(updateRedmineIssue(commonTask.redmine.id, user.ids.rm, {
			issue: {
				assigned_to_id: assignee.ids.rm,
				status_id: rmStatusId,
				notes: this.cmnComment.value,
			}
		}))

		this.cmnWrapper.style.display = 'none'
	}

	render () {
		const { boards, task, connectDragSource, userId } = this.props

		return connectDragSource(
			<li>
				<a href="#" onClick={e => {
					e.preventDefault()
					this._editTask(task)
				}}>{task.redmine.subject}</a> <small>({task.gitlab.iid} - {task.redmine.id})</small><br/>
				<img className="icon" title="Copy branch name" src="../static/images/git.png" onClick={e => this._copyElement(`feature/${task.gitlab.iid}-${task.redmine.id}-${getSlug(task.redmine.subject)}`, e.target)}/>
				<img className="icon" title="Copy TimeDoctor task" src="../static/images/td.png" onClick={e => this._copyElement(`${task.redmine.subject} - ${systems.redmine.url}issues/${task.redmine.id}`, e.target)}/>
				<a className="icon" title="Go to Redmine task" href={`${systems.redmine.url}issues/${task.redmine.id}`} target="_blank">
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
				<Link as={`/task/${task.redmine.id}`} href={`/task?id=${task.redmine.id}`}><a style={{ marginRight: 10 }}>rm</a></Link>

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
}

export default DragSource(ItemTypes.BOARD, {
	beginDrag(props) {
		//console.log('beginDrag',props);
		return {};
	},
	endDrag(props, monitor) {
		if (monitor.didDrop()) {
			let labelName = monitor.getDropResult().name
			const { dispatch, task, boards } = props
			let labels = Boards.getNonBoardLabels(task.gitlab.labels, boards)

			labels.push(labelName)

			dispatch(updateGitlabIssue(task.gitlab.iid, {
				assignee_id: task.gitlab.assignee.id,
				labels: labels.join(','),
			}))

			let glBoard = Boards.getBoardByTaskLabels(labels, boards)
			let rmStatusId
			for (let key in statuses) {
				if (statuses.hasOwnProperty(key) && statuses[key].gl === glBoard.id) {
					rmStatusId = statuses[key].rm
					break
				}
			}

			dispatch(updateRedmineIssue(task.redmine.id, task.redmine.assigned_to.id, {
				issue: {
					assigned_to_id: task.redmine.assigned_to.id,
					status_id: rmStatusId,
				}
			}))
		}
	},
}, (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging()
}))(CommonTask)