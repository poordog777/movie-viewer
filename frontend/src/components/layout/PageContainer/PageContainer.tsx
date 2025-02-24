import { Container } from '@mui/material';
import { styled } from '@mui/material/styles';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const Main = styled('main')(({ theme }) => ({
  minHeight: 'calc(100vh - 64px)', // 減去 Header 高度
  padding: theme.spacing(3, 0),
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 0)
  }
}));

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'lg'
}) => {
  return (
    <Main>
      <Container maxWidth={maxWidth}>
        {children}
      </Container>
    </Main>
  );
};

export default PageContainer;