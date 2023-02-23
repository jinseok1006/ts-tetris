import React, { useState, useCallback, useMemo, useEffect } from 'react';
import produce from 'immer';
import styled, { css } from 'styled-components';

interface Cell {
  row: number;
  col: number;
  block: boolean;
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

const HeaderBlock = styled.div`
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

// Header는 memo한다고해도 이득이 없으므로 쓰지 않는다.
const Header = ({
  running,
  cells,
  onToggleRun,
}: {
  running: boolean;
  cells: number;
  onToggleRun: () => void;
}) => {
  return (
    <HeaderBlock>
      <h1>{cells}</h1>
      <h2 onClick={onToggleRun}>running:{running ? 'true' : 'false'}</h2>
    </HeaderBlock>
  );
};

const TETIRS_BLOCKS = [
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

  const cells = useMemo(() => countBoardCell(board), [board]);
  console.log('App rerender!');

  const onToggle = (rowInput: number, colInput: number) => {
    console.log(rowInput, colInput);
    setBoard(
      produce((draft) => {
        draft[rowInput][colInput].block = !draft[rowInput][colInput].block;
      })
    );
  };
  const onToggleRun = () => setRunning(!running);

  const createBlocks = () =>
    setBoard(
      produce((draft) => {
        const ROW = 0,
          COL = 3;
        draft[ROW][COL].block = true;
      })
    );

  // useEffect에서 언제 cleanup함수가 실행되는가?
  // deps의 변화가 cleanup을 호출한다.
  useEffect(() => {
    let requestId: number;

    // setTimeout(createBlocks, 500);

    const gameLoop = () => {
      updateBoard();

      if (running) {
        requestId = setTimeout(gameLoop, 1000);
      }
    };

    gameLoop();

    return () => clearTimeout(requestId);
  }, [running]);

  const updateBoard = () => {
    setBoard(
      produce((draft) => {
        for (let i = ROW_MAX - 1; i >= 0; i--) {
          for (let j = 0; j < COL_MAX; j++) {
            if (i === 0) {
              draft[i][j] = initCell(0, j);
            } else {
              draft[i][j].block = draft[i - 1][j].block;
            }
          }
        }
      })
    );
  };

  return (
    <>
      <Header cells={cells} running={running} onToggleRun={onToggleRun} />
      <Board board={board} onToggle={onToggle} />
    </>
  );
}

interface BoardProps {
  board: Cell[][];
  onToggle: (r: number, c: number) => void;
}

// Board컴포넌트의 Props가 이전 렌더링때와 똑같다면
// 렌더링하지말고 이전 렌더링 값을 그대로 이용해주세요.
const Board = ({ board, onToggle }: BoardProps) => {
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
};

const CellBlock = styled.div`
  ${({ block }: { block: boolean }) => css`
    background-color: ${block ? 'red' : 'unset'};
  `}
`;

interface CellProps {
  cell: Cell;
  onToggle: (r: number, c: number) => void;
}

const Cell = React.memo(({ cell, onToggle }: CellProps) => {
  const { row, col } = cell;
  // console.log(`너.. ${row}-${col} 리렌더링?`);
  return (
    <CellBlock block={cell.block} onClick={() => onToggle(row, col)}>
      {col}
    </CellBlock>
  );
});

// 리렌더 체크용
function countBoardCell(board: Cell[][]) {
  console.log(`count!`);
  return board.reduce(
    (pre, row) =>
      pre + row.reduce((pre, cell) => pre + (cell.block ? 1 : 0), 0),
    0
  );
}
