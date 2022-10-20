import { Signal } from 'solid-js'
import { onCleanup, on, createEffect, createSignal, createMemo, mapArray } from 'solid-js'
import { read, write, owrite, Memo } from 'solid-play'
import { ease, ticks, lerp, Vec2, loop_for } from 'solid-play'
import { Sticky } from 'solid-play'
import { Role, Color, ranks_reversed, role_long, color_long, initial_fen, poss, ranks, vec2_orientation, poss_vec2 } from 'solid-play'

import { m_log } from 'solid-play'


const transform_style = (v: Vec2) => {
  return {
    transform: `translate(calc(100% * ${v.x}), calc(100% * ${v.y}))`
  }
}


const normal_vec2 = (normal: string): Vec2 => {
  let _ = normal.split(',')
  return Vec2.make(parseFloat(_[0]), parseFloat(_[1]))
}



export type Rank = string
export type Pos = string

export class _Chessboard23 {

  set shapes(fen: string) { owrite(this._shapes, fen) }
  set drag(piese: string | undefined) { this._drag_piese.piese = piese }
  set fen(fen: string) { owrite(this._fen, fen) }
  get squares() { return this.m_squares() }
  get pieses() { return this.m_pieses() }
  get ranks() { return this.m_ranks() }
  get orientation() { return this.m_orientation() }

  get circles() { return this.m_circles() }
  get arrows() { return this.m_arrows() }

  _fen: Signal<string>
  _sticky_pos: Sticky<string>
  _shapes: Signal<string>
  m_circles: Memo<Array<Circle>>
  m_arrows: Memo<Array<Arrow>>
  m_pieses: Memo<Array<Piese>>
  m_squares: Memo<Array<Square>>
  m_ranks: Memo<Array<Rank>>
  m_orientation: Memo<Color>

  _drag_piese: DragPiese

  constructor() {

    this._drag_piese = DragPiese.make(this)

    this._fen = createSignal(initial_fen)
    let m_fen: Memo<any> = createMemo(() => {
      let fen = read(this._fen)
      let res: any = [,[],[],[]]
      fen.split(' ').forEach(_ => {
        if (_ === 'w' || _ === 'b') {
          res[0] = _
          return
        }

        let [square, s_pos] = _.split('@@')
        if (s_pos) {
          res[2].push(_)
          return
        }

        let [piese, _pos] = _.split('@')
        if (poss.includes(_pos)) {
          res[1].push(_)
          return
        }
      })
      return res
    })

    let m_orientation: Memo<Color> = createMemo(() => m_fen()[0])
    let m_squares: Memo<Array<string>> = createMemo(() => m_fen()[2])
    let m_pieses: Memo<Array<string>> = createMemo(() => m_fen()[1])

    let free = [...Array(64).keys()].map(_ => Vec2.make(-8, -8))
    this._sticky_pos = Sticky.make<string>(free)

    this.m_orientation = m_orientation


    this.m_pieses = createMemo(mapArray(() => {
      let orientation = m_orientation()
      return m_pieses()
      .map(_ => [orientation, _].join('__O__'))
    }, (orientation_: string) => {
      let [orientation, _] = orientation_.split('__O__')
      let [piece, _pos_or] = _.split('@')

      let _pos = poss_vec2.get(_pos_or)!
      let _desired_pos = vec2_orientation(_pos, orientation as Color)
      let _pos0 = this._sticky_pos.acquire_pos(piece, _desired_pos)
      
      let res = Piese.make(this, _, _pos0, _desired_pos)
      onCleanup(() => {
        this._sticky_pos.release_pos(piece, res.pos)
      })
      return res
    }))

    this.m_squares = createMemo(mapArray(m_squares, _ => Square.make(this, _)))
    this.m_ranks = createMemo(() => m_orientation() === 'w' ? ranks : ranks_reversed)

    createEffect(on(this.m_pieses, () => {
      this._sticky_pos.reset_fix_all()
    }))



    this._shapes = createSignal('')
    let m_shapes = createMemo(() => {
      let shapes = read(this._shapes)

      let res: Array<Array<string>> = [[],[]]

      shapes.split(' ').forEach(_ => {
        let [shape, _pos] = _.split('@')

        if (shape.match('circle')) {
          res[0].push(_)
        }

        if (shape.match('arrow')) {
          res[1].push(_)
        }
      })

      return res
    })

    let m_circles = createMemo(() => m_shapes()[0])
    this.m_circles = createMemo(mapArray(m_circles, _ => Circle.make(this, _)))

    let m_arrows = createMemo(() => m_shapes()[1])
    this.m_arrows = createMemo(mapArray(m_arrows, _ => Arrow.make(this, _)))
  }
}

export type Board = _Chessboard23



class DragPiese {

  set piese(piese: string | undefined) {
    owrite(this._piese, piese)
  }
  get klass() { return this.m_klass() }
  get style() { 
    let _ = read(this._tween_pos)

    return _ && transform_style(_.sub(Vec2.make(0.5, 0.5)))
  }
  get pos() { return read(this._tween_pos) }

