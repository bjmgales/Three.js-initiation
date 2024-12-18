import { useState, useEffect, useRef } from 'react'
import './App.css'
import Three from './Player/three.tsx'
import ThreeCreator from './Creator/three_creator.tsx'
import Menu from './Menu Overlay/Menu.tsx'

const App = () => {

  const [isStart, setStart] = useState<boolean>(false);
  useEffect(() => {
    fetch("http://localhost:8000/")
      .then((response) => response.json()
      )
  }, []);
  const [endTrip, setEndTrip] = useState<boolean>(false);
  const [isReset, setIsReset] = useState<boolean>(false);
  const [isUpload, setUpload] = useState<boolean>(true);
  const [isCreator, setCreator] = useState<boolean>(false);
  const [isMusic, setMusic] = useState<boolean>(false);
  const [isSounds, setSounds] = useState<boolean>(false);
  const [newPath, setNewPath] = useState<{ [key: string]: string }>({})
  const handleChange = (event: Event) => {
    const e = event.target as HTMLInputElement
    if (!e || !e.files)
      return;
    const f = e.files[0]
    let reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target)
        return;
      let content = e.target.result as string
      setNewPath(JSON.parse(content))
      handleReset();
    }
    reader.readAsText(f);
  }

  const fileRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    fileRef.current!.addEventListener('change', handleChange);
    return () => {
      fileRef.current?.removeEventListener('change', handleChange);
    }
  }, [])

  const handleReset = async () => {
    setIsReset(true);
    setStart(false);
    setEndTrip(false)
    setUpload(true);
    setTimeout(() => {
      setIsReset(false);
    }, 0.1)
  }
  return (
    <>
      <audio className='sounds' src='/assets/ambiance.mp3' loop></audio>
      <audio className='music' src='/assets/taxi-driver-theme.mp3' loop></audio>
      <Menu
        isStart={isStart} setStart={setStart}
        endTrip={endTrip} setEndTrip={setEndTrip}
        isReset={isReset} setIsReset={setIsReset}
        isCreator={isCreator} setCreator={setCreator}
        isMusic={isMusic} setMusic={setMusic}
        isSounds={isSounds} setSounds={setSounds}
        isUpload={isUpload} setUpload={setUpload}
        fileRef={fileRef}
      ></Menu>
      {
        !isReset && !isCreator && (
          <Three
            isStart={isStart} setStart={setStart}
            endTrip={endTrip} setEndTrip={setEndTrip}
            isReset={isReset} isCreator={isCreator}
            newPath={newPath}
          />
        )
      }
      {
        isCreator && !isReset && (
          <ThreeCreator
            isReset={isReset} isCreator={isCreator}
          />
        )
      }
    </>
  )
}

export default App
