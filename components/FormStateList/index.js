import {Component} from 'react'
import {connect} from 'react-redux'

import {setFormIssueState} from '../../redux/actions'
import Statuses from '../../modules/Statuses'

class FormStateList extends Component {
    componentDidMount() {
        const {defaultValue, state, dispatch} = this.props

        if (defaultValue && defaultValue != state) {
            dispatch(setFormIssueState(defaultValue))
        }
    }
    render() {
        const {boards, defaultValue, dispatch} = this.props

        return <p>Set state: <select defaultValue={defaultValue} onChange={e => dispatch(setFormIssueState(parseInt(e.target.value)))}>
            {boards && boards.map(board =>
                <option value={Statuses.getStatusByGlId(board.id).rm} key={board.id}>{board.label.name}</option>
            )}
        </select></p>
    }
}

export default connect(state => ({
    boards: state.gitlab.boards,
    state: state.forms.issue.state,
}))(FormStateList)