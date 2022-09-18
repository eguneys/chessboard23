import { onCleanup, on, createEffect, createSignal, createMemo, mapArray } from 'solid-js'
import { read, write, owrite } from 'solid-play'
import { ease, ticks, lerp, Vec2, loop_for } from 'solid-play'
import { make_sticky_pos } from 'solid-play'

const initial_fen = `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`

const files = 'abcdefgh'.split('')

const ranks = '87654321'.split('')
const ranks_reversed = ranks.slice(0).reverse()


const colors = 'wb'.split('')
const roles = 'rkqbnp'.split('')

const role_long = { r: 'rook', k: 'king', q: 'queen', b: 'bishop', n: 'knight', p: 'pawn' }
const color_long = { w: 'white', b: 'black' }

const pieces = colors.flatMap(c => roles.map(r => c + r))
const poss = files.flatMap(f => ranks.map(r => f + r))

const poss_vec2 = new Map(poss.map(_ => {
  let [file, rank] = _.split('')
  let x = files.indexOf(file),
    y = ranks.indexOf(rank)
  return [_, Vec2.make(x, y)]
}))

const vec2_orientation = (v: Vec2, o: Color) => {
  if (o === 'b') {
    return Vec2.make(v.x, 7 - v.y)
  }
  return v
}


const transform_style = (v: Vec2) => {
  return {
    transform: `translate(calc(100% * ${v.x}), calc(100% * ${v.y}))`
  }
}


export class _Chessboard23 {

  set fen(fen: string) { owrite(this._fen, fen) }
  get squares() { return this.m_squares() }
  get pieses() { return this.m_pieses() }
  get ranks() { return this.m_ranks() }
  get orientation() { return this.m_orientation() }


  _acquire_pos(piece: Piece, v: Vec2) {
    let instant_track = false
    return this._sticky_pos.acquire_pos(piece, v, instant_track)
  }

  _release_pos(piece: Piece, v: Vec2) {
    this._sticky_pos.release_pos(piece, v)
  }


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
    this.m_pieses = createMemo(mapArray(m_pieses, _ => make_piese(this, _)))
    this.m_squares = createMemo(mapArray(m_squares, _ => make_square(this, _)))
    this.m_ranks = createMemo(() => m_orientation() === 'w' ? ranks : ranks_reversed)
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

export const make_piese = (board: Board, piese: string) => {
  let [_klass, _pos] = piese.split('@')
  let piece = _klass

  let m_pos = createMemo(() => vec2_orientation(poss_vec2.get(_pos), board.orientation))
  let klass = ['piese', color_long[_klass[0]], role_long[_klass[1]]].join(' ')

  let _tween_pos = createSignal(Vec2.zero)

  createEffect(on(m_pos, desired_pos => {
    let _pos0 = board._acquire_pos(piece, desired_pos)

    let cancel = loop_for(ticks.half, (dt: number, dt0: number, i) => {
      owrite(_tween_pos, () =>
        Vec2.make(
          lerp(_pos0.x, desired_pos.x, ease(i)),
          lerp(_pos0.y, desired_pos.y, ease(i))
        ))
    })

    onCleanup(()  => {
      board._release_pos(piece, read(_tween_pos))
      cancel()
    })
  }))

  onCleanup(() => {
    board._release_pos(piece, read(_tween_pos))
  })



  return {
    klass,
    get style() { return transform_style(read(_tween_pos)) },
  }
}


