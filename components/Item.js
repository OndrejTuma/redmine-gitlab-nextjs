export default ({ item }) => {
	return (
		<div onClick={() => item.onClick ? item.onClick() : {}}>
			{item.name}
		</div>
	)
}