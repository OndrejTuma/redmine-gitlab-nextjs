import { Component } from 'react'
import { connect } from 'react-redux'

import { Redmine, REST } from '../apiController'
import Users from '../modules/Users'
import CommonBoard from './CommonBoard'
import CommonBoards from './CommonBoards'

import { systems, statuses, users } from '../consts'
import { addIssue } from '../redux/actions'

class CommonTasks extends Component {
	/**
	 * adds issue in Redmine and GitLab, fill name, description (and labels for GitLab) and assign it to current user
	 */
	newCommonTask () {
		const { dispatch, auth } = this.props
		const assignee = Users.getUserById(auth.user.id)

		REST.rm(`issues.json`, data => {
			dispatch(addIssue(data.issue))
			this.formWrapper.style.display = 'none'
		}, 'POST', {
			issue: {
				project_id: systems.redmine.projectId,
				status_id: statuses.todo.rm,
				subject: this.formTitle.value,
				description: this.formDescription.value,
				assigned_to_id: assignee.ids.rm,
			}
		})
	}

	render () {
		const { auth, boards, dispatch, issues } = this.props

		return (
			<CommonBoards>
				<h2>Your tasks:</h2>
				<button onClick={() => {
					this.formWrapper.style.display = 'block'
					this.newAssignee.value = auth.user.id
				}}>New task</button>
				<div ref={elm => this.formWrapper = elm} style={{ display: 'none', clear: 'both' }}>
					<button style={{ float: 'right' }} onClick={() => this.formWrapper.style.display = 'none'}>x</button>
					<input type="text" ref={elm => this.formTitle = elm} placeholder={`Issue title`} />
					<br/>
					<textarea ref={elm => this.formDescription = elm} placeholder={`Issue description`} ></textarea>
					<br/>
					<p>Assign to: <select ref={elm => this.newAssignee = elm} defaultValue={auth.user.id}>
						{users && users.map((person) => (
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

					.icon { border-radius: 5px; display: inline-block; vertical-align: middle; cursor: pointer; margin-right: 10px; }
					img.icon, .icon img { width: 20px; }

					.highlighted { animation: fade 1s 1; }

					@keyframes fade {
						0% { background-color: green; }
						100% { background-color: transparent; }
					}
				`}</style>
				<ul className="task-list">
					{boards && boards.map(board => (
						<CommonBoard key={board.label.name} dispatch={dispatch} userId={auth.user.id} name={board.label.name} boards={boards} board={board} tasks={issues} />
					))}
				</ul>
			</CommonBoards>
		)
	}
}

export default connect(state => ({
	auth: state.auth,
	boards: state.gitlab.boards,
	gitlabIssues: state.gitlab.issues,
	issues: state.redmine.issues,
}))(CommonTasks)