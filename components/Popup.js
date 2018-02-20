export default (props) => {
	return (
		<div className="popup" style={{
			background: '#fff',
			padding: 30,
		}}>
			{props.children}
		</div>
	)
}