import { Component } from 'react'
import { DragSource } from 'react-dnd'
import Link from 'next/link'
import getSlug from 'speakingurl'
import copy from 'copy-to-clipboard'

import { Boards } from '../apiController'
import { ItemTypes, statuses, systems, users } from '../consts'
import Users from '../modules/Users'
import Statuses from '../modules/Statuses'
import { updateRedmineIssue } from '../redux/actions'

class CommonTask extends Component {
	/**
	 * Closes task
	 * @private
	 */
	_closeTask (task) {
		const { dispatch, userId } = this.props

		const user = Users.getUserById(userId)

		dispatch(updateRedmineIssue(task, {
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
	 * Show edit form with proper values
	 * @private
	 */
	_editTask() {
		let { board: { id: boardId }, userId } = this.props

		this.formWrapper.style.display = 'block'
		this.formState.value = boardId
		this.formAssignedTo.value = userId
	}
	/**
	 * updates Redmine task
	 * @param task
	 * @private
	 */
	_updateTask (task) {
		const { dispatch } = this.props
		const assignee = Users.getUserById(this.formAssignedTo.value)
		const status = Statuses.getStatusByGlId(this.formState.value)

		console.log('new status id',);

		dispatch(updateRedmineIssue(task, {
			issue: {
				assigned_to_id: assignee.ids.rm,
				status_id: status.rm,
				notes: this.formComment.value,
			}
		}))

		this.formWrapper.style.display = 'none'
	}

	render () {
		const { boards, task, connectDragSource, userId } = this.props

		return connectDragSource(
			<li>
				<a href="#" onClick={e => {
					e.preventDefault()
					this._editTask(task)
				}}>{task.subject}</a> <small>({task.id})</small><br/>
				<img className="icon" title="Copy branch name" src="../static/images/git.png" onClick={e => this._copyElement(`feature/${task.id}-${getSlug(task.subject)}`, e.target)}/>
				<img className="icon" title="Copy TimeDoctor task" src="../static/images/td.png" onClick={e => this._copyElement(`${task.subject} - ${systems.redmine.url}issues/${task.id}`, e.target)}/>
				<a className="icon" title="Go to Redmine task" href={`${systems.redmine.url}issues/${task.id}`} target="_blank">
					<img src="../static/images/rm.png" alt="Redmine"/>
				</a>
				<br/>
				<button style={{ marginRight: 10 }} onClick={() => {
					if (!confirm('Máš mergnuto z produce?')) {
						return
					}

					let url = `${systems.gitlab.projectUrl}merge_requests/new?merge_request[source_project_id]=${systems.gitlab.projectId}&merge_request[source_branch]=feature/${task.id}-${getSlug(task.subject)}&merge_request[target_project_id]=${systems.gitlab.projectId}&merge_request[target_branch]=staging`
					window.open(url,'_blank')

				}}>merge to stage</button>
				<Link as={`/task/${task.id}`} href={`/task?id=${task.id}`}><a style={{ marginRight: 10 }}>rm</a></Link>

				<div ref={elm => this.formWrapper = elm} style={{ display: 'none' }}>
					<p style={{ float: `right` }}>
						<button onClick={() => this.formWrapper.style.display = 'none'}>x</button>
					</p>
					<p>Set state: <select ref={elm => this.formState = elm}>
						{boards && boards.map((board, i) => (
							<option key={i} value={board.id}>{board.label.name}</option>
						))}
					</select></p>
					<p>Assign to: <select ref={elm => this.formAssignedTo = elm} defaultValue={userId}>
						{users && users.map(person => (
							<option key={person.id} value={person.id}>{person.name}</option>
						))}
					</select></p>
					<textarea ref={elm => this.formComment = elm}></textarea>
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
			const { dispatch, task } = props

			dispatch(updateRedmineIssue(task, {
				issue: {
					assigned_to_id: task.assigned_to.id,
					status_id: Statuses.getStatusByGlId(monitor.getDropResult().board.id).rm,
				}
			}))
		}
	},
}, (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging()
}))(CommonTask)