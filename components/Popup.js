export default ({children}) => {
	return (
		<div className={`popup--wrapper`} style={{
			background: 'rgba(0,0,0,.1)',
			bottom: 0,
			left: 0,
			position: 'fixed',
			right: 0,
			top: 0,
		}}>
			<div className={`popup--content`} style={{
				boxShadow: '0 0 30px rgba(0,0,0,.5)',
				background: '#fff',
				margin: 'auto',
				maxWidth: 500,
				padding: 30,
				position: 'relative',
				top: '50%',
				transform: 'translateY(-50%)',
			}}>
				{children}
			</div>
		</div>
	)
}