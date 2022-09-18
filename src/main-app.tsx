import { createSignal, createMemo } from 'solid-js'
import Chessboard23 from './view'

const App = () => {

  let _fen = createSignal(`w wr@b4 bk@a1 dark,white@@b1 black@@c3 e4@6.5-0.5`)

  let m_fen = createMemo(() => _fen[0])


  setTimeout(() => {
    _fen[1](`b wr@a4 bk@a8 dark,white@@b1 black@@c3 wq@c4 e4@6.5-0.5`)
    }, 4000)


  return (<>
      <Chessboard23 fen={m_fen()}/>
      </>)
}



export default App
