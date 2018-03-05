import {Component} from 'react'
import {connect} from 'react-redux'

import {setFormIssueTitle, resetFormIssueTitle} from '../../redux/actions'

class FormTitle extends Component {
    componentDidMount() {
        const {title, dispatch} = this.props

        if (title) {
            dispatch(resetFormIssueTitle())
        }
    }
    render() {
        const {autoFocus, defaultValue, dispatch} = this.props

        return <input autoFocus={autoFocus} onChange={e => dispatch(setFormIssueTitle(e.target.value))} defaultValue={defaultValue || ''} />
    }
}

export default connect(state => ({
    title: state.forms.issue.title,
}))(FormTitle)