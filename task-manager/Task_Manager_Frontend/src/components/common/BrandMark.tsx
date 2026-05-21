import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Box } from '@mui/material';

export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 2,
        display: 'grid',
        placeItems: 'center',
        color: 'primary.contrastText',
        bgcolor: 'primary.main',
        boxShadow: '0 10px 24px rgba(25, 118, 210, 0.22)',
      }}
    >
      <CheckCircleRoundedIcon sx={{ fontSize: size * 0.58 }} />
    </Box>
  );
}
