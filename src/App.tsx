import React, { useMemo, useState, useEffect } from 'react';
import produce from 'immer';
import styled, { css } from 'styled-components';

import Header from './components/Header';

interface ActivedBlock {
  isActive: true;
  isFlowing: boolean;
}

interface BlankBlock {
  isActive: false;
  isFlowing: false;
}

type CellBlock = ActivedBlock | BlankBlock;

interface Cell {
  row: number;
  col: number;
  block: CellBlock;
}

const BOARD_WIDTH = 350;

const COL_MAX = 3;
const ROW_MAX = 5;

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

// 빈셀은 항상 이 객체를 참조하는 것으로 렌더링을 피한다.
const blankBlock: BlankBlock = {
  isActive: false,
  isFlowing: false,
};

const initCell = (row: number, col: number): Cell => ({
  col,
  row,
  block: blankBlock,
});

const initBoard: Cell[][] = Array.from({ length: ROW_MAX }, (_, i) =>
  Array.from({ length: COL_MAX }, (_, j) => initCell(i, j))
);

const TETROMINO = [
  // 1번
  [
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
];

export default function App() {
  const [running, setRunning] = useState(true);
  const [board, setBoard] = useState(initBoard);

  // console.log(board[0][0].block === board[1][0].block);

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
        setBoard((board) => getNewBoard(board));
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

  const getNewBoard = (board: Cell[][]) => {
    const newBoard = produce(board, (draft) => {
      for (let i = ROW_MAX - 1; i >= 0; i--) {
        for (let j = 0; j < COL_MAX; j++) {
          if (i === 0) {
            draft[i][j].block = blankBlock;
          } else {
            draft[i][j].block = draft[i - 1][j].block;
          }
        }
      }
    });

    return newBoard;
  };

  const getNewBoardWithoutImmer = (board: Cell[][]) => {
    const newBoard = board.map((row) => row.map((cell) => cell));

    return newBoard;
  };

  let legacyCell: Cell = board[2][0];
  useEffect(() => {
    console.log(legacyCell === board[2][0]);
    legacyCell = board[2][0];
  }, [board]);

  // 아니 근데 왜 렌더링하는거냐고..

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
// 렌더링하지말고 이전 렌더링 값을 그대로 이용해  주세요.
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

function areEqual(prevState: CellProps, nextState: CellProps) {
  const prevCell = prevState.cell,
    nextCell = prevState.cell;
  const keys = Object.keys(prevCell) as [];

  for (const key of keys) {
    console.log(prevCell[key] === nextCell[key]);
    if (prevCell[key] !== nextCell[key]) {
      return false;
    }
  }

  return true;
}
