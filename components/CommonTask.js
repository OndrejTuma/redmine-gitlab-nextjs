import {Component} from 'react'
import {DragSource} from 'react-dnd'
import Link from 'next/link'
import getSlug from 'speakingurl'
import copy from 'copy-to-clipboard'
import {connect} from 'react-redux'

import {ItemTypes, statuses, systems} from '../consts'
import Users from '../modules/Users'
import Statuses from '../modules/Statuses'
import {updateRedmineIssue} from '../redux/actions'

import Popup from './Popup'
import MergeButton from './MergeButton/index'
import FormComment from './FormComment/index'
import FormUserList from './FormUserList/index'
import FormStateList from './FormStateList/index'


class CommonTask extends Component {
    state = {
        edit_task: false,
    }

    /**
     * Copies text and notify user by setting target's innerHTML
     * @param text string - text to copy to clipboard
     * @param elm domNode
     * @private
     */
    _copyElement(text, elm) {
        copy(text)

        if (elm) {
            let prevClassName = elm.className
            elm.className += ' highlighted'
            setTimeout(() => {
                elm.className = prevClassName
            }, 1000)
        }
    }

    /**
     * Show edit form with proper values
     * @private
     */
    _editTask(e) {
        e.preventDefault()
        this.setState({edit_task: true})
    }

    /**
     * updates Redmine task
     * @param task
     * @private
     */
    _updateTask() {
        const {dispatch, issue, task} = this.props
        const assignee = Users.getUserById(issue.assignee.id)

        if (!assignee.ids) {
            return console.error(`no assignee found for id ${issue.assignee.id}`, issue)
        }

        dispatch(updateRedmineIssue(task, {
            issue: {
                assigned_to_id: assignee.ids.rm,
                status_id: issue.state,
                notes: issue.comment,
            }
        }))

        this.setState({edit_task: false})
    }

    render() {
        const {board: {id: boardId}, task, connectDragSource} = this.props
        const {edit_task} = this.state

        return connectDragSource(
            <li>
                <a href="#" onClick={e => this._editTask(e)}>{task.subject}</a>
                <small>({task.id})</small>
                <br/>
                <img className="icon" title="Copy branch name" src="../static/images/git.png"
                     onClick={e => this._copyElement(`feature/${task.id}-${getSlug(task.subject)}`, e.target)}/>
                <img className="icon" title="Copy TimeDoctor task" src="../static/images/td.png"
                     onClick={e => this._copyElement(`${task.subject} - ${systems.redmine.url}issues/${task.id}`, e.target)}/>
                <a className="icon" title="Go to Redmine task" href={`${systems.redmine.url}issues/${task.id}`}
                   target="_blank">
                    <img src="../static/images/rm.png" alt="Redmine"/>
                </a>
                <br/>
                <MergeButton task={task}/>
                <Link as={`/task/${task.id}`} href={`/task?id=${task.id}`}><a style={{marginRight: 10}}>rm</a></Link>

                {edit_task && <Popup>
                    <span onClick={() => this.setState({edit_task: false})} style={{
                        cursor:'pointer',
                        fontSize:'1.5em',
                        position:'absolute',
                        right: 10,
                        top: 5,
                    }}>&times;</span>
                    <FormStateList defaultValue={Statuses.getStatusByGlId(boardId).rm}/>
                    <FormUserList/>
                    <FormComment/>
                    <br/>
                    <button onClick={() => this._updateTask()}>Update task</button>
                </Popup>}
            </li>
        )
    }
}

export default connect(state => ({
    issue: state.forms.issue,
}))(DragSource(ItemTypes.BOARD, {
    beginDrag() {
        //console.log('beginDrag',props);
        return {};
    },
    endDrag(props, monitor) {
        if (!monitor.didDrop()) {
            return
        }

        const {dispatch, task} = props
        const result = monitor.getDropResult()
        let issue = {}
        let status_id

        if (result.board) {
            status_id = Statuses.getStatusByGlId(result.board.id).rm
        }
        else if (result.isTrash) {
            status_id = statuses.closed.rm
        }

        // if we dropped task on the same board again, nothing happens
        if (status_id === task.status.id) {
            return
        }

        issue.status_id = status_id

        if ([statuses.test.rm].indexOf(status_id) >= 0) {
            issue.done_ratio = 80
        }
        if ([statuses.deploy.rm, statuses.ready.rm].indexOf(status_id) >= 0) {
            issue.done_ratio = 100
        }

        dispatch(updateRedmineIssue(task, {issue}))
    },
}, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))(CommonTask))