import { FormControl, Select, MenuItem, Typography, Box } from '@mui/material';

export const CustomSelect = ({ label, options, value, onChange, placeholder }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
      <Typography 
        variant="caption" 
        sx={{ 
          fontSize: '11px', 
          fontWeight: 800, 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em', 
          color: 'text.secondary' 
        }}
      >
        {label}
      </Typography>
      <FormControl fullWidth variant="outlined">
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          displayEmpty
          sx={{
            borderRadius: 3,
            bgcolor: 'background.default',
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
              borderColor: 'transparent',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'divider',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
              borderWidth: 2,
            },
            '& .MuiSelect-select': {
              py: 2,
              px: 2.5,
              fontSize: '0.95rem',
              fontWeight: 500
            }
          }}
        >
          {placeholder && (
            <MenuItem value="" disabled sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {placeholder}
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem 
              key={option.id} 
              value={option.id}
              sx={{
                py: 1.5,
                px: 2.5,
                fontSize: '0.95rem',
                fontWeight: 500,
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                '&.Mui-selected': {
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(99, 102, 241, 0.08)',
                  color: 'primary.main',
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.25)' : 'rgba(99, 102, 241, 0.15)',
                  }
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              {option.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
