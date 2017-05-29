import Head from 'next/head'
import Header from './Header'

const Layout = (props) => (
	<div>
		<Head>
			<title>Redmine & GitLab playground</title>
			<meta charSet='utf-8' />
			<meta name='viewport' content='initial-scale=1.0, width=device-width' />
			<style>{`
			body { font-size: 20px; }
			a { color: inherit; }
		  `}</style>
		</Head>
		<Header/>
		{props.children}
	</div>
)

export default Layout