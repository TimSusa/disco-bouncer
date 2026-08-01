import Drawer from "@material-ui/core/Drawer";
import { makeStyles, useTheme } from "@material-ui/styles";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { ClipList } from "./components/ClipList";
import DrawerList from "./components/Drawer";
import MenuAppBar from "./components/MenuAppBar";
import { clock } from "./store/thunks/clock";

const DRAWER_WIDTH = 280;

export function App() {
	const dispatch = useDispatch();
	const theme = useTheme();
	const classes = makeStyles(styles.bind(this, theme))();
	useEffect(() => {
		dispatch(clock());
	}, [dispatch]);
	return (
		<div className={classes.root}>
			<MenuAppBar />
			<Drawer
				variant="permanent"
				anchor="left"
				classes={{
					paper: classes.drawerPaper,
				}}
			>
				<DrawerList classes={classes} onClose={() => {}} />
			</Drawer>
			<main className={classes.content}>
				<ClipList />
			</main>
		</div>
	);
}

function styles(theme) {
	return {
		root: {
			display: "flex",
			width: "100%",
			height: "100vh",
			zIndex: 1,
		},
		drawerPaper: {
			width: DRAWER_WIDTH,
			flexShrink: 0,
			backgroundColor: theme.palette.background.default,
			color: theme.palette.primary.contrastText,
			overflow: "auto",
		},
		iconColor: {
			color: theme.palette.primary.contrastText,
		},
		content: {
			flexGrow: 1,
			marginLeft: DRAWER_WIDTH,
			marginTop: 64,
			padding: theme.spacing(2),
			backgroundColor: theme.palette.background.default,
			overflow: "auto",
			height: "calc(100vh - 64px)",
		},
	};
}
