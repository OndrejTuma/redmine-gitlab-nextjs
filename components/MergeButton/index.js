import {Component} from 'react'
import {connect} from 'react-redux'
import getSlug from 'speakingurl'

import {gitlabFetch} from '../../apiController'
import {GIT, systems} from '../../consts'
import {addMergeRequest} from '../../redux/actions'

import Popup from '../Popup'
import FormUserList from '../FormUserList/index'
import FormComment from '../FormComment/index'

class MergeButton extends Component {
    state = {
        show_dialog: false,
    }

    _assembleBranchName() {
        const {task: {id, subject}} = this.props

        return `feature/${id}-${getSlug(subject)}`
    }
    _assembleTitle() {
        const {task: {id, subject}} = this.props

        return `#${id}: ${subject}`
    }
    _click() {
        const mrId = this._getMergeRequestId()

        if (mrId) {
            window.open(`${systems.gitlab.mergeRequestUrl}${mrId}`)
        }
        else {
            this._merge()
        }
    }
    _createMR() {
        const {dispatch, issue: {assignee, comment}} = this.props

        gitlabFetch('merge_requests', 'POST', {
            id: systems.gitlab.projectId,
            assignee_id: assignee.ids.gl,
            description: comment,
            source_branch: this._assembleBranchName(),
            target_branch: GIT.main_branch,
            title: this._assembleTitle(),
            remove_source_branch: true,
            labels: `Frontend`
        })
            .then(data => {
                if (!data || !data.iid) {
                    return
                }
                dispatch(addMergeRequest(data))
                this.setState({show_dialog:false})
            })
    }
    _getMergeRequestId() {
        const {mr_mine} = this.props
        const branch_name = this._assembleBranchName()

        if (!mr_mine || !mr_mine.length) {
            return 0
        }

        return mr_mine.reduce((has,mr) => {
            if (branch_name == mr.source_branch && mr.target_branch == GIT.main_branch) {
                return mr.iid
            }
            return has
        }, 0)
    }
    _merge() {
        if (!confirm(`Máš rebased ${GIT.main_branch}?`)) {
            this.setState({show_dialog: false})
            return
        }

        this.setState({show_dialog: true})
    }

    render() {
        const {show_dialog} = this.state
        const mrId = this._getMergeRequestId()

        return <div>
            <button style={{marginRight: 10}} onClick={() => this._click()}>{mrId ? 'view merge request' : 'merge to stage'}</button>

            {show_dialog && <Popup>
                <a href="#" style={{
                    fontSize:'1.5em',
                    position: 'absolute',
                    right: 10,
                    textDecoration:'none',
                    top: 5,
                }} onClick={() => this.setState({show_dialog:false})}>&times;</a>
                <p style={{float:'right'}}>
                    <button onClick={() => this._createMR()}>Create MR</button>
                </p>
                <FormUserList/>
                <p style={{marginBottom:0}}>Description:</p>
                <FormComment/>
            </Popup>}
        </div>
    }
}

export default connect(state => ({
    mr_mine: state.gitlab.mr_mine,
    issue: state.forms.issue,
}))(MergeButton)