import './wrap.css'
import { createSignal, createMemo } from 'solid-js'
import Chessboard23 from './view'
import { MobileSituation } from 'lchessanalysis'
import { initial_fen } from 'solid-play'
import { read, write, owrite } from 'solid-play'
import { make_ref, set_$ref, make_drag_ref } from 'solid-play'



const App = () => {

  let _shapes = createSignal('')

  let _drag = createSignal()

  let _fen = createSignal('w wr@b4')
  let m_fen = createMemo(() => read(_fen))

  let ref = make_ref()

  owrite(_shapes, `red-circle@h1~ red-arrow@a4,b5~`)

  setTimeout(() => {

      owrite(_shapes, `green-circle@h1 red-arrow@a4,b5`)
      }, 2000)

  make_drag_ref({
      on_drag(e, start) {
      let pos = ref.get_normal_at_abs_pos(e.m || e.e).scale(8)
      owrite(_drag, 'wr@' + pos.vs.join(','))
      }
    }, ref)


  setTimeout(() => {
      owrite(_fen, `b wr@a4 bk@a8 dark,white@@b1 black@@c3 wq@c4 wr@6.5,-0.5`)
      }, 4000)


  return (<>
    <div class='board-wrap' ref={set_$ref(ref)}>
      <Chessboard23 shapes={read(_shapes)} drag={read(_drag)} fen={m_fen()}/>
    </div>
  </>)
}


const testfen = (_fen) => {

  let f1 = MobileSituation.from_fen('1k6/6r1/2Qp3p/3Bp3/2N1P1p1/P7/1PP3PP/5r1K w -').board.pieses.join(' ')
  let f2 = MobileSituation.from_fen('1k3r2/6r1/2Qp3p/3Bp3/2N1P1p1/P7/1PP3PP/5R1K b -').board.pieses.join(' ')

 f1 = MobileSituation.from_fen('2kr4/p1p2pp1/1P4p1/1P2P3/3r1PP1/PQ2Pn1P/2KRR3/5q2 w -').board.pieses.join(' ')
 f2 = MobileSituation.from_fen('2kr4/p1pr1pp1/1P4p1/1P2P3/3B1PP1/PQ2Pn1P/2KRR3/5q2 b -').board.pieses.join(' ')


  setTimeout(() => {
      owrite(_fen, 'w ' + f1)
      }, 100)

  setTimeout(() => {
      owrite(_fen, 'w ' + f2)
      //owrite(_fen, `w wr@b4 bk@a1 dark,white@@b1 black@@c3 e4@6.5-0.5`)
      }, 2000)
}



export default App
