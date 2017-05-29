import Link from 'next/link'

const Header = () => (
	<div style={{ backgroundColor: '#eee', padding: '10px 20px', marginBottom: 20, textAlign: 'center' }}>
		<Link href='/' style={{ float: 'left' }}><a>Home</a></Link>
		<p>Redmine & GitLab API playground on Next.js!</p>
	</div>
)

export default Header