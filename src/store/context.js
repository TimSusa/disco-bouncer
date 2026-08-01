import { createContext } from "react";

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const context = createContext({ audioContext });

export default context;
