import { Component } from 'react'
import Layout from '../components/Layout'

import Auth from '../components/Auth'

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

	getAllAssignees (issue) {
		const { journals } = issue

		if (!journals || !journals.length) {
			return
		}

		let seen = {}
console.log('issue', issue);
		let users = journals.map((journal) => {
			if (journal.details && journal.details[0].name === 'assigned_to_id') {
				console.log(journal.details[0].new_value);
			}
			return journal.user
		}).filter(journal => seen.hasOwnProperty(journal.id) ? false : (seen[journal.id] = true))
		if (users.indexOf(issue.author) > -1) {
			users.push(issue.author)
		}
		return users

		/*
		for(let i = journals.length; i--;) {
			if (
				journals[i].details.length &&
				journals[i].details[0].name == 'assigned_to_id' &&
				!assignees[journals[i].user.id]
			) {
				console.log('getAllAssignees add:', journals[i].user);
				assignees[journals[i].user.id] = journals[i].user.name
			}
		}
		// in case author is not yet included
		if (!assignees[issue.author.id]) {
			assignees[issue.author.id] = issue.author.name
		}
		return assignees
		*/
	}
	getLastTextComment (issue) {
		const { journals } = issue
		if (journals) {
			for(let i = journals.length; i--;) {
				if (journals[i].notes) {
					return journals[i]
				}
			}
		}
		return
	}
	hidePingForm () {
		this.textarea.value = ''
		this.updateForm.style.display = 'none'
	}
	pingBackTo(userId, comment = '') {
		const { issue: { id }, dispatch } = this.props

		return REST.rm(`issues/${id}.json`, () => {
			dispatch(fetchIssue(id))
			this.updateForm.style.display = 'none'
			this.textarea.value = ''
		}, 'PUT', {
			issue: {
				assigned_to_id: userId,
				notes: comment,
			}
		})
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
		const { issue, statuses, auth } = this.props

		if (issue && Object.keys(issue).length) {
			let { status: { name, id: status_id } } = issue
			let lastTextComment = this.getLastTextComment(issue)
			let assignees = this.getAllAssignees(issue)

			if (auth.isLogged) {
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
								<select ref={select => this.assignTo = select} defaultValue={assignees && assignees.length ? assignees.slice(-1)[0].id : ``}>
									{assignees && assignees.map((assignee) => (
										<option value={assignee.id} key={assignee.id}>{assignee.name}</option>
									))}
								</select>
								<br/>
								<textarea ref={textarea => this.textarea = textarea } placeholder={`Comment`}></textarea>
								<br/>
								<button onClick={() => this.pingBackTo(this.assignTo.value, this.textarea.value)}>Update</button>
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
		}
		return <Auth />
	}

}

export default nextConnect(state => ({
	auth: state.auth,
	issue: state.redmine.issue,
	statuses: state.redmine.statuses,
}))(Task)