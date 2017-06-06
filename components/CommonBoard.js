import CommonTask from './CommonTask'
import { DropTarget } from 'react-dnd'
import { ItemTypes } from '../consts'

const CommonBoard = (({ userId, board, boards, dispatch, tasks, name, connectDropTarget }) => connectDropTarget(
	<li>
		<strong className="heading" style={{ backgroundColor: board.label.color }}>{name}</strong>
		<ol className="board">
			{Object.keys(tasks).map(key => {
				if (tasks[key].gitlab.labels.indexOf(name) > -1) {
					return <CommonTask dispatch={dispatch} userId={userId} key={key} task={tasks[key]} rmId={key} boards={boards} />
				}
			})}
		</ol>
	</li>
))

export default DropTarget(ItemTypes.BOARD, {
	drop(props, monitor) {
		//console.log('drop',props, monitor.getDropResult())
		return props
	},
}, (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isOver: monitor.isOver(),
	canDrop: monitor.canDrop(),
}))(CommonBoard)