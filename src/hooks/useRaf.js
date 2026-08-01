import React from "react";

export const useRaf = (onFrame) => {
	const requestRef = React.useRef();
	const startTimeRef = React.useRef();
	const onFrameRef = React.useRef(onFrame);
	onFrameRef.current = onFrame;

	React.useEffect(() => {
		const callback = (time) => {
			if (!startTimeRef.current) startTimeRef.current = time;
			const progress = time - startTimeRef.current;
			onFrameRef.current(progress);
			requestRef.current = requestAnimationFrame(callback);
		};
		requestRef.current = requestAnimationFrame(callback);
		return () => cancelAnimationFrame(requestRef.current);
	}, []);
};
