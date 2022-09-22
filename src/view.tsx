/* @refresh reload */
import { createEffect } from 'solid-js'
import { _Chessboard23 } from './ctrl'
import { long_color } from 'solid-play'


export default function(props) {

  let ctrl = new _Chessboard23()

  createEffect(() => {
    ctrl.drag = props.drag
    ctrl.fen = props.fen
    })

  return (<>
    <div class={['chessboard', long_color[ctrl.orientation]].join(' ')}>
    <div class='squares'>
         <For each={ctrl.squares}>{ (square, i) =>
           <div class={square.klass} style={square.style}/>
           }</For>
       </div>
       <div class='files'>
         <Index each={'abcdefgh'.split('')}>{ (file, i) =>
           <div class='file'>{file()}</div>
           }</Index>
       </div>
       <div class='ranks'>
         <Index each={ctrl.ranks}>{ (rank, i) =>
           <div class='rank'>{rank()}</div>
         }</Index>
       </div>
       <div class='pieses'>
         <For each={ctrl.pieses}>{ (piese, i) =>
           <div class={piese.klass} style={piese.style}/>
          }</For>
         
          <Show when={ctrl._drag_piese.style}>{ style =>
            <div class={ctrl._drag_piese.klass} style={style}/>
          }</Show>
       </div>
    </div>
      </>)


}
