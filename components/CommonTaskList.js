import { Component } from 'react'
import { connect } from 'react-redux'

class CommonTaskList extends Component {

	render () {
		return (
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
							<a href="#" onClick={() => this.editCommonTask(commonTasks[key])}>{commonTasks[key].redmine.subject}</a> <small>({commonTasks[key].gitlab.iid} - {key})</small><br/>
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
							<a style={{ marginRight: 10 }} href={`${systems.redmine.url}issues/${key}`} target="_blank">rm&rarr;</a>
							<a style={{ marginRight: 10 }} href={`http://gitlab.dev.footshop.cz/footshop/footshop-ng/issues/${commonTasks[key].gitlab.iid}`} target="_blank">gl&rarr;</a>
						</li>
					))}
				</ol>
			</div>
		)
	}
}


export default connect(state => ({
	issues: state.global.issues
}))(CommonTaskList)
