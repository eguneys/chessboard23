import { onCleanup, on, createEffect, createSignal, createMemo, mapArray } from 'solid-js'
import { read, write, owrite } from 'solid-play'
import { ease, ticks, lerp, Vec2, loop_for } from 'solid-play'
import { make_sticky_pos } from 'solid-play'
import { ranks_reversed, role_long, color_long, initial_fen, poss, ranks, vec2_orientation, poss_vec2 } from 'solid-play'

const transform_style = (v: Vec2) => {
  return {
    transform: `translate(calc(100% * ${v.x}), calc(100% * ${v.y}))`
  }
}

const piese_d = piese => {
  let [,_pos] = piese.split('@')
  return poss.indexOf(_pos)
}

const normal_vec2 = normal => {
  return Vec2.make(...normal.split(','))
}

export class _Chessboard23 {

  set fen(fen: string) { owrite(this._fen, fen) }
  get squares() { return this.m_squares() }
  get pieses() { return this.m_pieses() }
  get ranks() { return this.m_ranks() }
  get orientation() { return this.m_orientation() }

  constructor() {

    this._fen = createSignal(initial_fen)
    let m_fen = createMemo(() => {
      let fen = read(this._fen)
      let res = [,[],[],[]]
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

        let [pos, v_pos] = _.split('@')
        if (v_pos && poss.includes(pos)) {
          res[3].push(_)
          return
        }

        let [piese, _pos] = _.split('@')
        if (_pos) {
          res[1].push(_)
        }
      })
      return res
    })

    let m_orientation = createMemo(() => m_fen()[0])
    let m_squares = createMemo(() => m_fen()[2])
    let m_pieses = createMemo(() => m_fen()[1])
    let m_instants = createMemo(() => m_fen()[3])

    let free = [...Array(64).keys()].map(_ => Vec2.make(-8, -8))
    this._sticky_pos = make_sticky_pos(free)

    this.m_orientation = m_orientation


    this.m_pieses = createMemo(mapArray(() => {
      let orientation = m_orientation()
      return m_pieses()
      .map(_ => [orientation, _].join('__O__'))
    }, (orientation_) => {
      let [orientation, _] = orientation_.split('__O__')
      let [piece,_pos_or] = _.split('@')

      let _pos = poss_vec2.get(_pos_or) || normal_vec2(_pos_or)
      let _desired_pos = vec2_orientation(_pos, orientation)
      let _pos0 = this._sticky_pos.acquire_pos(piece, _desired_pos)
      
      let res = make_piese(this, _, _pos0, _desired_pos)
      onCleanup(() => {
        this._sticky_pos.release_pos(piece, res.pos)
      })

      
      return res
    }))

    this.m_squares = createMemo(mapArray(m_squares, _ => make_square(this, _)))
    this.m_ranks = createMemo(() => m_orientation() === 'w' ? ranks : ranks_reversed)

    createEffect(on(this.m_pieses, () => {
      this._sticky_pos.reset_fix_all()
    }))
  }
}

export type Board = _Chessboard23

export const make_square = (board: Board, square: string) => {
  let [_klass, _pos] = square.split('@@')

  let m_pos = createMemo(() => vec2_orientation(poss_vec2.get(_pos), board.orientation))
  let klass = ['square', ..._klass.split(',')].join(' ')
  return {
    get style() { return transform_style(m_pos()) },
    klass
  }
}

export const make_piese = (board: Board, piese: string, _pos0: Vec2, _desired_pos: Vec2) => {
  let [_klass] = piese.split('@')
  let piece = _klass

  let klass = ['piese', color_long[_klass[0]], role_long[_klass[1]]].join(' ')

  let _tween_pos = createSignal(_pos0.clone)

  let cancel = loop_for(ticks.half, (dt: number, dt0: number, i) => {
    owrite(_tween_pos, () =>
           Vec2.make(
             lerp(_pos0.x, _desired_pos.x, ease(i)),
             lerp(_pos0.y, _desired_pos.y, ease(i))
           ))
  })

  onCleanup(()  => {
    cancel()
  })

  return {
    klass,
    get style() { return transform_style(read(_tween_pos)) },
    get pos() { return read(_tween_pos) }
  }
}


