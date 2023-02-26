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

// 빈셀은 항상 이 객체를 참조하는 것으로 렌더링을 피한다.
const BLANK_BLOCK: BlankBlock = {
  isActive: false,
  isFlowing: false,
};

const initCell = (row: number, col: number): Cell => ({
  col,
  row,
  block: BLANK_BLOCK,
});

const initBoard: Cell[][] = Array.from({ length: ROW_MAX }, (_, i) =>
  Array.from({ length: COL_MAX }, (_, j) => initCell(i, j))
);

const getNewBlankCell = (rowInput: number, colInput: number): Cell => ({
  row: rowInput,
  col: colInput,
  block: BLANK_BLOCK,
});

const compareBlock = (blockA: CellBlock, blockB: CellBlock): boolean => {
  const keys = Object.keys(blockA) as (keyof CellBlock)[];

  for (const key of keys) {
    if (blockA[key] !== blockB[key]) {
      return false;
    }
  }

  return true;
};

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

  const cells = countBoardCell(board);
  const onToggleRun = () => setRunning(!running);

  useEffect(() => {
    let requestId: number;

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

  const getNewBoard = (board: Cell[][]): Cell[][] => {
    // row는 복사, cell은 참조 형태로 newboard에 복사
    const newBoard = board.map((row) => row.map((cell) => cell));

    // 업데이트 하면서 절대 참조에 접근하여 수정X
    for (let i = ROW_MAX - 1; i >= 0; i--) {
      for (let j = 0; j < COL_MAX; j++) {
        if (i === 0) {
          // 활성화 되어있는 경우에 참조 끊기
          if (newBoard[i][j].block.isActive) {
            newBoard[i][j] = getNewBlankCell(i, j);
          }
        } else {
          // 전과 블럭이 다르면 참조 끊기
          if (!compareBlock(board[i - 1][j].block, board[i][j].block)) {
            newBoard[i][j] = {
              ...board[i][j],
              block: { ...board[i - 1][j].block },
            };
          }
        }
      }
    }

    return newBoard;
  };

  // const getNewBoard = (board: Cell[][]) => {
  //   const newBoard = produce(board, (draft) => {
  //     for (let i = ROW_MAX - 1; i >= 0; i--) {
  //       for (let j = 0; j < COL_MAX; j++) {
  //         if (i === 0) {
  //           draft[i][j].block = BLANK_BLOCK;
  //         } else {
  //           draft[i][j].block = draft[i - 1][j].block;
  //         }
  //       }
  //     }
  //   });

  // for (let i = 0; i < ROW_MAX; i++) {
  //   for (let j = 0; j < COL_MAX; j++) {
  //     console.log(
  //       board[i][j] === newBoard[i][j],
  //       board[i][j].block === newBoard[i][j].block
  //     );
  //   }
  // }

  //   return newBoard;
  // };

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
  // cell shallow equal 햇는데 왜 렌더링하는거지..?

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

const Cell = React.memo(function Cell({ cell }: CellProps) {
  const { row, col } = cell;

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

function shallowEqual(objA: any, objB: any): boolean {
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    const currentKey = keysA[i];
    console.log(currentKey, Object.is(objA[currentKey], objB[currentKey]));

    if (
      !Object.hasOwnProperty.call(objB, currentKey) ||
      !Object.is(objA[currentKey], objB[currentKey])
    ) {
      return false;
    }
  }

  return true;
}
