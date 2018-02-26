import {Component} from 'react'
import {connect} from 'react-redux'

import {setFormIssueComment, resetFormIssueComment} from '../../redux/actions'

class FormComment extends Component {
    componentDidMount() {
        const {comment, dispatch} = this.props

        if (comment) {
            dispatch(resetFormIssueComment())
        }
    }
    render() {
        const {defaultValue, dispatch} = this.props

        return <textarea onChange={e => dispatch(setFormIssueComment(e.target.value))} defaultValue={defaultValue || ''}></textarea>
    }
}

export default connect(state => ({
    comment: state.forms.issue.comment,
}))(FormComment)