import {DropTarget} from 'react-dnd'
import {ItemTypes} from '../consts'

const Trashcan = ({isTrash, connectDropTarget}) => connectDropTarget(
	<p style={{textAlign: 'center'}}>
		<img src={`static/images/trash.svg`} alt="" style={{
			width: 100,
		}}/>
	</p>
)

export default DropTarget(ItemTypes.BOARD, {
	drop(props, monitor) {
		//console.log('drop', props, monitor.getDropResult())
		return props
	},
	hover(props, monitor) {
		//console.log('hovering', props, monitor.getDropResult())
		return props
	}
}, (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isOver: monitor.isOver(),
	canDrop: monitor.canDrop(),
}))(Trashcan)