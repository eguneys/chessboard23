const write_shape = (shape: Shape) => {
  let [color, pos, pos2] = shape
  if (!pos2) {
    return `${color}-circle@${pos}`
  } else {
    return `${color}-arrow@${pos},${pos2}`
  }
}

export type Color = string
export type Pos = string
export type Shape = [Color, Pos] | [Color, Pos, Pos]

export class Shapes {

  static make = () => new Shapes(undefined, new Map(), new Map())

  static from_fen = (fen: string) => {

    let circles = new Map()
    let arrows = new Map()

    if (fen !== '') {
      fen.split(' ').map(_ => {
        if (_.match('circle')) {
          let [_color, pos] = _.split('@')

          circles.set(pos, [_color.split('-')[0], pos])
        } else {

          let [_color, pos_pos2] = _.split('@')
          let [pos, pos2] = pos_pos2.split(',')

          let key = pos + pos2
          arrows.set(key, [_color.split('-')[0], pos, pos2])
        }
      })
    }


    return new Shapes(undefined, circles, arrows)
  }

  get clone() {
    return new Shapes(this._drawing, this._circles, this._arrows)
  }

  get drawing_shape() {
    if (this._drawing) {
      return write_shape(this._drawing) + '~'
    }
    return undefined
  }

  get circle_shapes() {
    return [...this._circles.values()].map(write_shape).join(' ')
  }

  get arrow_shapes() {
    return [...this._arrows.values()].map(write_shape).join(' ')
  }

  get shapes() {
    return [this.circle_shapes, this.arrow_shapes, this.drawing_shape].join(' ')
  }


  get fen() {
    return [this.circle_shapes, this.arrow_shapes].join(' ')
  }

  drawing_cancel() {
    this._drawing = undefined
  }

  drawing_circle(color: string, pos: string) {
    this._drawing = [color, pos]
  }

  drawing_arrow(color: string, pos: string, pos2: string) {
    this._drawing = [color, pos, pos2]
  }

  commit_drawing() {
    if (this._drawing) {
      let [color, pos, pos2] = this._drawing

      if (pos2) {
        let key = pos + pos2

        if (this._arrows.get(key)) {
          this._arrows.delete(key)
        } else {
          this._arrows.set(key, this._drawing)
        }
      } else {
        let key = pos
        if (this._circles.get(key)) {
          this._circles.delete(key)
        } else {
          this._circles.set(key, this._drawing)
        }
      }
    }
    this._drawing = undefined
  }

  _drawing: Shape | undefined
  _circles: Map<string, Shape>
  _arrows: Map<string, Shape>

  constructor(_drawing: Shape | undefined, _circles: Map<string, Shape>, _arrows: Map<string, Shape>) {
    this._drawing = _drawing
    this._circles = _circles
    this._arrows = _arrows
  }
}
