import { createSignal, createMemo } from 'solid-js'
import Chessboard23 from './view'
import { MobileSituation } from 'lchessanalysis'
import { initial_fen } from 'solid-play'
import { read, write, owrite } from 'solid-play'

const App = () => {

  let _fen = createSignal('w wr@b4')
  let m_fen = createMemo(() => read(_fen))


  let f1 = MobileSituation.from_fen('1k6/6r1/2Qp3p/3Bp3/2N1P1p1/P7/1PP3PP/5r1K w -').board.pieses.join(' ')
  let f2 = MobileSituation.from_fen('1k3r2/6r1/2Qp3p/3Bp3/2N1P1p1/P7/1PP3PP/5R1K b -').board.pieses.join(' ')


  setTimeout(() => {
      owrite(_fen, 'w ' + f1)
      }, 100)

  setTimeout(() => {
      owrite(_fen, 'w ' + f2)
      //owrite(_fen, `w wr@b4 bk@a1 dark,white@@b1 black@@c3 e4@6.5-0.5`)
      }, 2000)


/*
  setTimeout(() => {
      owrite(_fen, `b wr@a4 bk@a8 dark,white@@b1 black@@c3 wq@c4 e4@6.5-0.5`)
      }, 4000)

  setTimeout(() => {
    owrite(_fen, `w ` + MobileSituation.from_fen(initial_fen).board.pieses.join(' '))
      }, 5000)

*/

  return (<>
      <Chessboard23 fen={m_fen()}/>
      </>)
}



export default App
