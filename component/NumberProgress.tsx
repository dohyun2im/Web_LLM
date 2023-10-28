import { Box, LinearProgressProps, LinearProgress } from "@mui/material";

interface Props extends LinearProgressProps {
    value: number;
}

const NumberProgress = ({ ...props }: Props) => {
    return (
        <Box sx={{ width: "100%", mr: 1, mb: 2 }}>
            <LinearProgress variant="determinate" {...props} />
        </Box>
    );
};

export default NumberProgress;
