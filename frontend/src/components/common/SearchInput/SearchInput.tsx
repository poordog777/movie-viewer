import { useState, useCallback } from 'react';
import { Paper, InputBase, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

const SearchContainer = styled(Paper)`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: ${({ theme }) => theme.spacing(2)} auto;
  padding: ${({ theme }) => theme.spacing(0.5, 2)};
`;

const StyledInput = styled(InputBase)`
  flex: 1;
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

const Form = styled('form')`
  width: 100%;
`;

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = '搜尋電影...'
}) => {
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch();
    }
  };

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <Form onSubmit={handleSubmit}>
      <SearchContainer elevation={focused ? 3 : 1}>
        <SearchIcon color="action" />
        <StyledInput
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {value && (
          <IconButton size="small" onClick={handleClear}>
            <ClearIcon />
          </IconButton>
        )}
        <IconButton type="submit" disabled={!value.trim()}>
          <SearchIcon />
        </IconButton>
      </SearchContainer>
    </Form>
  );
};

export default SearchInput;