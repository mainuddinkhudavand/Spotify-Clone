import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const { addSongToHistory } = useContext(AuthContext);

  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // in seconds
  const [duration, setDuration] = useState(0); // in seconds
  const [volume, setVolume] = useState(0.7); // 0 to 1
  const [playlist, setPlaylist] = useState([]); // Current queue/playlist of songs
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const audioRef = useRef(new Audio());

  // Setup event listeners for audio object
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(err => console.error("Playback error", err));
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playlist, currentIndex, isShuffle, isRepeat]);

  // Volume control effect
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  // Set src and handle play state
  const playSong = (song, customPlaylist = []) => {
    const audio = audioRef.current;
    
    if (customPlaylist.length > 0) {
      setPlaylist(customPlaylist);
      const index = customPlaylist.findIndex(s => s._id === song._id);
      setCurrentIndex(index >= 0 ? index : 0);
    } else if (playlist.length === 0 || !playlist.some(s => s._id === song._id)) {
      setPlaylist([song]);
      setCurrentIndex(0);
    } else {
      const index = playlist.findIndex(s => s._id === song._id);
      if (index >= 0) {
        setCurrentIndex(index);
      }
    }

    if (currentSong && currentSong._id === song._id) {
      // Just toggle play if it's the same song
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().catch(err => console.error("Playback error", err));
        setIsPlaying(true);
      }
    } else {
      // Change song
      audio.pause();
      setCurrentSong(song);
      audio.src = song.audioUrl;
      audio.load();
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            // Log to history
            addSongToHistory(song._id);
          })
          .catch(err => {
            console.error("Playback failed/interrupted", err);
            setIsPlaying(false);
          });
      }
    }
  };

  const pauseSong = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!currentSong) return;
    if (isPlaying) {
      pauseSong();
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error("Playback error", err));
    }
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= playlist.length) {
        nextIndex = 0; // Loop back to start
      }
    }
    
    setCurrentIndex(nextIndex);
    const nextSong = playlist[nextIndex];
    if (nextSong) {
      playSong(nextSong, playlist);
    }
  };

  const previousTrack = () => {
    if (playlist.length === 0) return;
    
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = playlist.length - 1; // Wrap around to end
    }
    
    setCurrentIndex(prevIndex);
    const prevSong = playlist[prevIndex];
    if (prevSong) {
      playSong(prevSong, playlist);
    }
  };

  const seekTo = (seconds) => {
    audioRef.current.currentTime = seconds;
    setProgress(seconds);
  };

  return (
    <PlayerContext.Provider value={{
      currentSong,
      isPlaying,
      progress,
      duration,
      volume,
      playlist,
      currentIndex,
      isShuffle,
      isRepeat,
      playSong,
      pauseSong,
      togglePlay,
      nextTrack,
      previousTrack,
      seekTo,
      setVolume,
      setIsShuffle,
      setIsRepeat,
      setPlaylist
    }}>
      {children}
    </PlayerContext.Provider>
  );
};
