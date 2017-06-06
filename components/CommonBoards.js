import React from 'react'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

const TaskBoards = ({ children }) => (
	<div className="common-tasks">
		{children}
	</div>
)

export default DragDropContext(HTML5Backend)(TaskBoards)