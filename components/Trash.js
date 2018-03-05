import {Component} from 'react'
import {DropTarget} from 'react-dnd'
import {ItemTypes} from '../consts'

class Trashcan extends Component {
	render() {
		const {connectDropTarget, isOver} = this.props

		const image = isOver ? `garbage-open.svg` : `garbage.svg`

		return connectDropTarget(
			<p style={{textAlign: 'center'}}>
				<img src={`static/images/${image}`} alt="" style={{width: 100}} ref={`testik`} title={`Drag here to close issue`}/>
			</p>
        )
	}
}

export default DropTarget(ItemTypes.BOARD, {
	drop(props, monitor) {
		//console.log('drop', props, monitor.getDropResult())
		return props
	},
	hover(props, monitor, component) {
		//console.log('hovering', props, monitor)
		return props
	}
}, (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isOver: monitor.isOver(),
	canDrop: monitor.canDrop(),
}))(Trashcan)