  static make = (board: Board) => {
    return new DragPiese(board)
  }

  _piese: Signal<string | undefined>
  _tween_pos: Signal<Vec2 | undefined>
  m_klass: Memo<string>

  constructor(readonly board: Board) {

    let _piese: Signal<string | undefined> = createSignal()
    let m_piece_pos = createMemo(() => read(_piese)?.split('@'))

    let m_klass = createMemo(() => {
      let _klass = m_piece_pos()?.[0]

      if (_klass) {
        return ['piese dragging', color_long[_klass[0] as Color], role_long[_klass[1] as Role]].join(' ')
      }
      return ''
    })

    let m_desired_pos = createMemo(() => {
      let _ = m_piece_pos()?.[1]
      if (_) {
        return normal_vec2(_)
      }
      return undefined
    })
    let _tween_pos: Signal<Vec2 | undefined> = createSignal(m_desired_pos())

    this._piese = _piese
    this._tween_pos = _tween_pos
    this.m_klass = m_klass

    createEffect(on(m_desired_pos, (desired_pos) => {
      if (desired_pos) {
        onCleanup(
          loop_for(ticks.five, (dt: number, i) => {
            owrite(_tween_pos, _ =>
                   Vec2.make(
                     lerp(_?.x || desired_pos.x, desired_pos.x, 0.5),
                     lerp(_?.y || desired_pos.y, desired_pos.y, 0.5)
                   ))
          })
        )
      } else {
        owrite(_tween_pos, undefined)
      }
    }))


  
  }
}

class Piese {

  static make = (board: Board, piese: string, pos0: Vec2, _desired_pos: Vec2) => {
    return new Piese(board, piese, pos0, _desired_pos)
  }

  get style() { return transform_style(read(this._tween_pos)) }
  get pos() { return read(this._tween_pos) }

  klass: string
  _tween_pos: Signal<Vec2>

  constructor(readonly board: Board, 
              readonly piese: string,
              readonly _pos0: Vec2,
              readonly _desired_pos: Vec2) {
              
      let [_klass] = piese.split('@')
      let piece = _klass
      
      let klass = ['piese', color_long[_klass[0] as Color], role_long[_klass[1] as Role]].join(' ')
      
      let _tween_pos = createSignal(_pos0.clone)

      this._tween_pos = _tween_pos
      this.klass = klass

      onCleanup(
        loop_for(ticks.half, (dt: number, i) => {
          owrite(_tween_pos, () =>
                 Vec2.make(
                   lerp(_pos0.x, _desired_pos.x, ease(i)),
                   lerp(_pos0.y, _desired_pos.y, ease(i))
                 ))
        })
      )
              }
}


class Square {
  static make = (board: Board, square: string) => {
    return new Square(board, square)
  }


  get style() { return transform_style(this.m_pos()) }

  m_pos: Memo<Vec2>
  klass: string

  constructor(readonly board: Board, readonly square: string) {
    let [_klass, _pos] = square.split('@@')

  let m_pos = createMemo(() => vec2_orientation(poss_vec2.get(_pos)!, board.orientation))
  let klass = ['square', ..._klass.split(',')].join(' ')
  this.m_pos = m_pos
  this.klass = klass

  }
}



const pos2user = (v: Vec2) => {
  return Vec2.make(v.x - 3.5, v.y - 3.5)
}



class Circle {
  static make = (board: Board, circle: string) => {
    return new Circle(board, circle)
  }

  cx: number
  cy: number
  stroke: string
  drawing: boolean

  get opacity() {
    return this.drawing ? 0.9 : 1.0
  }

  constructor(readonly board: Board, readonly circle: string) {
  
  let [_circle, _drawing] = circle.split('~')

  let drawing = _drawing === ''

  let [brush, pos] = _circle.split('@')

  let stroke = brush.match('red') ? 'red' : 'green'

  let [cx, cy] = pos2user(poss_vec2.get(pos)!).vs


  this.drawing = drawing
  this.stroke = stroke
  this.cx = cx
  this.cy = cy
  
  }
}


class Arrow {
  static make = (board: Board, arrow: string) => {
    return new Arrow(board, arrow)
  }

  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  stroke: string
  drawing: boolean

  get opacity() {
    return this.drawing ? 0.9 : 1.0
  }

  constructor(readonly board: Board, readonly arrow: string) {
  
    let [_arrow, _drawing] = arrow.split('~')

    let drawing = _drawing === ''

    let [brush, _pos1_pos2] = _arrow.split('@')
    let [_pos1, _pos2] = _pos1_pos2.split(',')

    let stroke = brush.match('red') ? 'red' : 'green'


    let [x1, y1] = pos2user(poss_vec2.get(_pos1)!).vs
    let [x2, y2] = pos2user(poss_vec2.get(_pos2)!).vs

    let id = stroke[0]


    this.drawing = drawing
    this.stroke = stroke
    this.id = id
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2

  }
}
