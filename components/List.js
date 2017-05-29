import Item from './Item'

export default ({ items }) => {
	return (
		<ol>
			{items && items.map((item, i) => (
				<li key={i}>
					<Item item={item} />
				</li>
			))}
		</ol>
	)
}