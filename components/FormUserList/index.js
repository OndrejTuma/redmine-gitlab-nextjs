import {Component} from 'react'
import {connect} from 'react-redux'

import {users} from '../../consts'
import {setFormIssueAssignee} from '../../redux/actions'

import Users from '../../modules/Users'

class FormUserList extends Component {
    componentDidMount() {
        const {defaultValue, dispatch, assignee, user} = this.props

        if (defaultValue && defaultValue.id != assignee.id) {
            dispatch(setFormIssueAssignee(defaultValue))
        }
        else if (!assignee) {
            dispatch(setFormIssueAssignee(Users.getUserById(user.id)))
        }
    }
    render() {
        const {defaultValue, dispatch, assignee, user} = this.props

        const select_value = defaultValue || (assignee ? assignee.id : user.id)

        return <p>Assign to: <select defaultValue={select_value} onChange={e => dispatch(setFormIssueAssignee(Users.getUserById(e.target.value)))}>
            {users && users.map(person => (
                <option key={person.id} value={person.id}>{person.name}</option>
            ))}
        </select></p>
    }
}

export default connect(state => ({
    user: state.auth.user,
    assignee: state.forms.issue.assignee,
}))(FormUserList)