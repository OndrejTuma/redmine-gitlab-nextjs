import Link from 'next/link'
import Auth from './Auth'

const Header = (props) => (
	<div style={{ backgroundColor: '#eee', padding: '10px 20px', marginBottom: 20, textAlign: 'center' }}>
		{props.children}
		<Link href='/' style={{ float: 'left' }}><a>Home</a></Link>
		<p style={{ float: 'right' }}><Auth /></p>
		<p>Redmine & GitLab API playground on Next.js!</p>
	</div>
)

export default Header