import { v4 as uuidv4 } from 'uuid'

export const content = {
  setContent(state, { payload: { content } }) {
    state.tracks.length = 0
    state.tracks = []
    state.tracksToRemove = []
    state.tracksToRemove.length = 0
    content.forEach((pathOfTrack) => {
      state.tracks.push({
        id: `track-${uuidv4()}`,
        data: [
          {
            id: `clip-${uuidv4()}`,
            src: pathOfTrack,
            blob: null,
            volume: 0.66,
            isLooping: true,
            isWaveformShown: true,
            isPlaying: false,
            audioDriverOutName: null,
            isMarkedForHitlist: false,
            willBeRemoved: false
          }
        ]
      })
    })
  },
  addTrack(state) {
    const track = {
      id: `track-${uuidv4()}`,
      data: [
        {
          id: `clip-${uuidv4()}`,
          src: './public/beat.mp3',
          blob: null,
          volume: 0.66,
          isLooping: true,
          isWaveformShown: true,
          isPlaying: false,
          audioDriverOutName: null
        }
      ]
    }
    state.tracks.push(track)
  },
  addClipToTrack(state, { payload: { id } }) {
    const idx = state.tracks.findIndex((item) => item.id === id)
    state.tracks[idx] = {
      id,
      data: [
        ...state.tracks[idx].data,
        {
          id: `clip-${uuidv4()}`,
          src: './beat.mp3',
          blob: null,
          volume: 0.66,
          isLooping: true,
          isWaveformShown: true,
          isPlaying: false,
          audioDriverOutName: null
        }
      ]
    }
  },
  removeClip(state, { payload: { tracksId, clipId } }) {
    const tracksIdx = state.tracks.findIndex((item) => item.id === tracksId)
    const clipIdx = state.tracks[tracksIdx].data.findIndex(
      (item) => item.id === clipId
    )
    state.tracks[tracksIdx].data.splice(clipIdx, 1)
    if (state.tracks[tracksIdx].data.length === 0) {
      state.tracks.splice(tracksIdx, 1)
    }
  },
  markForHitlist(state, { payload: { tracksId, clipId } }) {
    const tracksIdx = state.tracks.findIndex((item) => item.id === tracksId)
    const clipIdx = state.tracks[tracksIdx].data.findIndex(
      (item) => item.id === clipId
    )
    state.tracks[tracksIdx].data[clipIdx].isMarkedForHitlist = true
  },
  markForRemoval(state, { payload: { tracksId, clipId } }) {
    const tracksIdx = state.tracks.findIndex((item) => item.id === tracksId)
    const clipIdx = state.tracks[tracksIdx].data.findIndex(
      (item) => item.id === clipId
    )
    state.tracks[tracksIdx].data[clipIdx].willBeRemoved = true
    state.tracksToRemove.push(state.tracks[tracksIdx].data[clipIdx])
  },
  changeClipSrc(state, { payload: { tracksId, clipId, src } }) {
    const tracksIdx = state.tracks.findIndex((item) => item.id === tracksId)
    const clipIdx = state.tracks[tracksIdx].data.findIndex(
      (item) => item.id === clipId
    )
    state.tracks[tracksIdx].data[clipIdx].src = src
  },

  changeClipVolume(state, { payload: { tracksId, clipId, volume } }) {
    const tracksIdx = state.tracks.findIndex((item) => item.id === tracksId)
    const clipIdx = state.tracks[tracksIdx].data.findIndex(
      (item) => item.id === clipId
    )
    state.tracks[tracksIdx].data[clipIdx].volume = volume
  },
  // toggleIsPlaying(state, { payload: { tracksId, clipId, isPlaying } }) {
  //   const tracksIdx = state.tracks.findIndex((item) => item.id === tracksId)
  //   const clipIdx = state.tracks[tracksIdx].data.findIndex(
  //     (item) => item.id === clipId
  //   )
  //   state.tracks[tracksIdx].data[clipIdx].isPlaying = !isPlaying
  // },
  toggleIsPlayingList(state, { payload: { clips } }) {
    clips.forEach((clip) => {
      const { tracksId, clipId, isPlaying } = clip
      const tracksIdx = state.tracks.findIndex((item) => item.id === tracksId)
      const clipIdx = state.tracks[tracksIdx].data.findIndex(
        (item) => item.id === clipId
      )

      // stop old clips
      if (isPlaying) {
        state.tracks[tracksIdx].data.forEach((clipp, idx) => {
          state.tracks[tracksIdx].data[idx].isPlaying = false
        })
      }
      state.tracks[tracksIdx].data[clipIdx].isPlaying = isPlaying
    })
  },
  toggleIsLooping(state, { payload: { tracksId, clipId, isLooping } }) {
    const tracksIdx = state.tracks.findIndex((item) => item.id === tracksId)
    const clipIdx = state.tracks[tracksIdx].data.findIndex(
      (item) => item.id === clipId
    )
    state.tracks[tracksIdx].data[clipIdx].isLooping = isLooping
  },
  setAudioDriverOutName(
    state,
    { payload: { tracksId, clipId, audioDriverOutName } }
  ) {
    const tracksIdx = state.tracks.findIndex((item) => item.id === tracksId)
    const clipIdx = state.tracks[tracksIdx].data.findIndex(
      (item) => item.id === clipId
    )
    state.tracks[tracksIdx].data[clipIdx].audioDriverOutName =
      audioDriverOutName
  },
  toggleIsWaveformShown(
    state,
    { payload: { tracksId, clipId, isWaveformShown } }
  ) {
    const tracksIdx = state.tracks.findIndex((item) => item.id === tracksId)
    const clipIdx = state.tracks[tracksIdx].data.findIndex(
      (item) => item.id === clipId
    )
    state.tracks[tracksIdx].data[clipIdx].isWaveformShown = isWaveformShown
  },
  removeMarkedTracks(state, { payload: { tracksToRemove } }) {
    tracksToRemove.forEach((track) => {
      const tracksIdx = state.tracks.findIndex(
        (item) => item.data[0].id === track.id
      )
      state.tracks.splice(tracksIdx, 1)
      // if (state.tracks[idx].data.length === 0) {
      //   state.tracks.splice(idx, 1)
      // }
    })
    state.tracksToRemove.length = 0
    //state.tracksToRemove = []
  },
  stopAll(state) {
    state.tracks.forEach((track, idx) => {
      track.data.forEach((clip, clipIdx) => {
        state.tracks[idx].data[clipIdx].isPlaying = false
      })
    })
  }
}
