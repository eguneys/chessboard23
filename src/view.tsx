import { Index, Show, For, Component } from 'solid-js'
import { createEffect } from 'solid-js'
import { _Chessboard23 } from './ctrl'
import { long_color } from 'solid-play'

const Chessboard23: Component<{ shapes: string, drag: string | undefined, fen: string }> = (props) => {


  let ctrl = new _Chessboard23()

  createEffect(() => { ctrl.drag = props.drag })
  createEffect(() => { ctrl.fen = props.fen })
  createEffect(() => { ctrl.shapes = props.shapes || '' })



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
         
          <Show keyed when={ctrl._drag_piese.style}>{ style =>
            <div class={ctrl._drag_piese.klass} style={style}/>
          }</Show>
      </div>
      <svg class='shapes' viewBox='-4 -4 8 8' preserveAspectRatio='xMidYMid slice'>
         <defs>
           <For each={ctrl.arrows}>{arrow =>
             <marker id={`arrowhead-${arrow.id}`} orient="auto" markerWidth="4" markerHeight="8" refX="2.05" refY="2.01"><path d="M0,0 V4 L3,2 Z" fill={arrow.stroke}></path></marker>
           }</For>
          </defs>
            <g>
              <For each={ctrl.circles}>{ circle => 
                <circle stroke={circle.stroke} stroke-width={circle.drawing ? "0.046875" : "0.0625"} fill="none" opacity={circle.opacity} cx={circle.cx} cy={circle.cy} r="0.46875"></circle>
              }</For>
              <For each={ctrl.arrows}>{ arrow =>
                <line stroke={arrow.stroke} stroke-width="0.15625" stroke-linecap="round" marker-end={`url(#arrowhead-${arrow.id})`} opacity={arrow.opacity} x1={arrow.x1} y1={arrow.y1} x2={arrow.x2} y2={arrow.y2}></line>
              }</For> 
            </g>
         </svg>

     </div>
   </>)
}

export default Chessboard23
