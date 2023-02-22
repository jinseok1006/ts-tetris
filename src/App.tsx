import React, { useState, useCallback, useMemo } from 'react';
import produce from 'immer';
import styled from 'styled-components';

// 리렌더 발생 꼭 확인하기!

interface Cell {
  row: number;
  col: number;
  block: boolean;
}

const BOARD_WIDTH = 350;

const COL_MAX = 12;
const ROW_MAX = 20;

const BoardBlock = styled.div`
  width: ${BOARD_WIDTH}px;
  margin: 0 auto;
  margin-top: 3rem;
  display: flex;
  flex-flow: row wrap;
  border: 1px solid black;
  border-bottom: none;
  border-right: none;

  div {
    width: calc(100% / ${COL_MAX});
    height: 29.12px;
    border: 1px solid black;
    border-left: none;
    border-top: none;
  }
`;

const Header = styled.div`
  text-align: center;
`;

const initCell = (row: number, col: number): Cell => ({
  col,
  row,
  block: false,
});

const initBoard: Cell[][] = Array.from({ length: ROW_MAX }, (_, i) =>
  Array.from({ length: COL_MAX }, (_, j) => initCell(i, j))
);

export default function App() {
  const [board, setBoard] = useState(initBoard);
  const [test, setTest] = useState(false);

  const cells = useMemo(() => countBoardCell(board), [board]);

  const onClick = () => setTest(!test);
  const onToggle = useCallback(
    (rowInput: number, colInput: number) =>
      setBoard(
        produce((draft) => {
          draft[rowInput][colInput].block = !draft[rowInput][colInput].block;
        })
      ),
    []
  );

  return (
    <>
      <Header>
        <h1>{cells}</h1>
        <h2 onClick={onClick}>{test ? 'true' : 'false'}</h2>
      </Header>
      <Board board={board} onToggle={onToggle} />
    </>
  );
}

interface BoardProps {
  board: Cell[][];
  onToggle: (r: number, c: number) => void;
}

// board에 memo를 주면 cell또한 리렌더링하지않는다. 물론 board가 변하지않았을때기준
const Board = React.memo(({ board, onToggle }: BoardProps) => {
  console.log('board render!!');
  return (
    <>
      <BoardBlock>
        {board.map((row) =>
          row.map((cell) => (
            <Cell key={cell.col} cell={cell} onToggle={onToggle} />
          ))
        )}
      </BoardBlock>
    </>
  );
});

interface CellProps {
  cell: Cell;
  onToggle: (r: number, c: number) => void;
}

const Cell = React.memo(({ cell, onToggle }: CellProps) => {
  const { row, col } = cell;
  console.log(`너.. ${row}${col} 리렌더링?`);
  return <div onClick={() => onToggle(row, col)}>{col}</div>;
});

// 리렌더 체크용
function countBoardCell(board: Cell[][]) {
  console.log('render');
  return board.length * board[0].length;
}
