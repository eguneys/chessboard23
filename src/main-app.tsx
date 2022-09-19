import { createSignal, createMemo } from 'solid-js'
import Chessboard23 from './view'
import { MobileSituation } from 'lchessanalysis'
import { initial_fen } from 'solid-play'
import { read, write, owrite } from 'solid-play'

const App = () => {

  let _fen = createSignal('w wr@b4')
  let m_fen = createMemo(() => read(_fen))


  setTimeout(() => {
      owrite(_fen, 'w wr@h3')
      }, 100)

  setTimeout(() => {
      owrite(_fen, `w wr@b4 bk@a1 dark,white@@b1 black@@c3 e4@6.5-0.5`)
      }, 2000)


  setTimeout(() => {
      owrite(_fen, `b wr@a4 bk@a8 dark,white@@b1 black@@c3 wq@c4 e4@6.5-0.5`)
      }, 4000)

  setTimeout(() => {
    owrite(_fen, `w ` + MobileSituation.from_fen(initial_fen).board.pieses.join(' '))
      }, 5000)


  return (<>
      <Chessboard23 fen={m_fen()}/>
      </>)
}



export default App
