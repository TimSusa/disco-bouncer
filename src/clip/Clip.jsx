import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import PlayIcon from '@material-ui/icons/PlayArrow'
import NoLoopIcon from '@material-ui/icons/ArrowRightAlt'
import LoopIcon from '@material-ui/icons/Loop'
import PauseIcon from '@material-ui/icons/Pause'
import FastForwardIcon from '@material-ui/icons/FastForward'
import FastRewindIcon from '@material-ui/icons/FastRewind'
import SaveIcon from '@material-ui/icons/Delete'
import CloseIcon from '@material-ui/icons/Close'
import OpenWithIcon from '@material-ui/icons/Search'
import WaveSurfer from 'wavesurfer.js'
import Slider from '@material-ui/core/Slider'
import { actionsContent, actionsViewSettings } from '../global-state'
import context from '../global-state/context'
import {
  //removeFile,
  openWith
} from '../utils/ipc-renderer.js'
//import { playbackStates } from '../global-state/reducers/view-settings'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    border: 'solid 1px #00000035',
    borderRadius: 5,
    padding: 8,
    height: 200
  }
}))
export function Clip({ index }) {
  const classes = useStyles()
  const { audioContext } = useContext(context)
  const dispatch = useDispatch()
  const { registerClip } = actionsViewSettings
  const {
    changeClipSrc,
    changeClipVolume,
    toggleIsLooping,
    //removeClip,
    markForRemoval,
    markForHitlist,
    stopAll
  } = actionsContent
  const { audioDriverOuts } = useSelector((state) => state.viewSettings)
  const { tracks } = useSelector((state) => state.content)
  const { id: tmpTrackId, data } = tracks[index]

  const {
    isPlaying,
    isLooping,
    isWaveformShown,
    volume,
    audioDriverOutName,
    src,
    id,
    isMarkedForHitlist,
    willBeRemoved
  } = data[0]
  const waveformRef = useRef(null)
  const wavesurfer = useRef(null)
  const nrOfCycles = useRef(0)
  const playWasCalled = useRef(false)
  const [playing, setPlay] = useState(isPlaying)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const options = formWaveSurferOptions(waveformRef.current)
    wavesurfer.current = WaveSurfer.create(options)
    wavesurfer.current.load(src)
    wavesurfer.current.setVolume(volume)

    wavesurfer.current.on('seek', () => {
      dispatch(stopAll())
      handlePlayPause()
      setDuration(parseInt(wavesurfer.current.getDuration()) / 60)
    })
    wavesurfer.current.on('ready', () => {
      //dispatch(stopAll())
      setDuration(parseInt(wavesurfer.current.getDuration()) / 60)
    })
    wavesurfer.current.on('finish', () => {
      nrOfCycles.current++
      if (isLooping) {
        wavesurfer.current.play()
      } else {
        wavesurfer.current.stop()
      }
    })
    return () => wavesurfer.current.destroy()
    //eslint-disable-next-line
  }, [src])

  useEffect(() => {
    if (audioDriverOutName) {
      const sinkId = audioDriverOuts.find(
        (driver) => driver.label === audioDriverOutName
      ).deviceId
      wavesurfer.current.setSinkId(sinkId)
    }
    //eslint-disable-next-line
  }, [audioDriverOutName])

  useEffect(() => {
    if (isPlaying) {
      wavesurfer.current.playPause(audioContext.baseLatency)
      playWasCalled.current = true
    } else if (playWasCalled.current) {
      wavesurfer.current.playPause(audioContext.baseLatency)
    }
    //eslint-disable-next-line
  }, [isPlaying])
  const getBackgroundColor = () => {
    if (willBeRemoved) {
      return isMarkedForHitlist ? 'green' : 'red'
    } else {
      return isMarkedForHitlist ? 'green' : 'inherit'
    }
  }
  return (
    <div
      className={classes.root}
      draggable='false'
      onDrop={(e) => {
        let dt = e.dataTransfer
        let files = dt.files
        e.preventDefault()
        dispatch(
          changeClipSrc({
            tracksId: tmpTrackId,
            clipId: id,
            src: files[0].path || files[0].name
          })
        )
      }}
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onDragEnd={(e) => {
        e.preventDefault()
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderRadius: 5,
          height: '%',
          padding: '8px 8px 0 8px',
          backgroundColor: getBackgroundColor()
        }}
      >
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
          {src.split('/').pop()}
        </div>
        <IconButton
          onClick={() => {
            // dispatch(removeClip({ tracksId: tmpTrackId, clipId: id }))
            dispatch(markForHitlist({ tracksId: tmpTrackId, clipId: id }))

            setPlay(false)
            dispatch(
              registerClip({
                clip: {
                  tracksId: tmpTrackId,
                  clipId: id,
                  isPlaying: false
                }
              })
            )
          }}
        >
          <CloseIcon style={{ width: 16 }}></CloseIcon>
        </IconButton>
      </div>
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          height: '13%'
        }}
      >
        <IconButton
          onClick={() => {
            handlePlayPause()
          }}
          aria-label='play'
        >
          {isPlaying ? (
            <PauseIcon style={{ width: 16 }}></PauseIcon>
          ) : (
            <PlayIcon style={{ width: 16 }} />
          )}
        </IconButton>
        <IconButton
          onClick={() => {
            dispatch(
              toggleIsLooping({
                tracksId: tmpTrackId,
                clipId: id,
                isLooping: !isLooping
              })
            )
          }}
          aria-label='loop'
        >
          {isLooping ? (
            <LoopIcon style={{ width: 16 }}></LoopIcon>
          ) : (
            <NoLoopIcon style={{ width: 16 }} />
          )}
        </IconButton>
        <IconButton
          aria-label='skip-backward'
          onClick={() => {
            wavesurfer.current.skip(-1)
            wavesurfer.current.play()
          }}
        >
          <FastRewindIcon style={{ width: 16 }}></FastRewindIcon>
        </IconButton>
        <IconButton
          aria-label='skip-forward'
          onClick={() => {
            wavesurfer.current.skip(1)
            wavesurfer.current.play()
          }}
        >
          <FastForwardIcon style={{ width: 16 }}></FastForwardIcon>
        </IconButton>

        <IconButton
          onClick={() => {
            //removeFile(src)
            dispatch(markForRemoval({ tracksId: tmpTrackId, clipId: id }))
            // handlePlayPause()

            setPlay(false)
            dispatch(
              registerClip({
                clip: {
                  tracksId: tmpTrackId,
                  clipId: id,
                  isPlaying: false
                }
              })
            )
          }}
          aria-label='load-file'
        >
          <SaveIcon style={{ width: 16 }}></SaveIcon>
        </IconButton>
        <IconButton
          onClick={() => {
            openWith(src)
          }}
          aria-label='open-in-files'
        >
          <OpenWithIcon style={{ width: 16 }}></OpenWithIcon>
        </IconButton>
        <div>{duration}</div>
      </div>
      <div
        style={{
          width: '100%',
          display: isWaveformShown ? 'unset' : 'none'
        }}
        id='waveform'
        ref={waveformRef}
      />

      <div style={{ width: '100%' }}>
        <Slider
          onChange={onVolumeChange}
          value={volume}
          name='volume'
          min={0.01}
          max={1}
          step={0.025}
          valueLabelDisplay='off'
          aria-labelledby='range-slider'
        />
      </div>
    </div>
  )

  function handlePlayPause() {
    setPlay(!playing)
    if (isPlaying) {
      dispatch(
        registerClip({
          clip: {
            tracksId: tmpTrackId,
            clipId: id,
            isPlaying: false
          }
        })
      )
    } else {
      dispatch(
        registerClip({
          clip: {
            tracksId: tmpTrackId,
            clipId: id,
            isPlaying: true
          }
        })
      )
    }
  }
  function formWaveSurferOptions(ref) {
    return {
      container: ref,
      audioContext,
      // audioScriptProcessor: new AudioWorkletNode(audioContext, 'audioContext'),
      // closeAudioContext: false,
      barWidth: 2,
      barRadius: 2,
      responsive: true,
      height: 80,
      normalize: true,
      partialRender: true
      // backend: 'WebAudio'
    }
  }

  function onVolumeChange(e, value) {
    const newVolume = +value

    if (newVolume) {
      dispatch(
        changeClipVolume({
          clipId: id,
          tracksId: tmpTrackId,
          volume: newVolume
        })
      )
      wavesurfer.current.setVolume(newVolume || 1)
    }
  }
}

Clip.propTypes = {
  index: PropTypes.any
}
