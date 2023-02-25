import styled from 'styled-components';

const HeaderBlock = styled.div`
  text-align: center;
`;

const Header = ({
  running,
  cells,
  onToggleRun,
  createBlock,
}: {
  running: boolean;
  cells: number;
  onToggleRun: () => void;
  createBlock: () => void;
}) => {
  return (
    <HeaderBlock>
      <h1>{cells}</h1>
      <h2 onClick={onToggleRun}>running:{running ? 'true' : 'false'}</h2>
      <button onClick={createBlock}>createBlock([0,3]~[3,6])</button>
    </HeaderBlock>
  );
};

export default Header;
