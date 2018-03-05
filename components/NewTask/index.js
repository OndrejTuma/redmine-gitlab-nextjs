import {Component} from 'react'
import {connect} from 'react-redux'

import {redmineFetch} from '../../apiController'
import {systems, statuses} from '../../consts'

import Popup from '../Popup'
import FormUserList from '../FormUserList/index'
import FormComment from '../FormComment/index'
import FormTitle from '../FormTitle/index'

import {addIssue} from '../../redux/actions'

class NewTask extends Component {
    state = {
        show_dialog: false,
    }

    _createTask() {
        const {dispatch, issue: {assignee, comment, title}} = this.props

        redmineFetch(`issues.json`, 'POST', {
            issue: {
                project_id: systems.redmine.projectId,
                status_id: statuses.todo.rm,
                subject: title,
                description: comment,
                assigned_to_id: assignee.ids.rm,
            }
        }).then(data => {
            if (data && data.issue) {
                dispatch(addIssue(data.issue))
            }
            this.setState({show_dialog: false})
        })
    }

    render() {
        const {show_dialog} = this.state

        return <div>
            <button onClick={() => this.setState({show_dialog: true})}>New task</button>

            {show_dialog && <Popup>
                <a href="#" style={{
                    fontSize: '1.5em',
                    position: 'absolute',
                    right: 10,
                    textDecoration: 'none',
                    top: 5,
                }} onClick={() => this.setState({show_dialog: false})}>&times;</a>

                <p style={{marginBottom: 0}}>Title:</p>
                <FormTitle autoFocus/>
                <FormUserList/>
                <p style={{marginBottom: 0}}>Description:</p>
                <FormComment/>
                <br/>
                <button onClick={() => this._createTask()}>Create Issue</button>
            </Popup>}
        </div>
    }
}

export default connect(state => ({
    issue: state.forms.issue,
}))(NewTask)