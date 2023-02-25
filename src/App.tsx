import React, { useMemo, useState, useEffect } from 'react';
import produce from 'immer';
import styled, { css } from 'styled-components';

import Header from './components/Header';

interface ActivedCell {
  isActive: true;
  isFlowing: boolean;
}

interface BlankCell {
  isActive: false;
  isFlowing: false;
}

type CellBlock = ActivedCell | BlankCell;

interface Cell {
  row: number;
  col: number;
  block: ActivedCell | BlankCell;
}

// 빈셀은 항상 이 객체를 참조하는 것으로 렌더링을 피한다.
const setCellBlank = () => blankCell;
const BOARD_WIDTH = 350;

const COL_MAX = 10;
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
    height: 34.89px;
    border: 1px solid black;
    border-left: none;
    border-top: none;
  }
`;

const initCell = (row: number, col: number): Cell => ({
  col,
  row,
  block: {
    isActive: false,
    isFlowing: false,
  },
});

const blankCell: BlankCell = {
  isActive: false,
  isFlowing: false,
};

const initBoard: Cell[][] = Array.from({ length: ROW_MAX }, (_, i) =>
  Array.from({ length: COL_MAX }, (_, j) => initCell(i, j))
);

const TETROMINO = [
  [
    // 1번
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
];

export default function App() {
  const [running, setRunning] = useState(true);
  const [board, setBoard] = useState(initBoard);

  // 항상 board가 바뀌기때문에 memo를 쓰는것은 손해다
  const cells = countBoardCell(board);

  const onToggleRun = () => setRunning(!running);

  // useEffect에서 언제 cleanup함수가 실행되는가?
  // deps의 변화가 cleanup을 호출한다.
  // 함수가 변수의 최근상태를 참조하지 못한다...
  useEffect(() => {
    let requestId: number;

    // setTimeout(createBlocks, 500);

    const gameLoop = () => {
      if (running) {
        updateBoard();
        requestId = setTimeout(gameLoop, 1000);
      }
    };

    gameLoop();

    return () => {
      console.log('clearTimeout!');
      clearTimeout(requestId);
    };
  }, [running]);

  const createBlock = () => {
    const ROW = 0,
      COL = 3;

    setBoard(
      produce((draft) => {
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            if (TETROMINO[0][i][j]) {
              draft[ROW + i][COL + j].block = {
                isActive: true,
                isFlowing: true,
              };
            } else {
              draft[ROW + i][COL + j].block = {
                isActive: false,
                isFlowing: false,
              };
            }
          }
        }
      })
    );
  };

  const updateBoard = () => {
    setBoard(
      produce((draft) => {
        for (let i = ROW_MAX - 1; i >= 0; i--) {
          for (let j = 0; j < COL_MAX; j++) {}
        }
      })
    );
  };

  return (
    <>
      <Header
        cells={cells}
        running={running}
        onToggleRun={onToggleRun}
        createBlock={createBlock}
      />
      <Board board={board} />
    </>
  );
}

interface BoardProps {
  board: Cell[][];
}

// Board컴포넌트의 Props가 이전 렌더링때와 똑같다면
// 렌더링하지말고 이전 렌더링 값을 그대로 이용해주세요.
const Board = ({ board }: BoardProps) => {
  console.log('board render!!');

  return (
    <>
      <BoardBlock>
        {board.map((row) =>
          row.map((cell) => <Cell key={cell.col} cell={cell} />)
        )}
      </BoardBlock>
    </>
  );
};

const CellBlock = styled.div`
  ${({ isActive }: { isActive: boolean }) => css`
    background-color: ${isActive ? 'red' : 'unset'};
  `}
`;

interface CellProps {
  cell: Cell;
}

const Cell = React.memo(({ cell }: CellProps) => {
  console.log(cell);
  const { row, col } = cell;
  // console.log(`너.. ${row}-${col} 리렌더링?`);
  return <CellBlock isActive={cell.block.isActive}>{col}</CellBlock>;
});

// 리렌더 체크용
function countBoardCell(board: Cell[][]) {
  // console.log(`count!`);
  return board.reduce(
    (pre, row) =>
      pre + row.reduce((pre, cell) => pre + (cell.block.isActive ? 1 : 0), 0),
    0
  );
}
