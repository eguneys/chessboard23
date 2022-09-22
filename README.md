# Chess Board component for Solid JS for the 2023

Place chess pieces and color squares on a colorless chess board.

Add dependency

    cd yourawesomeproject
    pnpm link vchessboard

    cp node_modules/vchessboard/dist/bundle.css assets/

Alternatively check out the css files in the src/style.css and src/theme.css.

    <!-- Include is2d klass to pickup piece styling -->
    <div class='is2d' id='app'></div>



    import Chessboard23 from 'chessboard23'

    const App = () => {


      // shapes
      // note: append ~ if still drawing (mouse is down)
      // circle white-circle@b4~
      // arrow red-arrow@b4,c6

      // drag wr@-1.0,2.532


      // color  w or b
      // pieses wr@b4
      // squares dark,white@@b1
      // free pieses wr@6.5,-0.5

      let fen = `w wr@b4 bk@a1 dark,white@@b1 black@@c3 wr@6.5,-0.5`
      return <Chessboard23 shapes={shapes} drag={drag} fen={fen}/>
    }

