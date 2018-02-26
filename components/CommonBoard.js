import CommonTask from './CommonTask'
import Statuses from '../modules/Statuses'
import { DropTarget } from 'react-dnd'
import { ItemTypes } from '../consts'

const CommonBoard = (({ userId, board, tasks, connectDropTarget }) => connectDropTarget(
	<li>
		<strong className="heading" style={{ backgroundColor: board.label.color }}>{board.label.name}</strong>
		<ol className="board">
			{tasks.map((task, i) => {
				let status = Statuses.getStatusByRmId(task.status.id)
				if (status.gl && status.gl === board.id) {
					return <CommonTask board={board} userId={userId} key={i} task={task} />
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