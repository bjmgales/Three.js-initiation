import download from "downloadjs"

interface Menu {
    isStart: boolean,
    setStart: React.Dispatch<React.SetStateAction<boolean>>,
    endTrip: boolean,
    setEndTrip: React.Dispatch<React.SetStateAction<boolean>>,
    isReset: boolean,
    setIsReset: React.Dispatch<React.SetStateAction<boolean>>,
    isCreator: boolean,
    setCreator: React.Dispatch<React.SetStateAction<boolean>>,
    isMusic: boolean,
    setMusic: React.Dispatch<React.SetStateAction<boolean>>,
    isSounds: boolean,
    setSounds: React.Dispatch<React.SetStateAction<boolean>>,
    isUpload: boolean,
    setUpload: React.Dispatch<React.SetStateAction<boolean>>,
    fileRef: React.MutableRefObject<HTMLInputElement | null>
}

const Menu = (props: Menu) => {
    const handleReset = async () => {
        props.setIsReset(true);
        props.setStart(false);
        props.setEndTrip(false)
        props.setUpload(true);
        setTimeout(() => {
            props.setIsReset(false);
        }, 0.1)
    }
    return (
        <>
            <div id='not-on-road'>The last point lead to an out of road trajectory.</div>
            <div className='menu'>
                <div className="menuBtns">
                    {
                        !props.endTrip && !props.isCreator &&
                        (<button className="btn" onClick={() => {
                            props.setStart(!props.isStart)
                            props.setUpload(false);
                        }}>
                            {props.isStart ? "Stop" : "Start"}
                        </button>)

                    }
                    <button className="btn reset" onClick={() => {
                        handleReset();
                    }}>
                        Reset
                    </button>
                    {
                        !props.isCreator &&
                        (
                            <button className="btn path" onClick={() => {
                                handleReset();
                                props.setCreator(true);
                            }}>
                                Create New Path
                            </button>
                        )
                    }
                    <input ref={props.fileRef} id='file' type='file' accept='.txt' />
                    {
                        props.isUpload && !props.isCreator && (
                            <>
                                <button className='btn' onClick={() => {
                                    props.fileRef.current!.click()
                                }}>
                                    Upload path
                                </button>
                            </>
                        )
                    }
                    {
                        !props.isCreator &&
                        (
                            <button className='btn' onClick={() => {
                                fetch("http://localhost:8000/get-trip")
                                    .then((response) => response.blob()
                                        .then((blob) => {
                                            download(blob, 'taxi-driver.txt');
                                        }))
                            }}>
                                Download Current Path
                            </button>
                        )
                    }
                    {
                        props.isCreator && (
                            <>
                                <button className='btn' onClick={() => {
                                    props.setCreator(!props.isCreator)
                                    handleReset()
                                }}>
                                    Back
                                </button>
                                <button className='dl_custom' onClick={() => {
                                    fetch("http://localhost:8000/get-trip")
                                        .then((response) => response.blob()
                                            .then((blob) => {
                                                download(blob, 'taxi-driver.txt');
                                            }))
                                }}>

                                    Download
                                </button>
                                <p id='tuto'>Use MouseWheel-Click two times on the road to see your trajectory.</p>
                            </>
                        )}
                </div>
                <div className="togglersDiv">
                    <button className='btn musicToggler' onClick={() => {
                        const audio = document.querySelector('.music') as HTMLAudioElement
                        let prevState = !props.isMusic;
                        props.setMusic(!props.isMusic)
                        if (prevState)
                            audio.play()
                        else {
                            audio.pause()
                            audio.currentTime = 0;
                        }
                    }}>
                        <img className='btn btnMusicToggler' src={props.isMusic ?
                            '/assets/music-on.png' :
                            '/assets/music-off.png'}></img>
                    </button>
                    <button className='btn soundToggler'
                        onClick={() => {
                            const audio = document.querySelector('.sounds') as HTMLAudioElement
                            let prevState = !props.isSounds;
                            props.setSounds(!props.isSounds)
                            if (prevState)
                                audio.play()
                            else {
                                audio.pause()
                                audio.currentTime = 0;
                            }
                        }}>
                        <img className='btn btnSoundsToggler' src={props.isSounds ? '/assets/sound-on.png' : '/assets/sound-off.png'}></img>
                    </button>
                </div>

            </div >
        </>
    )
}

export default Menu;