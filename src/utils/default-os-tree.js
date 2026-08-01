/**
 * Build a default OS file tree for browser mode.
 * Shows common system folders as a starting point.
 * Clicking a folder opens the file picker for that location.
 */
export function buildDefaultOsTree() {
	return {
		id: "/",
		name: "Computer",
		path: "/",
		type: "folder",
		children: [
			{
				id: "home",
				name: "Home",
				path: "~",
				type: "folder",
				children: [
					{
						id: "home/Downloads",
						name: "Downloads",
						path: "~/Downloads",
						type: "folder",
						children: [],
					},
					{
						id: "home/Desktop",
						name: "Desktop",
						path: "~/Desktop",
						type: "folder",
						children: [],
					},
					{
						id: "home/Documents",
						name: "Documents",
						path: "~/Documents",
						type: "folder",
						children: [],
					},
					{
						id: "home/Music",
						name: "Music",
						path: "~/Music",
						type: "folder",
						children: [],
					},
					{
						id: "home/Videos",
						name: "Videos",
						path: "~/Videos",
						type: "folder",
						children: [],
					},
				],
			},
			{
				id: "network",
				name: "Network",
				path: "/Network",
				type: "folder",
				children: [],
			},
		],
	};
}
