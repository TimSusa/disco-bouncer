import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { configureAppStore } from "../store/configure-app-store";
import MuiWrappedApp from "./MuiWrappedApp";

ReduxWrappedMuiApp.propTypes = {
	children: PropTypes.any,
	store: PropTypes.object,
};

export function ReduxWrappedMuiApp(props) {
	const store = configureAppStore();
	const { store: propsStore, children } = props;
	return (
		<Provider store={propsStore || store}>
			{children ? (
				<MuiWrappedApp {...props}>{children}</MuiWrappedApp>
			) : (
				<MuiWrappedApp {...props} />
			)}
		</Provider>
	);
}
ReduxWrappedMuiApp.displayName = "ReduxWrappedMuiApp";
export default ReduxWrappedMuiApp;
