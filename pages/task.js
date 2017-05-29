import { Component } from 'react'
import Layout from '../components/Layout'
import fetch from 'isomorphic-fetch'

import { systems } from '../consts'
import { nextConnect } from '../store'
import { fetchIssue, setStatuses } from '../redux/actions'
import { REST } from '../apiController'

class Task extends Component {
	componentWillMount () {
		const { dispatch, url: { query: { id } } } = this.props

		dispatch(setStatuses())
		dispatch(fetchIssue(id))
	}

	hidePingForm () {
		this.textarea.value = ''
		this.updateForm.style.display = 'none'
	}
	pingBackTo(user, comment = '') {
		const { issue: { id } } = this.props

		return REST.rm(`issues/${id}.json`, () => {
			this.updateForm.style.display = 'none'
			this.textarea.value = ''
		}, 'PUT', {
			issue: {
				assigned_to_id : user.id,
				notes: comment
			}
		})

		fetch(`${systems.redmine.url}issues/${this.props.issue.id}.json`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				key: systems.redmine.auth,
				issue: {
					assigned_to_id : user.id,
					notes: comment
				}
			}),
		})
			.then(data => {
				this.updateForm.style.display = 'none'
				this.textarea.value = ''
				//return data.json()
			})
			.catch(err => console.log(err))
	}
	showPingForm () {
		this.updateForm.style.display = 'block'
		this.textarea.focus()
	}
	updateIssueStatus(statusId) {
		let { issue: { id }, dispatch } = this.props

		return REST.rm(`issues/${id}.json`, () => dispatch(fetchIssue(id)), 'PUT', { issue: { status_id: statusId } })
	}

	render() {
		const { issue, statuses, lastTextComment, assignees } = this.props

		if (issue && Object.keys(issue).length) {
			let { status: { name, id: status_id } } = issue
			return (
				<Layout>
					<div>
						{statuses && statuses.map( ({ id: statusId, name }, id) => (
							<button disabled={statusId == status_id} key={`status-${id}`} onClick={() => this.updateIssueStatus(statusId)}>{name}</button>
						))}
					</div>
					<p style={{ float: 'left' }}>
						Assigned to: {issue.assigned_to ? issue.assigned_to.name : `...`}<br/>
						Status: <small><i>{name || `...`}</i></small><br/>
					</p>
					<div style={{ float: 'right' }}>
						Created by: {issue.author ? issue.author.name : `...`}<br/>
						<button onClick={() => {
							this.updateForm.style.display == 'none' ? this.showPingForm() : this.hidePingForm()
						}}>Ping task</button>
						<div ref={updateForm => this.updateForm = updateForm} style={{ display: 'none' }}>
							<small>Back to:</small>
							<select ref={select => this.assignTo = select} defaultValue={issue.assignees ? issue.assignees[0].id : ``}>
								{assignees && assignees.map((assignee, i) => (
									<option value={assignee.id} key={i}>{assignee.firstname} {assignee.lastname}</option>
								))}
							</select>
							<br/>
							<textarea ref={textarea => this.textarea = textarea } placeholder={`Comment`}></textarea>
							<br/>
							<button onClick={() => this.pingBackTo(issue.assignees ? issue.assignees[0].id : assignees[0].id, this.textarea.value)}>Update</button>
						</div>
					</div>
					<h1 style={{ clear: 'both' }}><a href={`${systems.redmine.url}issues/${issue.id}`} target="_blank">{issue.subject}</a></h1>
					<p>{issue.description}</p>
					{lastTextComment && lastTextComment.user ? (
						<div>
							<h3>Last comment:</h3>
							<p>{`${lastTextComment.user.name}: ${lastTextComment.notes}`}</p>
						</div>
					) : ''}
				</Layout>
			)
		}
		return  (
			<p>loading...</p>
		)
	}

}

export default nextConnect(state => ({
	userId: state.global.userId,
	issue: state.redmine.issue,
	status: state.redmine.status,
	statuses: state.redmine.statuses,
	assignees: state.redmine.assignees,
	lastTextComment: state.redmine.lastTextComment,
}))(Task)