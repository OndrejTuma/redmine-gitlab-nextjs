import {Component} from 'react'
import {connect} from 'react-redux'

import {systems} from '../../consts'

class MergeRequestBlock extends Component {
	state = {
		show_list: false,
	}

	render() {
		const {mr_for_me} = this.props
		const {show_list} = this.state

		return <div style={{float: 'right', textAlign: 'right'}}>
			<p style={{cursor: mr_for_me.length ? 'pointer' : 'default'}} onClick={() => this.setState({show_list: !show_list})}>
				MR assigned to me: <strong>{mr_for_me.length}</strong>
			</p>
			{show_list && <ul style={{listStyle: 'none'}}>
				{mr_for_me.map((mr, i) =>
					<li key={i}>
						<a href={`${systems.gitlab.mergeRequestUrl}${mr.iid}`} title={mr.author.name}
						   target={`_blank`}>{mr.title}</a>
					</li>
				)}
			</ul>}
		</div>
	}
}

export default connect(state => ({
	mr_for_me: state.gitlab.mr_for_me,
}))(MergeRequestBlock)