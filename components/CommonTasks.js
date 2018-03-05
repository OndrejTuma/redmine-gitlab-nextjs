import { Component } from 'react'
import { connect } from 'react-redux'

import CommonBoard from './CommonBoard'
import CommonBoards from './CommonBoards'
import Trash from './Trash'

import NewTask from './NewTask/index'

class CommonTasks extends Component {
	render () {
		const { auth, boards, issues } = this.props

		return (
			<CommonBoards>
				<NewTask/>

				<style>{`
					.task-list { display: table; list-style: none; padding-left: 0; table-layout: fixed; width: 100%; }
					.task-list li { display: table-cell; vertical-align: top; }
					.task-list li + li { border-left: 1px dashed #000; }
					.task-list .heading { color: #222; display: block; margin-bottom: 1em; text-align: center; border-bottom: 1px dashed #000; padding: 10px 0; }

					.board { padding: 0 10px 0 25px; }
					.board li { display: list-item; margin-bottom: 1em; padding: 0; }
					.board li + li { border-left: none; }

					.icon { border-radius: 5px; display: inline-block; vertical-align: middle; cursor: pointer; margin-right: 10px; }
					img.icon, .icon img { width: 20px; }

					.highlighted { animation: fade 1s 1; }

					@keyframes fade {
						0% { background-color: green; }
						100% { background-color: transparent; }
					}
				`}</style>
				<ul className="task-list">
					{boards && boards.map(board => (
						<CommonBoard key={board.label.name} board={board} tasks={issues} />
					))}
				</ul>

				<Trash isTrash={true} />
			</CommonBoards>
		)
	}
}

export default connect(state => ({
	auth: state.auth,
	boards: state.gitlab.boards,
	issues: state.redmine.issues,
}))(CommonTasks)